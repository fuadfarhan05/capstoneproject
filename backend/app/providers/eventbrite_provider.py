from copy import deepcopy
from datetime import date
from time import monotonic

import httpx

from app.core.config import settings


SERPAPI_EVENTBRITE_SEARCH_URL = "https://serpapi.com/search"
EVENTBRITE_PAGE_SIZE = 20
EVENTBRITE_CACHE_TTL_SECONDS = 15 * 60
EVENTBRITE_CACHE_MAX_ENTRIES = 128

EVENTBRITE_CATEGORY_MAP = {
    "music": "music",
    "sports": "sports_and_fitness",
    "arts & theatre": "performing_and_visual_arts",
    "film": "film_media_and_entertainment",
    "miscellaneous": "other",
}

EVENTBRITE_RESULT_CATEGORY_MAP = {
    "music": "music",
    "sports & fitness": "sports",
    "sports and fitness": "sports",
    "performing & visual arts": "arts & theatre",
    "performing and visual arts": "arts & theatre",
    "film, media & entertainment": "film",
    "film media & entertainment": "film",
}

_eventbrite_cache: dict[tuple, tuple[float, dict]] = {}


class EventbriteConfigurationError(RuntimeError):
    """Raised when Eventbrite search is missing required configuration."""


class EventbriteValidationError(ValueError):
    """Raised when filters cannot be represented by Eventbrite search."""


class EventbriteRequestError(RuntimeError):
    """Raised when the Eventbrite search provider request fails."""


class EventbriteQuotaError(EventbriteRequestError):
    """Raised when the Eventbrite search quota has been exhausted."""


class EventbriteTimeoutError(EventbriteRequestError):
    """Raised when the Eventbrite search provider times out."""


class EventbriteResponseError(EventbriteRequestError):
    """Raised when the Eventbrite search provider returns malformed data."""


# Maps provider result labels into Triply's shared category values.
def _normalize_eventbrite_category(category: object) -> str:
    if not category:
        return "unknown"

    normalized = str(category).strip().lower()
    return EVENTBRITE_RESULT_CATEGORY_MAP.get(normalized, "miscellaneous")


# Clears cached Eventbrite pages so tests and maintenance can start fresh.
def clear_eventbrite_cache() -> None:
    _eventbrite_cache.clear()


# Builds a secret-free cache key from provider search parameters.
def _build_eventbrite_cache_key(params: dict) -> tuple:
    return tuple(
        sorted(
            (key, str(value))
            for key, value in params.items()
            if key != "api_key"
        )
    )


# Returns an unexpired cached page without exposing mutable cached state.
def _get_cached_eventbrite_page(cache_key: tuple) -> dict | None:
    cached = _eventbrite_cache.get(cache_key)
    if cached is None:
        return None

    cached_at, page = cached
    if monotonic() - cached_at >= EVENTBRITE_CACHE_TTL_SECONDS:
        _eventbrite_cache.pop(cache_key, None)
        return None

    return deepcopy(page)


# Stores a provider page for a short period to protect the search quota.
def _cache_eventbrite_page(cache_key: tuple, page: dict) -> None:
    if (
        cache_key not in _eventbrite_cache
        and len(_eventbrite_cache) >= EVENTBRITE_CACHE_MAX_ENTRIES
    ):
        oldest_key = min(
            _eventbrite_cache,
            key=lambda key: _eventbrite_cache[key][0],
        )
        _eventbrite_cache.pop(oldest_key, None)

    _eventbrite_cache[cache_key] = (monotonic(), deepcopy(page))


# Translates Triply filters into SerpApi's Eventbrite search parameters.
def build_eventbrite_search_params(
    city: str | None = None,
    category: str | None = None,
    query: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    page: int = 0,
    size: int = EVENTBRITE_PAGE_SIZE,
    sort: str | None = None,
) -> dict:
    api_key = settings.serpapi_api_key
    if api_key is None or not api_key.strip():
        raise EventbriteConfigurationError(
            "SERPAPI_API_KEY is not configured"
        )

    if not city or not city.strip():
        raise EventbriteValidationError(
            "city is required for Eventbrite searches"
        )

    if size != EVENTBRITE_PAGE_SIZE:
        raise EventbriteValidationError(
            "Eventbrite searches require size=20"
        )

    if bool(start_date) != bool(end_date):
        raise EventbriteValidationError(
            "Eventbrite searches require start_date and end_date together"
        )

    if start_date and date.fromisoformat(start_date) < date.today():
        raise EventbriteValidationError(
            "Eventbrite start_date cannot be in the past"
        )

    params = {
        "engine": "eventbrite",
        "api_key": api_key.strip(),
        "location": city.strip(),
        "page": page + 1,
    }

    if query:
        params["q"] = query

    if category:
        mapped_category = EVENTBRITE_CATEGORY_MAP.get(
            category.strip().lower()
        )
        if mapped_category is None:
            raise EventbriteValidationError(
                "unsupported Eventbrite category"
            )
        params["category"] = mapped_category

    if start_date and end_date:
        params["start_date"] = start_date
        params["end_date"] = end_date

    if sort == "date":
        params["sort_by"] = "date"

    return params


