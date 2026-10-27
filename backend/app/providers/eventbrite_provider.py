from app.core.config import settings
import httpx

EVENTBRITE_SEARCH_URL = "https://www.eventbriteapi.com/v3/events/search/"


class EventbriteConfigurationError(RuntimeError):
    """Raised when the Eventbrite provider is missing required configuration."""


class EventbriteRequestError(RuntimeError):
    """Raised when an Eventbrite HTTP request fails."""


class EventbriteTimeoutError(EventbriteRequestError):
    """Raised when Eventbrite does not respond before the timeout."""


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

def normalize_eventbrite_response(response_data: dict, city: str) -> list[dict]:
    events = response_data.get("events") or []

    return [
        normalize_eventbrite_event(eventbrite_event, city=city)
        for eventbrite_event in events
    ]

def get_eventbrite_events(
    city: str | None = None,
    category: str | None = None,
    query: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
):
    headers = build_eventbrite_headers()

    params = build_eventbrite_search_params(
        city=city,
        category=category,
        query=query,
        start_date=start_date,
        end_date=end_date,
    )

    try:
        response = httpx.get(
            EVENTBRITE_SEARCH_URL,
            headers=headers,
            params=params,
            timeout=10,
        )
        response.raise_for_status()
    except httpx.TimeoutException as exc:
        raise EventbriteTimeoutError(
            "Eventbrite request timed out"
        ) from exc
    except httpx.HTTPError as exc:
        raise EventbriteRequestError(
            "Eventbrite request failed"
        ) from exc

    return normalize_eventbrite_response(response.json(), city=city or "")

def build_eventbrite_headers():
    token = settings.eventbrite_api_token
    if token is None or not token.strip():
        raise EventbriteConfigurationError(
            "EVENTBRITE_API_TOKEN is not configured"
        )

    return {
        "Authorization": f"Bearer {token.strip()}"
    }

def build_eventbrite_search_params(
    city: str | None = None,
    category: str | None = None,
    query: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
) -> dict:
    params = {}

    if query:
        params["q"] = query

    if city:
        params["location.address"] = city

    if start_date:
        params["start_date.range_start"] = f"{start_date}T00:00:00"

    if end_date:
        params["start_date.range_end"] = f"{end_date}T23:59:59"

    return params
