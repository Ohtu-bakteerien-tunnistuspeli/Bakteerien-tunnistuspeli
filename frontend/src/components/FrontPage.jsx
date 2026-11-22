import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { getGame } from '../reducers/gameReducer'
import { Button, Table } from 'react-bootstrap'

const FrontPage = () => {
  const library = useSelector(state => state.language)?.library?.frontend.frontPage
  const user = useSelector(userData => userData.user)
  const cases = useSelector(state => state.case)?.sort((case1, case2) => case1.name.localeCompare(case2.name))
  const credits = useSelector(state => state.credit)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const startGame = caseId => {
    dispatch(getGame(navigate, caseId, user.token))
  }

  return (
    <div>
      <p className="description">
        {library.introductionTextStart}
        <br />
        <br />
        {library.introductionTextEnd}
      </p>
      <div>
        {cases ? (
          <Table id="caseTable" borderless hover>
            <tbody>
              {cases.map(c => (
                <tr key={c.id}>
                  <td>
                    <Button variant="light" onClick={() => startGame(c.id)} block>
                      {c.name}{' '}
                      {!user.admin && credits.length > 0 && credits[0].testCases.includes(c.name) ? (
                        <i className="fas fa-check"></i>
                      ) : (
                        <></>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div>{library.noCases}</div>
        )}
      </div>
    </div>
  )
}

export default FrontPage
