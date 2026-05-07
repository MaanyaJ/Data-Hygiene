import React from 'react'
import { Routes, Route } from 'react-router-dom'
import RecordsListPage from './pages/RecordsListPage'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<RecordsListPage key="landing" mode="landing" />} />
        <Route path="/active" element={<RecordsListPage key="active" mode="active" />} />
        <Route path="/completed" element={<RecordsListPage key="completed" mode="completed" />} />
        <Route path="/on-hold" element={<RecordsListPage key="onhold" mode="onhold" />} />
        <Route path="/all" element={<RecordsListPage key="all" mode="all" />} />
      </Routes>
    </>
  )
}

export default App