const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const bcrypt = require('bcrypt')
const api = supertest(app)

const Bacterium = require('../models/bacterium')
const User = require('../models/user')
const Test = require('../models/testCase')
const Case = require('../models/case')
const Credit = require('../models/credit')


// Users and needed user tokens.
let user1
let user3
let user4

let adminToken
let user1Token
let user2Token

let caseAdded

beforeEach(async () => {
  await Bacterium.deleteMany({})
  await User.deleteMany({})
  await Test.deleteMany({})
  await Case.deleteMany({})
  await Credit.deleteMany({})

  // Create users
  const adminPwd = await bcrypt.hash('admin', 10)
  const admin = new User({ username: 'adminNew', passwordHash: adminPwd, admin: true, email: 'example666@com' })
  await admin.save()

  const userPwd = await bcrypt.hash('user', 10)
  let user = new User({ username: 'user1New', passwordHash: userPwd, admin: false, email: 'example1@com' })
  user1 = await user.save()
  user = new User({ username: 'user2New', passwordHash: userPwd, admin: false, email: 'example2@com' })
  await user.save()
  user = new User({ username: 'user3New', passwordHash: userPwd, admin: false, email: 'example3@com' })
  user3 = await user.save()
  user = new User({ username: 'user4New', passwordHash: userPwd, admin: false, email: 'example4@com' })
  user4 = await user.save()


  // Get tokens
  let loginRes = await api
    .post('/api/user/login')
    .send({
      username: 'adminNew',
      password: 'admin'
    })
  adminToken = loginRes.body.token
  loginRes = await api
    .post('/api/user/login')
    .send({
      username: 'user1New',
      password: 'user'
    })
  user1Token = loginRes.body.token
  loginRes = await api
    .post('/api/user/login')
    .send({
      username: 'user2New',
      password: 'user'
    })
  user2Token = loginRes.body.token

  // Save credits
  const user1Credits = new Credit({
    user: user1.id,
    testCases: [
      'Maitotila 2',
      'Maitotila 4'
    ]
  })
  await user1Credits.save()
  const user3Credits = new Credit({
    user: user3.id,
    testCases: [
      'Maitotila 7',
      'Maitotila 9'
    ]
  })
  await user3Credits.save()
  const user4Credits = new Credit({
    user: user4.id,
    testCases: [
      'Maitotila 4',
      'Maitotila 7'
    ]
  })
  await user4Credits.save()

  // Create case
  const initialBacterium = new Bacterium({
    name: 'test bacterium'
  })
  const addedBacterium = await initialBacterium.save()

  const initialSamples = [
    {
      description: 'Sample1',
      rightAnswer: true
    },
    {
      description: 'Sample2',
      rightAnswer: false
    }
  ]

  const initialTest = new Test({
    name: 'testForCase',
    type: 'Viljely'
  })
  const addedTest = await initialTest.save()

  const initialCase = new Case({
    name: 'Maitotila 11',
    anamnesis: 'Anamneesi',
    bacterium: addedBacterium,
    samples: initialSamples,
    testGroups: [
      [
        {
          tests: [
            {
              test: addedTest,
              positive: true
            }
          ],
          isRequired: true
        }
      ]
    ]
  })
  caseAdded = await initialCase.save()
})

