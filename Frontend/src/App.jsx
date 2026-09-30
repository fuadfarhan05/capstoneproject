import { Routes, Route } from 'react-router-dom'
import { NotLoggedHome, SearchResults } from './pages/index'
const App = () => {
  return (
    <Routes>
      <Route index path='/' element={<NotLoggedHome />} />
      <Route path='/search' element={<SearchResults />} />
    </Routes>
  )
}

export const useAuth = () => useContext(AuthContext)