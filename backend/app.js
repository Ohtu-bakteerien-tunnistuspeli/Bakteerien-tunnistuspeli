const express = require('express')
const cors = require('cors')
const app = express()
const { library, MONGODB_URI, IMAGEURL } = require('./utils/config')
const { logger } = require('./utils/logger')
const libraryRoutes = library.frontend.routes
const seed = require('./mongo/seed_db')
require('express-async-errors')
const mongoose = require('mongoose')
if (
  process.env.NODE_ENV === 'testserver' ||
  process.env.NODE_ENV === 'development' ||
  process.env.NODE_ENV === 'test'
) {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

if (process.env.NODE_ENV === 'production') {
  mongoose.set('strictQuery', false)
  mongoose.connect(MONGODB_URI)
} else if (process.env.NODE_ENV === 'development') {
  mongoose.set('strictQuery', false)
  mongoose.connect(MONGODB_URI)
  mongoose.connection.on('error', error => {
    if (error.message.code === 'ETIMEDOUT') {
      logger.error(error)
      mongoose.connect(MONGODB_URI)
    }
    logger.error(error)
  })
  seed()
} else {
  const mongoDB = 'mongodb://localhost:27017/test'
  mongoose.set('strictQuery', false)
  mongoose.connect(mongoDB)
  mongoose.connection.on('error', error => {
    if (error.message.code === 'ETIMEDOUT') {
      logger.error(error)
      mongoose.connect(mongoDB)
    }
    logger.error(error)
  })
}

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
const path = require('path')
const dir = path.join(__dirname, IMAGEURL)
app.use(express.static(dir))
const security = require('./utils/security')
app.use(security.tokenExtractor)
const userRouter = require('./controllers/user')
app.use('/api/user', userRouter)
const bacteriumRouter = require('./controllers/bacterium')
app.use('/api/bacteria', bacteriumRouter)
const testRouter = require('./controllers/testCase')
app.use('/api/test', testRouter)
const caseRouter = require('./controllers/case')
app.use('/api/case', caseRouter)
const gameRouter = require('./controllers/game')
app.use('/api/game', gameRouter)
const creditRouter = require('./controllers/credit')

app.use('/api/credit', creditRouter)
app.use(security.authorizationHandler)
app.get(
  new RegExp(
    `/(${libraryRoutes.bacteriaList}|${libraryRoutes.caseList}|${libraryRoutes.testList}|${libraryRoutes.creditList}|${libraryRoutes.userList}|${libraryRoutes.game}|${libraryRoutes.profile}|${libraryRoutes.login}|${libraryRoutes.register}|${libraryRoutes.temporaryPassword})$`
  ),
  (req, res) => {
    res.sendFile(`${__dirname}/build/index.html`, error => {
      if (error) {
        res.status(500).send(error)
      }
    })
  }
)

app.get('*', (req, res) => {
  res.status(404).sendFile(`${__dirname}/utils/error.html`)
})
module.exports = app
