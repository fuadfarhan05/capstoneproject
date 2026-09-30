from app.providers.sample_provider import get_sample_events

#backend logic: filtering, finding events, cities

def filter_events(city: str | None = None, category: str | None = None, query: str | None = None, start_date: str | None = None, end_date: str | None = None):
    filtered_events = get_sample_events()

    if city:
        filtered_events = [ #new list called filtered_events
            event for event in filtered_events # keep the matching event dictionary
            if event["city"].lower() == city.lower()
        ]

    if category: 
        filtered_events = [
            event for event in filtered_events 
            if event["category"].lower() == category.lower()
        ]

    if query: #if the word is in the title or description
        filtered_events = [
            event for event in filtered_events
            if query.lower() in event["title"].lower()
            or query.lower() in event["description"].lower()
        ]

    if start_date:
        filtered_events = [
          event for event in filtered_events
          if event["date"] >= start_date #check if the event date is after the start date in filter
        ]
    
    if end_date:
        filtered_events = [
            event for event in filtered_events
            if event["date"] <= end_date
        ]

    return filtered_events

def get_event_by_id(event_id: int):
    for event in get_sample_events(): #search thru events dictionary
            if event["id"] == event_id: #match id's and return event
                return event


    return None

def get_cities():
    return sorted({event["city"] for event in get_sample_events()}) #creates a unique set of names, "sorted" handles duplicates

