import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ErrorPage from '../components/ErrorPage'
import Loader from '../components/Loader'
import { Typography, Box, Paper } from "@mui/material";

const Details = () => {

    const obj = {
        name: "Maanya",
        age: 21,
        education: "CSE",
        city: "Chirala",
        state: "Andhra"
    }

    const { id } = useParams()
    const [error, setError] = useState(null)
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetchInvalidFields = async () => {
        setLoading(true)
        try {
            const res = await fetch(`http://192.168.0.182:8001/snapshot-records/${id}`)
            const data = await res.json()
            setData(data.data)
            console.log(data)

        } catch (error) {
            console.log(error)
            setError(error)
        } finally {
            setLoading(false)
        }
    }
    // useEffect(() => {
    //     fetchInvalidFields()
    // }, [])

    if (error) return <ErrorPage />
    if (loading) return <Loader />

    return (
        <>
            <Typography variant="h6" sx={{ mb: 1 }}>
                Execution Information
            </Typography>

            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        '& > *:not(:last-child)': {
                            borderRight: '1px solid',
                            borderColor: 'divider',
                        },
                    }}
                >
                    {Object.entries(obj).map(([key, value], index) => (
                        <Box
                            key={key}
                            sx={{
                                p: 2,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                '&:nth-of-type(odd)': {
                                    borderRight: '1px solid',
                                    borderRightColor: 'divider',
                                },
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.7rem' }}
                            >
                                {key}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                                {value}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Paper>
            <Typography>Invalid Fields:</Typography>
        </>
    )
}

export default Details