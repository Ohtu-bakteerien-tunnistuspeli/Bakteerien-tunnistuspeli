const express = require('express')
const cors = require('cors')
const app = express()
const { library, MONGODB_URI, IMAGEURL } = require('./utils/config')
const { logger } = require('./utils/logger')
const libraryRoutes = library.frontend.routes
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

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  const { MongoMemoryServer } = require('mongodb-memory-server')
  const mongoServer = new MongoMemoryServer()
  const User = require('./models/user')
  const Bacterium = require('./models/bacterium')
  const TestCase = require('./models/testCase')
  const Case = require('./models/case')
  const Credit = require('./models/credit')
  const bcrypt = require('bcrypt')

  mongoServer
    .getUri()
    .then(mongoUri => {
      mongoose.set('strictQuery', false)
      mongoose.connect(mongoUri)
      mongoose.connection.on('error', error => {
        if (error.message.code === 'ETIMEDOUT') {
          logger.error(error)
          mongoose.connect(mongoUri)
        }
        logger.error(error)
      })
      mongoose.connection.once('open', async () => {
        logger.info(`MongoDB successfully connected to ${mongoUri}`)
        const saltRounds = 10
        let passwordHash = await bcrypt.hash('useruser12', saltRounds)
        const user = new User({
          username: 'user',
          email: 'user@example.com',
          admin: false,
          studentNumber: '834183479234',
          classGroup: 'C-13',
          passwordHash,
        })
        await user.save()
        passwordHash = await bcrypt.hash('adminadmin', saltRounds)
        const admin = new User({
          username: 'admin',
          email: 'admin@example.com',
          studentNumber: '',
          classGroup: '',
          admin: true,
          passwordHash,
        })
        await admin.save()

        const cred1 = new Credit({
          user: user,
          testCases: ['Maitotila 3', 'Maitotila 5'],
        })
        await cred1.save()

        const bac1 = new Bacterium({
          name: 'Streptococcus agalactiae',
        })

        const bac2 = new Bacterium({
          name: 'Staphylococcus aureus',
        })

        await bac1.save()
        await bac2.save()

        const intialTestCase1 = new TestCase({
          name: 'Veriagar, +37 °C, aerobinen kasvatus',
          type: 'Viljely',
        })

        const intialTestCase2 = new TestCase({
          name: 'Gram-värjäys',
          type: 'Värjäys',
        })

        const intialTestCase3 = new TestCase({
          name: 'Katalaasitesti',
          type: 'Testi',
        })
        const intialTestCase4 = new TestCase({
          name: 'HIRS-sarja (hippuraatti, inuliini, raffinoosi, sorbitoli)',
          type: 'Testi',
        })

        const intialTestCase5 = new TestCase({
          name: 'Eskuliiniveriagar',
          type: 'Viljely',
        })

        const intialTestCase6 = new TestCase({
          name: 'Edwardsin agar',
          type: 'Viljely',
        })

        const intialTestCase7 = new TestCase({
          name: 'CAMP-testi',
          type: 'Testi',
        })

        await intialTestCase1.save()
        await intialTestCase2.save()
        await intialTestCase3.save()
        await intialTestCase4.save()
        await intialTestCase5.save()
        await intialTestCase6.save()
        await intialTestCase7.save()

        const initialCase = new Case({
          name: 'Maitotila 1',
          bacterium: bac1,
          anamnesis: 'Vasemman takaneljänneksen maito on hiukan kokkareista...',
          completionText: 'You completed the initial case!',
          hints: [],
          samples: [
            {
              description: 'Maitonäyte Muurikin kaikista neljänneksistä',
              rightAnswer: true,
            },
            {
              description: 'Tankkimaitonäyte',
              rightAnswer: false,
            },
            {
              description: 'Ulostenäyte Muurikilta',
              rightAnswer: false,
            },
            {
              description: 'Virtsanäyte Muurikilta',
              rightAnswer: false,
            },
          ],
          testGroups: [
            [
              { tests: [{ test: intialTestCase1, positive: true }], isRequired: false },
              {
                tests: [
                  { test: intialTestCase2, positive: true },
                  { test: intialTestCase4, positive: true },
                ],
                isRequired: true,
              },
            ],
            [{ tests: [{ test: intialTestCase3, positive: false }], isRequired: true }],
          ],
          complete: true,
        })
        await initialCase.save()

        const initialCase2 = new Case({
          name: 'Maitotila 2',
          bacterium: bac1,
          anamnesis: 'Vasemman takaneljänneksen maito on hiukan kokkareista...',
          completionText: 'You completed the initial case!',
          hints: [],
          samples: [
            {
              description: 'Maitonäyte Muurikin kaikista neljänneksistä',
              rightAnswer: true,
            },
            {
              description: 'Tankkimaitonäyte',
              rightAnswer: false,
            },
            {
              description: 'Ulostenäyte Muurikilta',
              rightAnswer: false,
            },
            {
              description: 'Virtsanäyte Muurikilta',
              rightAnswer: false,
            },
          ],
          testGroups: [],
          complete: true,
        })
        await initialCase2.save()
      })
    })
    .catch(error => logger.error(error))
} else if (process.env.NODE_ENV === 'production') {
  mongoose.set('strictQuery', false)
  mongoose.connect(MONGODB_URI)
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
