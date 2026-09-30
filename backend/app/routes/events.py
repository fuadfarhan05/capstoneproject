from fastapi import APIRouter, HTTPException
from app.services.event_service import filter_events, get_cities, get_event_by_id


router = APIRouter()

@router.get("/events")
def list_events(city: str | None = None, category: str | None = None, query: str | None = None, start_date: str | None = None, end_date: str | None = None):
    return {"events": filter_events(city=city, category=category,query=query, start_date=start_date, end_date=end_date)} #call helpr function that filters events, cleaner structure

@router.get("/cities") #search for events
def list_cities():
    return {"cities": get_cities()} #return call of get_cities in JSON object under key cities

@router.get("/events/{event_id}") #search for event by id
def get_event(event_id: int):
    event = get_event_by_id(event_id) #call helper and pass parameter
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found") #stop request and raise an error
    
    return event
