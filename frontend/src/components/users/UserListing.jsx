import { useState } from 'react'
import ConfirmWindow from '../utility/ConfirmWindow'
import { useSelector } from 'react-redux'
import { Modal, Button } from 'react-bootstrap'

const UserListing = ({ listedUser, userDelete, promote, demote }) => {
    const library = useSelector(state => state.language)?.library?.frontend.users.listing
    const handleShow = () => setShow(true)
    const handleClose = () => setShow(false)
    const [show, setShow] = useState(false)
    return (
        <tr>
            <td>{listedUser.studentNumber ? listedUser.studentNumber.length < 20 ? listedUser.studentNumber : `${listedUser.studentNumber.substring(0,20)}...` : ''}</td>
            <td>{listedUser.username.length < 20 ? listedUser.username : `${listedUser.username.substring(0,20)}...`}</td>
            <td>{listedUser.admin ? <i className='fas fa-check'></i> : <></>}</td>
            <td>
                <div style={{ float: 'right' }}>
                    <Button id='userShowLink' style={{ margin: '2px' }} variant='primary' onClick={handleShow}>{library.showUser}</Button>
                    <Modal show={show} size='lg' scrollable='true' onHide={handleClose} >
                        <Modal.Header closeButton></Modal.Header>
                        <Modal.Body>
                            {`${library.studentNumber} ${listedUser.studentNumber}`}<br />
                            {`${library.username} ${listedUser.username}`}<br />
                            {`${library.classGroup} ${listedUser.classGroup === 'C-' ? '' : listedUser.classGroup}`}<br />
                            {`${library.email} ${listedUser.email}`}<br />
                        </Modal.Body>
                    </Modal>
                    {listedUser.admin ?
                        <ConfirmWindow
                            listedUser={listedUser}
                            buttonId='demoteUser'
                            modalOpenButtonText={library.demote.button}
                            modalOpenButtonVariant='primary'
                            modalHeader={`${library.demote.modalHeaderStart}${listedUser.username}${library.demote.modalHeaderEnd}`}
                            warningText={library.demote.warning}
                            functionToExecute={demote}
                            executeButtonText={library.demote.executeButton}
                            executeButtonVariant='primary'
                        />
                        :
                        <ConfirmWindow
                            listedUser={listedUser}
                            buttonId='promoteUser'
                            modalOpenButtonText={library.promote.button}
                            modalOpenButtonVariant='primary'
                            modalHeader={`${library.promote.modalHeaderStart}${listedUser.username}${library.promote.modalHeaderEnd}`}
                            warningText={library.promote.warning}
                            functionToExecute={promote}
                            executeButtonText={library.promote.executeButton}
                            executeButtonVariant='primary'
                        />
                    }
                    <ConfirmWindow
                        listedUser={listedUser}
                        buttonId='deleteUser'
                        modalOpenButtonText={library.delete.button}
                        modalOpenButtonVariant='danger'
                        modalHeader={`${library.delete.modalHeaderStart}${listedUser.username}${library.delete.modalHeaderEnd}`}
                        warningText={library.delete.warning}
                        functionToExecute={userDelete}
                        executeButtonText={library.delete.executeButton}
                        executeButtonVariant='danger'
                    />
                </div>

            </td>
        </tr>
    )
}

export default UserListing