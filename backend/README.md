# Backend API

This backend will provide the API layer for the travel event discovery app. It will support event discovery for New York City, Chicago, and San Francisco, letting the React frontend retrieve, search, and filter events without calling third-party APIs directly.

## Local Development

From the backend folder, start the FastAPI server with Uvicorn:

```bash
cd backend
.venv/bin/uvicorn main:app --reload
```

The local API runs at:

```text
http://127.0.0.1:8000
```

## Current Backend Flow

The current sample API is organized around this flow:

```text
route -> service -> provider -> response
```

- `main.py` creates the FastAPI app and registers route groups.
- `app/routes/events.py` defines the event-related HTTP endpoints.
- `app/services/event_service.py` handles filtering, city listing, and event lookup logic.
- `app/providers/sample_provider.py` supplies static sample event data for local testing.

This keeps the API shape stable while the data source is still sample data. Later, an Eventbrite provider can be added without forcing the frontend to change how it calls the backend.

## Current Endpoints

```text
GET    /
GET    /health

GET    /api/cities

GET    /api/events
GET    /api/events/{event_id}
```

`GET /api/events` supports these optional query parameters:

```text
city
category
query
start_date
end_date
```

Example event requests:

```text
GET /api/events?city=Chicago
GET /api/events?category=music
GET /api/events?query=career
GET /api/events?start_date=2026-10-09&end_date=2026-10-12
GET /api/events?city=Chicago&start_date=2026-10-01&end_date=2026-10-31
```

## Provider Direction

The first event provider should be Eventbrite. Ticketmaster may be added later, but the MVP should focus on getting one provider working end to end before adding another integration.

The backend should keep provider-specific logic isolated so the app can later support multiple providers without changing the frontend contract.

Current provider-oriented structure:

```text
app/
├── routes/
│   └── events.py
├── services/
│   └── event_service.py
└── providers/
    ├── sample_provider.py
    └── eventbrite_provider.py
```

Future provider files can be added as the integrations are built:

```text
app/providers/
├── sample_provider.py
├── eventbrite_provider.py
└── ticketmaster_provider.py
```

`eventbrite_provider.py` should handle Eventbrite API requests and convert Eventbrite responses into the app's normalized event shape. `ticketmaster_provider.py` can be added when the project is ready for a second provider.

## API Responsibilities

The backend should:

- Fetch event data from Eventbrite.
- Normalize provider responses into a consistent event model.
- Support filtering by supported city, date range, category, and keyword when Eventbrite data supports it.
- Keep API keys and credentials on the server.
- Handle provider errors gracefully.
- Return clean JSON responses to the frontend.
- Eventually protect saved events, itinerary, and user endpoints with Firebase authentication.

## Planned Endpoints

```text
GET    /api/users/me

GET    /api/saved-events
POST   /api/saved-events
DELETE /api/saved-events/{event_id}

GET    /api/itinerary
POST   /api/itinerary
DELETE /api/itinerary/{item_id}
```

Example event request:

```text
GET /api/events?city=chicago&start_date=2026-10-08&end_date=2026-10-12&query=music
```

## Environment Variables

Secrets should never be committed. The backend should read provider and auth configuration from environment variables.

```text
EVENTBRITE_API_TOKEN=
TICKETMASTER_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_CREDENTIALS=
ALLOWED_ORIGINS=
```

`EVENTBRITE_API_TOKEN` is the priority for the first event integration. `TICKETMASTER_API_KEY` can remain optional until the Ticketmaster provider is implemented.

## Deployment

The backend is planned for Railway. CORS should allow the local frontend during development and the deployed Vercel frontend in production.
