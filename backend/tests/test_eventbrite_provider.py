from unittest.mock import Mock, patch

import httpx
import pytest

from app.core.config import settings
from app.providers.eventbrite_provider import (
    EVENTBRITE_PAGE_SIZE,
    SERPAPI_EVENTBRITE_SEARCH_URL,
    EventbriteConfigurationError,
    EventbriteQuotaError,
    EventbriteRequestError,
    EventbriteResponseError,
    EventbriteTimeoutError,
    EventbriteValidationError,
    build_eventbrite_page,
    build_eventbrite_search_params,
    clear_eventbrite_cache,
    get_eventbrite_events,
    normalize_eventbrite_event,
    normalize_eventbrite_response,
)


# Clears provider cache state before and after every provider test.
@pytest.fixture(autouse=True)
def reset_eventbrite_cache():
    clear_eventbrite_cache()
    yield
    clear_eventbrite_cache()


# Creates a successful mocked SerpApi response for provider tests.
def _mock_eventbrite_response(
    *,
    current_page: int = 1,
    has_next: bool = True,
) -> Mock:
    response = Mock()
    response.json.return_value = {
        "events_results": [
            {
                "event_id": "789",
                "title": "Mock Eventbrite Event",
                "description": "Mocked Eventbrite response.",
                "start_date": "2026-11-22",
                "start_time": "18:00",
                "link": "https://eventbrite.com/e/mock",
                "venue": {"name": "Mock Venue"},
                "address": ["500 Mock St", "Chicago, IL"],
                "price": "Free",
                "image": "https://example.com/mock.jpg",
                "category": "Music",
            }
        ],
        "serpapi_pagination": {
            "current": current_page,
            **(
                {"next": "https://serpapi.com/search?page=2"}
                if has_next
                else {}
            ),
        },
    }
    return response


# Verifies that a missing SerpApi key fails before a provider request.
def test_get_eventbrite_events_requires_serpapi_key(monkeypatch):
    monkeypatch.setattr(settings, "serpapi_api_key", None)

    with pytest.raises(
        EventbriteConfigurationError,
        match="SERPAPI_API_KEY",
    ):
        get_eventbrite_events(city="Chicago")


# Verifies that a whitespace-only SerpApi key is rejected.
def test_build_eventbrite_search_params_rejects_blank_key(monkeypatch):
    monkeypatch.setattr(settings, "serpapi_api_key", "   ")

    with pytest.raises(
        EventbriteConfigurationError,
        match="SERPAPI_API_KEY",
    ):
        build_eventbrite_search_params(city="Chicago")


# Verifies every supported Triply filter maps to SerpApi's parameter names.
def test_build_eventbrite_search_params_with_filters(monkeypatch):
    monkeypatch.setattr(settings, "serpapi_api_key", "fake-serpapi-key")

    params = build_eventbrite_search_params(
        city="Chicago",
        category="Arts & Theatre",
        query="comedy",
        start_date="2026-11-20",
        end_date="2026-11-22",
        page=2,
        size=20,
        sort="date",
    )

    assert params == {
        "engine": "eventbrite",
        "api_key": "fake-serpapi-key",
        "location": "Chicago",
        "page": 3,
        "q": "comedy",
        "category": "performing_and_visual_arts",
        "start_date": "2026-11-20",
        "end_date": "2026-11-22",
        "sort_by": "date",
    }


# Verifies Eventbrite searches require a location supported by the provider.
def test_build_eventbrite_search_params_requires_city(monkeypatch):
    monkeypatch.setattr(settings, "serpapi_api_key", "fake-serpapi-key")

    with pytest.raises(EventbriteValidationError, match="city is required"):
        build_eventbrite_search_params()


# Verifies the API rejects page sizes SerpApi cannot represent correctly.
def test_build_eventbrite_search_params_requires_size_twenty(monkeypatch):
    monkeypatch.setattr(settings, "serpapi_api_key", "fake-serpapi-key")

    with pytest.raises(EventbriteValidationError, match="size=20"):
        build_eventbrite_search_params(city="Chicago", size=10)


# Verifies custom Eventbrite date ranges contain both required boundaries.
def test_build_eventbrite_search_params_requires_complete_date_range(
    monkeypatch,
):
    monkeypatch.setattr(settings, "serpapi_api_key", "fake-serpapi-key")

    with pytest.raises(
        EventbriteValidationError,
        match="start_date and end_date together",
    ):
        build_eventbrite_search_params(
            city="Chicago",
            start_date="2026-11-20",
        )


# Verifies SerpApi does not receive date ranges beginning in the past.
def test_build_eventbrite_search_params_rejects_past_start_date(
    monkeypatch,
):
    monkeypatch.setattr(settings, "serpapi_api_key", "fake-serpapi-key")

    with pytest.raises(
        EventbriteValidationError,
        match="start_date cannot be in the past",
    ):
        build_eventbrite_search_params(
            city="Chicago",
            start_date="2000-01-01",
            end_date="2000-01-02",
        )


