import testService from '../services/test'
import { setNotification } from '../reducers/notificationReducer'

const testReducer = (testState = [], action) => {
  switch (action.type) {
    case 'GET_TEST': {
      return action.data
    }
    case 'ADD_TEST': {
      return [...testState, action.data]
    }
    case 'DELETE_TEST': {
      return testState.filter(test => test.id !== action.data)
    }
    case 'UPDATE_TEST': {
      return testState.map(test => (test.id === action.data.id ? action.data : test))
    }
    case 'ZERO_TEST': {
      return action.data
    }
    default:
      return testState
  }
}

export const getTests = token => {
  return async dispatch => {
    const test = await testService.get(token)
    if (test.error) {
      dispatch(setNotification({ message: test.error, success: false, show: true }))
    } else {
      dispatch({
        type: 'GET_TEST',
        data: test,
      })
    }
  }
}

export const addTest = (name, type, contImg, posImg, negImg, bacteriaSpesif, token, handleClose) => {
  return async (dispatch, getState) => {
    const library = getState()?.language?.library.frontend.test.reducer
    const test = await testService.add(name, type, contImg, posImg, negImg, bacteriaSpesif, token)
    if (test.error) {
      dispatch(
        setNotification({ message: test.error.substring(test.error.indexOf('name: ') + 6), success: false, show: true })
      )
    } else {
      dispatch(setNotification({ message: library.addSuccess, success: true, show: true }))
      dispatch({
        type: 'ADD_TEST',
        data: test,
      })
      handleClose()
    }
  }
}

export const deleteTest = (id, token) => {
  return async (dispatch, getState) => {
    const library = getState()?.language?.library.frontend.test.reducer
    const response = await testService.deleteTest(id, token)
    if (response.status !== 204) {
      dispatch(setNotification({ message: response.error, success: false }))
    } else {
      dispatch(setNotification({ message: library.deleteSuccess, success: true, show: true }))
      dispatch({
        type: 'DELETE_TEST',
        data: id,
      })
    }
  }
}

export const updateTest = (
  id,
  name,
  type,
  contImg,
  photoPos,
  photoNeg,
  bacteriaSpesif,
  photosToDelete,
  deleteSpecifics,
  token,
  handleClose,
  setDeletePhotos,
  setDeleteSpecifics
) => {
  return async (dispatch, getState) => {
    const library = getState()?.language?.library.frontend.test.reducer
    const test = await testService.update(
      id,
      name,
      type,
      contImg,
      photoPos,
      photoNeg,
      bacteriaSpesif,
      photosToDelete,
      deleteSpecifics,
      token
    )
    if (test.error) {
      dispatch(
        setNotification({ message: test.error.substring(test.error.indexOf('name: ') + 6), success: false, show: true })
      )
    } else {
      dispatch(setNotification({ message: library.editSuccess, success: true, show: true }))
      dispatch({
        type: 'UPDATE_TEST',
        data: test,
      })
      handleClose()
      setDeletePhotos({ ctrl: false, pos: false, neg: false })
      setDeleteSpecifics([])
    }
  }
}

export const zeroTest = () => {
  return async dispatch => {
    dispatch({
      type: 'ZERO_TEST',
      data: [],
    })
  }
}

export default testReducer
