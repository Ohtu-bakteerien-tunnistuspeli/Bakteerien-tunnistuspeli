import gameService from '../services/game'
import { setNotification } from '../reducers/notificationReducer'
import { getCredits } from './creditReducer'

const gameReducer = (state = null, action) => {
  switch (action.type) {
    case 'GET_GAME': {
      return action.data
    }
    case 'CHECK_SAMPLES': {
      return action.data
    }
    case 'CHECK_TESTS': {
      return action.data
    }
    case 'CHECK_BACTERIUM': {
      return action.data
    }
    case 'ZERO_GAME': {
      return action.data
    }
    case 'PUT_GAME': {
      return action.data
    }
    default:
      return state
  }
}

export const getGame = (navigate, id, token) => {
  return async (dispatch, getState) => {
    const library = getState()?.language?.library.frontend.routes
    const receivedCase = await gameService.get(id, token)
    const initialGameStates = await gameService.testCheck(id, { tests: [] }, token)
    if (receivedCase.error) {
      dispatch(setNotification({ message: receivedCase.error, success: false, show: true }))
    } else if (initialGameStates.error) {
      dispatch(setNotification({ message: initialGameStates.error, success: false, show: true }))
    } else {
      let game = {
        case: receivedCase,
        samplesCorrect: false,
        correctSample: '',
        requiredTestsDone: initialGameStates.requiredDone,
        allTestsDone: initialGameStates.allDone,
        bacteriumCorrect: false,
        correctTests: [],
        testResults: [],
        completionImageUrl: null,
      }
      dispatch({
        type: 'GET_GAME',
        data: game,
      })
      navigate(`/${library.game}`)
    }
  }
}

export const checkSamples = (game, selectedSample, token, setTestTab) => {
  return async (dispatch, getState) => {
    const library = getState()?.language?.library.frontend.gamePage.reducer
    const checkSample = await gameService.sampleCheck(game.case.id, { samples: [selectedSample] }, token)
    if (checkSample.error) {
      dispatch(setNotification({ message: checkSample.error, success: false, show: true }))
    } else {
      if (checkSample.correct) {
        dispatch(setNotification({ message: library.samplesCorrect, success: true, show: true }))
        dispatch({
          type: 'CHECK_SAMPLES',
          data: { ...game, samplesCorrect: true, correctSample: selectedSample },
        })
        setTestTab('testejä')
      } else {
        dispatch(setNotification({ message: library.samplesWrong, success: false, show: true }))
      }
    }
  }
}

export const checkTests = (game, test, token, setTestTab) => {
  return async (dispatch, getState) => {
    const library = getState()?.language?.library.frontend.gamePage.reducer
    const checkTest = await gameService.testCheck(game.case.id, { tests: [...game.correctTests, test] }, token)
    if (checkTest.error) {
      dispatch(setNotification({ message: checkTest.error, success: false, show: true }))
    } else {
      if (checkTest.correct) {
        if (checkTest.allDone) {
          dispatch(setNotification({ message: library.allTestsDone, success: true, show: true }))
        } else if (checkTest.requiredDone) {
          dispatch(setNotification({ message: library.requiredTestsDone, success: true, show: true }))
        } else {
          dispatch(setNotification({ message: library.testCorrect, success: true, show: true }))
        }
        dispatch({
          type: 'CHECK_TESTS',
          data: {
            ...game,
            correctTests: [...game.correctTests, test],
            testResults: [...game.testResults, { imageUrl: checkTest.imageUrl, testName: checkTest.testName }],
            requiredTestsDone: checkTest.requiredDone,
            allTestsDone: checkTest.allDone,
          },
        })
        setTestTab('tuloksia')
      } else {
        if (checkTest.hint) {
          dispatch(setNotification({ message: checkTest.hint, success: false, show: true }))
        } else {
          dispatch(setNotification({ message: library.testWrong, success: false, show: true }))
        }
      }
    }
  }
}

export const checkBacterium = (game, bacteriumName, token) => {
  return async (dispatch, getState) => {
    const library = getState()?.language?.library.frontend.gamePage.reducer
    const checkBacterium = await gameService.bacteriumCheck(game.case.id, { bacteriumName }, token)
    if (checkBacterium.error) {
      dispatch(setNotification({ message: checkBacterium.error, success: false, show: true }))
    } else {
      if (checkBacterium.correct) {
        dispatch(setNotification({ message: library.bacteriumCorrect, success: true, show: true }))
        dispatch({
          type: 'CHECK_BACTERIUM',
          data: {
            ...game,
            bacteriumCorrect: true,
            completionImageUrl: checkBacterium.completionImageUrl,
          },
        })
        dispatch(getCredits(token))
      } else {
        dispatch(setNotification({ message: library.bacteriumWrong, success: false, show: true }))
      }
    }
  }
}

export const zeroGame = () => {
  return async dispatch => {
    dispatch({
      type: 'ZERO_GAME',
      data: null,
    })
  }
}

export const recoverGame = game => {
  return async dispatch => {
    dispatch({
      type: 'PUT_GAME',
      data: game,
    })
  }
}

export default gameReducer
