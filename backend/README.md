# Backend API

This backend provides the API layer for the travel event discovery app. It lets the React frontend retrieve, search, and filter events without exposing third-party API credentials in the browser.

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

The API is organized around this flow:

```text
route -> service -> provider -> response
```

- `main.py` creates the FastAPI app and registers route groups.
- `app/core/config.py` reads backend configuration from environment variables.
- `app/routes/events.py` defines the event-related HTTP endpoints.
- `app/routes/health.py` defines a small status endpoint for local checks and deployment checks.
- `app/services/event_service.py` selects the requested provider and translates provider failures into clean API errors.
- `app/providers/sample_provider.py` supplies static data for local development and testing.
- `app/providers/ticketmaster_provider.py` requests live Ticketmaster data and converts it into the app's event format.

This keeps the response shape stable regardless of which event provider supplies the data.

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
source
```

Example event requests:

```text
GET /api/events?city=Chicago
GET /api/events?category=music
GET /api/events?query=career
GET /api/events?start_date=2026-10-09&end_date=2026-10-12
GET /api/events?city=Chicago&start_date=2026-10-01&end_date=2026-10-31
GET /api/events?source=ticketmaster&city=Chicago&category=music&query=music
```

## Provider Direction

Sample data remains the default provider so the backend works without external credentials. Ticketmaster is the live provider and can be selected with `source=ticketmaster`. Eventbrite groundwork remains in the project but is not the primary live provider.

The backend should keep provider-specific logic isolated so the app can later support multiple providers without changing the frontend contract.

Current provider-oriented structure:

```text
app/
├── core/
│   └── config.py
├── routes/
│   └── events.py
├── services/
│   └── event_service.py
└── providers/
    ├── sample_provider.py
    ├── eventbrite_provider.py
    └── ticketmaster_provider.py
```

`ticketmaster_provider.py` translates the app's filters into Ticketmaster query parameters, makes the HTTP request, and normalizes Ticketmaster's nested response into the app's `Event` model.

## API Responsibilities

The backend should:

- Fetch live event data from Ticketmaster.
- Normalize provider responses into a consistent event model.
- Support filtering by city, date range, category, and keyword when the selected provider supports it.
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

For local development, copy the example file and fill in local values:

```bash
cd backend
cp .env.example .env
```

The backend loads this file automatically when it starts. Existing shell or
deployment environment variables take priority over values in `.env`. The real
`.env` file should stay local and is ignored by Git.

```text
EVENTBRITE_API_TOKEN=
TICKETMASTER_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_CREDENTIALS=
ALLOWED_ORIGINS=
```

`TICKETMASTER_API_KEY` is required only for requests using `source=ticketmaster`. Requests using the default `source=sample` do not require an external API key.

Current committed example:

```text
EVENTBRITE_API_TOKEN=
TICKETMASTER_API_KEY=
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Deployment

The backend is planned for Railway. CORS should allow the local frontend during development and the deployed Vercel frontend in production.
