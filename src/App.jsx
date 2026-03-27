import React from 'react'
import LandingPage from './pages/LandingPage'
import { Routes, Route } from 'react-router-dom'
import DetailsPage from './pages/DetailsPage'

const App = () => {
  return (
    <>
    <Routes>
      <Route path="/" element={<LandingPage/>} />
      <Route path="/record/:id" element={<DetailsPage/>} />
    </Routes>
    </>
  )
}

export default App