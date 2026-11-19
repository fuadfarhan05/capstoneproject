from datetime import date, timedelta
from unittest.mock import call, patch

import pytest
from fastapi import HTTPException

from app.providers.eventbrite_provider import (
    EventbriteConfigurationError,
    EventbriteRequestError,
)
from app.providers.ticketmaster_provider import (
    TicketmasterConfigurationError,
    TicketmasterTimeoutError,
)
from app.services.combined_event_service import (
    _deduplicate_events,
    _fetch_eventbrite_prefix,
    _interleave_events,
    get_combined_events,
)


# Builds one complete normalized event for combined-service tests.
def _event(
    event_id: str,
    *,
    source: str,
    date: str,
    time: str = "19:00:00",
    title: str | None = None,
    venue: str = "Shared Venue",
    description: str = "",
) -> dict:
    return {
        "id": event_id,
        "title": title or f"Event {event_id}",
        "description": description,
        "city": "Chicago",
        "venue": venue,
        "date": date,
        "time": time,
        "category": "music",
        "address": None,
        "pricing": "unknown",
        "ticket_link": None,
        "photos": [],
        "source": source,
    }


# Builds a provider prefix with predictable dates for pagination tests.
def _dated_events(source: str, count: int, day_offset: int = 0) -> list[dict]:
    first_date = date(2026, 12, 1) + timedelta(days=day_offset)
    return [
        _event(
            f"{source}-{index}",
            source=source,
            date=(first_date + timedelta(days=index)).isoformat(),
        )
        for index in range(count)
    ]


# Verifies combined searches sort the full provider prefixes before slicing.
def test_combined_date_sort_is_stable_across_page_boundaries():
    ticketmaster_events = _dated_events("ticketmaster", 20, day_offset=0)
    eventbrite_events = _dated_events("eventbrite", 20, day_offset=1)

    with (
        patch(
            "app.services.combined_event_service._fetch_ticketmaster_prefix",
            return_value=(ticketmaster_events, True),
        ),
        patch(
            "app.services.combined_event_service._fetch_eventbrite_prefix",
            return_value=(eventbrite_events, True),
        ),
    ):
        first_page = get_combined_events(page=0, size=20, sort="date")
        second_page = get_combined_events(page=1, size=20, sort="date")

    combined_dates = [
        event["date"]
        for event in first_page["events"] + second_page["events"]
    ]
    assert combined_dates == sorted(combined_dates)
    assert first_page["events"][-1]["date"] <= (
        second_page["events"][0]["date"]
    )


# Verifies an exact occurrence from two providers appears only once.
def test_deduplicate_events_removes_strong_cross_provider_match():
    ticketmaster_event = _event(
        "tm-1",
        source="ticketmaster",
        date="2026-12-10",
        title="Chicago Holiday Concert",
    )
    eventbrite_event = _event(
        "eb-1",
        source="eventbrite",
        date="2026-12-10",
        title="Chicago Holiday Concert",
    )

    deduplicated = _deduplicate_events(
        [eventbrite_event, ticketmaster_event]
    )

    assert len(deduplicated) == 1
    assert deduplicated[0]["source"] == "ticketmaster"


# Verifies different occurrence times are not collapsed as duplicates.
def test_deduplicate_events_preserves_different_time_slots():
    afternoon = _event(
        "tm-2",
        source="ticketmaster",
        date="2026-12-10",
        time="15:00:00",
        title="Chicago Holiday Concert",
    )
    evening = _event(
        "eb-2",
        source="eventbrite",
        date="2026-12-10",
        time="19:00:00",
        title="Chicago Holiday Concert",
    )

    assert len(_deduplicate_events([afternoon, evening])) == 2


# Verifies provider IDs remain namespaced by source during deduplication.
def test_deduplicate_events_preserves_same_id_from_different_sources():
    ticketmaster_event = _event(
        "shared-id",
        source="ticketmaster",
        date="2026-12-10",
        title="Morning Event",
    )
    eventbrite_event = _event(
        "shared-id",
        source="eventbrite",
        date="2026-12-11",
        title="Evening Event",
    )

    deduplicated = _deduplicate_events(
        [ticketmaster_event, eventbrite_event]
    )

    assert len(deduplicated) == 2
    assert {(event["source"], event["id"]) for event in deduplicated} == {
        ("ticketmaster", "shared-id"),
        ("eventbrite", "shared-id"),
    }


# Verifies relevance mode alternates sources without changing provider order.
def test_interleave_events_preserves_each_provider_order():
    ticketmaster_events = _dated_events("ticketmaster", 2)
    eventbrite_events = _dated_events("eventbrite", 2)

    interleaved = _interleave_events(
        ticketmaster_events,
        eventbrite_events,
    )

    assert [event["id"] for event in interleaved] == [
        "ticketmaster-0",
        "eventbrite-0",
        "ticketmaster-1",
        "eventbrite-1",
    ]


