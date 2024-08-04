const { test, beforeEach, describe, after } = require('node:test')
const assert = require('node:assert')
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

const getLoggedInUser = async userNumber => {
  if (userNumber === 1) {
    return await api.post('/api/user/login').send({
      username: 'user1New',
      password: 'useruser',
    })
  } else if (userNumber === 2) {
    return await api.post('/api/user/login').send({
      username: 'user2New',
      password: 'useruser',
    })
  } else if (userNumber === 3) {
    return await api.post('/api/user/login').send({
      username: 'user3New',
      password: 'useruser',
    })
  } else if (userNumber === 4) {
    return await api.post('/api/user/login').send({
      username: 'user4New',
      password: 'useruser',
    })
  }
  return await api.post('/api/user/login').send({
    username: 'adminNew',
    password: 'adminadmin',
  })
}

const findCaseId = async () => {
  const addedCase = await Case.findOne({ name: 'Maitotila 11' })
  return addedCase._id
}

beforeEach(async () => {
  await Case.deleteMany({})
  await Test.deleteMany({})
  await Bacterium.deleteMany({})
  await Credit.deleteMany({})
  await User.deleteMany({})

  // Create users
  const adminPwd = await bcrypt.hash('adminadmin', 10)
  await new User({ username: 'adminNew', passwordHash: adminPwd, admin: true, email: 'example666@com' }).save()

  const userPwd = await bcrypt.hash('useruser', 10)
  let user1 = await new User({
    username: 'user1New',
    passwordHash: userPwd,
    admin: false,
    email: 'example1@com',
  })
  user1 = await user1.save()
  await new User({
    username: 'user2New',
    passwordHash: userPwd,
    admin: false,
    email: 'example2@com',
  }).save()
  let user3 = await new User({
    username: 'user3New',
    passwordHash: userPwd,
    admin: false,
    email: 'example3@com',
  })
  user3 = await user3.save()
  const user4 = await new User({
    username: 'user4New',
    passwordHash: userPwd,
    admin: false,
    email: 'example4@com',
  })
  user4.save()

  // Save credits
  await new Credit({
    user: user1.id,
    testCases: ['Maitotila 2', 'Maitotila 4'],
  }).save()
  await new Credit({
    user: user3.id,
    testCases: ['Maitotila 7', 'Maitotila 9'],
  }).save()
  await new Credit({
    user: user4.id,
    testCases: ['Maitotila 4', 'Maitotila 7'],
  }).save()

  // Create case
  const initialBacterium = new Bacterium({
    name: 'test bacterium',
  })
  const addedBacterium = await initialBacterium.save()

  const initialSamples = [
    {
      description: 'Sample1',
      rightAnswer: true,
    },
    {
      description: 'Sample2',
      rightAnswer: false,
    },
  ]

  const initialTest = await new Test({
    name: 'testForCase',
    type: 'Viljely',
  }).save()

  await new Case({
    name: 'Maitotila 11',
    anamnesis: 'Anamneesi',
    bacterium: addedBacterium,
    samples: initialSamples,
    testGroups: [
      [
        {
          tests: [
            {
              test: initialTest,
              positive: true,
            },
          ],
          isRequired: true,
        },
      ],
    ],
  }).save()
})

