import { createContext, useContext } from 'react'

// Contexts and their hooks live here (not next to the providers) so the
// provider files only export components, which keeps fast refresh working.

// { user, authReady, openAuth(mode), logOut(), setPhotoURL(url) }
export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// { savedEvents, isSaved(id), toggleSave(event) }
export const SavedEventsContext = createContext(null)
export const useSavedEvents = () => useContext(SavedEventsContext)
