# Backend API

This backend will provide the API layer for the travel event discovery app. It will support event discovery for New York City, Chicago, and San Francisco, letting the React frontend retrieve, search, and filter events without calling third-party APIs directly.

## Provider Direction

The first event provider should be Eventbrite. Ticketmaster may be added later, but the MVP should focus on getting one provider working end to end before adding another integration.

The backend should keep provider-specific logic isolated so the app can later support multiple providers without changing the frontend contract.

Suggested provider structure:

```text
app/
├── services/
│   ├── event_service.py
│   └── providers/
│       ├── base.py
│       ├── eventbrite.py
│       └── ticketmaster.py
```

`eventbrite.py` should handle Eventbrite API requests and convert Eventbrite responses into the app's normalized event shape. `ticketmaster.py` can be added when the project is ready for a second provider.

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
GET    /health

GET    /api/cities

GET    /api/events
GET    /api/events/{event_id}

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
