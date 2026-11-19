import re
from typing import Any

from fastapi import HTTPException

from app.providers.eventbrite_provider import (
    EVENTBRITE_PAGE_SIZE,
    EventbriteConfigurationError,
    EventbriteQuotaError,
    EventbriteRequestError,
    EventbriteTimeoutError,
    EventbriteValidationError,
    get_eventbrite_events,
)
from app.providers.ticketmaster_provider import (
    TicketmasterConfigurationError,
    TicketmasterRequestError,
    TicketmasterTimeoutError,
    get_ticketmaster_events,
)


COMBINED_PAGE_SIZE = 20
TICKETMASTER_PREFIX_PAGE_SIZE = 200
MAX_REFILL_ATTEMPTS = 3
CANONICAL_CATEGORIES = {
    "music",
    "sports",
    "arts & theatre",
    "film",
    "miscellaneous",
}


# Fetches enough chronologically compatible Ticketmaster results for one combined page.
def _fetch_ticketmaster_prefix(
    limit: int,
    *,
    city: str | None,
    category: str | None,
    query: str | None,
    start_date: str | None,
    end_date: str | None,
    sort: str | None,
) -> tuple[list[dict], bool]:
    page_size = min(limit, TICKETMASTER_PREFIX_PAGE_SIZE)
    events: list[dict] = []
    provider_has_next = False
    page = 0

    while len(events) < limit:
        result = get_ticketmaster_events(
            city=city,
            category=category,
            query=query,
            start_date=start_date,
            end_date=end_date,
            page=page,
            size=page_size,
            sort=sort,
        )
        batch = result.get("events") or []
        events.extend(batch)
        provider_has_next = bool(result.get("has_next"))

        if not batch or not provider_has_next:
            break

        page += 1

    return events[:limit], len(events) > limit or provider_has_next


# Fetches enough cached SerpApi Eventbrite pages for one combined page.
def _fetch_eventbrite_prefix(
    limit: int,
    *,
    city: str | None,
    category: str | None,
    query: str | None,
    start_date: str | None,
    end_date: str | None,
    sort: str | None,
) -> tuple[list[dict], bool]:
    events: list[dict] = []
    provider_has_next = False
    page = 0

    while len(events) < limit:
        result = get_eventbrite_events(
            city=city,
            category=category,
            query=query,
            start_date=start_date,
            end_date=end_date,
            page=page,
            size=EVENTBRITE_PAGE_SIZE,
            sort=sort,
        )
        batch = result.get("events") or []
        events.extend(batch)
        provider_has_next = bool(result.get("has_next"))

        if not batch or not provider_has_next:
            break

        page += 1

    return events[:limit], len(events) > limit or provider_has_next


# Produces stable lowercase text for conservative duplicate comparisons.
def _normalize_text(value: Any) -> str:
    return " ".join(
        re.sub(r"[^a-z0-9]+", " ", str(value or "").lower()).split()
    )


# Builds a strong occurrence fingerprint without collapsing different time slots.
def _event_fingerprint(event: dict) -> tuple[str, str, str, str] | None:
    title = _normalize_text(event.get("title"))
    event_date = str(event.get("date") or "")
    event_time = str(event.get("time") or "")
    venue = _normalize_text(event.get("venue"))

    if not title or not event_date or not venue:
        return None

    return title, event_date, event_time, venue


# Scores optional event fields so duplicate resolution keeps the richer record.
def _event_completeness(event: dict) -> int:
    useful_values = [
        event.get("description"),
        event.get("venue"),
        event.get("time"),
        event.get("address"),
        event.get("ticket_link"),
    ]
    score = sum(bool(value) for value in useful_values)
    pricing = event.get("pricing")
    if pricing and str(pricing).lower() != "unknown":
        score += 1
    if event.get("photos"):
        score += 1
    return score


