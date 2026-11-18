import pytest
from fastapi.testclient import TestClient

import app.auth as auth_module
from app.auth import get_current_user
from main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def real_login_check(monkeypatch):
    # Use the real get_current_user, but fake Firebase so no network or key is needed.
    app.dependency_overrides.pop(get_current_user, None)
    monkeypatch.setattr(auth_module, "_init_firebase", lambda: None)
    monkeypatch.delenv("REQUIRE_VERIFIED_EMAIL", raising=False)


def _verify(token):
    if token == "good-token":
        return {"uid": "test-user"}
    raise ValueError("bad token")


def _unverified(token):
    if token == "good-token":
        return {"uid": "test-user", "email_verified": False}
    raise ValueError("bad token")


def _verified(token):
    if token == "good-token":
        return {"uid": "test-user", "email_verified": True}
    raise ValueError("bad token")


def test_no_token_returns_401(monkeypatch):
    monkeypatch.setattr(auth_module.auth, "verify_id_token", _verify)

    response = client.get("/api/events")

    assert response.status_code == 401
    assert response.json()["detail"] == "Missing authentication token"


def test_fake_token_returns_401(monkeypatch):
    monkeypatch.setattr(auth_module.auth, "verify_id_token", _verify)

    response = client.get("/api/events", headers={"Authorization": "Bearer fake123"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or expired token"


def test_valid_token_returns_200(monkeypatch):
    monkeypatch.setattr(auth_module.auth, "verify_id_token", _verify)

    response = client.get("/api/events", headers={"Authorization": "Bearer good-token"})

    assert response.status_code == 200


def test_health_stays_public(monkeypatch):
    monkeypatch.setattr(auth_module.auth, "verify_id_token", _verify)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_unverified_email_blocked_when_required(monkeypatch):
    monkeypatch.setenv("REQUIRE_VERIFIED_EMAIL", "true")
    monkeypatch.setattr(auth_module.auth, "verify_id_token", _unverified)

    response = client.get("/api/events", headers={"Authorization": "Bearer good-token"})

    assert response.status_code == 403
    assert response.json()["detail"] == "Email not verified"


def test_verified_email_allowed_when_required(monkeypatch):
    monkeypatch.setenv("REQUIRE_VERIFIED_EMAIL", "true")
    monkeypatch.setattr(auth_module.auth, "verify_id_token", _verified)

    response = client.get("/api/events", headers={"Authorization": "Bearer good-token"})

    assert response.status_code == 200


def test_unverified_email_allowed_when_not_required(monkeypatch):
    monkeypatch.setattr(auth_module.auth, "verify_id_token", _unverified)

    response = client.get("/api/events", headers={"Authorization": "Bearer good-token"})

    assert response.status_code == 200