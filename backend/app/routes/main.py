from fastapi import FastAPI

app = FastAPI()


events = { 
    {"id": 1, "title": "Career Fair", "category": "networking"},
    {"id": 2, "title": "Study Night", "category": "academic"},
}

@app.get("/")
async def root():
    return{"message": "Hello World"}

@app.get("/api/events") #search for events
def list_events(eventlist, category=None, location=None,pricing=None ):
    return filter_events(events,category,location)

@app.get("/api/cities") #search for events
def list_events():
    return list_cities()

@app.get("/api/events/{event_id}") #search for event by id
def get_event(event_id: int):
    for event in events:
            if event["id"] == event_id:
                return event
    return {"error": "event not found"}

@app.get("/api/schedule") #schedule of events for a user
def getuserschedule(user_id, date=None):
    return {"events": events}

@app.post("/api/create_event") #xcreate new event
def create_event():
    return {"message": "Create event endpoint coming soon"}