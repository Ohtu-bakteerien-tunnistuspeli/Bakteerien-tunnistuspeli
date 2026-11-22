import creditService from '../services/credit'
import { setNotification } from './notificationReducer'

const creditReducer = (state = [], action) => {
  switch (action.type) {
    case 'GET_CREDITS': {
      return action.data
    }
    case 'DELETE_CREDITS': {
      return state.filter(credit => !action.data.includes(credit.id))
    }
    case 'ZERO_CREDIT': {
      return action.data
    }
    default:
      return state
  }
}

export const getCredits = token => {
  return async dispatch => {
    const credits = await creditService.get(token)
    if (credits.error) {
      dispatch(setNotification({ message: credits.error, success: false }))
    } else {
      dispatch({
        type: 'GET_CREDITS',
        data: credits,
      })
    }
  }
}

export const creditsDelete = (credits, token) => {
  return async dispatch => {
    const deletedCredits = await creditService.deleteCredits(credits, token)
    if (deletedCredits.error) {
      dispatch(setNotification({ message: deletedCredits.error, success: false }))
    } else {
      dispatch({
        type: 'DELETE_CREDITS',
        data: credits,
      })
    }
  }
}

export const zeroCredit = () => {
  return async dispatch => {
    dispatch({
      type: 'ZERO_CREDIT',
      data: [],
    })
  }
}

export default creditReducer
