import React, { useEffect, useState } from 'react'
import RecordCard from '../components/RecordCard'
import { Box, Pagination, Typography} from '@mui/material'
import Loader from '../components/Loader'

const LandingPage = () => {

  const [page, setPage] = useState(1)
  const [records, setRecords] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const pageSize = 50

  const fetchRecords = async (page) => {
    setLoading(true)
    try {
      const res = await fetch(`http://192.168.0.182:8000/invalid-summary?page=${page}&size=${pageSize}`)
      const data = await res.json()

      setTotalPages(Math.ceil(data.total_invalid_records / pageSize))
      setRecords(data.data)

    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords(page)
  }, [page])

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          margin: 2,
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        {loading && records.length === 0 ? (
          <Loader/>
        ) : (
          <>
            <Typography>
              Page {page} of {totalPages}
            </Typography>
            {records.map((e) => (
              <RecordCard record={e} key={e.ExecutionId} />
            ))}
            <Pagination
              count={totalPages}
              variant="outlined"
              color="primary"
              page={page}
              sx={{
                "& .Mui-selected": {
                  border: "none",
                },
              }}
              onChange={(e, val) => setPage(val)}
              siblingCount={1}
              boundaryCount={1}
              showFirstButton
              showLastButton
            />
          </>
        )}
      </Box>
    </>
  )
}

export default LandingPage