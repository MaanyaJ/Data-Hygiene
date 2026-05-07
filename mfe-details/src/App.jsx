import React from 'react'
import { Routes, Route } from 'react-router-dom'
import DetailsPage from './pages/DetailsPage'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<div>Please select a record from the dashboard.</div>} />
        <Route path="/:id" element={<DetailsPage />} />
      </Routes>
    </>
  )
}

export default App