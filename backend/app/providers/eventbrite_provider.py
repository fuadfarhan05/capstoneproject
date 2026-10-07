from app.core.config import settings

#reads in the eventbrite api token and searches eventbrite using the filters. then normalizes into the apps shape

def normalize_eventbrite_event(eventbrite_event: dict, city: str) -> dict:
    logo = eventbrite_event.get("logo") or {}
    venue = eventbrite_event.get("venue") or {}
    address = venue.get("address") or {}

    photo_url = logo.get("url")
    photos = [photo_url] if photo_url else []

    start = eventbrite_event.get("start") or {}
    start_local = start.get("local", "")

    name = eventbrite_event.get("name") or {}
    description = eventbrite_event.get("description") or {}

    return {
        "id": int(eventbrite_event["id"]),
        "title": name.get("text", ""),
        "description": description.get("text", ""),
        "city": city,
        "venue": venue.get("name", ""),
        "date": start_local[:10],
        "category": "unknown",
        "address": address.get("localized_address_display"),
        "pricing": "unknown",
        "ticket_link": eventbrite_event.get("url"),
        "photos": photos,
        "source": "eventbrite",
    }

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