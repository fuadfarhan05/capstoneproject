from fastapi.testclient import TestClient
from unittest.mock import patch
from app.core.config import settings
from app.providers.eventbrite_provider import (
    EventbriteQuotaError,
    EventbriteRequestError,
    EventbriteTimeoutError,
)
from app.providers.sample_provider import SAMPLE_EVENTS
from app.providers.ticketmaster_provider import (
    TicketmasterConfigurationError,
    TicketmasterNotFoundError,
    TicketmasterRequestError,
    TicketmasterTimeoutError,
)
from main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_events_returns_events():
    response = client.get("/api/events")

    assert response.status_code == 200
    data = response.json()
    assert "events" in data
    assert len(data["events"]) > 0


def test_events_default_source_uses_sample_data():
    response = client.get("/api/events")

    assert response.status_code == 200

    data = response.json()
    assert len(data["events"]) > 0
    assert all(event["source"] == "sample" for event in data["events"])


def test_events_sample_source_uses_sample_data():
    response = client.get("/api/events?source=sample")

    assert response.status_code == 200

    data = response.json()
    assert len(data["events"]) > 0
    assert all(event["source"] == "sample" for event in data["events"])


# Verifies existing single-provider responses do not gain an empty warning field.
def test_sample_events_omit_combined_provider_warnings():
    response = client.get("/api/events?source=sample")

    assert response.status_code == 200
    assert "warnings" not in response.json()


def test_sample_events_include_pagination_metadata():  # Verifies metadata on the first sample page.
    response = client.get(
        "/api/events?source=sample&page=0&size=2"
    )

    assert response.status_code == 200

    data = response.json()
    assert len(data["events"]) == 2
    assert data["page"] == 0
    assert data["size"] == 2
    assert data["total_elements"] == 6
    assert data["total_pages"] == 3
    assert data["has_next"] is True


def test_sample_events_identify_final_page():  # Verifies that the final sample page has no next page.
    response = client.get(
        "/api/events?source=sample&page=2&size=2"
    )

    assert response.status_code == 200

    data = response.json()
    assert len(data["events"]) == 2
    assert data["page"] == 2
    assert data["has_next"] is False


# Verifies that the detail endpoint uses Ticketmaster by default.
def test_event_by_id_defaults_to_ticketmaster():
    ticketmaster_event = {
        "id": "ticketmaster-123",
        "title": "Mock Ticketmaster Event",
        "description": "A normalized event returned by the provider.",
        "city": "Chicago",
        "venue": "Mock Venue",
        "date": "2026-11-10",
        "time": "19:30:00",
        "category": "music",
        "address": "500 Mock St, Chicago, IL 60601",
        "pricing": "25.00 - 75.00 USD",
        "ticket_link": "https://ticketmaster.com/mock-event",
        "photos": [],
        "source": "ticketmaster",
    }

    with patch(
        "app.services.event_service.get_ticketmaster_event",
        return_value=ticketmaster_event,
    ) as mock_get_event:
        response = client.get("/api/events/ticketmaster-123")

    assert response.status_code == 200
    assert response.json() == ticketmaster_event
    mock_get_event.assert_called_once_with("ticketmaster-123")


# Verifies that sample details remain available through an explicit source.
def test_sample_event_by_id():
    response = client.get("/api/events/1?source=sample")

    assert response.status_code == 200

    data = response.json()
    assert data["id"] == 1
    assert data["title"] == "NYC Career Fair"


# Verifies that a missing sample event returns the shared not-found response.
def test_missing_sample_event_returns_404():
    response = client.get("/api/events/999?source=sample")

    assert response.status_code == 404
    assert response.json()["detail"] == "Event not found"


# Verifies that a missing Ticketmaster event becomes a 404 response.
def test_missing_ticketmaster_event_returns_404():
    with patch(
        "app.services.event_service.get_ticketmaster_event",
        side_effect=TicketmasterNotFoundError(
            "Ticketmaster event was not found"
        ),
    ):
        response = client.get("/api/events/missing-event")

    assert response.status_code == 404
    assert response.json() == {"detail": "Event not found"}


