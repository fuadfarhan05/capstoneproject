from app.core.config import settings

#reads in the eventbrite api token and searches eventbrite using the filters. then normalizes into the apps shape

def normalize_eventbrite_event(eventbrite_event: dict) -> dict:
    raise NotImplementedError("Eventbrite event normalization has not been implemented yet")

def get_eventbrite_events(
    city: str | None = None,
    category: str | None = None,
    query: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
):
    if settings.eventbrite_api_token is None:
        raise RuntimeError("EVENTBRITE_API_TOKEN is not configured")

    
    raise NotImplementedError("Eventbrite integration has not been implemented yet")