import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import { PageNotFound } from '@data-hygiene/ui'

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {/* For Auth MFE, any other path also shows login or a 404 */}
      <Route path="/" element={<LoginPage />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

export default App
