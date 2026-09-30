import { Routes, Route } from 'react-router-dom'
import { NotLoggedHome, SearchResults, GroupPlans } from './pages/index'
import { NavBar } from './components/index'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<NotLoggedHome />} />

      <Route element={<NavBar />}>
        <Route path='/search' element={<SearchResults />} />
        <Route path='/group-plans' element={<GroupPlans />} />
      </Route>
    </Routes>
  )
}
export default App
