import { Routes, Route } from 'react-router-dom'
import { NotLoggedHome, LoginPage, SignUpPage } from './pages/index'
const App = () => {
  return (
    <Routes>
      <Route index path='/' element={<NotLoggedHome />} />
      <Route path='login' element={<LoginPage />} />
      <Route path='signup' element={<SignUpPage />} />
    </Routes>
  )
}
export default App
