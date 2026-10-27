// Helpers for showing API events (and older saved events) in the UI.

const gradients = [
  'linear-gradient(135deg, #f97316 0%, #db2777 100%)',
  'linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%)',
  'linear-gradient(135deg, #facc15 0%, #f97316 100%)',
  'linear-gradient(135deg, #1e293b 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
  'linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%)',
  'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
]

// Same event always gets the same fallback gradient
const gradientFor = (id) => {
  const text = String(id ?? '')
  let hash = 0
  for (const ch of text) hash = (hash * 31 + ch.charCodeAt(0)) | 0
  return gradients[Math.abs(hash) % gradients.length]
}

// Ticketmaster returns the same image in several sizes/ratios; prefer a
// wide 16:9 one so it fills the card cover nicely.
export const getCoverImage = (event) => {
  const photos = event.photos ?? []
  return (
    photos.find((url) => url.includes('RETINA_LANDSCAPE_16_9')) ??
    photos.find((url) => url.includes('16_9')) ??
    photos[0] ??
    null
  )
}

// CSS background for the cover: the photo if there is one, else a gradient
export const getCoverBackground = (event) => {
  const image = getCoverImage(event)
  if (image) return `center / cover no-repeat url("${image}")`
  return event.gradient ?? gradientFor(event.id)
}

// "2026-10-22" -> "Thu, Oct 22". Anything else is shown as-is.
export const formatEventDate = (date) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date ?? '')
  if (!match) return date ?? ''
  const [, y, m, d] = match
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString(
    'en-US',
    { weekday: 'short', month: 'short', day: 'numeric' },
  )
}

// "19:30:00" -> "7:30 PM". Anything else is shown as-is.
export const formatEventTime = (time) => {
  const match = /^(\d{2}):(\d{2})/.exec(time ?? '')
  if (!match) return time ?? ''

  const hours = Number(match[1])
  const minutes = match[2]
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12

  return `${displayHour}:${minutes} ${period}`
}

const money = (amount) =>
  `$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`

// Lowest listed price in dollars, or null when unknown. Used for sorting.
export const getMinPrice = (event) => {
  if (typeof event.price === 'number') return event.price // older saved events
  const pricing = (event.pricing ?? '').toLowerCase()
  if (pricing === 'free') return 0
  const match = /([\d.]+)/.exec(pricing)
  return match ? Number(match[1]) : null
}

// "25.00 - 75.00 USD" -> "$25 – $75"; unknown/missing -> "Price TBA"
export const formatPricing = (event) => {
  if (typeof event.price === 'number') {
    return event.price === 0 ? 'Free' : money(event.price)
  }
  const pricing = (event.pricing ?? '').trim()
  const lower = pricing.toLowerCase()
  if (!pricing || lower === 'unknown') return 'Price TBA'
  if (lower === 'free') return 'Free'
  if (lower === 'paid') return 'Paid'

  const range = /^([\d.]+)\s*-\s*([\d.]+)\s*USD$/i.exec(pricing)
  if (range) {
    const [min, max] = [Number(range[1]), Number(range[2])]
    if (min === 0 && max === 0) return 'Free'
    return min === max ? money(min) : `${money(min)} – ${money(max)}`
  }
  return pricing
}

// "arts & theatre" -> "Arts & Theatre"
export const formatCategory = (category) =>
  (category ?? '').replace(/\b\w/g, (c) => c.toUpperCase())
