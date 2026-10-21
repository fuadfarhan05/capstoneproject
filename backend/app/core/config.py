import os
from pathlib import Path

from dotenv import load_dotenv


BACKEND_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


def load_backend_environment(
    env_file: str | Path = BACKEND_ENV_FILE,
) -> bool:
    return load_dotenv(dotenv_path=env_file, override=False)


load_backend_environment()


def get_allowed_origins() -> list[str]:
    raw_origins = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )

    return [
        origin.strip()
        for origin in raw_origins.split(",")
        if origin.strip()
    ]


class Settings:
    eventbrite_api_token: str | None = os.getenv("EVENTBRITE_API_TOKEN")
    ticketmaster_api_key: str | None = os.getenv("TICKETMASTER_API_KEY")
    allowed_origins: list[str] = get_allowed_origins()


settings = Settings()