# Verifies that detail requests reject providers without detail support.
def test_event_detail_rejects_invalid_source():
    response = client.get("/api/events/event-123?source=eventbrite")

    assert response.status_code == 400
    assert response.json() == {
        "detail": "source must be 'sample' or 'ticketmaster'"
    }


# Verifies that missing Ticketmaster configuration becomes a 503 detail response.
def test_event_detail_requires_ticketmaster_api_key():
    with patch(
        "app.services.event_service.get_ticketmaster_event",
        side_effect=TicketmasterConfigurationError(
            "TICKETMASTER_API_KEY is not configured"
        ),
    ):
        response = client.get("/api/events/event-123")

    assert response.status_code == 503
    assert response.json() == {
        "detail": "Ticketmaster is not configured"
    }


# Verifies that a Ticketmaster detail timeout becomes a 504 response.
def test_event_detail_timeout_returns_504():
    with patch(
        "app.services.event_service.get_ticketmaster_event",
        side_effect=TicketmasterTimeoutError(
            "Ticketmaster request timed out"
        ),
    ):
        response = client.get("/api/events/event-123")

    assert response.status_code == 504
    assert response.json() == {
        "detail": "Ticketmaster request timed out"
    }


# Verifies that other Ticketmaster detail failures become a 502 response.
def test_event_detail_request_error_returns_502():
    with patch(
        "app.services.event_service.get_ticketmaster_event",
        side_effect=TicketmasterRequestError(
            "Ticketmaster request failed"
        ),
    ):
        response = client.get("/api/events/event-123")

    assert response.status_code == 502
    assert response.json() == {
        "detail": "Ticketmaster request failed"
    }


def test_filter_events_by_city():
    response = client.get("/api/events?city=Chicago")

    assert response.status_code == 200

    data = response.json()
    assert len(data["events"]) > 0
    assert all(event["city"] == "Chicago" for event in data["events"])


def test_filter_events_by_query():
    response = client.get("/api/events?query=bridge")

    assert response.status_code == 200

    data = response.json()
    assert len(data["events"]) > 0
    assert any(
        "bridge" in event["title"].lower()
        or "bridge" in event["description"].lower()
        or "bridge" in event["venue"].lower()
        for event in data["events"]
    )


def test_filter_events_by_date_range():
    response = client.get("/api/events?start_date=2026-10-15&end_date=2026-10-20")

    assert response.status_code == 200

    data = response.json()
    assert len(data["events"]) > 0
    assert all(
        "2026-10-15" <= event["date"] <= "2026-10-20"
        for event in data["events"]
    )


def test_invalid_start_date_returns_400():
    response = client.get("/api/events?start_date=bad-date")

    assert response.status_code == 400
    assert response.json()["detail"] == "start_date must use YYYY-MM-DD format"


def test_invalid_date_range_returns_400():
    response = client.get("/api/events?start_date=2026-10-20&end_date=2026-10-01")

    assert response.status_code == 400
    assert response.json()["detail"] == "start_date must be before or equal to end_date"


def test_events_invalid_source_returns_400():
    response = client.get("/api/events?source=random")

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "source must be 'sample', 'eventbrite', 'ticketmaster', or 'all'"
    )


# Verifies that combined searches forward every public filter to the aggregator.
def test_combined_events_forward_filters_and_pagination():
    combined_page = {
        "events": [],
        "page": 1,
        "size": 20,
        "total_pages": None,
        "total_elements": None,
        "has_next": True,
        "warnings": [],
    }

    with patch(
        "app.services.event_service.get_combined_events",
        return_value=combined_page,
    ) as mock_get_events:
        response = client.get(
            "/api/events?source=all&city=Chicago&category=Sports"
            "&query=basketball&sort=date&page=1&size=20"
            "&start_date=2026-11-20&end_date=2026-11-30"
        )

    assert response.status_code == 200
    assert response.json() == combined_page
    mock_get_events.assert_called_once_with(
        city="Chicago",
        category="Sports",
        query="basketball",
        start_date="2026-11-20",
        end_date="2026-11-30",
        page=1,
        size=20,
        sort="date",
    )


