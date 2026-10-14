import httpx
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.core.config import settings
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
    assert response.json()["detail"] == "source must be either 'sample' or 'eventbrite'"


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


def test_eventbrite_timeout_returns_504():
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


def test_eventbrite_connection_error_returns_502():
    original_token = settings.eventbrite_api_token
    settings.eventbrite_api_token = "fake-token"

    eventbrite_request = httpx.Request(
        "GET",
        "https://www.eventbriteapi.com/v3/events/search/",
    )

    try:
        with patch(
            "app.providers.eventbrite_provider.httpx.get",
            side_effect=httpx.ConnectError(
                "Could not connect to Eventbrite",
                request=eventbrite_request,
            ),
        ):
            response = client.get("/api/events?source=eventbrite")

        assert response.status_code == 502
        assert response.json() == {
            "detail": "Eventbrite request failed"
        }
    finally:
        settings.eventbrite_api_token = original_token
