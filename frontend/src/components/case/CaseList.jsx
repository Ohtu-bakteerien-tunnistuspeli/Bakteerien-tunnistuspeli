import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import CaseListing from './CaseListing'
import CaseForm from './CaseForm'
import { deleteCase } from '../../reducers/caseReducer'
import { Table } from 'react-bootstrap'

const CaseList = () => {
  const library = useSelector(state => state.language)?.library?.frontend.case.list
  const cases = useSelector(state => state.case)?.sort((case1, case2) => case1.name.localeCompare(case2.name))
  const [casesToShow, setCasesToShow] = useState(cases)
  const user = useSelector(state => state.user)
  const [filterByName, setFilterByName] = useState('')
  const dispatch = useDispatch()
  const [timer, setTimer] = useState(null)
  useEffect(() => {
    if (timer) {
      clearTimeout(timer)
    }
    setTimer(
      setTimeout(() => {
        if (filterByName === '') {
          setCasesToShow(cases)
        } else {
          setCasesToShow(cases.filter(c => c.name && c.name.toLowerCase().startsWith(filterByName.toLowerCase())))
        }
      }, 1000)
    )
  }, [filterByName, cases])

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [timer])

  const delCase = caseToDelete => {
    dispatch(deleteCase(caseToDelete, user.token))
  }

  return (
    <div>
      <h2>{library.title}</h2>
      <p className="instruct-img">{library.imageInstruct}</p>
      {library.filterByName}
      <input
        id="caseNameFilter"
        type="text"
        value={filterByName}
        onChange={({ target }) => setFilterByName(target.value)}
      ></input>
      &nbsp;
      {cases.length !== 0 ? (
        <Table id="caseTable" borderless hover>
          <thead>
            <tr>
              <th>{library.name}</th>
              <th>{library.completionImage}</th>
              <th>{user?.admin ? <CaseForm></CaseForm> : <></>}</th>
            </tr>
          </thead>
          <tbody>
            {casesToShow.map(caseItem => (
              <CaseListing key={caseItem.id} caseItem={caseItem} admin={user?.admin} deleteCase={delCase} />
            ))}
          </tbody>
        </Table>
      ) : (
        <>
          {user?.admin ? <CaseForm></CaseForm> : <></>}
          <div>{library.noCases}</div>
        </>
      )}
    </div>
  )
}

export default CaseList
