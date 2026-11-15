import { useState } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'

const ConfirmWindow = ({ listedUser, buttonId, modalOpenButtonText, modalOpenButtonVariant, modalHeader, warningText, functionToExecute, executeButtonText, executeButtonVariant, showImmediately, password, parameter }) => {
    const [confirmText, setConfirmText] = useState('')
    const [show, setShow] = useState(showImmediately ? true : false)
    const handleShow = () => setShow(true)
    const handleClose = () => setShow(false)
    return (
        <>
            {showImmediately ? <></>
                :
                <Button variant={modalOpenButtonVariant}
                    style={{ margin: '2px' }}
                    id={buttonId}
                    onClick={handleShow}>{modalOpenButtonText}</Button>
            }
            <Modal show={show} size='lg' scrollable='true' onHide={handleClose}>
                <Modal.Header closeButton>
                    {modalHeader}
                </Modal.Header>
                <Modal.Body>
                    <Form.Label>{warningText}</Form.Label>
                    { password ?
                        <Form.Control
                            type="password"
                            id="confirmField"
                            onChange={(event) => setConfirmText(event.target.value)}
                        />
                        :
                        <Form.Control
                            type="text"
                            id="confirmField"
                            onChange={(event) => setConfirmText(event.target.value)}
                        />
                    }
                    { parameter ?
                        <Button id="confirm" variant={executeButtonVariant} type="button" onClick={() => {
                            functionToExecute({ confirmText, handleClose })
                        }}>{executeButtonText}</Button>
                        :
                        <Button id="confirm" variant={executeButtonVariant} type="button" disabled={confirmText !== listedUser.username} onClick={() => {
                            functionToExecute(listedUser)
                            handleClose()
                        }}>{executeButtonText}</Button>
                    }
                </Modal.Body>
            </Modal>
        </>
    )
}

export default ConfirmWindow