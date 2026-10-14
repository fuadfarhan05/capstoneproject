import os


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
    #makes this a reusable token by other classes
    eventbrite_api_token: str | None = os.getenv("EVENTBRITE_API_TOKEN")
    allowed_origins: list[str] = get_allowed_origins()



settings = Settings()