# Verifies that unsupported global sort modes return the public API error.
def test_events_invalid_sort_returns_400():
    response = client.get("/api/events?sort=price")

    assert response.status_code == 400
    assert response.json() == {"detail": "sort must be 'date'"}


# Verifies that sample events are sorted globally before page slicing.
def test_sample_events_sort_dates_across_page_boundaries():
    unsorted_events = [
        SAMPLE_EVENTS[index].copy()
        for index in [4, 0, 5, 1, 3, 2]
    ]

    with patch(
        "app.services.event_service.get_sample_events",
        return_value=unsorted_events,
    ):
        first_response = client.get(
            "/api/events?source=sample&sort=date&page=0&size=3"
        )
        second_response = client.get(
            "/api/events?source=sample&sort=date&page=1&size=3"
        )

    assert first_response.status_code == 200
    assert second_response.status_code == 200

    first_page = first_response.json()
    second_page = second_response.json()
    dates = [
        event["date"]
        for event in first_page["events"] + second_page["events"]
    ]

    assert dates == sorted(dates)
    assert first_page["events"][-1]["date"] <= second_page["events"][0]["date"]
    assert first_page["total_elements"] == 6
    assert first_page["total_pages"] == 2
    assert first_page["has_next"] is True
    assert second_page["has_next"] is False


# Verifies that omitting sort preserves the sample provider's original order.
def test_sample_events_without_sort_preserve_provider_order():
    unsorted_events = [
        SAMPLE_EVENTS[index].copy()
        for index in [4, 0, 5]
    ]

    with patch(
        "app.services.event_service.get_sample_events",
        return_value=unsorted_events,
    ):
        response = client.get("/api/events?source=sample")

    assert response.status_code == 200
    assert [event["id"] for event in response.json()["events"]] == [5, 1, 6]


# Verifies missing SerpApi configuration becomes the shared 503 response.
def test_events_eventbrite_source_requires_serpapi_key(monkeypatch):
    monkeypatch.setattr(settings, "serpapi_api_key", None)

    response = client.get(
        "/api/events?source=eventbrite&city=Chicago"
    )

    assert response.status_code == 503
    assert response.json() == {"detail": "Eventbrite is not configured"}


# Verifies Eventbrite provider pagination and sorting receive API parameters.
def test_eventbrite_events_forward_filters_and_pagination():
    eventbrite_page = {
        "events": [],
        "page": 2,
        "size": 20,
        "total_pages": None,
        "total_elements": None,
        "has_next": True,
    }

    with patch(
        "app.services.event_service.get_eventbrite_events",
        return_value=eventbrite_page,
    ) as mock_get_events:
        response = client.get(
            "/api/events?source=eventbrite&city=Chicago"
            "&category=Music&query=workshop&sort=date&page=2&size=20"
            "&start_date=2026-11-20&end_date=2026-11-30"
        )

    assert response.status_code == 200
    assert response.json() == eventbrite_page
    mock_get_events.assert_called_once_with(
        city="Chicago",
        category="Music",
        query="workshop",
        start_date="2026-11-20",
        end_date="2026-11-30",
        page=2,
        size=20,
        sort="date",
    )


# Verifies Eventbrite searches return a clear error when city is omitted.
def test_eventbrite_requires_city(monkeypatch):
    monkeypatch.setattr(settings, "serpapi_api_key", "fake-serpapi-key")

    response = client.get("/api/events?source=eventbrite")

    assert response.status_code == 400
    assert response.json() == {
        "detail": "city is required for Eventbrite searches"
    }


