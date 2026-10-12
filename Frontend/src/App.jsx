import { Routes, Route } from 'react-router-dom'
import { NotLoggedHome, ProfilePage } from './pages/index'
const App = () => {
  return (
    <Routes>
      <Route index path='/' element={<NotLoggedHome />} />
      <Route path='profile' element={<ProfilePage />} />
    </Routes>
  )
}
export default App
