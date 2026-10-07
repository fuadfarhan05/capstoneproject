from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

def test_health_check():
    response = client.get('/health')

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_events_return_events():
    response = client.get("/api/events")

    assert response.status_code == 200
    data = response.json()
    assert "events" in data
    assert len(data["events"]) > 0


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

def test_filter_events_by_date_range():
        response = client.get("/api/events?start_date=2026-10-15&end_date=2026-10-20")

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