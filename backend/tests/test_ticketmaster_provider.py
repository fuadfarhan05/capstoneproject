import httpx
import pytest

from app.core.config import settings
from app.models.event import Event
from unittest.mock import Mock, patch
from app.providers.ticketmaster_provider import (
    TICKETMASTER_SEARCH_URL,
    TicketmasterConfigurationError,
    TicketmasterRequestError,
    TicketmasterTimeoutError,
    build_ticketmaster_search_params,
    get_ticketmaster_events,
    normalize_ticketmaster_event,
    normalize_ticketmaster_response,
)


# Verifies that Ticketmaster searches fail clearly when no API key is configured.
def test_build_ticketmaster_search_params_requires_api_key(monkeypatch):
    monkeypatch.setattr(settings, "ticketmaster_api_key", None)

    with pytest.raises(
        TicketmasterConfigurationError,
        match="TICKETMASTER_API_KEY",
    ):
        build_ticketmaster_search_params(city="Chicago")


# Verifies that an API key containing only spaces is treated as missing.
def test_build_ticketmaster_search_params_rejects_blank_api_key(
    monkeypatch,
):
    monkeypatch.setattr(settings, "ticketmaster_api_key", "   ")

    with pytest.raises(
        TicketmasterConfigurationError,
        match="TICKETMASTER_API_KEY",
    ):
        build_ticketmaster_search_params(city="Chicago")


# Verifies that our search filters are translated into Ticketmaster parameter names.
def test_build_ticketmaster_search_params_with_filters(monkeypatch):
    monkeypatch.setattr(
        settings,
        "ticketmaster_api_key",
        "fake-ticketmaster-key",
    )

    params = build_ticketmaster_search_params(
        city="Chicago",
        category="music",
        query="concert",
        start_date="2026-10-10",
        end_date="2026-10-12",
    )

    assert params == {
        "apikey": "fake-ticketmaster-key",
        "city": "Chicago",
        "classificationName": "music",
        "keyword": "concert",
        "startDateTime": "2026-10-10T00:00:00Z",
        "endDateTime": "2026-10-12T23:59:59Z",
    }


# Verifies that pagination values are included in the Ticketmaster request parameters.
def test_build_ticketmaster_search_params_includes_pagination(monkeypatch):
    monkeypatch.setattr(
        settings,
        "ticketmaster_api_key",
        "fake-ticketmaster-key",
    )

    params = build_ticketmaster_search_params(
        page=2,
        size=25,
    )

    assert params["page"] == 2
    assert params["size"] == 25


# Verifies that optional filters are omitted when the caller does not provide them.
def test_build_ticketmaster_search_params_omits_empty_filters(
    monkeypatch,
):
    monkeypatch.setattr(
        settings,
        "ticketmaster_api_key",
        "fake-ticketmaster-key",
    )

    params = build_ticketmaster_search_params()

    assert params == {
        "apikey": "fake-ticketmaster-key",
    }


# Verifies that a complete Ticketmaster event is converted into our event format.
def test_normalize_ticketmaster_event():
    ticketmaster_event = {
        "id": "G5vYZ9abc123",
        "name": "Chicago Rock Concert",
        "info": "Live music in downtown Chicago.",
        "url": "https://ticketmaster.com/chicago-rock-concert",
        "dates": {
            "start": {
                "localDate": "2026-10-12",
                "localTime": "19:30:00",
            }
        },
        "classifications": [
            {
                "segment": {
                    "name": "Music",
                }
            }
        ],
        "priceRanges": [
            {
                "currency": "USD",
                "min": 25.0,
                "max": 75.0,
            }
        ],
        "images": [
            {
                "url": "https://example.com/concert-small.jpg",
            },
            {
                "url": "https://example.com/concert-large.jpg",
            },
        ],
        "_embedded": {
            "venues": [
                {
                    "name": "United Center",
                    "city": {
                        "name": "Chicago",
                    },
                    "state": {
                        "stateCode": "IL",
                    },
                    "postalCode": "60612",
                    "address": {
                        "line1": "1901 W Madison St",
                    },
                }
            ]
        },
    }

    normalized_event = normalize_ticketmaster_event(
        ticketmaster_event,
        city="Chicago",
    )

    assert normalized_event == {
        "id": "G5vYZ9abc123",
        "title": "Chicago Rock Concert",
        "description": "Live music in downtown Chicago.",
        "city": "Chicago",
        "venue": "United Center",
        "date": "2026-10-12",
        "time": "19:30:00",
        "category": "music",
        "address": "1901 W Madison St, Chicago, IL 60612",
        "pricing": "25.00 - 75.00 USD",
        "ticket_link": (
            "https://ticketmaster.com/chicago-rock-concert"
        ),
        "photos": [
            "https://example.com/concert-small.jpg",
            "https://example.com/concert-large.jpg",
        ],
        "source": "ticketmaster",
    }


# Verifies that missing optional Ticketmaster fields receive safe default values.
def test_normalize_ticketmaster_event_handles_missing_optional_fields():
    ticketmaster_event = {
        "id": "missing-fields-123",
        "name": "Simple Event",
        "dates": {
            "start": {
                "localDate": "2026-10-15",
            }
        },
        "url": "https://ticketmaster.com/simple-event",
    }

    normalized_event = normalize_ticketmaster_event(
        ticketmaster_event,
        city="New York City",
    )

    assert normalized_event == {
        "id": "missing-fields-123",
        "title": "Simple Event",
        "description": "",
        "city": "New York City",
        "venue": "",
        "date": "2026-10-15",
        "time": None,
        "category": "unknown",
        "address": None,
        "pricing": "unknown",
        "ticket_link": "https://ticketmaster.com/simple-event",
        "photos": [],
        "source": "ticketmaster",
    }


