import caseService from '../services/case'
import { setNotification } from '../reducers/notificationReducer'

const caseReducer = (state = [], action) => {
  switch (action.type) {
    case 'GET_CASES': {
      return action.data
    }
    case 'ADD_CASE': {
      return [...state, action.data]
    }
    case 'DELETE_CASE': {
      return state.filter(ca => ca.id !== action.data.id)
    }
    case 'UPDATE_CASE': {
      return state.map(c => (c.id === action.data.id ? action.data : c))
    }
    case 'ZERO_CASE': {
      return action.data
    }
    default:
      return state
  }
}

export const getCases = token => {
  return async dispatch => {
    const cases = await caseService.get(token)
    if (cases.error) {
      dispatch(setNotification({ message: cases.error, success: false, show: true }))
    } else {
      dispatch({
        type: 'GET_CASES',
        data: cases,
      })
    }
  }
}

export const addCase = (
  name,
  bacterium,
  anamnesis,
  completionText,
  completionImage,
  samples,
  testGroups,
  token,
  resetCaseForm
) => {
  return async (dispatch, getState) => {
    const library = getState()?.language?.library.frontend.case.reducer
    const caseToSave = await caseService.add(
      name,
      bacterium,
      anamnesis,
      completionText,
      completionImage,
      samples,
      testGroups,
      token
    )
    if (caseToSave.error) {
      if (caseToSave.error.includes('Case validation failed')) {
        dispatch(
          setNotification({
            message: caseToSave.error.substring(caseToSave.error.indexOf('name: ') + 6),
            success: false,
            show: true,
          })
        )
      } else {
        dispatch(setNotification({ message: caseToSave.error, success: false, show: true }))
      }
    } else {
      dispatch(
        setNotification({
          message: `${library.addSuccessStart}${caseToSave.name}${library.addSuccessEnd}`,
          success: true,
          show: true,
        })
      )
      dispatch({
        type: 'ADD_CASE',
        data: caseToSave,
      })
      resetCaseForm()
    }
  }
}

export const deleteCase = (caseToDelete, token) => {
  return async (dispatch, getState) => {
    const library = getState()?.language?.library.frontend.case.reducer
    const res = await caseService.deleteCase(caseToDelete.id, token)
    if (res.status !== 204) {
      dispatch(setNotification({ message: res.error, success: false, show: true }))
    } else {
      dispatch(
        setNotification({
          message: `${library.deleteSuccessStart}${caseToDelete.name}${library.deleteSuccessEnd}`,
          success: true,
          show: true,
        })
      )
      dispatch({
        type: 'DELETE_CASE',
        data: caseToDelete,
      })
    }
  }
}

export const updateCase = (
  id,
  name,
  bacterium,
  anamnesis,
  completionText,
  completionImage,
  samples,
  testGroups,
  deleteEndImage,
  token,
  resetCaseForm
) => {
  return async (dispatch, getState) => {
    const library = getState()?.language?.library.frontend.case.reducer
    const caseToUpdate = await caseService.update(
      id,
      name,
      bacterium,
      anamnesis,
      completionText,
      completionImage,
      samples,
      testGroups,
      deleteEndImage,
      token
    )
    if (caseToUpdate.error) {
      if (caseToUpdate.error.includes('Case validation failed')) {
        dispatch(
          setNotification({
            message: caseToUpdate.error.substring(caseToUpdate.error.indexOf('name: ') + 6),
            success: false,
            show: true,
          })
        )
      } else {
        dispatch(setNotification({ message: caseToUpdate.error, success: false, show: true }))
      }
    } else {
      dispatch(
        setNotification({
          message: `${library.editSuccessStart}${caseToUpdate.name}${library.editSuccessEnd}`,
          success: true,
          show: true,
        })
      )
      dispatch({
        type: 'UPDATE_CASE',
        data: caseToUpdate,
      })
      resetCaseForm()
    }
  }
}

export const updateCaseHints = (id, hints, handleClose, token) => {
  return async (dispatch, getState) => {
    const library = getState()?.language?.library.frontend.case.reducer
    const caseToUpdate = await caseService.updateHints(id, hints, token)
    if (caseToUpdate.error) {
      dispatch(
        setNotification({
          message: caseToUpdate.error.substring(caseToUpdate.error.indexOf('name: ') + 6),
          success: false,
          show: true,
        })
      )
    } else {
      dispatch(
        setNotification({
          message: `${library.addHintSuccessStart}${caseToUpdate.name}${library.addHintSuccessEnd}`,
          success: true,
          show: true,
        })
      )
      dispatch({
        type: 'UPDATE_CASE',
        data: caseToUpdate,
      })
      handleClose()
    }
  }
}

export const zeroCase = () => {
  return async dispatch => {
    dispatch({
      type: 'ZERO_CASE',
      data: [],
    })
  }
}

export default caseReducer