# Verifies unsupported frontend categories fail instead of being ignored.
def test_build_eventbrite_search_params_rejects_unknown_category(
    monkeypatch,
):
    monkeypatch.setattr(settings, "serpapi_api_key", "fake-serpapi-key")

    with pytest.raises(
        EventbriteValidationError,
        match="unsupported Eventbrite category",
    ):
        build_eventbrite_search_params(
            city="Chicago",
            category="Unknown",
        )


# Verifies a complete SerpApi result becomes Triply's normalized event shape.
def test_normalize_eventbrite_event():
    eventbrite_event = {
        "event_id": "123",
        "title": "Sample Workshop",
        "description": "Learn something new.",
        "start_date": "2026-11-21",
        "start_time": "19:00",
        "link": "https://eventbrite.com/e/sample",
        "venue": {"name": "Downtown Hall"},
        "address": ["123 Main St", "Chicago, IL"],
        "price": "25.00 USD",
        "max_price": "50.00 USD",
        "image": "https://example.com/photo.jpg",
        "category": "Business & Professional",
    }

    normalized_event = normalize_eventbrite_event(
        eventbrite_event,
        city="Chicago",
    )

    assert normalized_event == {
        "id": "123",
        "title": "Sample Workshop",
        "description": "Learn something new.",
        "city": "Chicago",
        "venue": "Downtown Hall",
        "date": "2026-11-21",
        "time": "19:00",
        "category": "business & professional",
        "address": "123 Main St, Chicago, IL",
        "pricing": "25.00 USD - 50.00 USD",
        "ticket_link": "https://eventbrite.com/e/sample",
        "photos": ["https://example.com/photo.jpg"],
        "source": "eventbrite",
    }


# Verifies missing optional fields receive safe normalized defaults.
def test_normalize_eventbrite_event_handles_missing_optional_fields():
    eventbrite_event = {
        "event_id": "456",
        "title": "Online Meetup",
        "start_date": "2026-11-25",
        "online": True,
    }

    normalized_event = normalize_eventbrite_event(
        eventbrite_event,
        city="New York",
    )

    assert normalized_event == {
        "id": "456",
        "title": "Online Meetup",
        "description": "",
        "city": "New York",
        "venue": "Online",
        "date": "2026-11-25",
        "time": None,
        "category": "unknown",
        "address": None,
        "pricing": "unknown",
        "ticket_link": None,
        "photos": [],
        "source": "eventbrite",
    }


# Verifies incomplete required event fields are treated as provider failure.
def test_normalize_eventbrite_event_rejects_incomplete_event():
    with pytest.raises(EventbriteResponseError, match="incomplete event"):
        normalize_eventbrite_event(
            {"event_id": "123", "title": "Missing date"},
            city="Chicago",
        )


# Verifies every object in events_results is normalized.
def test_normalize_eventbrite_response():
    response_data = {
        "events_results": [
            {
                "event_id": "123",
                "title": "Sample Event",
                "start_date": "2026-11-21",
            }
        ]
    }

    normalized_events = normalize_eventbrite_response(
        response_data,
        city="Chicago",
    )

    assert len(normalized_events) == 1
    assert normalized_events[0]["id"] == "123"
    assert normalized_events[0]["source"] == "eventbrite"


# Verifies a response without events produces an empty result page.
def test_normalize_eventbrite_response_handles_missing_events():
    assert normalize_eventbrite_response({}, city="Chicago") == []


# Verifies malformed events_results data becomes a provider response error.
def test_normalize_eventbrite_response_rejects_invalid_event_list():
    with pytest.raises(EventbriteResponseError, match="invalid event list"):
        normalize_eventbrite_response(
            {"events_results": "not-a-list"},
            city="Chicago",
        )


# Verifies provider page numbers and next-page links become Triply metadata.
def test_build_eventbrite_page_converts_pagination_metadata():
    result = build_eventbrite_page(
        {
            "serpapi_pagination": {
                "current": 2,
                "next": "https://serpapi.com/search?page=3",
            }
        },
        events=[],
        requested_page=1,
    )

    assert result == {
        "events": [],
        "page": 1,
        "size": EVENTBRITE_PAGE_SIZE,
        "total_pages": None,
        "total_elements": None,
        "has_next": True,
    }