# Removes exact provider repeats and strong cross-provider occurrence matches.
def _deduplicate_events(events: list[dict]) -> list[dict]:
    deduplicated: list[dict] = []
    event_key_indexes: dict[tuple[str, str], int] = {}
    fingerprint_indexes: dict[tuple[str, str, str, str], int] = {}

    for event in events:
        source = str(event.get("source") or "")
        event_id = str(event.get("id") or "")
        event_key = (source, event_id)
        if event_id and event_key in event_key_indexes:
            continue

        fingerprint = _event_fingerprint(event)
        duplicate_index = (
            fingerprint_indexes.get(fingerprint)
            if fingerprint is not None
            else None
        )

        if duplicate_index is not None:
            existing = deduplicated[duplicate_index]
            existing_score = _event_completeness(existing)
            candidate_score = _event_completeness(event)
            prefer_ticketmaster = (
                candidate_score == existing_score
                and event.get("source") == "ticketmaster"
                and existing.get("source") != "ticketmaster"
            )
            if candidate_score > existing_score or prefer_ticketmaster:
                existing_key = (
                    str(existing.get("source") or ""),
                    str(existing.get("id") or ""),
                )
                event_key_indexes.pop(existing_key, None)
                deduplicated[duplicate_index] = event
                event_key_indexes[event_key] = duplicate_index
            continue

        event_index = len(deduplicated)
        deduplicated.append(event)
        event_key_indexes[event_key] = event_index
        if fingerprint is not None:
            fingerprint_indexes[fingerprint] = event_index

    return deduplicated


# Sorts complete event occurrences chronologically with deterministic tie breakers.
def _event_date_key(event: dict) -> tuple[str, str, str, str, str]:
    return (
        str(event.get("date") or "9999-12-31"),
        str(event.get("time") or "23:59:59"),
        _normalize_text(event.get("title")),
        str(event.get("source") or ""),
        str(event.get("id") or ""),
    )


# Alternates providers while preserving each provider's relevance order.
def _interleave_events(
    ticketmaster_events: list[dict],
    eventbrite_events: list[dict],
) -> list[dict]:
    interleaved: list[dict] = []
    longest = max(len(ticketmaster_events), len(eventbrite_events))

    for index in range(longest):
        if index < len(ticketmaster_events):
            interleaved.append(ticketmaster_events[index])
        if index < len(eventbrite_events):
            interleaved.append(eventbrite_events[index])

    return interleaved


# Orders a deduplicated provider prefix for date or relevance presentation.
def _order_combined_events(
    ticketmaster_events: list[dict],
    eventbrite_events: list[dict],
    sort: str | None,
) -> list[dict]:
    deduplicated = _deduplicate_events(
        ticketmaster_events + eventbrite_events
    )

    if sort == "date":
        return sorted(deduplicated, key=_event_date_key)

    ticketmaster_order = [
        event
        for event in deduplicated
        if event.get("source") == "ticketmaster"
    ]
    eventbrite_order = [
        event
        for event in deduplicated
        if event.get("source") == "eventbrite"
    ]
    return _interleave_events(ticketmaster_order, eventbrite_order)


# Converts provider exceptions into public status codes and warning text.
def _describe_provider_failure(
    provider: str,
    error: Exception,
) -> tuple[int, str]:
    if isinstance(error, EventbriteValidationError):
        return 400, "Eventbrite events are unavailable for these filters"
    if isinstance(
        error,
        (TicketmasterConfigurationError, EventbriteConfigurationError),
    ):
        return 503, f"{provider} events are temporarily unavailable"
    if isinstance(error, EventbriteQuotaError):
        return 503, "Eventbrite events are temporarily unavailable"
    if isinstance(
        error,
        (TicketmasterTimeoutError, EventbriteTimeoutError),
    ):
        return 504, f"{provider} events are temporarily unavailable"
    return 502, f"{provider} events are temporarily unavailable"


# Selects one public error when neither live provider can answer a request.
def _combined_failure_status(failures: list[tuple[int, str]]) -> int:
    statuses = [status for status, _ in failures]
    if 400 in statuses:
        return 400
    if statuses and all(status == 503 for status in statuses):
        return 503
    if 504 in statuses:
        return 504
    return 502


