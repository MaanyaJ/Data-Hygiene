import React from 'react'
import LandingPage from './pages/LandingPage'
import { Routes, Route } from 'react-router-dom'
import DetailsPage from './pages/DetailsPage'
import CompletedDetailsPage from './pages/CompletedDetailsPage'
import OnHoldDetailsPage from './pages/OnHoldDetailsPage'
import MyActiveList from './pages/MyActiveList'
import All from './pages/All'
import MyCompletedList from './pages/MyCompletedList'
import OnHoldList from './pages/OnHoldList'
import UniversalSearch from './pages/UniversalSearch'

const App = () => {
  return (
    <Routes>
      {/* Universal search — new home page */}
      <Route path="/"       element={<UniversalSearch/>} />
      <Route path="/search" element={<UniversalSearch/>} />

      {/* Legacy list pages */}
      <Route path="/landing"   element={<LandingPage/>} />
      <Route path="/active"    element={<MyActiveList/>} />
      <Route path="/all"       element={<All/>} />
      <Route path="/completed" element={<MyCompletedList/>} />
      <Route path="/onhold"    element={<OnHoldList/>} />

      {/* Detail pages — specific paths must come before the generic /:id */}
      <Route path="/completed/:id" element={<CompletedDetailsPage/>} />
      <Route path="/onhold/:id"    element={<OnHoldDetailsPage/>} />
      <Route path="/:id"           element={<DetailsPage/>} />
    </Routes>
  )
}

export default App