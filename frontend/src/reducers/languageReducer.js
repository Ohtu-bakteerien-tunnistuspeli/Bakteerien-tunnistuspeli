import Validation from '../lib/validation.json'
import Library from '../lib/library.json'

const reducer = (state = null, action) => {
  switch (action.type) {
    case 'GET_LANGUAGE': {
      return action.data
    }
    default:
      return state
  }
}

export const getLanguage = () => {
  return async dispatch => {
    const language = { validation: Validation, library: Library }
    dispatch({
      type: 'GET_LANGUAGE',
      data: language,
    })
  }
}

export default reducer
