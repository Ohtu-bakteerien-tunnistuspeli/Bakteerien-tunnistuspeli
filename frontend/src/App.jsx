import { useEffect } from 'react'
import IdleTimer from 'react-idle-timer'
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { returnUser, logout } from './reducers/userReducer'
import Login from './components/user/Login'
import TemporaryPassword from './components/user/TemporaryPassword'
import Register from './components/user/Register'
import FrontPage from './components/FrontPage'
import BacteriaList from './components/bacteria/BacteriaList'
import CaseList from './components/case/CaseList'
import TestList from './components/test/TestList'
import CreditList from './components/credit/CreditList'
import UserList from './components/users/UserList'
import GamePage from './components/GamePage'
import ProfilePage from './components/ProfilePage'
import Notification from './components/utility/Notification'
import Footer from './components/Footer'
import { Button, Navbar, Nav } from 'react-bootstrap'
import { getLanguage } from './reducers/languageReducer'
import useDetectMobile from './components/utility/useDetectMobile'

const App = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(userData => userData.user)
  const game = useSelector(state => state.game)
  const language = useSelector(state => state.language)

  useEffect(() => {
    dispatch(returnUser(navigate))
    dispatch(getLanguage())
  }, [dispatch])
  useEffect(() => {
    if (language && language.library) {
      document.title = language.library.frontend.title
    }
  }, [language])
  const logoutButton = async () => {
    dispatch(logout(navigate))
  }

  const handleOnBeforeUnload = () => {
    window.localStorage.setItem('lastPage', window.location.pathname)
    window.localStorage.setItem('gameState', JSON.stringify(game))
  }
  window.onbeforeunload = handleOnBeforeUnload

  const mobile = useDetectMobile()
  if (mobile) {
    document.body.style.setProperty('--attachVar', 'scroll')
  } else {
    document.body.style.setProperty('--attachVar', 'fixed')
  }
  if (!language || !language.validation || !language.library) {
    return <></>
  }
  const library = language.library.frontend
  return (
    <div className="page">
      {user ? (
        <IdleTimer
          timeout={7200000}
          onIdle={() => {
            dispatch(logout(navigate))
            alert(library.app.inactivityMessage)
          }}
        />
      ) : null}
      <Navbar collapseOnSelect expand="lg" className="nav-colour">
        <Navbar.Toggle className="hidden-nav" aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            {user ? (
              <Nav.Link href="#" as="span">
                <Link to="/" className="link">
                  {library.app.navigationBar.frontPage}
                </Link>
              </Nav.Link>
            ) : null}
            {user?.admin ? (
              <Nav.Link href="#" as="span">
                <Link to={`/${library.routes.bacteriaList}`} className="link">
                  {library.app.navigationBar.bacteriaList}
                </Link>
              </Nav.Link>
            ) : null}
            {user?.admin ? (
              <Nav.Link href="#" as="span">
                <Link to={`/${library.routes.caseList}`} className="link">
                  {library.app.navigationBar.caseList}
                </Link>
              </Nav.Link>
            ) : null}
            {user?.admin ? (
              <Nav.Link href="#" as="span">
                <Link to={`/${library.routes.testList}`} className="link">
                  {library.app.navigationBar.testList}
                </Link>
              </Nav.Link>
            ) : null}
            {user?.admin ? (
              <Nav.Link href="#" as="span">
                <Link to={`/${library.routes.creditList}`} className="link">
                  {library.app.navigationBar.creditList}
                </Link>
              </Nav.Link>
            ) : null}
            {user?.admin ? (
              <Nav.Link href="#" as="span">
                <Link to={`/${library.routes.userList}`} className="link">
                  {library.app.navigationBar.userList}
                </Link>
              </Nav.Link>
            ) : null}
          </Nav>
          <Nav.Link href="#" as="span">
            {user ? (
              <p className="nav-text">
                <em>{library.app.navigationBar.loggedIn}</em>
                <Link to={`/${library.routes.profile}`} className="logged-user">
                  {user.username.length < 20 ? user.username : `${user.username.substring(0, 20)}...`}
                </Link>
              </p>
            ) : (
              <Link to={`/${library.routes.login}`} className="link">
                {library.app.navigationBar.login}
              </Link>
            )}
          </Nav.Link>
          {user ? null : (
            <Nav.Link href="#" as="span">
              <Link to={`/${library.routes.register}`} className="link">
                {library.app.navigationBar.register}
              </Link>
            </Nav.Link>
          )}
          <Nav.Item>
            {user ? (
              <Button id="submit" variant="primary" type="button" onClick={logoutButton} style={{ margin: '0px' }}>
                {library.app.navigationBar.logout}
              </Button>
            ) : null}
          </Nav.Item>
        </Navbar.Collapse>
      </Navbar>
      <div className="wrapper">
        <div className="container">
          <Notification></Notification>
          {user ? (
            <>
              <Routes>
                <Route element={<FrontPage />} exact path="/" />
                <Route element={user.admin ? <BacteriaList /> : <Navigate to="/" />} exact path={`/${library.routes.bacteriaList}`} />
                <Route element={user.admin ? <CaseList /> : <Navigate to="/" />} exact path={`/${library.routes.caseList}`} />
                <Route element={user.admin ? <TestList /> : <Navigate to="/" />} exact path={`/${library.routes.testList}`} />
                <Route element={user.admin ? <CreditList /> : <Navigate to="/" />} exact path={`/${library.routes.creditList}`} />
                <Route element={user.admin ? <UserList /> : <Navigate to="/" />} exact path={`/${library.routes.userList}`} />
                <Route element={game ? <GamePage /> : <Navigate to="/" />} exact path={`/${library.routes.game}`} />
                <Route element={user ? <ProfilePage /> : <Navigate to="/" />} exact path={`/${library.routes.profile}`} />
              </Routes>
            </>
          ) : (
            <>
              <Routes>
                <Route element={<Login />} exact path={`/${library.routes.login}`} />
                <Route element={<Register />} exact path={`/${library.routes.register}`} />
                <Route element={<TemporaryPassword />} exact path={`/${library.routes.temporaryPassword}`} />
                <Route element={<Navigate to={`/${library.routes.login}`} />} exact path="/" />
              </Routes>
            </>
          )}
        </div>
      </div>
      <div className="outer-footer">
        <Footer className="outer-footer" />
      </div>
      <div className="footer-ghost"></div>
    </div>
  )
}

export default App
