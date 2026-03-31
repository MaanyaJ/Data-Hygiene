import React from 'react'
import LandingPage from './pages/LandingPage'
import { Routes, Route } from 'react-router-dom'
import DetailsPage from './pages/DetailsPage'
import MyActiveList from './pages/MyActiveList'
<<<<<<< HEAD
import MyCompletedList from './pages/MyCompletedList'
=======
import All from './pages/All'
import Completed from './pages/MyCompletedList'
>>>>>>> 7f85a1402d70434da4ccc80c6f3fdad1f200f436

const App = () => {
  return (
    <>
    <Routes>
      <Route path="/" element={<LandingPage/>} />
      <Route path="/:id" element={<DetailsPage/>} />
      <Route path = "/active" element = {<MyActiveList/>}/>
<<<<<<< HEAD
      <Route path = "/completed" element = {<MyCompletedList/>}/>
=======
      <Route path='/all' element = {<All/>}/>
      <Route path='/completed' element = {<Completed/>}/>
>>>>>>> 7f85a1402d70434da4ccc80c6f3fdad1f200f436
    </Routes>
    </>
  )
}

export default App