describe('getting credits', () => {
  test('admin can get list of all credits', async () => {
    const creditList = await api
      .get('/api/credit')
      .set('Authorization', `bearer ${adminToken}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
    expect(creditList.body.map(credit => credit.user.username)).toContain('user1New')
    expect(creditList.body.map(credit => credit.user.username)).toContain('user3New')
    expect(creditList.body.map(credit => credit.user.username)).toContain('user4New')
    expect(creditList.body.map(credit => credit.user.username)).not.toContain('user2New')
  })

  test('user that has credits can get his own credits', async () => {
    const creditList = await api
      .get('/api/credit')
      .set('Authorization', `bearer ${user1Token}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
    expect(creditList.body.map(credit => credit.user.username)).toContain('user1New')
    expect(creditList.body[0].testCases.length).toEqual(2)
    expect(creditList.body[0].testCases).toContain('Maitotila 2')
    expect(creditList.body[0].testCases).toContain('Maitotila 4')
  })

  test('user only gets list of his own credits', async () => {
    const creditList = await api
      .get('/api/credit')
      .set('Authorization', `bearer ${user1Token}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
    expect(creditList.body.map(credit => credit.user.username)).toContain('user1New')
    expect(creditList.body.length).toEqual(1)
  })
})


describe('completing cases', () => {
  test('points get correctly stored when completing first case', async () => {
    const bacterium = { bacteriumName: 'test bacterium' }
    await api
      .post(`/api/game/${caseAdded.id}/checkBacterium`)
      .set('Authorization', `bearer ${user2Token}`)
      .send(bacterium)
    let casesAfter = await api
      .get('/api/credit')
      .set('Authorization', `bearer ${user2Token}`)
      .expect(200)
    casesAfter = casesAfter.body[0].testCases
    expect(casesAfter.length).toEqual(1)
  })

  test('points get correctly stored when a case has already been completed previously', async () => {
    let casesBefore = await api
      .get('/api/credit')
      .set('Authorization', `bearer ${user1Token}`)
      .expect(200)
    casesBefore = casesBefore.body[0].testCases
    const bacterium = { bacteriumName: 'test bacterium' }
    await api
      .post(`/api/game/${caseAdded.id}/checkBacterium`)
      .set('Authorization', `bearer ${user1Token}`)
      .send(bacterium)
      .expect(200)
    let casesAfter = await api
      .get('/api/credit')
      .set('Authorization', `bearer ${user1Token}`)
      .expect(200)
    casesAfter = casesAfter.body[0].testCases
    expect(casesAfter.length).toEqual(casesBefore.length + 1)
  })
})

describe('deleting credits', () => {
  test('admin can delete credits', async () => {
    let creditsBefore = await api
      .get('/api/credit')
      .set('Authorization', `bearer ${adminToken}`)
      .expect(200)
    creditsBefore = creditsBefore.body
    const creditsToDelete = [
      creditsBefore.filter(credit => credit.user.username === user1.username)[0].id,
      creditsBefore.filter(credit => credit.user.username === user3.username)[0].id
    ]
    await api
      .delete('/api/credit/')
      .set('Authorization', `bearer ${adminToken}`)
      .send(creditsToDelete)
      .expect(204)
    let creditsAfter = await api
      .get('/api/credit')
      .set('Authorization', `bearer ${adminToken}`)
      .expect(200)
    creditsAfter = creditsAfter.body
    expect(creditsAfter.length).toEqual(creditsBefore.length - 2)
  })

  test('user cannot delete credits', async () => {
    let creditsBefore = await api
      .get('/api/credit')
      .set('Authorization', `bearer ${adminToken}`)
      .expect(200)
    creditsBefore = creditsBefore.body
    const creditsToDelete = [
      creditsBefore.filter(credit => credit.user.username === user1.username)[0].id,
      creditsBefore.filter(credit => credit.user.username === user3.username)[0].id
    ]
    await api
      .delete('/api/credit/')
      .set('Authorization', `bearer ${user1Token}`)
      .send(creditsToDelete)
      .expect(401)
    let creditsAfter = await api
      .get('/api/credit')
      .set('Authorization', `bearer ${adminToken}`)
      .expect(200)
    creditsAfter = creditsAfter.body
    expect(creditsAfter.length).toEqual(creditsBefore.length)
  })

  test('only correct credits are deleted', async () => {
    let creditsBefore = await api
      .get('/api/credit')
      .set('Authorization', `bearer ${adminToken}`)
      .expect(200)
    creditsBefore = creditsBefore.body
    const creditsToDelete = [
      creditsBefore.filter(credit => credit.user.username === user1.username)[0].id,
      creditsBefore.filter(credit => credit.user.username === user3.username)[0].id
    ]
    await api
      .delete('/api/credit/')
      .set('Authorization', `bearer ${adminToken}`)
      .send(creditsToDelete)
      .expect(204)
    let creditsAfter = await api
      .get('/api/credit')
      .set('Authorization', `bearer ${adminToken}`)
      .expect(200)
    creditsAfter = creditsAfter.body
    expect(creditsAfter.map(credit => credit.user.username)).not.toContain(user1.username)
    expect(creditsAfter.map(credit => credit.user.username)).not.toContain(user3.username)
    expect(creditsAfter.map(credit => credit.user.username)).toContain(user4.username)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
  await mongoose.disconnect()
})