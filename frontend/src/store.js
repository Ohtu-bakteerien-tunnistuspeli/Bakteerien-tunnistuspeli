import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import userReducer from './reducers/userReducer'
import bacteriaReducer from './reducers/bacteriaReducer'
import testReducer from './reducers/testReducer'
import caseReducer from './reducers/caseReducer'
import notificationReducer from './reducers/notificationReducer'
import gameReducer from './reducers/gameReducer'
import creditReducer from './reducers/creditReducer'
import usersReducer from './reducers/usersReducer'
import languageReducer from './reducers/languageReducer'

const reducer = combineReducers({
  user: userReducer,
  bacteria: bacteriaReducer,
  notification: notificationReducer,
  test: testReducer,
  case: caseReducer,
  game: gameReducer,
  credit: creditReducer,
  users: usersReducer,
  language: languageReducer,
})

const store = createStore(reducer, applyMiddleware(thunk))

export default store
