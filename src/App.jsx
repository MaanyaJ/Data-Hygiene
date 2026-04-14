import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import RecordsListPage from './pages/RecordsListPage'
import DetailsPage from './pages/DetailsPage'

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<RecordsListPage mode="landing" />} />
        <Route path="/active" element={<RecordsListPage mode="active" />} />
        <Route path="/completed" element={<RecordsListPage mode="completed" />} />
        <Route path="/on-hold" element={<RecordsListPage mode="onhold" />} />
        <Route path="/all" element={<RecordsListPage mode="all" />} />
        <Route path="/:id" element={<DetailsPage />} />
        <Route path="/completed/:id" element={<DetailsPage />} />
      </Routes>
    </>
  )
}

export default App