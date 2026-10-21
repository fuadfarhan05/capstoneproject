// Filter dropdown options shared by the home page and the search page.
// Values are sent straight to GET /api/events, so they must be names
// Ticketmaster understands (city names, classification/segment names).

export const cityOptions = [
  { label: 'New York City', value: 'New York' },
  { label: 'Chicago', value: 'Chicago' },
  { label: 'San Francisco', value: 'San Francisco' },
  { label: 'Los Angeles', value: 'Los Angeles' },
]

export const categoryOptions = [
  { label: 'Music', value: 'Music' },
  { label: 'Sports', value: 'Sports' },
  { label: 'Arts & Theatre', value: 'Arts & Theatre' },
  { label: 'Film', value: 'Film' },
  { label: 'Miscellaneous', value: 'Miscellaneous' },
]

// The API doesn't sort, so these are applied in the browser (EventResults)
export const sortOptions = [
  { label: 'Date: soonest', value: 'date' },
  { label: 'Price: low to high', value: 'price-asc' },
  { label: 'Price: high to low', value: 'price-desc' },
]

export const emptyFilters = { city: '', category: '', sort: '' }
