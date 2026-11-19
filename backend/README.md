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
- `app/services/combined_event_service.py` merges live providers, removes strong duplicates, and creates one shared page.
- `app/providers/sample_provider.py` supplies static data for local development and testing.
- `app/providers/ticketmaster_provider.py` requests live Ticketmaster data and converts it into the app's event format.
- `app/providers/eventbrite_provider.py` searches public Eventbrite listings through SerpApi and converts them into the same format.

This keeps the response shape stable regardless of which event provider supplies the data.

## Current Endpoints

```text
GET    /
GET    /health

GET    /api/cities

GET    /api/events
GET    /api/events/{event_id}    Ticketmaster by default
```

`GET /api/events` supports these optional query parameters:

```text
city
category
query
start_date
end_date
source
page        zero-based page number; defaults to 0
size        events per page; defaults to 20; maximum 200
sort        date for soonest-first ordering; omit for provider relevance
```

`GET /api/events/{event_id}` accepts an optional `source` query parameter:

```text
source      ticketmaster | sample; defaults to ticketmaster
```

Example event requests:

```text
GET /api/events?city=Chicago
GET /api/events?category=music
GET /api/events?query=career
GET /api/events?start_date=2026-10-09&end_date=2026-10-12
GET /api/events?city=Chicago&start_date=2026-10-01&end_date=2026-10-31
GET /api/events?source=ticketmaster&city=Chicago&category=music&query=music
GET /api/events?source=ticketmaster&city=Chicago&page=0&size=20
GET /api/events?source=ticketmaster&city=Chicago&sort=date&page=0&size=20
GET /api/events?source=eventbrite&city=Chicago&category=Music&page=0&size=20
GET /api/events?source=eventbrite&city=Chicago&sort=date&page=0&size=20
GET /api/events?source=all&city=Chicago&page=0&size=20
GET /api/events?source=all&city=Chicago&category=sports&sort=date&page=0&size=20
GET /api/events/G5vYZ9abc123
GET /api/events/1?source=sample
```

The `source` parameter accepts `sample`, `ticketmaster`, `eventbrite`, or
`all`. Combined searches use `source=all`, require the shared fixed page size
of 20, and return Ticketmaster and Eventbrite events in one response. When
`sort=date` is present, the backend sorts the combined provider prefixes before
selecting the requested page so chronological order remains stable across page
boundaries. Without a sort, the service alternates provider results while
preserving each provider's relevance order.

Combined responses use `null` for `total_pages` and `total_elements` because
SerpApi does not provide reliable totals. The service removes only strong
duplicate matches with the same normalized title, date, time, and venue, so
separate time slots remain separate events. If one live provider fails, the
response still contains results from the working provider and includes a
`warnings` array. A request fails only when neither live provider can answer.

The shared category values for combined searches are `music`, `sports`,
`arts & theatre`, `film`, and `miscellaneous`. Provider category labels are
normalized to those values; a missing provider category remains `unknown`.

Eventbrite list requests use SerpApi's Eventbrite search engine. They require
`city`, use a fixed `size=20`, and require `start_date` and `end_date` together
when a custom range is supplied. The API keeps Triply pages zero-based while
mapping them to SerpApi's one-based pages. SerpApi does not expose reliable
result totals, so Eventbrite responses return `null` for `total_pages` and
`total_elements`; `has_next` is derived from the provider's next-page link.

Ticketmaster detail requests accept alphanumeric event IDs and return the same
normalized `Event` shape used by event searches. A missing event returns `404`.
Missing Ticketmaster configuration returns `503`, provider timeouts return
`504`, and other upstream failures return `502`.

## Provider Direction

Sample data remains the default provider so the backend works without external credentials. Ticketmaster is the primary live provider and can be selected with `source=ticketmaster`. Public Eventbrite listings can be selected with `source=eventbrite` when `SERPAPI_API_KEY` is configured. Use `source=all` when both live providers should be combined.

The backend should keep provider-specific logic isolated so the app can later support multiple providers without changing the frontend contract.

Current provider-oriented structure:

```text
app/
├── core/
│   └── config.py
├── routes/
│   └── events.py
├── services/
│   ├── combined_event_service.py
│   └── event_service.py
└── providers/
    ├── sample_provider.py
    ├── eventbrite_provider.py
    └── ticketmaster_provider.py
```

`ticketmaster_provider.py` translates the app's filters into Ticketmaster query parameters, makes the HTTP request, and normalizes Ticketmaster's nested response into the app's `Event` model.

`eventbrite_provider.py` translates the same filters into SerpApi's Eventbrite
search parameters, maps provider-side sorting and pagination, normalizes public
Eventbrite results, and briefly caches identical searches to protect quota.

`combined_event_service.py` requests provider prefixes, applies conservative
cross-provider deduplication, orders the merged results, and slices one stable
zero-based page. The normalized event identity is the pair `source:id`, not the
provider ID by itself. Frontend and Firebase records should therefore store
both fields and use a composite key such as `ticketmaster:G5vYZ9abc123` or
`eventbrite:123456789` whenever an event needs a globally unique identifier.

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
SERPAPI_API_KEY=
TICKETMASTER_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_CREDENTIALS=
ALLOWED_ORIGINS=
```

`TICKETMASTER_API_KEY` is required for `source=ticketmaster`,
`SERPAPI_API_KEY` is required for `source=eventbrite`, and both should be
configured for complete `source=all` results. Requests using the default
`source=sample` do not require an external API key. Provider keys must remain
on the backend and must never be added to frontend environment files.

Current committed example:

```text
SERPAPI_API_KEY=
TICKETMASTER_API_KEY=
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://capstoneproject-murex.vercel.app
```

## Deployment

The backend is planned for Railway. CORS should allow the local frontend during development and the deployed Vercel frontend in production.

The deployed frontend is `https://capstoneproject-murex.vercel.app`. It is included in the default `ALLOWED_ORIGINS`; if you set `ALLOWED_ORIGINS` on Railway, it must include this URL (no trailing slash).
