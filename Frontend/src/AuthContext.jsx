import { createContext, useContext, useEffect, useState } from 'react'
import { watchAuthState } from './auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  // Firebase updates the User object in place (e.g. after updateProfile), so
  // bump this to re-render everything that reads `user`
  const [, setVersion] = useState(0)
  const refreshUser = () => setVersion((v) => v + 1)

  useEffect(() => {
    const unsubscribe = watchAuthState((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