# Converts one SerpApi Eventbrite result into Triply's Event contract.
def normalize_eventbrite_event(
    eventbrite_event: dict,
    city: str,
) -> dict:
    if not isinstance(eventbrite_event, dict):
        raise EventbriteResponseError(
            "Eventbrite search returned an invalid event"
        )

    event_id = eventbrite_event.get("event_id")
    title = eventbrite_event.get("title")
    start_date = eventbrite_event.get("start_date")
    if not event_id or not title or not start_date:
        raise EventbriteResponseError(
            "Eventbrite search returned an incomplete event"
        )

    venue = eventbrite_event.get("venue") or {}
    if not isinstance(venue, dict):
        raise EventbriteResponseError(
            "Eventbrite search returned an invalid venue"
        )

    address_value = eventbrite_event.get("address")
    if isinstance(address_value, list):
        address = ", ".join(
            str(part).strip()
            for part in address_value
            if part is not None and str(part).strip()
        ) or None
    elif isinstance(address_value, str):
        address = address_value.strip() or None
    else:
        address = None

    image = (
        eventbrite_event.get("image")
        or eventbrite_event.get("thumbnail")
    )
    photos = [image] if image else []

    pricing = str(eventbrite_event.get("price") or "unknown")
    maximum_price = eventbrite_event.get("max_price")
    if maximum_price and str(maximum_price) != pricing:
        pricing = f"{pricing} - {maximum_price}"

    normalized_category = _normalize_eventbrite_category(
        eventbrite_event.get("category")
    )

    return {
        "id": str(event_id),
        "title": str(title),
        "description": str(eventbrite_event.get("description") or ""),
        "city": city,
        "venue": venue.get("name") or (
            "Online" if eventbrite_event.get("online") else ""
        ),
        "date": str(start_date),
        "time": eventbrite_event.get("start_time"),
        "category": normalized_category,
        "address": address,
        "pricing": pricing,
        "ticket_link": eventbrite_event.get("link"),
        "photos": photos,
        "source": "eventbrite",
    }


# Normalizes every Eventbrite result and rejects malformed provider payloads.
def normalize_eventbrite_response(
    response_data: dict,
    city: str,
) -> list[dict]:
    if not isinstance(response_data, dict):
        raise EventbriteResponseError(
            "Eventbrite search returned an invalid response"
        )

    events = response_data.get("events_results") or []
    if not isinstance(events, list):
        raise EventbriteResponseError(
            "Eventbrite search returned an invalid event list"
        )

    return [
        normalize_eventbrite_event(event, city=city)
        for event in events
    ]


# Builds Triply pagination metadata from SerpApi's Eventbrite page links.
def build_eventbrite_page(
    response_data: dict,
    events: list[dict],
    requested_page: int,
) -> dict:
    pagination = response_data.get("serpapi_pagination") or {}
    provider_page = pagination.get("current", requested_page + 1)

    try:
        current_page = max(int(provider_page) - 1, 0)
    except (TypeError, ValueError):
        current_page = requested_page

    return {
        "events": events,
        "page": current_page,
        "size": EVENTBRITE_PAGE_SIZE,
        "total_pages": None,
        "total_elements": None,
        "has_next": bool(pagination.get("next")),
    }


# Requests one cached, normalized Eventbrite page through SerpApi.
def get_eventbrite_events(
    city: str | None = None,
    category: str | None = None,
    query: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    page: int = 0,
    size: int = EVENTBRITE_PAGE_SIZE,
    sort: str | None = None,
) -> dict:
    params = build_eventbrite_search_params(
        city=city,
        category=category,
        query=query,
        start_date=start_date,
        end_date=end_date,
        page=page,
        size=size,
        sort=sort,
    )
    cache_key = _build_eventbrite_cache_key(params)
    cached_page = _get_cached_eventbrite_page(cache_key)
    if cached_page is not None:
        return cached_page

    try:
        response = httpx.get(
            SERPAPI_EVENTBRITE_SEARCH_URL,
            params=params,
            timeout=10,
        )
        response.raise_for_status()
    except httpx.TimeoutException as exc:
        raise EventbriteTimeoutError(
            "Eventbrite search request timed out"
        ) from exc
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 429:
            raise EventbriteQuotaError(
                "Eventbrite search quota is unavailable"
            ) from exc
        raise EventbriteRequestError(
            "Eventbrite search request failed"
        ) from exc
    except httpx.HTTPError as exc:
        raise EventbriteRequestError(
            "Eventbrite search request failed"
        ) from exc

    try:
        response_data = response.json()
    except ValueError as exc:
        raise EventbriteResponseError(
            "Eventbrite search returned invalid JSON"
        ) from exc

    if not isinstance(response_data, dict):
        raise EventbriteResponseError(
            "Eventbrite search returned an invalid response"
        )
    provider_error = response_data.get("error")
    if provider_error:
        provider_error_text = str(provider_error).lower()
        if any(
            marker in provider_error_text
            for marker in ("quota", "limit", "searches per month")
        ):
            raise EventbriteQuotaError(
                "Eventbrite search quota is unavailable"
            )
        raise EventbriteRequestError(
            "Eventbrite search provider reported an error"
        )

    events = normalize_eventbrite_response(
        response_data,
        city=city.strip() if city else "",
    )
    event_page = build_eventbrite_page(
        response_data,
        events,
        requested_page=page,
    )
    _cache_eventbrite_page(cache_key, event_page)
    return event_page
