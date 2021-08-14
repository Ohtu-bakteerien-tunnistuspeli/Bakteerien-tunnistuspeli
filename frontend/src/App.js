import React, { useEffect } from 'react'
import { Switch, Route, Redirect, useHistory, Link } from 'react-router-dom'
import Idle from 'react-idle'
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
    const history = useHistory()
    const dispatch = useDispatch()
    const user = useSelector(state => state.user)
    const game = useSelector(state => state.game)
    const language = useSelector(state => state.language)
    useEffect(() => {
        dispatch(returnUser(history))
        dispatch(getLanguage())
    }, [dispatch, history])
    useEffect(() => {
        if (language && language.library) {
            document.title = language.library.frontend.title
        }
    }, [language])
    const logoutButton = async () => {
        dispatch(logout(history))
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
        return (<></>)
    }
    const library = language.library.frontend
    return (
        <div className='page'>
            {user ?
                <Idle
                    timeout={7200000}//7200000
                    onChange={({ idle }) => {
                        if (idle && user) {
                            dispatch(logout(history))
                            alert(library.app.inactivityMessage)
                        }
                    }} />
                :
                null
            }
            <Navbar collapseOnSelect expand='lg' className='nav-colour'>
                <Navbar.Toggle className='hidden-nav' aria-controls='responsive-navbar-nav' />
                <Navbar.Collapse id='responsive-navbar-nav' >
                    <Nav className='mr-auto'>
                        {user
                            ?
                            <Nav.Link href='#' as='span'>
                                <Link to='/' className='link'>{library.app.navigationBar.frontPage}</Link>
                            </Nav.Link>
                            : null
                        }
                        {user?.admin ?
                            <Nav.Link href='#' as='span'>
                                <Link to={`/${library.routes.bacteriaList}`} className='link'>{library.app.navigationBar.bacteriaList}</Link>
                            </Nav.Link>
                            : null
                        }
                        {user?.admin
                            ?
                            <Nav.Link href='#' as='span'>
                                <Link to={`/${library.routes.caseList}`} className='link'>{library.app.navigationBar.caseList}</Link>
                            </Nav.Link>
                            : null
                        }
                        {user?.admin
                            ?
                            <Nav.Link href='#' as='span'>
                                <Link to={`/${library.routes.testList}`} className='link'>{library.app.navigationBar.testList}</Link>
                            </Nav.Link>
                            : null
                        }
                        {user?.admin
                            ?
                            <Nav.Link href='#' as='span'>
                                <Link to={`/${library.routes.creditList}`} className='link'>{library.app.navigationBar.creditList}</Link>
                            </Nav.Link>
                            : null
                        }
                        {user?.admin
                            ?
                            <Nav.Link href='#' as='span'>
                                <Link to={`/${library.routes.userList}`} className='link'>{library.app.navigationBar.userList}</Link>
                            </Nav.Link>
                            : null
                        }
                    </Nav>
                    <Nav.Link href='#' as='span'>
                        {user
                            ? <p className='nav-text'><em>{library.app.navigationBar.loggedIn}</em><Link to={`/${library.routes.profile}`} className='logged-user' >{user.username.length < 20 ? user.username : `${user.username.substring(0,20)}...`}</Link></p>
                            : <Link to={`/${library.routes.login}`} className='link'>{library.app.navigationBar.login}</Link>
                        }
                    </Nav.Link>
                    {user
                        ? null
                        :
                        <Nav.Link href='#' as='span'>
                            <Link to={`/${library.routes.register}`} className='link'>{library.app.navigationBar.register}</Link>
                        </Nav.Link>
                    }
                    <Nav.Item>
                        {user
                            ? <Button id='submit' variant='primary' type='button' onClick={logoutButton} style={{ margin: '0px' }}>{library.app.navigationBar.logout}</Button>
                            : null
                        }
                    </Nav.Item>
                </Navbar.Collapse>
            </Navbar>
            <div className='wrapper'>
                <div className='container'>
                    <Notification></Notification>
                    {user ?
                        <>
                            <Switch>
                                <Route path={`/${library.routes.bacteriaList}`}>
                                    {user.admin ?
                                        <BacteriaList />
                                        :
                                        <Redirect to='/' />
                                    }
                                </Route>
                                <Route path={`/${library.routes.caseList}`}>
                                    {user.admin ?
                                        <CaseList />
                                        :
                                        <Redirect to='/' />
                                    }
                                </Route>
                                <Route path={`/${library.routes.testList}`}>
                                    {user.admin ?
                                        <TestList />
                                        :
                                        <Redirect to='/' />
                                    }
                                </Route>
                                <Route path={`/${library.routes.creditList}`}>
                                    {user.admin ?
                                        <CreditList />
                                        :
                                        <Redirect to='/' />
                                    }
                                </Route>
                                <Route path={`/${library.routes.userList}`}>
                                    {user.admin ?
                                        <UserList />
                                        :
                                        <Redirect to='/' />
                                    }
                                </Route>
                                <Route path={`/${library.routes.game}`}>
                                    {game ?
                                        <GamePage />
                                        :
                                        <Redirect to='/' />
                                    }
                                </Route>
                                <Route path={`/${library.routes.profile}`}>
                                    {user ?
                                        <ProfilePage />
                                        :
                                        <Redirect to='/' />
                                    }
                                </Route>
                                <Route path='/'>
                                    <FrontPage />
                                </Route>
                            </Switch>
                        </>
                        :
                        <>
                            <Switch>
                                <Route path={`/${library.routes.login}`}>
                                    <Login />
                                </Route>
                                <Route path={`/${library.routes.register}`}>
                                    <Register />
                                </Route>
                                <Route path={`/${library.routes.temporaryPassword}`}>
                                    <TemporaryPassword />
                                </Route>
                                <Route path='/'>
                                    <Redirect to={`/${library.routes.login}`} />
                                </Route>
                            </Switch>
                        </>
                    }

                </div>
            </div>
            <div className='outer-footer'>
                <Footer className='outer-footer' />
            </div>
            <div className='footer-ghost'></div>
        </div>
    )
}

export default App