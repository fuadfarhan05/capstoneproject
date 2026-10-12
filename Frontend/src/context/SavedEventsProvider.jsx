import { useEffect, useState } from 'react'
import { SavedEventsContext, useAuth } from './contexts'

// Saved events are kept in localStorage per user until the backend has an
// endpoint for them. Whole event objects are stored (not just ids) so the
// profile page can show them without re-fetching search results.
const storageKey = (uid) => `savedEvents:${uid}`

const load = (uid) => {
  try {
    return JSON.parse(localStorage.getItem(storageKey(uid))) ?? []
  } catch {
    return []
  }
}

const SavedEventsProvider = ({ children }) => {
  const { user, openAuth } = useAuth()
  const uid = user?.uid
  const [saved, setSaved] = useState({ uid: null, events: [] })

  // reload whenever a different user logs in (or everyone logs out)
  if (saved.uid !== (uid ?? null)) {
    setSaved({ uid: uid ?? null, events: uid ? load(uid) : [] })
  }

  useEffect(() => {
    if (!saved.uid) return
    try {
      localStorage.setItem(storageKey(saved.uid), JSON.stringify(saved.events))
    } catch {
      // storage full or blocked; saves just won't persist
    }
  }, [saved])

  const isSaved = (id) => saved.events.some((e) => e.id === id)

  const toggleSave = (event) => {
    // saving needs an account, so nudge guests to sign up
    if (!uid) {
      openAuth('signup')
      return
    }
    setSaved((prev) => ({
      ...prev,
      events: prev.events.some((e) => e.id === event.id)
        ? prev.events.filter((e) => e.id !== event.id)
        : [event, ...prev.events],
    }))
  }

  return (
    <SavedEventsContext.Provider
      value={{ savedEvents: saved.events, isSaved, toggleSave }}
    >
      {children}
    </SavedEventsContext.Provider>
  )
}

export default SavedEventsProvider
