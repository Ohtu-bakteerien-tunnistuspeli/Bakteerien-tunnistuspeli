import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import CreditListing from './CreditListing'
import { Table, Button } from 'react-bootstrap'
import CSVExporter from '../CSVExporter'
import { creditsDelete } from '../../reducers/creditReducer'

const CreditList = () => {
    const library = useSelector(state => state.language)?.library?.frontend.credit.list
    const credits = useSelector(state => state.credit)?.sort((credit1, credit2) => credit1.user.studentNumber.localeCompare(credit2.user.studentNumber))
    const [creditsToShow, setCreditsToShow] = useState(credits)
    const [filterByClassGroup, setFilterByClassGroup] = useState('')
    const [filterByStudentNumber, setFilterByStudentNumber] = useState('')
    const [orderByStudentNumber, setOrderByStudentNumber] = useState('')
    const [orderByClassGroup, setOrderByClassGroup] = useState('')
    const [orderByUsername, setOrderByUsername] = useState('')
    const user = useSelector(state => state.user)
    const dispatch = useDispatch()
    const [timer, setTimer] = useState(null)

    useEffect(() => {
        if (timer) {
            clearTimeout(timer)
        }
        setTimer(setTimeout(() => {
            if (filterByClassGroup === '' && filterByStudentNumber === '') {
                setCreditsToShow(credits)
            } else {
                if (filterByClassGroup === '') {
                    setCreditsToShow(credits.filter(credit => credit.user.studentNumber && credit.user.studentNumber.startsWith(filterByStudentNumber)))
                } else if (filterByStudentNumber === '') {
                    setCreditsToShow(credits.filter(credit => credit.user.classGroup && (credit.user.classGroup.substring(2, credit.user.classGroup.length) === filterByClassGroup || credit.user.classGroup === filterByClassGroup)))
                } else {
                    setCreditsToShow(credits.filter(credit => credit.user.studentNumber && credit.user.studentNumber.startsWith(filterByStudentNumber) && credit.user.classGroup && (credit.user.classGroup.substring(2, credit.user.classGroup.length) === filterByClassGroup || credit.user.classGroup === filterByClassGroup)))
                }
            }
        }, 1000))
    }, [filterByClassGroup, filterByStudentNumber, credits])

    useEffect(() => {
        return () => {
            if (timer) {
                clearTimeout(timer)
            }
        }
    }, [timer])

    const deleteCredits = () => {
        if (window.confirm(library.deleteConfirm)) {
            dispatch(creditsDelete(creditsToShow.map(credit => credit.id), user.token))
        }
    }

    useEffect(() => {

        const credits2 = [].concat(credits)

        if (orderByStudentNumber === '' && orderByClassGroup === '' && orderByUsername === '') {
            setCreditsToShow(credits)
        }

        if (orderByUsername === 'Descending' && orderByStudentNumber === '' && orderByClassGroup === '') {
            setCreditsToShow(credits2.sort((credit1, credit2) => credit2.user.username.localeCompare(credit1.user.username)))
        }

        if (orderByUsername === 'Ascending' && orderByStudentNumber === '' && orderByClassGroup === '') {
            setCreditsToShow(credits2.sort((credit1, credit2) => credit1.user.username.localeCompare(credit2.user.username)))
        }

        if (orderByStudentNumber !== '' || orderByClassGroup !== '' || orderByUsername === '') {
            if (orderByStudentNumber === 'Descending' && orderByClassGroup === '' && orderByUsername === '') {
                setCreditsToShow(credits2.sort((credit1, credit2) => credit2.user.studentNumber.localeCompare(credit1.user.studentNumber)))
            } else if (orderByClassGroup === 'Ascending' && orderByStudentNumber === '' && orderByUsername === '') {
                setCreditsToShow(credits2.sort((credit1, credit2) => credit2.user.classGroup.localeCompare(credit1.user.classGroup)))
            } else if (orderByClassGroup === 'Descending' && orderByStudentNumber === '' && orderByUsername === '') {
                setCreditsToShow(credits2.sort((credit1, credit2) => credit1.user.classGroup.localeCompare(credit2.user.classGroup)))
            } else {
                setCreditsToShow(credits)
            }
        }
    }, [orderByStudentNumber, orderByClassGroup, orderByUsername])

    return (
        <div>
            <h2>{library.title}</h2>
            <table>
                <tbody>
                    <tr>
                        <td>{library.filterByClassGroup}</td>
                        <td><input id='classGroupFilter' type='text' value={filterByClassGroup} onChange={({ target }) => setFilterByClassGroup(target.value)} /></td>
                    </tr>
                    <tr>
                        <td>{library.filterByStudentNumber}</td>
                        <td><input id='studentNumberFilter' type='text' value={filterByStudentNumber} onChange={({ target }) => setFilterByStudentNumber(target.value)} /></td>
                    </tr>
                </tbody>
            </table>
            <h6>{library.sortingInstructions}</h6>
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
                        <td>{library.orderByClassGroup}</td>
                        <td>
                            <select id='orderByClassGroup' type='text' value={orderByClassGroup} onChange={({ target }) => setOrderByClassGroup(target.value)}>
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
            {credits.length !== 0 ?
                <Table borderless hover>
                    <thead>
                        <tr>
                            <th>{library.studentNumber}</th>
                            <th>{library.username}</th>
                            <th>{library.classGroup}</th>
                            <th>
                                <Button id='deleteCredits' variant='danger' className='small-margin-float-right' onClick={deleteCredits}>{library.deleteCredits}</Button>
                                <CSVExporter data={creditsToShow} />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {creditsToShow.map(credit =>
                            <CreditListing key={credit.id} credit={credit} admin={user.admin} />
                        )}
                    </tbody>
                </Table>
                :
                <div>{library.noCredits}</div>
            }
        </div>
    )
}

export default CreditList