# Verifies the provider sends one request and returns normalized page data.
def test_get_eventbrite_events_requests_and_normalizes_page(monkeypatch):
    monkeypatch.setattr(settings, "serpapi_api_key", "fake-serpapi-key")
    fake_response = _mock_eventbrite_response(current_page=2)

    with patch(
        "app.providers.eventbrite_provider.httpx.get",
        return_value=fake_response,
    ) as mock_get:
        result = get_eventbrite_events(
            city="Chicago",
            category="Music",
            query="workshop",
            start_date="2026-11-20",
            end_date="2026-11-30",
            page=1,
            size=20,
            sort="date",
        )

    fake_response.raise_for_status.assert_called_once()
    mock_get.assert_called_once_with(
        SERPAPI_EVENTBRITE_SEARCH_URL,
        params={
            "engine": "eventbrite",
            "api_key": "fake-serpapi-key",
            "location": "Chicago",
            "page": 2,
            "q": "workshop",
            "category": "music",
            "start_date": "2026-11-20",
            "end_date": "2026-11-30",
            "sort_by": "date",
        },
        timeout=10,
    )
    assert result["page"] == 1
    assert result["size"] == 20
    assert result["has_next"] is True
    assert result["events"][0]["id"] == "789"
    assert result["events"][0]["time"] == "18:00"


# Verifies identical searches reuse cached results without another API call.
def test_get_eventbrite_events_uses_short_lived_cache(monkeypatch):
    monkeypatch.setattr(settings, "serpapi_api_key", "fake-serpapi-key")
    fake_response = _mock_eventbrite_response()

    with patch(
        "app.providers.eventbrite_provider.httpx.get",
        return_value=fake_response,
    ) as mock_get:
        first_result = get_eventbrite_events(city="Chicago")
        first_result["events"].clear()
        second_result = get_eventbrite_events(city="Chicago")

    assert mock_get.call_count == 1
    assert len(second_result["events"]) == 1


# Verifies provider timeouts become the dedicated timeout exception.
def test_get_eventbrite_events_raises_timeout(monkeypatch):
    monkeypatch.setattr(settings, "serpapi_api_key", "fake-serpapi-key")
    request = httpx.Request("GET", SERPAPI_EVENTBRITE_SEARCH_URL)

    with patch(
        "app.providers.eventbrite_provider.httpx.get",
        side_effect=httpx.TimeoutException("timed out", request=request),
    ):
        with pytest.raises(EventbriteTimeoutError):
            get_eventbrite_events(city="Chicago")


# Verifies an upstream 429 receives the quota-specific exception.
def test_get_eventbrite_events_raises_quota_error(monkeypatch):
    monkeypatch.setattr(settings, "serpapi_api_key", "fake-serpapi-key")
    request = httpx.Request("GET", SERPAPI_EVENTBRITE_SEARCH_URL)
    response = httpx.Response(429, request=request)

    with patch(
        "app.providers.eventbrite_provider.httpx.get",
        side_effect=httpx.HTTPStatusError(
            "quota exhausted",
            request=request,
            response=response,
        ),
    ):
        with pytest.raises(EventbriteQuotaError):
            get_eventbrite_events(city="Chicago")


# Verifies other HTTP failures receive the general provider exception.
def test_get_eventbrite_events_raises_request_error(monkeypatch):
    monkeypatch.setattr(settings, "serpapi_api_key", "fake-serpapi-key")
    request = httpx.Request("GET", SERPAPI_EVENTBRITE_SEARCH_URL)

    with patch(
        "app.providers.eventbrite_provider.httpx.get",
        side_effect=httpx.ConnectError("connection failed", request=request),
    ):
        with pytest.raises(EventbriteRequestError):
            get_eventbrite_events(city="Chicago")


# Verifies invalid JSON is translated into a safe response error.
def test_get_eventbrite_events_rejects_invalid_json(monkeypatch):
    monkeypatch.setattr(settings, "serpapi_api_key", "fake-serpapi-key")
    fake_response = Mock()
    fake_response.json.side_effect = ValueError("invalid JSON")

    with patch(
        "app.providers.eventbrite_provider.httpx.get",
        return_value=fake_response,
    ):
        with pytest.raises(EventbriteResponseError, match="invalid JSON"):
            get_eventbrite_events(city="Chicago")


# Verifies a provider error payload does not leak its contents to callers.
def test_get_eventbrite_events_rejects_provider_error_payload(monkeypatch):
    monkeypatch.setattr(settings, "serpapi_api_key", "fake-serpapi-key")
    fake_response = Mock()
    fake_response.json.return_value = {"error": "secret provider detail"}

    with patch(
        "app.providers.eventbrite_provider.httpx.get",
        return_value=fake_response,
    ):
        with pytest.raises(
            EventbriteRequestError,
            match="provider reported an error",
        ):
            get_eventbrite_events(city="Chicago")


# Verifies quota error payloads receive the quota-specific exception.
def test_get_eventbrite_events_detects_quota_error_payload(monkeypatch):
    monkeypatch.setattr(settings, "serpapi_api_key", "fake-serpapi-key")
    fake_response = Mock()
    fake_response.json.return_value = {
        "error": "Your account has reached its searches per month limit"
    }

    with patch(
        "app.providers.eventbrite_provider.httpx.get",
        return_value=fake_response,
    ):
        with pytest.raises(EventbriteQuotaError):
            get_eventbrite_events(city="Chicago")
