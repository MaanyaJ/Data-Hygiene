import React from 'react'
import './App.css'
import Record from './components/Record'
import { Box } from '@mui/material'

const App = () => {
  return (
    <>
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        margin: 2
      }}>
        <Record />
        <Record />
        <Record />
        <Record />
      </Box>
    </>
  )
}

export default App