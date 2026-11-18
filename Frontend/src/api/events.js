// Talks to the FastAPI backend (see backend/README.md).
// Override the address with VITE_API_URL in Frontend/.env if it moves.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

// GET /api/events?source=ticketmaster[&city=&category=&query=&page=&size=]
// Only filters that are set are sent. Pagination is always explicit so the
// UI can move through the same result set predictably.
// Throws an Error whose message is safe to show to the user.
export async function fetchEvents(
  { city, category, query, page = 0, size = 20 } = {},
  { signal } = {},
) {  // Fetches one event page and converts backend pagination names for React.
  const params = new URLSearchParams({
    source: 'ticketmaster',
    page: String(page),
    size: String(size),
  })
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
  return {
    events: Array.isArray(data.events) ? data.events : [],
    page: data.page ?? page,
    size: data.size ?? size,
    totalPages: data.total_pages ?? null,
    totalElements: data.total_elements ?? null,
    hasNext: data.has_next ?? false,
  }
}
