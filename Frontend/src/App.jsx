import { Routes, Route } from 'react-router-dom'
import { NotLoggedHome, SearchResults, Groups, Profile } from './pages/index'
import { NavBar } from './components/index'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<NotLoggedHome />} />

      <Route element={<NavBar />}>
        <Route path='/search' element={<SearchResults />} />
        <Route path='/groups' element={<Groups />} />
        <Route path='/profile' element={<Profile />} />
      </Route>
    </Routes>
  )
}
export default App
