from fastapi.testclient import TestClient
import httpx
from unittest.mock import patch
from app.core.config import settings
from app.providers.ticketmaster_provider import (
    TicketmasterConfigurationError,
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


def test_event_by_id():
    response = client.get("/api/events/1")

    assert response.status_code == 200

    data = response.json()
    assert data["id"] == 1
    assert data["title"] == "NYC Career Fair"


def test_missing_event_returns_404():
    response = client.get("/api/events/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Event not found"


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
        "source must be 'sample', 'eventbrite', or 'ticketmaster'"
    )


def test_events_eventbrite_source_requires_token():
    original_token = settings.eventbrite_api_token
    settings.eventbrite_api_token = None

    try:
        response = client.get("/api/events?source=eventbrite")

        assert response.status_code == 503
        assert response.json() == {"detail": "Eventbrite is not configured"}
    finally:
        settings.eventbrite_api_token = original_token

def test_eventbrite_invalid_start_date_returns_400():
    original_token = settings.eventbrite_api_token
    settings.eventbrite_api_token = None

    try:
        response = client.get(
            "/api/events?source=eventbrite&start_date=bad-date"
        )

        assert response.status_code == 400
        assert (
            response.json()["detail"]
            == "start_date must use YYYY-MM-DD format"
        )
    finally:
        settings.eventbrite_api_token = original_token

def test_eventbrite_timeout_returns_504(): #gives fake token so execution doesnt stop on missing token
    original_token = settings.eventbrite_api_token
    settings.eventbrite_api_token = "fake-token"

    eventbrite_request = httpx.Request(
        "GET",
        "https://www.eventbriteapi.com/v3/events/search/",
    )

    try:
        with patch(
            "app.providers.eventbrite_provider.httpx.get",
            side_effect=httpx.TimeoutException(
                "Eventbrite timed out",
                request=eventbrite_request,
            ),
        ):
            response = client.get("/api/events?source=eventbrite")

        assert response.status_code == 504
        assert response.json() == {
            "detail": "Eventbrite request timed out"
        }
    finally:
        settings.eventbrite_api_token = original_token


# Verifies that the Ticketmaster source returns normalized events through the API.
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

    with patch(
        "app.services.event_service.get_ticketmaster_events",
        return_value=ticketmaster_events,
        create=True,
    ) as mock_get_events:
        response = client.get(
            "/api/events?source=ticketmaster&city=Chicago&query=music"
        )

    assert response.status_code == 200
    assert response.json() == {"events": ticketmaster_events}
    mock_get_events.assert_called_once_with(
        city="Chicago",
        category=None,
        query="music",
        start_date=None,
        end_date=None,
        page=0,
        size=20,
    )


# Verifies that custom pagination values reach the Ticketmaster provider.
def test_events_ticketmaster_source_passes_pagination():
    with patch(
        "app.services.event_service.get_ticketmaster_events",
        return_value=[],
    ) as mock_get_events:
        response = client.get(
            "/api/events?source=ticketmaster&page=2&size=25"
        )

    assert response.status_code == 200
    assert response.json() == {"events": []}
    mock_get_events.assert_called_once_with(
        city=None,
        category=None,
        query=None,
        start_date=None,
        end_date=None,
        page=2,
        size=25,
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
