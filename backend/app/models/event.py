from pydantic import BaseModel, Field


class Event(BaseModel):
    id: int
    title: str
    description: str
    city: str
    venue: str
    date: str
    category: str
    address: str | None = None
    pricing: str | None = None
    ticket_link: str | None = None
    photos: list[str] = Field(default_factory=list) #photos should be a list of strings if not default to empty list
    source: str = "sample" #where is this event from, ticketmaster, eventbrite, sample data?


class EventListResponse(BaseModel): #named response model, this way the json response isn't too vague
    events: list[Event]