import os


class Settings:
    #makes this a reusable token by other classes
    eventbrite_api_token: str | None = os.getenv("EVENTBRITE_API_TOKEN")



settings = Settings()
