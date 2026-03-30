import React from 'react'
import LandingPage from './pages/LandingPage'
import { Routes, Route } from 'react-router-dom'
import DetailsPage from './pages/DetailsPage'
import MyActiveList from './pages/MyActiveList'

const App = () => {
  return (
    <>
    <Routes>
      <Route path="/" element={<LandingPage/>} />
      <Route path="/record/:id" element={<DetailsPage/>} />
      <Route path = "/active" element = {<MyActiveList/>}/>
    </Routes>
    </>
  )
}

export default App