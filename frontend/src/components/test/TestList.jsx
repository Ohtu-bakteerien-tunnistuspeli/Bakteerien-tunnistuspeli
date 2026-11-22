import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import TestForm from './TestForm'
import TestListing from './TestListing'
import { Table } from 'react-bootstrap'

const TestList = () => {
  const library = useSelector(state => state.language)?.library?.frontend.test.list
  const tests = useSelector(testState => testState.test)?.sort((test1, test2) => test1.name.localeCompare(test2.name))
  const user = useSelector(userData => userData.user)
  const [testsToShow, setTestsToShow] = useState(tests)
  const [filterByTestName, setFilterByTestName] = useState('')
  const [filterByTestType, setFilterByTestType] = useState('')
  const [timer, setTimer] = useState(null)
  useEffect(() => {
    if (timer) {
      clearTimeout(timer)
    }
    setTimer(
      setTimeout(() => {
        if (filterByTestName === '' && filterByTestType === '') {
          setTestsToShow(tests)
        } else {
          if (filterByTestName === '') {
            setTestsToShow(tests.filter(test => test.type && test.type.startsWith(filterByTestType)))
          } else if (filterByTestType === '') {
            setTestsToShow(
              tests.filter(test => test.name && test.name.toLowerCase().startsWith(filterByTestName.toLowerCase()))
            )
          } else {
            setTestsToShow(
              tests.filter(
                test =>
                  test.name &&
                  test.name.toLowerCase().startsWith(filterByTestName.toLowerCase()) &&
                  test.type &&
                  test.type.startsWith(filterByTestType)
              )
            )
          }
        }
      }, 1000)
    )
  }, [filterByTestName, filterByTestType, tests])

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [timer])

  return (
    <div>
      <h2>{library.title}</h2>
      <p className="instruct-img">{library.imageInstruct}</p>
      {library.filterByName}
      <input
        id="testNameFilter"
        type="text"
        value={filterByTestName}
        onChange={({ target }) => setFilterByTestName(target.value)}
      ></input>
      &nbsp;
      {library.filterByType}
      <select
        id="testTypeFilter"
        type="text"
        value={filterByTestType}
        onChange={({ target }) => setFilterByTestType(target.value)}
      >
        <option value=""></option>
        <option value="Testi">{library.test}</option>
        <option value="Viljely">{library.culture}</option>
        <option value="Värjäys">{library.dye}</option>
      </select>
      &nbsp;
      {tests.length !== 0 ? (
        <Table borderless hover>
          <thead>
            <tr>
              <th>{library.name}</th>
              <th>{library.type}</th>
              <th>{library.controlImage}</th>
              <th>{library.positiveDefault}</th>
              <th>{library.negativeDefault}</th>
              <th>{user?.admin ? <TestForm></TestForm> : <></>}</th>
            </tr>
          </thead>
          <tbody>
            {testsToShow.map(test => (
              <TestListing key={test.id} test={test}></TestListing>
            ))}
          </tbody>
        </Table>
      ) : (
        <>
          {user?.admin ? <TestForm></TestForm> : <></>}
          <div>{library.noTests}</div>
        </>
      )}
    </div>
  )
}

export default TestList
