import React from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'

const Loader = ({ label = "Loading..." }) => {
  return (
    <Box
      sx={{
        height: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <CircularProgress size={40} sx={{color: "#000000"}}/>
      <Typography sx={{color: "#000000", fontWeight: 600, fontSize: 14 }}>
        {label}
      </Typography>
    </Box>
  )
}

export default Loader