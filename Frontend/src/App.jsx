import { Routes, Route } from 'react-router-dom'
import {
  NotLoggedHome,
  Groups,
  Profile,
  SavedActivies,
  Results,
} from './pages/index'
import { NavBar } from './components/index'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<NotLoggedHome />} />

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
