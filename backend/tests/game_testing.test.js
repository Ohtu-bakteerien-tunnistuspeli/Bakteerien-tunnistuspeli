const { test, beforeEach, before, describe, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = supertest(app)

const Bacterium = require('../models/bacterium')
const User = require('../models/user')
const Test = require('../models/testCase')
const Case = require('../models/case')
const Credit = require('../models/credit')

const initialTests = [
  {
    name: 'test0',
    type: 'Viljely',
  },
  {
    name: 'test1',
    type: 'Viljely',
  },
  {
    name: 'test2',
    type: 'Viljely',
  },
  {
    name: 'test3',
    type: 'Värjäys',
  },
  {
    name: 'test4',
    type: 'Testi',
  },
  {
    name: 'test5',
    type: 'Testi',
  },
  {
    name: 'test6',
    type: 'Viljely',
  },
  {
    name: 'test7',
    type: 'Viljely',
  },
  {
    name: 'test8',
    type: 'Testi',
  },
  {
    name: 'test9',
    type: 'Viljely',
  },
  {
    name: 'test10',
    type: 'Värjäys',
  },
  {
    name: 'test11',
    type: 'Muu',
  },
]

const initialBacteriumForCase = new Bacterium({
  name: 'testBacterium',
})

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

let adminUserToken // For easy access to token
let testMap = {} // For easy access to IDs
let addedCaseId // For easy access to case information
let addedTests
let initialBacterium

before(async () => {
  await Credit.deleteMany({})
  await Bacterium.deleteMany({})
  await User.deleteMany({})
  await Test.deleteMany({})
  await Case.deleteMany({})
})

beforeEach(async () => {
  // Clean db
  await Credit.deleteMany({})
  await Bacterium.deleteMany({})
  await User.deleteMany({})
  await Test.deleteMany({})
  await Case.deleteMany({})
  // Create admin
  const adminPassword = await bcrypt.hash('admin', 10)
  const admin = new User({ username: 'adminNew', passwordHash: adminPassword, admin: true, email: 'example333333@com' })
  await admin.save()
  // Get admin token
  const loginRes = await api.post('/api/user/login').send({
    username: 'adminNew',
    password: 'admin',
  })
  adminUserToken = loginRes.body.token
  // Add all tests
  addedTests = initialTests.map(test => new Test(test))
  await Test.insertMany(addedTests)
  // Create name -> id map of tests
  testMap = {}
  const testsInDB = await api.get('/api/test').set('Authorization', `bearer ${adminUserToken}`)
  for (let i = 0; i < testsInDB.body.length; i++) {
    testMap[testsInDB.body[i].name] = testsInDB.body[i].id
  }
  // Add initial bacterium
  initialBacterium = new Bacterium(initialBacteriumForCase)
  initialBacterium.save()
  // Add initial case
  const caseToAdd = new Case({
    name: 'Test case',
    anamnesis: 'Test case',
    bacterium: initialBacterium,
    samples: initialSamples,
    testGroups: [
      [
        // Group 1
        {
          tests: [
            { test: addedTests[0], positive: true },
            { test: addedTests[1], positive: false },
          ],
          isRequired: true,
        },
        {
          tests: [{ test: addedTests[2], positive: true }],
          isRequired: false,
        },
      ],
      [
        // Group 2
        {
          tests: [{ test: addedTests[3], positive: true }],
          isRequired: true,
        },
        {
          tests: [{ test: addedTests[4], positive: false }],
          isRequired: false,
        },
      ],
      [
        // Group 3
        {
          tests: [
            { test: addedTests[5], positive: true },
            { test: addedTests[6], positive: true },
          ],
          isRequired: true,
        },
        {
          tests: [
            { test: addedTests[7], positive: true },
            { test: addedTests[8], positive: false },
          ],
          isRequired: true,
        },
      ],
      [
        // Group 4
        {
          tests: [{ test: addedTests[9], positive: true }],
          isRequired: true,
        },
      ],
    ],
    hints: [
      {
        test: addedTests[9],
        hint: 'test hint',
      },
    ],
  })
  addedCaseId = await caseToAdd.save()
  addedCaseId = addedCaseId._id
})

describe('it is possible to do tests', () => {
  test('admin can do tests', async () => {
    const data = [testMap['test0']]
    const res = await api
      .post(`/api/game/${addedCaseId}/checkTests`)
      .set('Authorization', `bearer ${adminUserToken}`)
      .send({ tests: data })
      .expect(200)
    assert.strictEqual(res.body.correct, true)
  })

  test('normal user can do tests', async () => {
    const adminPassword = await bcrypt.hash('user', 10)
    const admin = new User({
      username: 'userNew',
      passwordHash: adminPassword,
      admin: false,
      email: 'examples4444@com',
    })
    await admin.save()
    const loginRes = await api.post('/api/user/login').send({
      username: 'userNew',
      password: 'user',
    })

    const data = [testMap['test0']]
    const res = await api
      .post(`/api/game/${addedCaseId}/checkTests`)
      .set('Authorization', `bearer ${loginRes.body.token}`)
      .send({ tests: data })
      .expect(200)
    assert.strictEqual(res.body.correct, true)
  })

  test('correct first required test can be done', async () => {
    const data = [testMap['test0']]
    const res = await api
      .post(`/api/game/${addedCaseId}/checkTests`)
      .set('Authorization', `bearer ${adminUserToken}`)
      .send({ tests: data })
      .expect(200)
    assert.strictEqual(res.body.correct, true)
  })

  test('correct first extra test can be done', async () => {
    const data = [testMap['test2']]
    const res = await api
      .post(`/api/game/${addedCaseId}/checkTests`)
      .set('Authorization', `bearer ${adminUserToken}`)
      .send({ tests: data })
      .expect(200)
    assert.strictEqual(res.body.correct, true)
  })

  test('required tests cannot be done too early', async () => {
    const data = [testMap['test3']]
    const res = await api
      .post(`/api/game/${addedCaseId}/checkTests`)
      .set('Authorization', `bearer ${adminUserToken}`)
      .send({ tests: data })
      .expect(200)
    assert.strictEqual(res.body.correct, false)
    assert.strictEqual(res.body.hint, undefined)
  })

  test('test with hint returns it when the test is wrong answer', async () => {
    const data = [testMap['test9']]
    const res = await api
      .post(`/api/game/${addedCaseId}/checkTests`)
      .set('Authorization', `bearer ${adminUserToken}`)
      .send({ tests: data })
      .expect(200)
    assert.strictEqual(res.body.correct, false)
    assert.strictEqual(res.body.hint, 'test hint')
  })

  test('extra tests cannot be done too early', async () => {
    const data = [testMap['test4']]
    const res = await api
      .post(`/api/game/${addedCaseId}/checkTests`)
      .set('Authorization', `bearer ${adminUserToken}`)
      .send({ tests: data })
      .expect(200)
    assert.strictEqual(res.body.correct, false)
  })

  test('incorrect tests cannot be done', async () => {
    const data = [testMap['test11']]
    const res = await api
      .post(`/api/game/${addedCaseId}/checkTests`)
      .set('Authorization', `bearer ${adminUserToken}`)
      .send({ tests: data })
      .expect(200)
    assert.strictEqual(res.body.correct, false)
  })

  test('test group that only contains extra tests is not required', async () => {
    const caseToAdd = new Case({
      name: 'Test case2',
      anamnesis: 'Test case2',
      bacterium: initialBacterium,
      samples: initialSamples,
      testGroups: [
        [
          // Group 1
          {
            tests: [
              { test: addedTests[0], positive: true },
              { test: addedTests[1], positive: false },
            ],
            isRequired: false,
          },
          {
            tests: [{ test: addedTests[2], positive: true }],
            isRequired: false,
          },
        ],
        [
          // Group 2
          {
            tests: [{ test: addedTests[3], positive: true }],
            isRequired: true,
          },
          {
            tests: [{ test: addedTests[4], positive: false }],
            isRequired: false,
          },
        ],
      ],
    })
    const testCaseAdded = await caseToAdd.save()

    const data = [testMap['test3'], testMap['test4']]
    let res = await api
      .post(`/api/game/${testCaseAdded.id}/checkTests`)
      .set('Authorization', `bearer ${adminUserToken}`)
      .send({ tests: data })
      .expect(200)
    assert.strictEqual(res.body.correct, true)
  })

  test('last test group that only contains extra tests is not required', async () => {
    const caseToAdd = new Case({
      name: 'Test case3',
      anamnesis: 'Test case3',
      bacterium: initialBacterium,
      samples: initialSamples,
      testGroups: [
        [
          // Group 1
          {
            tests: [{ test: addedTests[0], positive: true }],
            isRequired: true,
          },
        ],
        [
          // Group 2
          {
            tests: [{ test: addedTests[1], positive: true }],
            isRequired: false,
          },
        ],
      ],
    })
    const testCaseAdded = await caseToAdd.save()

    const data = [testMap['test0']]
    let res = await api
      .post(`/api/game/${testCaseAdded.id}/checkTests`)
      .set('Authorization', `bearer ${adminUserToken}`)
      .send({ tests: data })
      .expect(200)
    assert.strictEqual(res.body.correct, true)
    assert.strictEqual(res.body.requiredDone, true)
    assert.strictEqual(res.body.allDone, false)
  })

  test('empty list can be posted to check if case can be completed without testing', async () => {
    const caseToAdd = new Case({
      name: 'Test case3',
      anamnesis: 'Test case3',
      bacterium: initialBacterium,
      samples: initialSamples,
      testGroups: [
        [
          // Group 1
          {
            tests: [{ test: addedTests[0], positive: true }],
            isRequired: false,
          },
        ],
        [
          // Group 2
          {
            tests: [{ test: addedTests[1], positive: true }],
            isRequired: false,
          },
        ],
      ],
    })
    const testCaseAdded = await caseToAdd.save()

    const data = []
    const res = await api
      .post(`/api/game/${testCaseAdded.id}/checkTests`)
      .set('Authorization', `bearer ${adminUserToken}`)
      .send({ tests: data })
      .expect(200)
    assert.strictEqual(res.body.requiredDone, true)
    assert.strictEqual(res.body.allDone, false)
  })
})

describe('it is possible to do multiple tests', () => {
  test('user can do tests from second group after completing all required tests from the first one', async () => {
    const data = [testMap['test0'], testMap['test3']]
    const res = await api
      .post(`/api/game/${addedCaseId}/checkTests`)
      .set('Authorization', `bearer ${adminUserToken}`)
      .send({ tests: data })
      .expect(200)
    assert.strictEqual(res.body.correct, true)
  })

  test('alternative required test can be done as extra', async () => {
    const data = [testMap['test0'], testMap['test1']]
    const res = await api
      .post(`/api/game/${addedCaseId}/checkTests`)
      .set('Authorization', `bearer ${adminUserToken}`)
      .send({ tests: data })
      .expect(200)
    assert.strictEqual(res.body.correct, true)
  })

  test('only required tests are required for completion', async () => {
    const data = [testMap['test0'], testMap['test3'], testMap['test5'], testMap['test7'], testMap['test9']]
    const res = await api
      .post(`/api/game/${addedCaseId}/checkTests`)
      .set('Authorization', `bearer ${adminUserToken}`)
      .send({ tests: data })
      .expect(200)
    assert.strictEqual(res.body.correct, true)
    assert.strictEqual(res.body.requiredDone, true)
    assert.strictEqual(res.body.allDone, false)
  })

  test('allDone is false if not all tests are done', async () => {
    const data = [testMap['test0'], testMap['test3'], testMap['test5'], testMap['test7'], testMap['test9']]
    const res = await api
      .post(`/api/game/${addedCaseId}/checkTests`)
      .set('Authorization', `bearer ${adminUserToken}`)
      .send({ tests: data })
      .expect(200)
    assert.strictEqual(res.body.correct, true)
    assert.strictEqual(res.body.allDone, false)
  })

  test('allDone is true if all tests are done', async () => {
    const data = [
      testMap['test0'],
      testMap['test1'],
      testMap['test2'],
      testMap['test3'],
      testMap['test4'],
      testMap['test5'],
      testMap['test6'],
      testMap['test7'],
      testMap['test8'],
      testMap['test9'],
    ]
    const res = await api
      .post(`/api/game/${addedCaseId}/checkTests`)
      .set('Authorization', `bearer ${adminUserToken}`)
      .send({ tests: data })
      .expect(200)
    assert.strictEqual(res.body.correct, true)
    assert.strictEqual(res.body.requiredDone, true)
    assert.strictEqual(res.body.allDone, true)
  })
})

describe('correct errors are given', () => {
  test('when no list is posted', async () => {
    const res = await api
      .post(`/api/game/${addedCaseId}/checkTests`)
      .set('Authorization', `bearer ${adminUserToken}`)
      .expect(400)
    assert.match(res.body.error, /Testin lähettämisessä tapahtui virhe./)
  })
})

after(async () => {
  await mongoose.connection.close()
})
