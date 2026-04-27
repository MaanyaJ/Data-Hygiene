import React from 'react'
import { Routes, Route } from 'react-router-dom'
import RecordsListPage from './pages/RecordsListPage'
import DetailsPage from './pages/DetailsPage'
import UploadPage from './pages/UploadPage'
import { RefreshProvider } from './context/RefreshContext'

const App = () => {
  return (
    <>
    <RefreshProvider>
      <Routes>
        <Route path="/" element={<RecordsListPage key="landing" mode="landing" />} />
        <Route path="/active" element={<RecordsListPage key="active" mode="active" />} />
        <Route path="/completed" element={<RecordsListPage key="completed" mode="completed" />} />
        <Route path="/on-hold" element={<RecordsListPage key="onhold" mode="onhold" />} />
        <Route path="/all" element={<RecordsListPage key="all" mode="all" />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/:id" element={<DetailsPage />} />
      </Routes>
      </RefreshProvider>
    </>
  )
}

export default App