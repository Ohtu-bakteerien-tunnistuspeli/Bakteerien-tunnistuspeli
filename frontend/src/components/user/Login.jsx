import { useDispatch, useSelector } from 'react-redux'
import { login } from '../../reducers/userReducer'
import { useNavigate } from 'react-router'
import { Form, Button } from 'react-bootstrap'
import { Link } from 'react-router'
const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const lib = useSelector(state => state.language)?.library
  const library = lib.frontend.user.login
  const routeLibrary = lib.frontend.routes
  const handleLogin = async event => {
    event.preventDefault()
    const username = event.target.username.value
    const password = event.target.password.value
    try {
      dispatch(login(username, password, navigate))
    } catch (exeption) {
      console.log(library.loginError)
    }
  }
  return (
    <div>
      <h2>{library.title}</h2>
      <Form onSubmit={handleLogin}>
        <Form.Group>
          <Form.Label>{library.username}</Form.Label>
          <Form.Control type="text" id="username" name="username" />
          <Form.Label>{library.password}</Form.Label>
          <Form.Control type="password" id="password" />
          <Button id="submit" variant="primary" type="submit">
            {library.button}
          </Button>
          <Form.Label>
            {library.forgetPasswordStart}
            <Link to={`/${routeLibrary.temporaryPassword}`}>{library.forgetPasswordMid}</Link>
            {library.forgetPasswordEnd}
          </Form.Label>
        </Form.Group>
      </Form>
    </div>
  )
}

export default Login
