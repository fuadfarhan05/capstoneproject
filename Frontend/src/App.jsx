import { Routes, Route } from 'react-router-dom'
import { NotLoggedHome } from './pages/index'
const App = () => {
  return (
    <Routes>
      <Route index path='/' element={<NotLoggedHome />} />
    </Routes>
  )
}
export default App
