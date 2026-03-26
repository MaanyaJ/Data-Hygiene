import React from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'

const Loader = () => {
  return (
    <>
    <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <CircularProgress size={40} />
            <Typography color="text.secondary">
              Loading...
            </Typography>
          </Box>
    </>
  )
}

export default Loader