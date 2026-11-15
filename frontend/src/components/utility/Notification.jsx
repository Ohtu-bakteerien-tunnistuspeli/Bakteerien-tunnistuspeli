import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Alert } from 'react-bootstrap'
import { setNotification } from '../../reducers/notificationReducer'
import { useDispatch } from 'react-redux'

const Notification = () => {
    const notification = useSelector(state => state.notification)
    const [show, setShow] = useState(true)
    const dispatch = useDispatch()

    /* style parameters */
    const style = {
        position: 'fixed',
        'borderColor': 'green',
        'borderWidth': 'thin',
        top: '80px',
        right: '80px',
        width: '30%',
        minWidth: '180px',
        textAlign: 'center',
        zIndex: 99999
    }

    const styleFail = {
        position: 'fixed',
        'borderColor': '#9B870C',
        'borderWidth': 'thin',
        top: '80px',
        right: '80px',
        width: '30%',
        minWidth: '180px',
        textAlign: 'center',
        zIndex: 99999
    }
    /* style parameters end */

    const onCloseHandler = () => {
        setShow(false)
        dispatch(setNotification(''))
    }

    useEffect(() => {
        setShow(notification.show)
    }, [notification.show])

    if (notification === '') {
        return (
            <></>
        )
    }

    if (!notification.success) {
        return (
            <Alert style={styleFail} show={show} variant="warning" className='message' onClose={() => onCloseHandler()} dismissible>{notification.message}</Alert>
        )
    }

    return (
        <Alert style={style} show={show} variant="success" className='message' onClose={() => onCloseHandler()} dismissible>{notification.message}</Alert>
    )
}

export default Notification
