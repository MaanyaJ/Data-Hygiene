import React, { useEffect, useState } from 'react'
import './App.css'
import RecordCard from './components/RecordCard'
import { Box, Pagination } from '@mui/material'

const App = () => {

  const [page, setPage] = useState(1)
  const [records, setRecords] = useState([])


  const fetchRecords = async(page) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/invalid-records?page=${page}&size=50`)
      
      const data = await res.json()
      setRecords(data.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchRecords(page)
    console.log(records)
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
          records.map((e)=>{
            return <RecordCard record = {e}></RecordCard>
          })
        }
        <RecordCard/>
        <RecordCard/>
        <RecordCard/>
        <RecordCard/>

        <Pagination
          count={50}
          variant='outlined'
          color='primary'
          page={page}
          sx={{
            "& .Mui-selected": {
              border: "none"
            }
          }}
          onChange={(e,val)=>{setPage(val)}}
        />
      </Box>

    </>
  )
}

export default App