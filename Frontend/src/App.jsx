import { Routes, Route } from 'react-router-dom'
import {
  Profile,
  SavedActivities,
  Results,
  LandingPage,
  Plans,
} from './pages/index'
import { NavBar } from './components/index'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />

      <Route element={<NavBar />}>
        <Route path='/plans' element={<Plans />} />
        <Route path='/results' element={<Results />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/saved-activities' element={<SavedActivities />} />
      </Route>
    </Routes>
  )
}
export default App
