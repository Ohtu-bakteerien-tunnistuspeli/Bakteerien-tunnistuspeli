import React from 'react'
import { useSelector } from 'react-redux'
import { Alert } from 'react-bootstrap'

const Notification = ( ) => {
    const notification = useSelector(state => state.notification)

    if(notification === '') {
        return (
            <></>
        )
    }

    if(notification.message.includes('Failed')) {
        return (
            <Alert variant="warning" className='message'>{notification.message}</Alert>
        )
    }

    return (
        <Alert variant="success" className='message'>{notification.message}</Alert>
    )
}

export default Notification