# Verifies Eventbrite rejects page sizes its upstream API cannot represent.
def test_eventbrite_requires_size_twenty(monkeypatch):
    monkeypatch.setattr(settings, "serpapi_api_key", "fake-serpapi-key")

    response = client.get(
        "/api/events?source=eventbrite&city=Chicago&size=10"
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Eventbrite searches require size=20"
    }


# Verifies Eventbrite custom ranges require both start and end dates.
def test_eventbrite_requires_complete_date_range(monkeypatch):
    monkeypatch.setattr(settings, "serpapi_api_key", "fake-serpapi-key")

    response = client.get(
        "/api/events?source=eventbrite&city=Chicago"
        "&start_date=2026-11-20"
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": (
            "Eventbrite searches require start_date and end_date together"
        )
    }


# Verifies unsupported Eventbrite category values return a public 400 error.
def test_eventbrite_rejects_unknown_category(monkeypatch):
    monkeypatch.setattr(settings, "serpapi_api_key", "fake-serpapi-key")

    response = client.get(
        "/api/events?source=eventbrite&city=Chicago&category=Unknown"
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "unsupported Eventbrite category"
    }


# Verifies invalid date syntax is rejected before provider configuration.
def test_eventbrite_invalid_start_date_returns_400():
    response = client.get(
        "/api/events?source=eventbrite&city=Chicago"
        "&start_date=bad-date"
    )

    assert response.status_code == 400
    assert (
        response.json()["detail"]
        == "start_date must use YYYY-MM-DD format"
    )


# Verifies Eventbrite search quota exhaustion becomes a 503 response.
def test_eventbrite_quota_error_returns_503():
    with patch(
        "app.services.event_service.get_eventbrite_events",
        side_effect=EventbriteQuotaError("quota unavailable"),
    ):
        response = client.get(
            "/api/events?source=eventbrite&city=Chicago"
        )

    assert response.status_code == 503
    assert response.json() == {
        "detail": "Eventbrite search quota is unavailable"
    }


# Verifies Eventbrite provider timeouts become a 504 response.
def test_eventbrite_timeout_returns_504():
    with patch(
        "app.services.event_service.get_eventbrite_events",
        side_effect=EventbriteTimeoutError("request timed out"),
    ):
        response = client.get(
            "/api/events?source=eventbrite&city=Chicago"
        )

    assert response.status_code == 504
    assert response.json() == {
        "detail": "Eventbrite request timed out"
    }


# Verifies other Eventbrite upstream failures become a 502 response.
def test_eventbrite_request_error_returns_502():
    with patch(
        "app.services.event_service.get_eventbrite_events",
        side_effect=EventbriteRequestError("request failed"),
    ):
        response = client.get(
            "/api/events?source=eventbrite&city=Chicago"
        )

    assert response.status_code == 502
    assert response.json() == {
        "detail": "Eventbrite request failed"
    }


# Verifies normalized Ticketmaster events and page metadata through the API.
def test_events_ticketmaster_source_returns_events():
    ticketmaster_events = [
        {
            "id": "ticketmaster-123",
            "title": "Mock Ticketmaster Event",
            "description": "A normalized event returned by the provider.",
            "city": "Chicago",
            "venue": "Mock Venue",
            "date": "2026-10-22",
            "time": "19:30:00",
            "category": "music",
            "address": "500 Mock St, Chicago, IL 60601",
            "pricing": "25.00 - 75.00 USD",
            "ticket_link": "https://ticketmaster.com/mock-event",
            "photos": [],
            "source": "ticketmaster",
        }
    ]

    ticketmaster_page = {
        "events": ticketmaster_events,
        "page": 0,
        "size": 20,
        "total_pages": 1,
        "total_elements": 1,
        "has_next": False,
    }

    with patch(
        "app.services.event_service.get_ticketmaster_events",
        return_value=ticketmaster_page,
        create=True,
    ) as mock_get_events:
        response = client.get(
            "/api/events?source=ticketmaster&city=Chicago&query=music"
        )

    assert response.status_code == 200
    assert response.json() == ticketmaster_page
    mock_get_events.assert_called_once_with(
        city="Chicago",
        category=None,
        query="music",
        start_date=None,
        end_date=None,
        page=0,
        size=20,
        sort=None,
    )


