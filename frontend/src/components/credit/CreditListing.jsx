import { useState } from 'react'
import { Modal, Table, Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'

const CreditListing = ({ credit, admin }) => {
    const library = useSelector(state => state.language)?.library?.frontend.credit.listing
    const handleShow = () => setShow(true)
    const handleClose = () => setShow(false)
    const [show, setShow] = useState(false)
    return (
        <tr key={credit.id}>
            {admin ?
                <>
                    <td>{credit.user.studentNumber < 20 ? credit.user.studentNumber : `${credit.user.studentNumber.substring(0,20)}...`}</td>
                    <td>{credit.user.username.length < 20 ? credit.user.username : `${credit.user.username.substring(0,20)}...`}</td>
                    <td>{credit.user.classGroup === 'C-' ? '' : credit.user.classGroup}</td>
                    <td>
                        <Button id='creditShowLink' className='small-margin-float-right' variant='primary' onClick={handleShow}>{library.showCredits}</Button>
                        <Modal show={show} size='lg' scrollable='true' onHide={handleClose} >
                            <Modal.Header closeButton></Modal.Header>
                            <Modal.Body>
                                {`${library.studentNumber} ${credit.user.studentNumber}`}<br />
                                {`${library.username} ${credit.user.username}`}<br />
                                {`${library.classGroup} ${credit.user.classGroup === 'C-' ? '' : credit.user.classGroup}`}<br />
                                {`${library.email} ${credit.user.email}`}<br />
                                {library.credits}
                                <Table>
                                    <tbody>
                                        {credit.testCases.map(completedCase =>
                                            <tr key={completedCase}>
                                                <td>{completedCase}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </Modal.Body>
                        </Modal>
                    </td>
                </>
                :
                <></>
            }
        </tr>
    )
}

export default CreditListing
