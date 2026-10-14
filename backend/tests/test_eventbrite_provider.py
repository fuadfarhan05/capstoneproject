from app.providers.eventbrite_provider import (
    EVENTBRITE_SEARCH_URL,
    EventbriteConfigurationError,
    build_eventbrite_headers,
    build_eventbrite_search_params,
    get_eventbrite_events,
    normalize_eventbrite_event,
    normalize_eventbrite_response,
)
import pytest
from app.core.config import settings
from unittest.mock import Mock, patch


def test_get_eventbrite_events_requires_token():
    original_token = settings.eventbrite_api_token
    settings.eventbrite_api_token = None

    try:
        with pytest.raises(EventbriteConfigurationError, match="EVENTBRITE_API_TOKEN"):
            get_eventbrite_events(city="Chicago")
    finally:
        settings.eventbrite_api_token = original_token

def test_build_eventbrite_headers_requires_token():
    original_token = settings.eventbrite_api_token
    settings.eventbrite_api_token = None

    try:
        with pytest.raises(EventbriteConfigurationError, match="EVENTBRITE_API_TOKEN"):
            build_eventbrite_headers()
    finally:
        settings.eventbrite_api_token = original_token

def test_build_eventbrite_headers_rejects_blank_token():
    original_token = settings.eventbrite_api_token
    settings.eventbrite_api_token = "   "

    try:
        with pytest.raises(EventbriteConfigurationError, match="EVENTBRITE_API_TOKEN"):
            build_eventbrite_headers()
    finally:
        settings.eventbrite_api_token = original_token

def test_build_eventbrite_headers_uses_bearer_token():
    original_token = settings.eventbrite_api_token
    settings.eventbrite_api_token = "fake-token"

    try:
        headers = build_eventbrite_headers()

        assert headers == {"Authorization": "Bearer fake-token"}
    finally:
        settings.eventbrite_api_token = original_token

def test_normalize_eventbrite_event():
    eventbrite_event = {
    "id": "123",
    "name": {"text": "Sample Concert"},
    "description": {"text": "Live music downtown."},
    "start": {"local": "2026-10-12T19:00:00"},
    "url": "https://eventbrite.com/e/sample",
    "venue": {
        "name": "Downtown Hall",
        "address": {
            "localized_address_display": "123 Main St, Chicago, IL"
        },
    },
    "logo": {
        "url": "https://example.com/photo.jpg"
    },
    }

    normalized_event = normalize_eventbrite_event(eventbrite_event, city="Chicago")

    assert normalized_event == { #make sure the return from evenbrite matches what our app expects
        "id": 123,
        "title": "Sample Concert",
        "description": "Live music downtown.",
        "city": "Chicago",
        "venue": "Downtown Hall",
        "date": "2026-10-12",
        "category": "unknown",
        "address": "123 Main St, Chicago, IL",
        "pricing": "unknown",
        "ticket_link": "https://eventbrite.com/e/sample",
        "photos": ["https://example.com/photo.jpg"],
        "source": "eventbrite",
    }

def test_normalize_eventbrite_event_handles_missing_optional_fields():
    eventbrite_event = {
        "id": "456",
        "name": {"text": "Untitled Meetup"},
        "description": None,
        "start": {"local": "2026-10-15T10:30:00"},
        "url": "https://eventbrite.com/e/meetup",
        "venue": None,
        "logo": None,
    }

    normalized_event = normalize_eventbrite_event(eventbrite_event, city="New York City")

    assert normalized_event == {
        "id": 456,
        "title": "Untitled Meetup",
        "description": "",
        "city": "New York City",
        "venue": "",
        "date": "2026-10-15",
        "category": "unknown",
        "address": None,
        "pricing": "unknown",
        "ticket_link": "https://eventbrite.com/e/meetup",
        "photos": [],
        "source": "eventbrite",
    }

def test_build_eventbrite_search_params_with_filters(): #calls the helper function and makes sure its in eventbrite parameter form
    params = build_eventbrite_search_params(
        city="Chicago",
        query="music",
        start_date="2026-10-10",
        end_date="2026-10-12",
    )

    assert params == {
        "q": "music",
        "location.address": "Chicago",
        "start_date.range_start": "2026-10-10T00:00:00",
        "start_date.range_end": "2026-10-12T23:59:59",
    }

def test_normalize_eventbrite_response():
    response_data = {
        "events": [
            {
                "id": "123",
                "name": {"text": "Sample Concert"},
                "description": {"text": "Live music downtown."},
                "start": {"local": "2026-10-12T19:00:00"},
                "url": "https://eventbrite.com/e/sample",
                "venue": None,
                "logo": None,
            }
        ]
    }

    normalized_events = normalize_eventbrite_response(response_data, city="Chicago")

    assert len(normalized_events) == 1
    assert normalized_events[0]["id"] == 123
    assert normalized_events[0]["title"] == "Sample Concert"
    assert normalized_events[0]["city"] == "Chicago"
    assert normalized_events[0]["source"] == "eventbrite"

def test_normalize_eventbrite_response_handles_missing_events():
    normalized_events = normalize_eventbrite_response({}, city="Chicago")

    assert normalized_events == []

def test_get_eventbrite_events_normalizes_response():
    original_token = settings.eventbrite_api_token
    settings.eventbrite_api_token = "fake-token"

    fake_response = Mock()
    fake_response.json.return_value = {
        "events": [
            {
                "id": "789",
                "name": {"text": "Mock Eventbrite Event"},
                "description": {"text": "Mocked Eventbrite response."},
                "start": {"local": "2026-10-22T18:00:00"},
                "url": "https://eventbrite.com/e/mock",
                "venue": {
                    "name": "Mock Venue",
                    "address": {
                        "localized_address_display": "500 Mock St, Chicago, IL"
                    },
                },
                "logo": None,
            }
        ]
    }

    try:
        with patch("app.providers.eventbrite_provider.httpx.get", return_value=fake_response) as mock_get:
            events = get_eventbrite_events(
                city="Chicago",
                query="music",
                start_date="2026-10-22",
                end_date="2026-10-23",
            )
        fake_response.raise_for_status.assert_called_once()

        mock_get.assert_called_once_with(
            EVENTBRITE_SEARCH_URL,
            headers={"Authorization": "Bearer fake-token"},
            params={
                "q": "music",
                "location.address": "Chicago",
                "start_date.range_start": "2026-10-22T00:00:00",
                "start_date.range_end": "2026-10-23T23:59:59",
            },
            timeout=10,
        )

        assert events == [
            {
                "id": 789,
                "title": "Mock Eventbrite Event",
                "description": "Mocked Eventbrite response.",
                "city": "Chicago",
                "venue": "Mock Venue",
                "date": "2026-10-22",
                "category": "unknown",
                "address": "500 Mock St, Chicago, IL",
                "pricing": "unknown",
                "ticket_link": "https://eventbrite.com/e/mock",
                "photos": [],
                "source": "eventbrite",
            }
        ]
    finally:
        settings.eventbrite_api_token = original_token
