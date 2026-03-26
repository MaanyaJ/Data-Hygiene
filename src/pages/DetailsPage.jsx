import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ErrorPage from '../components/ErrorPage'
import Loader from '../components/Loader'

const DetailsPage = () => {

    const { id } = useParams()
    const [error, setError] = useState(null)
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetchInvalidFields = async () => {
        setLoading(true)
        try {
            const res = await fetch(`http://192.168.0.182:8000/snapshot-records/${id}`)
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
    useEffect(() => {
      fetchInvalidFields()
    }, [])
    
    return (
        <>
        {loading? <Loader/> : id}
        </>
    )
}

export default DetailsPage