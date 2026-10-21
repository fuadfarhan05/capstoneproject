// Talks to the FastAPI backend (see backend/README.md).
// Override the address with VITE_API_URL in Frontend/.env if it moves.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

// GET /api/events?source=ticketmaster[&city=&category=&query=]
// Only filters that are set are sent. Returns the `events` array.
// Throws an Error whose message is safe to show to the user.
export async function fetchEvents(
  { city, category, query } = {},
  { signal } = {},
) {
  const params = new URLSearchParams({ source: 'ticketmaster' })
  if (city) params.set('city', city)
  if (category) params.set('category', category)
  if (query) params.set('query', query)

  let response
  try {
    response = await fetch(`${API_BASE_URL}/api/events?${params}`, { signal })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new Error(
      `Could not reach the events server at ${API_BASE_URL}. Is the backend running?`,
      { cause: err },
    )
  }

  if (!response.ok) {
    // FastAPI errors look like { "detail": "Ticketmaster is not configured" }
    const body = await response.json().catch(() => null)
    const detail = typeof body?.detail === 'string' ? body.detail : null
    throw new Error(detail ?? `Events request failed (${response.status})`)
  }

  const data = await response.json()
  return data.events ?? []
}