describe('getting credits', () => {
  test('admin can get list of all credits', async () => {
    const admin = await getLoggedInUser(5)
    const creditList = await api
      .get('/api/credit')
      .set('Authorization', `bearer ${admin.body.token}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
    assert(creditList.body.map(credit => credit.user.username).includes('user1New'))
    assert(creditList.body.map(credit => credit.user.username).includes('user3New'))
    assert(creditList.body.map(credit => credit.user.username).includes('user4New'))
    assert(!creditList.body.map(credit => credit.user.username).includes('user2New'))
  })

  test('user that has credits can get his own credits', async () => {
    const user1 = await getLoggedInUser(1)
    const creditList = await api
      .get('/api/credit')
      .set('Authorization', `bearer ${user1.body.token}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
    assert(creditList.body.map(credit => credit.user.username).includes('user1New'))
    assert.strictEqual(creditList.body[0].testCases.length, 2)
    assert(creditList.body[0].testCases.includes('Maitotila 2'))
    assert(creditList.body[0].testCases.includes('Maitotila 4'))
  })

  test('user only gets list of his own credits', async () => {
    const user1 = await getLoggedInUser(1)
    const creditList = await api
      .get('/api/credit')
      .set('Authorization', `bearer ${user1.body.token}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
    assert(creditList.body.map(credit => credit.user.username).includes('user1New'))
    assert.strictEqual(creditList.body.length, 1)
  })
})

describe('completing cases', () => {
  test('points get correctly stored when completing first case', async () => {
    const user2 = await getLoggedInUser(2)
    const caseId = await findCaseId()
    const bacterium = { bacteriumName: 'test bacterium' }
    await api
      .post(`/api/game/${caseId}/checkBacterium`)
      .set('Authorization', `bearer ${user2.body.token}`)
      .send(bacterium)
    let casesAfter = await api.get('/api/credit').set('Authorization', `bearer ${user2.body.token}`).expect(200)
    casesAfter = casesAfter.body[0].testCases
    assert.strictEqual(casesAfter.length, 1)
  })

  test('points get correctly stored when a case has already been completed previously', async () => {
    const user1 = await getLoggedInUser(1)
    const caseId = await findCaseId()
    let casesBefore = await api.get('/api/credit').set('Authorization', `bearer ${user1.body.token}`).expect(200)
    casesBefore = casesBefore.body[0].testCases
    const bacterium = { bacteriumName: 'test bacterium' }
    await api
      .post(`/api/game/${caseId}/checkBacterium`)
      .set('Authorization', `bearer ${user1.body.token}`)
      .send(bacterium)
      .expect(200)
    let casesAfter = await api.get('/api/credit').set('Authorization', `bearer ${user1.body.token}`).expect(200)
    casesAfter = casesAfter.body[0].testCases
    assert.strictEqual(casesAfter.length, casesBefore.length + 1)
  })
})

describe('deleting credits', () => {
  test('admin can delete credits', async () => {
    const user1 = await getLoggedInUser(1)
    const user3 = await getLoggedInUser(3)
    const admin = await getLoggedInUser(5)
    let creditsBefore = await api.get('/api/credit').set('Authorization', `bearer ${admin.body.token}`).expect(200)
    creditsBefore = creditsBefore.body
    const creditsToDelete = [
      creditsBefore.filter(credit => credit.user.username === user1.body.username)[0].id,
      creditsBefore.filter(credit => credit.user.username === user3.body.username)[0].id,
    ]
    await api
      .delete('/api/credit/')
      .set('Authorization', `bearer ${admin.body.token}`)
      .send(creditsToDelete)
      .expect(204)
    let creditsAfter = await api.get('/api/credit').set('Authorization', `bearer ${admin.body.token}`).expect(200)
    creditsAfter = creditsAfter.body
    assert.strictEqual(creditsAfter.length, creditsBefore.length - 2)
  })

  test('user cannot delete credits', async () => {
    const user1 = await getLoggedInUser(1)
    const user3 = await getLoggedInUser(3)
    const admin = await getLoggedInUser(5)
    let creditsBefore = await api.get('/api/credit').set('Authorization', `bearer ${admin.body.token}`).expect(200)
    creditsBefore = creditsBefore.body
    const creditsToDelete = [
      creditsBefore.filter(credit => credit.user.username === user1.body.username)[0].id,
      creditsBefore.filter(credit => credit.user.username === user3.body.username)[0].id,
    ]
    await api
      .delete('/api/credit/')
      .set('Authorization', `bearer ${user1.body.token}`)
      .send(creditsToDelete)
      .expect(401)
    let creditsAfter = await api.get('/api/credit').set('Authorization', `bearer ${admin.body.token}`).expect(200)
    creditsAfter = creditsAfter.body
    assert.strictEqual(creditsAfter.length, creditsBefore.length)
  })

  test('only correct credits are deleted', async () => {
    const user1 = await getLoggedInUser(1)
    const user3 = await getLoggedInUser(3)
    const user4 = await getLoggedInUser(4)
    const admin = await getLoggedInUser(5)
    let creditsBefore = await api.get('/api/credit').set('Authorization', `bearer ${admin.body.token}`).expect(200)
    creditsBefore = creditsBefore.body
    const creditsToDelete = [
      creditsBefore.filter(credit => credit.user.username === user1.body.username)[0].id,
      creditsBefore.filter(credit => credit.user.username === user3.body.username)[0].id,
    ]
    await api
      .delete('/api/credit/')
      .set('Authorization', `bearer ${admin.body.token}`)
      .send(creditsToDelete)
      .expect(204)
    let creditsAfter = await api.get('/api/credit').set('Authorization', `bearer ${admin.body.token}`).expect(200)
    creditsAfter = creditsAfter.body
    assert(!creditsAfter.map(credit => credit.user.username).includes(user1.body.username))
    assert(!creditsAfter.map(credit => credit.user.username).includes(user3.body.username))
    assert(creditsAfter.map(credit => credit.user.username).includes(user4.body.username))
  })
})

after(async () => {
  await mongoose.connection.close()
})
