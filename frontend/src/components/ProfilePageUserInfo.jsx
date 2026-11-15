import { ListGroup } from 'react-bootstrap'
import { Table } from 'react-bootstrap'
import { useSelector } from 'react-redux'

const ProfilePageUserInfo = ({ credit, user }) => {
    const library = useSelector(state => state.language)?.library?.frontend.profilePage.userInfo
    return (
        <div>
            <Table>
                <tbody>
                    <tr key={user.id}>
                        <td><b>{library.username}</b></td>
                        <td> {user.username} </td>
                    </tr>
                    <tr>
                        <td><b>{library.studentNumber}</b></td>
                        <td> {user.studentNumber} </td>
                    </tr>
                    <tr>
                        <td><b>{library.email}</b></td>
                        <td> {user.email} </td>
                    </tr>
                    <tr>
                        <td><b>{library.classGroup}</b></td>
                        <td> {user.classGroup === 'C-' ? '' : user.classGroup} </td>
                    </tr>
                </tbody>
            </Table>
            <h6>{library.credits}</h6>
            {credit && credit.testCases && credit.testCases.length > 0 ?
                <>
                    {credit.testCases.map(completedCase =>
                        <ListGroup variant='flush' key={completedCase}>
                            <ListGroup.Item>{completedCase}</ListGroup.Item>
                        </ListGroup>
                    )}
                </>
                :
                <p>{library.noCredits}</p>
            }
        </div>
    )
}

export default ProfilePageUserInfo