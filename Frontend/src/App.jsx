import { Routes, Route } from 'react-router-dom'
import {
  Groups,
  Profile,
  SavedActivies,
  Results,
  LandingPage,
} from './pages/index'
import { NavBar } from './components/index'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />

      <Route element={<NavBar />}>
        <Route path='/results' element={<Results />} />
        <Route path='/groups' element={<Groups />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/saved-activies' element={<SavedActivies />} />
      </Route>
    </Routes>
  )
}
export default App
