import pytest

from app.auth import get_current_user
from main import app


@pytest.fixture(autouse=True)
def fake_login():
    # Most tests are about events, not login, so pretend a user is logged in.
    # tests/test_auth.py removes this override to test the real login check.
    app.dependency_overrides[get_current_user] = lambda: {"uid": "test-user"}
    yield
    app.dependency_overrides.clear()