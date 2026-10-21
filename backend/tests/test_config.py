import os

from app.core.config import load_backend_environment, settings


def test_load_backend_environment_reads_env_file(tmp_path, monkeypatch):
    env_file = tmp_path / ".env"
    env_file.write_text(
        "TEST_BACKEND_SETTING=from-dotenv\n",
        encoding="utf-8",
    )
    monkeypatch.delenv("TEST_BACKEND_SETTING", raising=False)

    loaded = load_backend_environment(env_file)

    assert loaded is True
    assert os.getenv("TEST_BACKEND_SETTING") == "from-dotenv"


def test_load_backend_environment_preserves_existing_environment(
    tmp_path,
    monkeypatch,
):
    env_file = tmp_path / ".env"
    env_file.write_text(
        "TEST_BACKEND_SETTING=from-dotenv\n",
        encoding="utf-8",
    )
    monkeypatch.setenv("TEST_BACKEND_SETTING", "from-environment")

    load_backend_environment(env_file)

    assert os.getenv("TEST_BACKEND_SETTING") == "from-environment"


def test_settings_has_ticketmaster_api_key():
    assert hasattr(settings, "ticketmaster_api_key")