# Merges both live providers into one stable, globally paginated event response.
def get_combined_events(
    city: str | None = None,
    category: str | None = None,
    query: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    page: int = 0,
    size: int = COMBINED_PAGE_SIZE,
    sort: str | None = None,
) -> dict:
    if size != COMBINED_PAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="combined searches require size=20",
        )

    if category and category.strip().lower() not in CANONICAL_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail="unsupported combined event category",
        )

    page_end = (page + 1) * size
    prefix_limit = page_end
    ticketmaster_events: list[dict] = []
    eventbrite_events: list[dict] = []
    ticketmaster_has_next = False
    eventbrite_has_next = False
    ticketmaster_failure: tuple[int, str] | None = None
    eventbrite_failure: tuple[int, str] | None = None

    try:
        ticketmaster_events, ticketmaster_has_next = (
            _fetch_ticketmaster_prefix(
                prefix_limit,
                city=city,
                category=category,
                query=query,
                start_date=start_date,
                end_date=end_date,
                sort=sort,
            )
        )
    except (
        TicketmasterConfigurationError,
        TicketmasterTimeoutError,
        TicketmasterRequestError,
    ) as error:
        ticketmaster_failure = _describe_provider_failure(
            "Ticketmaster",
            error,
        )

    try:
        eventbrite_events, eventbrite_has_next = _fetch_eventbrite_prefix(
            prefix_limit,
            city=city,
            category=category,
            query=query,
            start_date=start_date,
            end_date=end_date,
            sort=sort,
        )
    except (
        EventbriteValidationError,
        EventbriteConfigurationError,
        EventbriteQuotaError,
        EventbriteTimeoutError,
        EventbriteRequestError,
    ) as error:
        eventbrite_failure = _describe_provider_failure(
            "Eventbrite",
            error,
        )

    failures = [
        failure
        for failure in [ticketmaster_failure, eventbrite_failure]
        if failure is not None
    ]
    if ticketmaster_failure and eventbrite_failure:
        raise HTTPException(
            status_code=_combined_failure_status(failures),
            detail="All event providers are unavailable",
        )

    ordered_events = _order_combined_events(
        ticketmaster_events,
        eventbrite_events,
        sort,
    )
    refill_attempts = 0

    while (
        len(ordered_events) < page_end
        and (ticketmaster_has_next or eventbrite_has_next)
        and refill_attempts < MAX_REFILL_ATTEMPTS
    ):
        prefix_limit += size
        refill_attempts += 1

        if ticketmaster_failure is None and ticketmaster_has_next:
            try:
                ticketmaster_events, ticketmaster_has_next = (
                    _fetch_ticketmaster_prefix(
                        prefix_limit,
                        city=city,
                        category=category,
                        query=query,
                        start_date=start_date,
                        end_date=end_date,
                        sort=sort,
                    )
                )
            except (
                TicketmasterConfigurationError,
                TicketmasterTimeoutError,
                TicketmasterRequestError,
            ) as error:
                ticketmaster_failure = _describe_provider_failure(
                    "Ticketmaster",
                    error,
                )
                ticketmaster_has_next = False

        if eventbrite_failure is None and eventbrite_has_next:
            try:
                eventbrite_events, eventbrite_has_next = (
                    _fetch_eventbrite_prefix(
                        prefix_limit,
                        city=city,
                        category=category,
                        query=query,
                        start_date=start_date,
                        end_date=end_date,
                        sort=sort,
                    )
                )
            except (
                EventbriteValidationError,
                EventbriteConfigurationError,
                EventbriteQuotaError,
                EventbriteTimeoutError,
                EventbriteRequestError,
            ) as error:
                eventbrite_failure = _describe_provider_failure(
                    "Eventbrite",
                    error,
                )
                eventbrite_has_next = False

        ordered_events = _order_combined_events(
            ticketmaster_events,
            eventbrite_events,
            sort,
        )

    page_start = page * size
    warnings = list(
        dict.fromkeys(
            failure[1]
            for failure in [ticketmaster_failure, eventbrite_failure]
            if failure is not None
        )
    )

    return {
        "events": ordered_events[page_start:page_end],
        "page": page,
        "size": size,
        "total_pages": None,
        "total_elements": None,
        "has_next": (
            len(ordered_events) > page_end
            or ticketmaster_has_next
            or eventbrite_has_next
        ),
        "warnings": warnings,
    }
