import React from 'react'
import LandingPage from './pages/LandingPage'
import { Routes, Route, Navigate } from 'react-router-dom'
import DetailsPage from './pages/DetailsPage'
 
const App = () => {
  return (
    <>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/record/:id" element={<DetailsPage />} />
       <Route path="/test" element={<DetailsPage />} />
        <Route path="*" element={<Navigate to="/test" />} />
    </Routes>
    </>
  )
}
 
export default App