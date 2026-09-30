from fastapi import APIRouter, HTTPException
from app.services.event_service import filter_events, get_cities, get_event_by_id
from app.models.event import Event, EventListResponse
from app.models.city import CityListResponse


router = APIRouter()


@router.get("/events", response_model=EventListResponse)
def list_events(
    city: str | None = None,
    category: str | None = None,
    query: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
):
    return {
        "events": filter_events(
            city=city,
            category=category,
            query=query,
            start_date=start_date,
            end_date=end_date,
        )
    }


@router.get("/cities", response_model=CityListResponse)
def list_cities():
    return {"cities": get_cities()}


@router.get("/events/{event_id}", response_model=Event)
def get_event(event_id: int):
    event = get_event_by_id(event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")

    return event
