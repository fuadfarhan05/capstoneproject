import { useEffect, useState } from 'react'
import { AuthContext } from './contexts'
import { watchAuthState, logOut } from '../auth'
import AuthModal from '../components/AuthModal'

// Keep a plain copy of the fields the UI needs. Firebase mutates its User
// object in place (e.g. after updateProfile), which React wouldn't notice.
const snapshot = (user) =>
  user && {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  }

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('signup')

  useEffect(
    () =>
      watchAuthState((firebaseUser) => {
        setUser(snapshot(firebaseUser))
        setAuthReady(true)
      }),
    [],
  )

  const value = {
    user,
    authReady,
    openAuth: (mode = 'signup') => {
      setModalMode(mode)
      setModalOpen(true)
    },
    logOut,
    setPhotoURL: (photoURL) => setUser((prev) => ({ ...prev, photoURL })),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal
        open={modalOpen}
        mode={modalMode}
        onModeChange={setModalMode}
        onClose={() => setModalOpen(false)}
      />
    </AuthContext.Provider>
  )
}

export default AuthProvider