# Verifies that custom pagination values reach the Ticketmaster provider.
def test_events_ticketmaster_source_passes_pagination():
    empty_page = {
        "events": [],
        "page": 2,
        "size": 25,
        "total_pages": 2,
        "total_elements": 50,
        "has_next": False,
    }

    with patch(
        "app.services.event_service.get_ticketmaster_events",
        return_value=empty_page,
    ) as mock_get_events:
        response = client.get(
            "/api/events?source=ticketmaster&page=2&size=25"
        )

    assert response.status_code == 200
    assert response.json() == empty_page
    mock_get_events.assert_called_once_with(
        city=None,
        category=None,
        query=None,
        start_date=None,
        end_date=None,
        page=2,
        size=25,
        sort=None,
    )


# Verifies that the API forwards the date sort to the Ticketmaster service call.
def test_events_ticketmaster_source_passes_date_sort():
    empty_page = {
        "events": [],
        "page": 0,
        "size": 20,
        "total_pages": 0,
        "total_elements": 0,
        "has_next": False,
    }

    with patch(
        "app.services.event_service.get_ticketmaster_events",
        return_value=empty_page,
    ) as mock_get_events:
        response = client.get(
            "/api/events?source=ticketmaster&sort=date"
        )

    assert response.status_code == 200
    mock_get_events.assert_called_once_with(
        city=None,
        category=None,
        query=None,
        start_date=None,
        end_date=None,
        page=0,
        size=20,
        sort="date",
    )


# Verifies that page numbers cannot be negative.
def test_events_rejects_negative_page():
    response = client.get("/api/events?page=-1")

    assert response.status_code == 422


# Verifies that a page size must contain at least one event.
def test_events_rejects_zero_size():
    response = client.get("/api/events?size=0")

    assert response.status_code == 422


# Verifies that a page size cannot exceed our API's safety limit of 200 events.
def test_events_rejects_size_above_api_limit():
    response = client.get("/api/events?size=201")

    assert response.status_code == 422


# Verifies that missing Ticketmaster configuration becomes a 503 response.
def test_events_ticketmaster_source_requires_api_key():
    with patch(
        "app.services.event_service.get_ticketmaster_events",
        side_effect=TicketmasterConfigurationError(
            "TICKETMASTER_API_KEY is not configured"
        ),
        create=True,
    ):
        response = client.get("/api/events?source=ticketmaster")

    assert response.status_code == 503
    assert response.json() == {
        "detail": "Ticketmaster is not configured"
    }


# Verifies that a Ticketmaster timeout becomes a 504 response.
def test_ticketmaster_timeout_returns_504():
    with patch(
        "app.services.event_service.get_ticketmaster_events",
        side_effect=TicketmasterTimeoutError(
            "Ticketmaster request timed out"
        ),
        create=True,
    ):
        response = client.get("/api/events?source=ticketmaster")

    assert response.status_code == 504
    assert response.json() == {
        "detail": "Ticketmaster request timed out"
    }


# Verifies that other Ticketmaster request failures become a 502 response.
def test_ticketmaster_request_error_returns_502():
    with patch(
        "app.services.event_service.get_ticketmaster_events",
        side_effect=TicketmasterRequestError(
            "Ticketmaster request failed"
        ),
        create=True,
    ):
        response = client.get("/api/events?source=ticketmaster")

    assert response.status_code == 502
    assert response.json() == {
        "detail": "Ticketmaster request failed"
    }
