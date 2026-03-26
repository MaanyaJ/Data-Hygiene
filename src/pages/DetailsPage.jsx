import React from 'react'
import { useParams } from 'react-router-dom'

const DetailsPage = () => {
    const {id} = useParams()
  return (
    <div>{id}</div>
  )
}

export default DetailsPage