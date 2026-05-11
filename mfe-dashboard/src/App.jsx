import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import RecordsListPage from './pages/RecordsListPage'
import Loader from 'shell/Loader'

const DetailsPage = lazy(() => import('details/DetailsPage'));

const App = () => {
  return (
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
  )
}

export default App