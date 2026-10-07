from datetime import date

from fastapi import HTTPException

from app.providers.sample_provider import get_sample_events

# Backend logic: filtering, finding events, and listing supported cities.


def _matches_text(value: str, search_text: str) -> bool:
    return value.strip().lower() == search_text.strip().lower()


def _contains_text(value: str, search_text: str) -> bool:
    return search_text.strip().lower() in value.strip().lower()


def _parse_date(value: str, field_name: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} must use YYYY-MM-DD format",
        )


def filter_events(
    city: str | None = None,
    category: str | None = None,
    query: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
):
    filtered_events = get_sample_events()
    parsed_start_date = _parse_date(start_date, "start_date") if start_date else None
    parsed_end_date = _parse_date(end_date, "end_date") if end_date else None

    if parsed_start_date and parsed_end_date and parsed_start_date > parsed_end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before or equal to end_date",
        )

    if city:
        filtered_events = [
            event for event in filtered_events
            if _matches_text(event["city"], city)
        ]

    if category:
        filtered_events = [
            event for event in filtered_events
            if _matches_text(event["category"], category)
        ]

    if query:
        filtered_events = [
            event for event in filtered_events
            if _contains_text(event["title"], query)
            or _contains_text(event["description"], query)
            or _contains_text(event["venue"], query)
        ]

    if parsed_start_date:
        filtered_events = [
            event for event in filtered_events
            if date.fromisoformat(event["date"]) >= parsed_start_date
        ]

    if parsed_end_date:
        filtered_events = [
            event for event in filtered_events
            if date.fromisoformat(event["date"]) <= parsed_end_date
        ]

    return filtered_events


def get_event_by_id(event_id: int):
    for event in get_sample_events():
        if event["id"] == event_id:
            return event

    return None


def get_cities():
    return sorted({event["city"] for event in get_sample_events()})
