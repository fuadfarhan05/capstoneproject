import httpx

from app.core.config import settings

TICKETMASTER_SEARCH_URL = (
    "https://app.ticketmaster.com/discovery/v2/events.json"
)


class TicketmasterConfigurationError(RuntimeError):
    """Raised when Ticketmaster configuration is missing."""


class TicketmasterRequestError(RuntimeError):
    """Raised when a Ticketmaster HTTP request fails."""


class TicketmasterTimeoutError(TicketmasterRequestError):
    """Raised when Ticketmaster does not respond before the timeout."""


# Builds Ticketmaster query parameters from our API's search filters.
def build_ticketmaster_search_params(
    city: str | None = None,
    category: str | None = None,
    query: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    page: int | None = None,
    size: int | None = None,
) -> dict:
    api_key = settings.ticketmaster_api_key

    if api_key is None or not api_key.strip():
        raise TicketmasterConfigurationError(
            "TICKETMASTER_API_KEY is not configured"
        )

    params = {"apikey": api_key.strip()}

    if city:
        params["city"] = city

    if category:
        params["classificationName"] = category

    if query:
        params["keyword"] = query

    if start_date:
        params["startDateTime"] = f"{start_date}T00:00:00Z"

    if end_date:
        params["endDateTime"] = f"{end_date}T23:59:59Z"

    if page is not None:
        params["page"] = page

    if size is not None:
        params["size"] = size

    return params


# Converts one Ticketmaster event into the event format used by our application.
def normalize_ticketmaster_event(
    ticketmaster_event: dict,
    city: str,
) -> dict:
    embedded = ticketmaster_event.get("_embedded") or {}
    venues = embedded.get("venues") or []
    venue = venues[0] if venues else {}

    venue_city_data = venue.get("city") or {}
    venue_city = venue_city_data.get("name") or city

    venue_address = venue.get("address") or {}
    address_line = venue_address.get("line1")

    state_data = venue.get("state") or {}
    state_code = state_data.get("stateCode")
    postal_code = venue.get("postalCode")

    address = None

    if address_line:
        state_and_postal = " ".join(
            part
            for part in [state_code, postal_code]
            if part
        )

        address_parts = [
            address_line,
            venue_city,
            state_and_postal,
        ]

        address = ", ".join(
            part
            for part in address_parts
            if part
        )

    dates = ticketmaster_event.get("dates") or {}
    start = dates.get("start") or {}

    classifications = (
        ticketmaster_event.get("classifications") or []
    )
    classification = (
        classifications[0] if classifications else {}
    )
    segment = classification.get("segment") or {}
    category = segment.get("name", "unknown").lower()

    price_ranges = ticketmaster_event.get("priceRanges") or []
    pricing = "unknown"

    if price_ranges:
        price_range = price_ranges[0]
        minimum = price_range.get("min")
        maximum = price_range.get("max")
        currency = price_range.get("currency")

        if minimum is not None and maximum is not None:
            pricing = (
                f"{minimum:.2f} - {maximum:.2f} {currency}"
            ).strip()

    images = ticketmaster_event.get("images") or []
    photos = [
        image["url"]
        for image in images
        if image.get("url")
    ]

    return {
        "id": ticketmaster_event.get("id", ""),
        "title": ticketmaster_event.get("name", ""),
        "description": (
            ticketmaster_event.get("info")
            or ticketmaster_event.get("pleaseNote")
            or ""
        ),
        "city": venue_city,
        "venue": venue.get("name", ""),
        "date": start.get("localDate", ""),
        "time": start.get("localTime"),
        "category": category,
        "address": address,
        "pricing": pricing,
        "ticket_link": ticketmaster_event.get("url"),
        "photos": photos,
        "source": "ticketmaster",
    }


# Converts every event in a Ticketmaster response into our application format.
def normalize_ticketmaster_response(
    response_data: dict,
    city: str,
) -> list[dict]:
    embedded = response_data.get("_embedded") or {}
    events = embedded.get("events") or []

    return [
        normalize_ticketmaster_event(
            ticketmaster_event,
            city=city,
        )
        for ticketmaster_event in events
    ]


# Requests Ticketmaster events and returns them in our normalized event format.
def get_ticketmaster_events(
    city: str | None = None,
    category: str | None = None,
    query: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    page: int | None = None,
    size: int | None = None,
) -> list[dict]:
    params = build_ticketmaster_search_params(
        city=city,
        category=category,
        query=query,
        start_date=start_date,
        end_date=end_date,
        page=page,
        size=size,
    )

    try:
        response = httpx.get(
            TICKETMASTER_SEARCH_URL,
            params=params,
            timeout=10,
        )
        response.raise_for_status()
    except httpx.TimeoutException as exc:
        raise TicketmasterTimeoutError(
            "Ticketmaster request timed out"
        ) from exc
    except httpx.HTTPError as exc:
        raise TicketmasterRequestError(
            "Ticketmaster request failed"
        ) from exc

    return normalize_ticketmaster_response(response.json(), city=city or "")
