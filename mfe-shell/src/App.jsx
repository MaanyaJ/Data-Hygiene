import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box } from "@mui/material"
import Navbar from './components/Navbar'
import Loader from './components/Loader'

// Remote MFEs
const RecordsListPage = lazy(() => import('dashboard/RecordsListPage'));
const DetailsPage = lazy(() => import('details/DetailsPage'));

const App = () => {
  return (
    <>
      <Navbar />
      <Box sx={{ pt: 7 }}> {/* Padding for fixed Navbar */}
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<RecordsListPage key="landing" mode="landing" />} />
            <Route path="/active" element={<RecordsListPage key="active" mode="active" />} />
            <Route path="/completed" element={<RecordsListPage key="completed" mode="completed" />} />
            <Route path="/on-hold" element={<RecordsListPage key="onhold" mode="onhold" />} />
            <Route path="/all" element={<RecordsListPage key="all" mode="all" />} />
            <Route path="/:id" element={<DetailsPage />} />
          </Routes>
        </Suspense>
      </Box>
    </>
  )
}

export default App