# Verifies every filter reaches both provider-prefix requests unchanged.
def test_combined_events_forward_filters_to_both_providers():
    with (
        patch(
            "app.services.combined_event_service._fetch_ticketmaster_prefix",
            return_value=([], False),
        ) as ticketmaster_fetch,
        patch(
            "app.services.combined_event_service._fetch_eventbrite_prefix",
            return_value=([], False),
        ) as eventbrite_fetch,
    ):
        result = get_combined_events(
            city="Chicago",
            category="Sports",
            query="basketball",
            start_date="2026-12-01",
            end_date="2026-12-31",
            page=0,
            size=20,
            sort="date",
        )

    expected_arguments = {
        "city": "Chicago",
        "category": "Sports",
        "query": "basketball",
        "start_date": "2026-12-01",
        "end_date": "2026-12-31",
        "sort": "date",
    }
    ticketmaster_fetch.assert_called_once_with(20, **expected_arguments)
    eventbrite_fetch.assert_called_once_with(20, **expected_arguments)
    assert result["events"] == []


# Verifies Eventbrite prefix collection advances through zero-based pages.
def test_fetch_eventbrite_prefix_requests_multiple_pages():
    first_page = _dated_events("eventbrite", 20)
    second_page = _dated_events("eventbrite", 20, day_offset=20)

    with patch(
        "app.services.combined_event_service.get_eventbrite_events",
        side_effect=[
            {"events": first_page, "has_next": True},
            {"events": second_page, "has_next": False},
        ],
    ) as get_events:
        events, has_next = _fetch_eventbrite_prefix(
            30,
            city="Chicago",
            category=None,
            query=None,
            start_date=None,
            end_date=None,
            sort=None,
        )

    assert len(events) == 30
    assert has_next is True
    assert get_events.call_args_list == [
        call(
            city="Chicago",
            category=None,
            query=None,
            start_date=None,
            end_date=None,
            page=0,
            size=20,
            sort=None,
        ),
        call(
            city="Chicago",
            category=None,
            query=None,
            start_date=None,
            end_date=None,
            page=1,
            size=20,
            sort=None,
        ),
    ]


# Verifies Ticketmaster results survive an Eventbrite provider failure.
def test_combined_events_return_ticketmaster_with_warning_on_partial_failure():
    ticketmaster_events = _dated_events("ticketmaster", 2)

    with (
        patch(
            "app.services.combined_event_service._fetch_ticketmaster_prefix",
            return_value=(ticketmaster_events, False),
        ),
        patch(
            "app.services.combined_event_service._fetch_eventbrite_prefix",
            side_effect=EventbriteRequestError("upstream failed"),
        ),
    ):
        result = get_combined_events(city="Chicago")

    assert result["events"] == ticketmaster_events
    assert result["warnings"] == [
        "Eventbrite events are temporarily unavailable"
    ]


# Verifies Eventbrite results survive a Ticketmaster provider timeout.
def test_combined_events_return_eventbrite_with_warning_on_partial_failure():
    eventbrite_events = _dated_events("eventbrite", 2)

    with (
        patch(
            "app.services.combined_event_service._fetch_ticketmaster_prefix",
            side_effect=TicketmasterTimeoutError("timed out"),
        ),
        patch(
            "app.services.combined_event_service._fetch_eventbrite_prefix",
            return_value=(eventbrite_events, False),
        ),
    ):
        result = get_combined_events(city="Chicago")

    assert result["events"] == eventbrite_events
    assert result["warnings"] == [
        "Ticketmaster events are temporarily unavailable"
    ]


# Verifies two configuration failures produce a service-unavailable response.
def test_combined_events_raise_503_when_both_providers_are_unconfigured():
    with (
        patch(
            "app.services.combined_event_service._fetch_ticketmaster_prefix",
            side_effect=TicketmasterConfigurationError("missing key"),
        ),
        patch(
            "app.services.combined_event_service._fetch_eventbrite_prefix",
            side_effect=EventbriteConfigurationError("missing key"),
        ),
    ):
        with pytest.raises(HTTPException) as error:
            get_combined_events(city="Chicago")

    assert error.value.status_code == 503
    assert error.value.detail == "All event providers are unavailable"


# Verifies combined searches keep their fixed cross-provider page size.
def test_combined_events_reject_nonstandard_page_size():
    with pytest.raises(HTTPException) as error:
        get_combined_events(city="Chicago", size=10)

    assert error.value.status_code == 400
    assert error.value.detail == "combined searches require size=20"


# Verifies unsupported shared categories fail before either provider is called.
def test_combined_events_reject_unsupported_category():
    with pytest.raises(HTTPException) as error:
        get_combined_events(city="Chicago", category="workshops")

    assert error.value.status_code == 400
    assert error.value.detail == "unsupported combined event category"
