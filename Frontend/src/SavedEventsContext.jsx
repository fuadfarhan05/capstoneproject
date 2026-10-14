import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { saveEvent, unsaveEvent, watchSavedEvents } from './savedEvents'

// Keeps the logged-in user's saved events in sync with Firestore
// (users/{uid}/savedEvents). Firestore applies local writes to the
// listener immediately, so the bookmark updates without waiting on the
// network.

const SavedEventsContext = createContext(null)

export const SavedEventsProvider = ({ children }) => {
  const { user } = useAuth()
  const uid = user?.uid ?? null
  const [saved, setSaved] = useState({ uid: null, events: [] })

  // clear the list as soon as the user changes, before the new one loads
  if (saved.uid !== uid) {
    setSaved({ uid, events: [] })
  }

  useEffect(() => {
    if (!uid) return
    return watchSavedEvents(
      uid,
      (events) => setSaved({ uid, events }),
      (err) => console.error('Could not load saved events:', err.code)
    )
  }, [uid])

  const isSaved = (id) => saved.events.some((e) => e.id === id)

  // callers check for a logged-in user first (see SaveButton)
  const toggleSave = (event) => {
    const request = isSaved(event.id)
      ? unsaveEvent(event.id)
      : saveEvent(event)
    request.catch((err) =>
      console.error('Could not update saved events:', err.code)
    )
  }

  return (
    <SavedEventsContext.Provider
      value={{ savedEvents: saved.events, isSaved, toggleSave }}
    >
      {children}
    </SavedEventsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSavedEvents = () => useContext(SavedEventsContext)
