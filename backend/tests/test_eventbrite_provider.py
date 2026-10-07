from app.providers.eventbrite_provider import normalize_eventbrite_event

def test_normalize_eventbrite_event():
    eventbrite_event = {
    "id": "123",
    "name": {"text": "Sample Concert"},
    "description": {"text": "Live music downtown."},
    "start": {"local": "2026-10-12T19:00:00"},
    "url": "https://eventbrite.com/e/sample",
    "venue": {
        "name": "Downtown Hall",
        "address": {
            "localized_address_display": "123 Main St, Chicago, IL"
        },
    },
    "logo": {
        "url": "https://example.com/photo.jpg"
    },
    }

    normalized_event = normalize_eventbrite_event(eventbrite_event, city="Chicago")

    assert normalized_event == { #make sure the return from evenbrite matches what our app expects
        "id": 123,
        "title": "Sample Concert",
        "description": "Live music downtown.",
        "city": "Chicago",
        "venue": "Downtown Hall",
        "date": "2026-10-12",
        "category": "unknown",
        "address": "123 Main St, Chicago, IL",
        "pricing": "unknown",
        "ticket_link": "https://eventbrite.com/e/sample",
        "photos": ["https://example.com/photo.jpg"],
        "source": "eventbrite",
    }
        
    
def test_normalize_eventbrite_event_handles_missing_optional_fields():
    eventbrite_event = {
        "id": "456",
        "name": {"text": "Untitled Meetup"},
        "description": None,
        "start": {"local": "2026-10-15T10:30:00"},
        "url": "https://eventbrite.com/e/meetup",
        "venue": None,
        "logo": None,
    }

    normalized_event = normalize_eventbrite_event(eventbrite_event, city="New York City")

    assert normalized_event == {
        "id": 456,
        "title": "Untitled Meetup",
        "description": "",
        "city": "New York City",
        "venue": "",
        "date": "2026-10-15",
        "category": "unknown",
        "address": None,
        "pricing": "unknown",
        "ticket_link": "https://eventbrite.com/e/meetup",
        "photos": [],
        "source": "eventbrite",
    }