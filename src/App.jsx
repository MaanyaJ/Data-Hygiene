import React, { useEffect, useState } from 'react'
import './App.css'
import RecordCard from './components/RecordCard'
import { Box, Pagination, Typography } from '@mui/material'

const App = () => {

  const [page, setPage] = useState(1)
  const [records, setRecords] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 50

  const fetchRecords = async (page) => {
    try {
      const res = await fetch(`http://192.168.0.182:8000/invalid-records?page=${page}&size=${pageSize}`)
      const data = await res.json()

      setTotalPages(Math.ceil(data.total_invalid_records / pageSize))
      setRecords(data.data)

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchRecords(page)
  }, [page])

  return (
    <>
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        margin: 2,
        alignItems: "center"
      }}>

        {
          records.map((e) => {
            return <RecordCard record={e} key={e.ExecutionId}></RecordCard>
          })
        }

        <Pagination
          count={totalPages}
          variant='outlined'
          color='primary'
          page={page}
          sx={{
            "& .Mui-selected": {
              border: "none"
            }
          }}
          onChange={(e, val) => { setPage(val) }}
          siblingCount={1}
          boundaryCount={1}
          showFirstButton
          showLastButton
        />
        <Typography>
          Page {page} of {totalPages}
        </Typography>
      </Box>

    </>
  )
}

export default App