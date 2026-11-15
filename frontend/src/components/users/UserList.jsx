import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import UserListing from './UserListing'
import { Table } from 'react-bootstrap'
import { deleteUser, promoteUser, demoteUser } from '../../reducers/usersReducer'

const UserList = () => {
    const library = useSelector(state => state.language)?.library?.frontend.users.list
    const users = useSelector(state => state.users)?.sort((user1, user2) => user1.username.localeCompare(user2.username))
    const user = useSelector(state => state.user)
    const [usersToShow, setUsersToShow] = useState(users)
    const [filterByStudentNumber, setFilterByStudentNumber] = useState('')
    const [filterByUsername, setFilterByUsername] = useState('')
    const [filterByClassGroup, setFilterByClassGroup] = useState('C-')
    const [orderByStudentNumber, setOrderByStudentNumber] = useState('')
    const [orderByUsername, setOrderByUsername] = useState('')

    const dispatch = useDispatch()
    const [timer, setTimer] = useState(null)

    useEffect(() => {
        if (timer) {
            clearTimeout(timer)
        }
        setTimer(setTimeout(() => {
            if (filterByStudentNumber === '' && filterByUsername === '' && filterByClassGroup === '') {
                setUsersToShow(users)
            } else {
                if (filterByStudentNumber === '' && filterByClassGroup === '') {
                    setUsersToShow(users.filter(user => user.username && user.username.toLowerCase().startsWith(filterByUsername.toLowerCase())))
                } else if (filterByUsername === '' && filterByClassGroup === '') {
                    setUsersToShow(users.filter(user => user.studentNumber && user.studentNumber.startsWith(filterByStudentNumber)))
                } else if (filterByUsername === '' && filterByStudentNumber === '') {
                    setUsersToShow(users.filter(user => user.classGroup && user.classGroup.toLowerCase().startsWith(filterByClassGroup.toLowerCase())))
                } else {
                    setUsersToShow(users.filter(user => user.username && user.username.toLowerCase().startsWith(filterByUsername.toLowerCase())
                        && user.studentNumber && user.studentNumber.startsWith(filterByStudentNumber)
                        && user.classGroup && user.classGroup.toLowerCase().startsWith(filterByClassGroup.toLowerCase())))
                }
            }
        }, 1000))
    }, [filterByUsername, filterByStudentNumber, filterByClassGroup, users])

    useEffect(() => {
        return () => {
            if (timer) {
                clearTimeout(timer)
            }
        }
    }, [timer])

    useEffect(() => {
        const users2 = [].concat(users)
        if (orderByStudentNumber === '' && orderByUsername === '') {
            setUsersToShow(users)
        }
        if (orderByStudentNumber !== '' || orderByUsername !== '') {
            if (orderByStudentNumber === 'Descending' && orderByUsername === '') {
                setUsersToShow(users2.sort((user1, user2) => user1.studentNumber.localeCompare(user2.studentNumber)))
            } else if (orderByStudentNumber === 'Ascending' && orderByUsername === '') {
                setUsersToShow(users2.sort((user1, user2) => user2.studentNumber.localeCompare(user1.studentNumber)))
            } else if (orderByUsername === 'Ascending' && orderByStudentNumber === '') {
                setUsersToShow(users2.sort((user1, user2) => user2.username.localeCompare(user1.username)))
            } else if (orderByUsername === 'Descending' && orderByStudentNumber === '') {
                setUsersToShow(users2.sort((user1, user2) => user1.username.localeCompare(user2.username)))
            } else {
                setUsersToShow(users)
            }
        }
    }, [orderByStudentNumber, orderByUsername])

    const userDelete = (userToDelete) => {
        dispatch(deleteUser(userToDelete, user.token))
    }
    const promote = (userToPromote) => {
        dispatch(promoteUser(userToPromote.id, user.token))
    }
    const demote = (userToDemote) => {
        dispatch(demoteUser(userToDemote.id, user.token))
    }
    return (
        <div>
            <h2>{library.title}</h2>
            <table>
                <tbody>
                    <tr>
                        <td>{library.filterByStudentNumber}</td>
                        <td><input id='studentNumberFilter' type='text' value={filterByStudentNumber} onChange={({ target }) => setFilterByStudentNumber(target.value)} /></td>
                    </tr>
                    <tr>
                        <td>{library.filterByUsername}</td>
                        <td><input id='usernameFilter' type='text' value={filterByUsername} onChange={({ target }) => setFilterByUsername(target.value)} /></td>
                    </tr>
                    <tr>
                        <td>{library.filterByClassGroup}</td>
                        <td> <input id='classGroupFilter' type='text' value={filterByClassGroup} onChange={({ target }) => setFilterByClassGroup(target.value)} /></td>
                    </tr>
                </tbody>
            </table>
            <h6>{library.orderInstructions}</h6>
            <table>
                <tbody>
                    <tr>
                        <td>{library.orderByStudentNumber}</td>
                        <td>
                            <select id='orderByStudentNumber' type='text' value={orderByStudentNumber} onChange={({ target }) => setOrderByStudentNumber(target.value)}>
                                <option value=''></option>
                                <option value='Ascending'>{library.ascending}</option>
                                <option value='Descending'>{library.descending}</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>{library.orderByUsername}</td>
                        <td>
                            <select id='orderByUsername' type='text' value={orderByUsername} onChange={({ target }) => setOrderByUsername(target.value)}>
                                <option value=''></option>
                                <option value='Ascending'>{library.ascending}</option>
                                <option value='Descending'>{library.descending}</option>
                            </select>
                        </td>
                    </tr>
                </tbody>
            </table>
            {users.length !== 0 ?
                <Table id='userTable'>
                    <thead>
                        <tr>
                            <th>{library.studentNumber}</th>
                            <th>{library.username}</th>
                            <th>{library.admin}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersToShow.map(listedUser =>
                            <UserListing
                                key={listedUser.id}
                                listedUser={listedUser}
                                userDelete={userDelete}
                                promote={promote}
                                demote={demote}
                            ></UserListing>
                        )}
                    </tbody>
                </Table>
                :
                <>
                    <div>{library.noUsers}</div>
                </>
            }
        </div>
    )
}

export default UserList