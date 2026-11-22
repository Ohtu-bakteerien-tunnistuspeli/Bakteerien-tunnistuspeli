const reducer = (state = '', action) => {
  switch (action.type) {
    case 'SET NOTIFICATION': {
      return action.notification
    }
    default:
      return state
  }
}

let timer

export const setNotification = notification => {
  return async dispatch => {
    if (notification !== '') {
      clearTimeout(timer)
      timer = setTimeout(() => {
        dispatch(setNotification(''))
      }, 5000)
    }
    dispatch({
      type: 'SET NOTIFICATION',
      notification: notification,
    })
  }
}

export default reducer
