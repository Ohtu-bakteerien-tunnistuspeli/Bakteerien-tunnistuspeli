import userService from '../services/user'
import { setNotification } from './notificationReducer'
import { getBacteria, zeroBacteria } from './bacteriaReducer'
import { getTests, zeroTest } from './testReducer'
import { getCases, zeroCase } from './caseReducer'
import { getCredits, zeroCredit } from './creditReducer'
import { recoverGame } from './gameReducer'
import { getUsers, zeroUsers } from './usersReducer'

const reducer = (state = null, action) => {
  switch (action.type) {
    case 'LOGIN': {
      return action.data
    }
    case 'LOGOUT': {
      return action.data
    }
    case 'RETURN_USER': {
      return action.data
    }
    case 'REGISTER': {
      return action.data
    }
    case 'SET_USER': {
      return action.data
    }
    default:
      return state
  }
}

export const login = (username, password, history) => {
  return async (dispatch, getState) => {
    const library = getState()?.language?.library.frontend.user.reducer
    const routeLibrary = getState()?.language?.library.frontend.routes
    let user = await userService.login({ username, password })
    if (user && !user.error) {
      user.token = `bearer ${user.token}`
      window.localStorage.setItem('loggedUser', JSON.stringify(user))
      dispatch({
        type: 'LOGIN',
        data: user,
      })
      if (user.admin) {
        dispatch(getUsers(user.token))
      }
      dispatch(getCredits(user.token))
      dispatch(getBacteria(user.token))
      dispatch(getTests(user.token))
      dispatch(getCases(user.token))
      if (user.temporaryPasswordUsed) {
        dispatch(
          setNotification({
            message: `${library.singleLoginMessageStart}${username}${library.singleLoginMessageEnd}`,
            success: true,
            show: true,
          })
        )
        history.push(`/${routeLibrary.profile}`)
      } else {
        dispatch(
          setNotification({
            message: `${library.loginMessageStart}${username}${library.loginMessageEnd}`,
            success: true,
            show: true,
          })
        )
        history.push('/')
      }
    } else {
      dispatch({
        type: 'LOGIN',
        data: null,
      })
      dispatch(setNotification({ message: library.loginFail, success: false, show: true }))
    }
  }
}

export const logout = history => {
  return async dispatch => {
    window.localStorage.removeItem('loggedUser')
    dispatch({
      type: 'LOGOUT',
      data: null,
    })
    history.push('/')
    dispatch(zeroUsers())
    dispatch(zeroBacteria())
    dispatch(zeroCase())
    dispatch(zeroCredit())
    dispatch(zeroTest())
  }
}

export const returnUser = history => {
  return async dispatch => {
    const userText = window.localStorage.getItem('loggedUser')
    if (window.localStorage.getItem('lastPage')) {
      history.push(window.localStorage.getItem('lastPage'))
    }
    if (window.localStorage.getItem('gameState')) {
      dispatch(recoverGame(JSON.parse(window.localStorage.getItem('gameState'))))
    }
    let user = null
    if (userText) {
      user = JSON.parse(userText)
      if (user.admin) {
        dispatch(getUsers(user.token))
      }
      dispatch(getCredits(user.token))
      dispatch(getBacteria(user.token))
      dispatch(getTests(user.token))
      dispatch(getCases(user.token))
    }
    dispatch({
      type: 'RETURN_USER',
      data: user,
    })
  }
}

export const register = (username, email, studentNumber, classGroup, password, history) => {
  return async (dispatch, getState) => {
    const library = getState()?.language?.library.frontend.user.reducer
    const routeLibrary = getState()?.language?.library.frontend.routes
    let response = await userService.register({ username, email, studentNumber, classGroup, password })
    if (response && !response.error) {
      dispatch(
        setNotification({
          message: `${library.registerMessageStart}${username}${library.registerMessageEnd}`,
          success: true,
          show: true,
        })
      )
      history.push(`/${routeLibrary.login}`)
    } else {
      dispatch({
        type: 'REGISTER',
        data: null,
      })
      if (response.error.includes('User validation failed')) {
        dispatch(
          setNotification({
            message: response.error.substring(response.error.indexOf('name: ') + 6),
            success: false,
            show: true,
          })
        )
      } else {
        dispatch(setNotification({ message: response.error, success: false, show: true }))
      }
    }
  }
}

export const generateTemporaryPassword = (username, email, history) => {
  return async dispatch => {
    let response = await userService.temporaryPasswordGenerate({ username, email })
    if (response.error) {
      dispatch(setNotification({ message: response.error, success: false, show: true }))
    } else {
      dispatch(setNotification({ message: response.message, success: true, show: true }))
      history.push('/')
    }
  }
}

export const setUser = user => {
  return async dispatch => {
    window.localStorage.setItem('loggedUser', JSON.stringify(user))
    dispatch({
      type: 'SET_USER',
      data: user,
    })
  }
}

export default reducer