# Verifies that the searched city is used when venue city data is unavailable.
def test_normalize_ticketmaster_event_uses_requested_city_as_fallback():
    ticketmaster_event = {
        "id": "fallback-city-123",
        "name": "City Event",
        "dates": {
            "start": {
                "localDate": "2026-10-18",
            }
        },
        "_embedded": {
            "venues": [
                {
                    "name": "Unknown Venue",
                }
            ]
        },
    }

    normalized_event = normalize_ticketmaster_event(
        ticketmaster_event,
        city="Chicago",
    )

    assert normalized_event["city"] == "Chicago"


# Verifies that every event inside _embedded.events is normalized.
def test_normalize_ticketmaster_response():
    response_data = {
        "_embedded": {
            "events": [
                {
                    "id": "response-event-123",
                    "name": "Response Event",
                    "dates": {
                        "start": {
                            "localDate": "2026-10-20",
                        }
                    },
                }
            ]
        }
    }

    normalized_events = normalize_ticketmaster_response(
        response_data,
        city="Chicago",
    )

    assert len(normalized_events) == 1
    assert normalized_events[0]["id"] == "response-event-123"
    assert normalized_events[0]["title"] == "Response Event"
    assert normalized_events[0]["city"] == "Chicago"
    assert normalized_events[0]["source"] == "ticketmaster"


# Verifies that a response without events returns an empty list.
def test_normalize_ticketmaster_response_handles_missing_events():
    normalized_events = normalize_ticketmaster_response(
        {},
        city="Chicago",
    )

    assert normalized_events == []


# Verifies that our Event model supports Ticketmaster's alphanumeric IDs.
def test_event_model_accepts_ticketmaster_string_id():
    event = Event(
        id="G5vYZ9abc123",
        title="Ticketmaster Event",
        description="An event with an alphanumeric ID.",
        city="Chicago",
        venue="United Center",
        date="2026-10-12",
        category="music",
        source="ticketmaster",
    )

    assert event.id == "G5vYZ9abc123"


# Verifies the outgoing HTTP request and normalization without calling Ticketmaster.
def test_get_ticketmaster_events_sends_request_and_normalizes_response(
    monkeypatch,
):
    monkeypatch.setattr(
        settings,
        "ticketmaster_api_key",
        "fake-ticketmaster-key",
    )

    fake_response = Mock()
    fake_response.json.return_value = {
        "_embedded": {
            "events": [
                {
                    "id": "ticketmaster-789",
                    "name": "Mock Ticketmaster Event",
                    "info": "A mocked Ticketmaster response.",
                    "dates": {
                        "start": {
                            "localDate": "2026-10-22",
                        }
                    },
                    "url": "https://ticketmaster.com/mock-event",
                    "_embedded": {
                        "venues": [
                            {
                                "name": "Mock Venue",
                                "city": {
                                    "name": "Chicago",
                                },
                                "state": {
                                    "stateCode": "IL",
                                },
                                "postalCode": "60601",
                                "address": {
                                    "line1": "500 Mock St",
                                },
                            }
                        ]
                    },
                }
            ]
        }
    }

    with patch(
        "app.providers.ticketmaster_provider.httpx.get",
        return_value=fake_response,
    ) as mock_get:
        events = get_ticketmaster_events(
            city="Chicago",
            query="music",
            start_date="2026-10-22",
            end_date="2026-10-23",
            page=2,
            size=25,
        )

    fake_response.raise_for_status.assert_called_once()

    mock_get.assert_called_once_with(
        TICKETMASTER_SEARCH_URL,
        params={
            "apikey": "fake-ticketmaster-key",
            "city": "Chicago",
            "keyword": "music",
            "startDateTime": "2026-10-22T00:00:00Z",
            "endDateTime": "2026-10-23T23:59:59Z",
            "page": 2,
            "size": 25,
        },
        timeout=10,
    )

    assert len(events) == 1
    assert events[0]["id"] == "ticketmaster-789"
    assert events[0]["title"] == "Mock Ticketmaster Event"
    assert events[0]["city"] == "Chicago"
    assert events[0]["source"] == "ticketmaster"


# Verifies that an HTTP timeout becomes our Ticketmaster-specific timeout error.
def test_get_ticketmaster_events_raises_timeout_error(monkeypatch):
    monkeypatch.setattr(
        settings,
        "ticketmaster_api_key",
        "fake-ticketmaster-key",
    )

    request = httpx.Request(
        "GET",
        TICKETMASTER_SEARCH_URL,
    )

    with patch(
        "app.providers.ticketmaster_provider.httpx.get",
        side_effect=httpx.TimeoutException(
            "Ticketmaster timed out",
            request=request,
        ),
    ):
        with pytest.raises(
            TicketmasterTimeoutError,
            match="Ticketmaster request timed out",
        ):
            get_ticketmaster_events(city="Chicago")


# Verifies that other HTTP failures become our Ticketmaster request error.
def test_get_ticketmaster_events_raises_request_error(monkeypatch):
    monkeypatch.setattr(
        settings,
        "ticketmaster_api_key",
        "fake-ticketmaster-key",
    )

    request = httpx.Request(
        "GET",
        TICKETMASTER_SEARCH_URL,
    )

    with patch(
        "app.providers.ticketmaster_provider.httpx.get",
        side_effect=httpx.ConnectError(
            "Could not connect to Ticketmaster",
            request=request,
        ),
    ):
        with pytest.raises(
            TicketmasterRequestError,
            match="Ticketmaster request failed",
        ):
            get_ticketmaster_events(city="Chicago")
