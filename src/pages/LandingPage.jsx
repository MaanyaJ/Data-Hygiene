import React, { useEffect, useState } from 'react'
import RecordCard from '../components/RecordCard'
import { Box, Pagination, Typography } from '@mui/material'
import Loader from '../components/Loader'
import ErrorPage from '../components/ErrorPage'

const LandingPage = () => {

    const [page, setPage] = useState(1)
    const [records, setRecords] = useState([])
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
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
            setError(error)
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
                }}
            >
                {loading && records.length === 0 ? (
                    <Loader />
                ) : error ? (
                    <ErrorPage message={error} onRetry={() => fetchRecords(page)} />
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
                            page={page}
                            onChange={(e, val) => setPage(val)}
                            showFirstButton
                            showLastButton
                            variant='outlined'
                            color='primary'
                        />
                    </>
                )}
            </Box>
        </>
    )
}

export default LandingPage