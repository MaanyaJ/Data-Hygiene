import React from 'react'
import LandingPage from './pages/LandingPage'
import { Routes, Route } from 'react-router-dom'
import DetailsPage from './pages/DetailsPage'
import MyActiveList from './pages/MyActiveList'
import All from './pages/All'
import MyCompletedList from './pages/MyCompletedList'
import OnHoldList from './pages/OnHoldList'


const App = () => {
  return (
    <>
    <Routes>
      <Route path="/" element={<LandingPage/>} />
      <Route path="/:id" element={<DetailsPage/>} />
      <Route path='/completed/:id' element={<DetailsPage/>}/>
      <Route path = "/active" element = {<MyActiveList/>}/>
      <Route path='/all' element = {<All/>}/>
      <Route path = "/completed" element = {<MyCompletedList/>}/>
      <Route path="/on-hold" element={<OnHoldList/>} />

    </Routes>
    </>
  )
}

export default App