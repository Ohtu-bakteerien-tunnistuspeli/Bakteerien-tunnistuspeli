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

const initialBacteria = [
  {
    name: 'koli',
  },
  {
    name: 'tetanus',
  },
]
const initialTest = {
  name: 'testName',
  type: 'testType',
}

beforeEach(async () => {
  await Case.deleteMany({})
  await Test.deleteMany({})
  await Bacterium.deleteMany({})
  await User.deleteMany({})
  const bacteriaObjects = initialBacteria.map(bacterium => new Bacterium(bacterium))
  const promiseArray = bacteriaObjects.map(backterium => backterium.save())
  await Promise.all(promiseArray)
  const adminPassword = await bcrypt.hash('admin', 10)
  const userPassword = await bcrypt.hash('password', 10)
  await new User({
    username: 'adminNew',
    passwordHash: adminPassword,
    admin: true,
    email: 'exampless1111111111@com',
  }).save()
  await new User({
    username: 'usernameNew',
    passwordHash: userPassword,
    admin: false,
    email: 'examples444444@com',
  }).save()
  await Test(initialTest).save()
})

describe('addition of a case ', () => {
  test('admin can add a case', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const res = await api.get('/api/case').set('Authorization', `bearer ${user.body.token}`)
    const initialLength = res.body.length
    const bacterium = await Bacterium.findOne({ name: 'koli' })
    const testCase = await Test.findOne({ name: 'testName' })
    const samples = JSON.stringify([
      {
        description: 'desc 1',
        rightAnswer: true,
      },
      {
        description: 'desc 2',
        rightAnswer: false,
      },
    ])
    const testGroups = JSON.stringify([
      [
        {
          tests: [
            {
              testId: testCase.id,
              positive: true,
            },
          ],
          isRequired: true,
        },
      ],
    ])
    const newCase = {
      name: 'testing case',
      bacterium: bacterium.id,
      anamnesis: 'test anamnesis',
      samples: samples,
      testGroups: testGroups,
      completionText: 'test completion text',
    }
    const addingRes = await api
      .post('/api/case')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newCase)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(addingRes.body.name, 'testing case')
    assert.strictEqual(addingRes.body.bacterium.name, 'koli')
    assert.strictEqual(addingRes.body.testGroups[0][0].tests[0].test.name, 'testName')
    assert.strictEqual(addingRes.body.testGroups[0][0].tests[0].positive, true)
    assert.strictEqual(addingRes.body.testGroups[0][0].isRequired, true)
    assert.strictEqual(addingRes.body.samples[0].description, 'desc 1')
    assert.strictEqual(addingRes.body.samples[0].rightAnswer, true)
    assert.strictEqual(addingRes.body.samples[1].description, 'desc 2')
    assert.strictEqual(addingRes.body.samples[1].rightAnswer, false)
    assert.strictEqual(addingRes.body.anamnesis, 'test anamnesis')
    assert.strictEqual(addingRes.body.completionText, 'test completion text')
    assert.strictEqual(addingRes.body.complete, true)
    const resAfterAdding = await api.get('/api/case').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(resAfterAdding.body.length, initialLength + 1)
  })

  test('an invalid case is not added and returns error message', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const testCase = await Test.findOne({ name: 'testName' })
    const bacterium = await Bacterium.findOne({ name: 'koli' })
    const samples = JSON.stringify([
      {
        description: 'desc 1',
        rightAnswer: true,
      },
      {
        description: 'desc 2',
        rightAnswer: false,
      },
    ])
    const testGroups = JSON.stringify([
      [
        {
          tests: [
            {
              testId: testCase.id,
              positive: true,
            },
          ],
          isRequired: true,
        },
      ],
    ])
    const newCase = {
      name: 'testing case',
      bacterium: bacterium.id,
      anamnesis: 'test anamnesis',
      samples: samples,
      testGroups: testGroups,
      completionText: 'test completion text',
    }
    await api
      .post('/api/case')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newCase)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const res = await api.get('/api/case').set('Authorization', `bearer ${user.body.token}`)

    const initialLength = res.body.length
    const testGroups2 = JSON.stringify([
      [
        {
          tests: [
            {
              testId: 'false-test-id',
              positive: true,
            },
          ],
          isRequired: true,
        },
      ],
    ])

    const newCases = [
      {
        name: 'testing case',
        bacterium: 'false-id',
        anamnesis: 'test anamnesis',
        samples: samples,
        testGroups: testGroups,
        completionText: 'test completion text',
      },
      {
        name: 'testing case',
        bacterium: bacterium.id,
        anamnesis: 'test anamnesis',
        samples: samples,
        testGroups: testGroups2,
        completionText: 'test completion text',
      },
      {
        name: 't',
        bacterium: bacterium.id,
        anamnesis: 'test anamnesis',
        samples: samples,
        testGroups: testGroups,
        completionText: 'test completion text',
      },
      {
        name: 'oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo',
        bacterium: bacterium.id,
        anamnesis: 'test anamnesis',
        samples: samples,
        testGroups: testGroups,
        completionText: 'test completion text',
      },
    ]
    let addResponse = await api
      .post('/api/case')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newCases[0])
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.match(addResponse.body.error, /Annettua bakteeria ei löydy./)
    let resAfterAdding = await api.get('/api/case').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(resAfterAdding.body.length, initialLength)
    addResponse = await api
      .post('/api/case')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newCases[1])
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.match(addResponse.body.error, /Annettua testiä ei löydy./)
    resAfterAdding = await api.get('/api/case').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(resAfterAdding.body.length, initialLength)
    addResponse = await api
      .post('/api/case')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newCase)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.match(addResponse.body.error, /Nimen tulee olla uniikki./)
    resAfterAdding = await api.get('/api/case').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(resAfterAdding.body.length, initialLength)
    addResponse = await api
      .post('/api/case')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newCases[2])
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.match(addResponse.body.error, /Nimen tulee olla vähintään 2 merkkiä pitkä./)
    resAfterAdding = await api.get('/api/case').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(resAfterAdding.body.length, initialLength)
    addResponse = await api
      .post('/api/case')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newCases[3])
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.match(addResponse.body.error, /Nimen tulee olla enintään 100 merkkiä pitkä./)
    resAfterAdding = await api.get('/api/case').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(resAfterAdding.body.length, initialLength)
  })

  test('user cannot add a case', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })
    const admin = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const res = await api.get('/api/case').set('Authorization', `bearer ${admin.body.token}`)
    const initialLength = res.body.length
    const bacterium = await Bacterium.findOne({ name: 'koli' })
    const testCase = await Test.findOne({ name: 'testName' })
    const samples = JSON.stringify([
      {
        description: 'desc 1',
        rightAnswer: true,
      },
      {
        description: 'desc 2',
        rightAnswer: false,
      },
    ])
    const testGroups = JSON.stringify([
      [
        {
          tests: [
            {
              testId: testCase.id,
              positive: true,
            },
          ],
          isRequired: true,
        },
      ],
    ])
    const newCase = {
      name: 'testing case',
      bacterium: bacterium.id,
      anamnesis: 'test anamnesis',
      samples: samples,
      testGroups: testGroups,
    }
    const addResponse = await api
      .post('/api/case')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newCase)
      .expect(401)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(addResponse.body.error, 'token missing or invalid')
    const resAfterAdding = await api.get('/api/case').set('Authorization', `bearer ${admin.body.token}`)
    assert.strictEqual(resAfterAdding.body.length, initialLength)
  })
})

describe('deletion of a case', () => {
  test('admin can delete a case', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const res = await api.get('/api/case').set('Authorization', `bearer ${user.body.token}`)
    const initialLength = res.body.length
    const bacterium = await Bacterium.findOne({ name: 'koli' })
    const testCase = await Test.findOne({ name: 'testName' })
    const samples = JSON.stringify([
      {
        description: 'desc 1',
        rightAnswer: true,
      },
      {
        description: 'desc 2',
        rightAnswer: false,
      },
    ])
    const testGroups = JSON.stringify([
      [
        {
          tests: [
            {
              testId: testCase.id,
              positive: true,
            },
          ],
          isRequired: true,
        },
      ],
    ])
    const newCase = {
      name: 'testing case',
      bacterium: bacterium.id,
      anamnesis: 'test anamnesis',
      samples: samples,
      testGroups: testGroups,
      completionText: 'test completion text',
    }
    await api
      .post('/api/case')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newCase)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const resAfterAdding = await api.get('/api/case').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(resAfterAdding.body.length, initialLength + 1)
    await api
      .delete(`/api/case/${resAfterAdding.body[0].id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .expect(204)
    const resAfterDelete = await api.get('/api/case').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(resAfterDelete.body.length, initialLength)
  })

  test('user cannot delete a case', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })
    const admin = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const bacterium = await Bacterium.findOne({ name: 'koli' })
    const testCase = await Test.findOne({ name: 'testName' })
    const samples = JSON.stringify([
      {
        description: 'desc 1',
        rightAnswer: true,
      },
      {
        description: 'desc 2',
        rightAnswer: false,
      },
    ])
    const testGroups = JSON.stringify([
      [
        {
          tests: [
            {
              testId: testCase.id,
              positive: true,
            },
          ],
          isRequired: true,
        },
      ],
    ])
    const newCase = {
      name: 'testing case',
      bacterium: bacterium.id,
      anamnesis: 'test anamnesis',
      samples: samples,
      testGroups: testGroups,
      completionText: 'test completion text',
    }
    await api
      .post('/api/case')
      .set('Authorization', `bearer ${admin.body.token}`)
      .send(newCase)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const res = await api.get('/api/bacteria').set('Authorization', `bearer ${admin.body.token}`)
    const initialLength = res.body.length
    const deleteResponse = await api
      .delete(`/api/bacteria/${res.body[0].id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .expect(401)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(deleteResponse.body.error, 'token missing or invalid')
    const resAfterDelete = await api.get('/api/bacteria').set('Authorization', `bearer ${admin.body.token}`)
    assert.strictEqual(resAfterDelete.body.length, initialLength)
  })
})

describe('modify a case', () => {
  test('admin can modify an existing case', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const bacterium = await Bacterium.findOne({ name: 'koli' })
    const testCase = await Test.findOne({ name: 'testName' })
    const samples = JSON.stringify([
      {
        description: 'desc 1',
        rightAnswer: true,
      },
      {
        description: 'desc 2',
        rightAnswer: false,
      },
    ])
    const testGroups = JSON.stringify([
      [
        {
          tests: [
            {
              testId: testCase.id,
              positive: true,
            },
          ],
          isRequired: true,
        },
      ],
    ])
    const newCase = {
      name: 'testing case',
      bacterium: bacterium.id,
      anamnesis: 'test anamnesis',
      samples: samples,
      testGroups: testGroups,
      completionText: 'test completion text',
    }
    await api
      .post('/api/case')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newCase)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const res = await api.get('/api/case').set('Authorization', `bearer ${user.body.token}`)
    const caseToUpdate = {
      name: 'case testing',
      anamnesis: 'anamnesis test',
      completionText: '',
    }
    const updatedCase = await api
      .put(`/api/case/${res.body[0].id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(caseToUpdate)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(res.body[0].id, updatedCase.body.id)
    assert.strictEqual(updatedCase.body.name, 'case testing')
    assert.strictEqual(updatedCase.body.anamnesis, 'anamnesis test')
    assert.strictEqual(updatedCase.body.completionText, '')
    assert.strictEqual(updatedCase.body.complete, false)
  })

  test('user cannot modify an existing case', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })

    const admin = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const bacterium = await Bacterium.findOne({ name: 'koli' })
    const testCase = await Test.findOne({ name: 'testName' })
    const samples = JSON.stringify([
      {
        description: 'desc 1',
        rightAnswer: true,
      },
      {
        description: 'desc 2',
        rightAnswer: false,
      },
    ])
    const testGroups = JSON.stringify([
      [
        {
          tests: [
            {
              testId: testCase.id,
              positive: true,
            },
          ],
          isRequired: true,
        },
      ],
    ])
    const newCase = {
      name: 'testing case',
      bacterium: bacterium.id,
      anamnesis: 'test anamnesis',
      samples: samples,
      testGroups: testGroups,
      completionText: 'test completion text',
    }
    await api
      .post('/api/case')
      .set('Authorization', `bearer ${admin.body.token}`)
      .send(newCase)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const res = await api.get('/api/case').set('Authorization', `bearer ${admin.body.token}`)
    const caseToUpdate = {}
    caseToUpdate.name = 'case testing'
    caseToUpdate.anamnesis = 'anamnesis test'
    const updatedCase = await api
      .put(`/api/case/${res.body[0].id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(caseToUpdate)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(updatedCase.body.error, 'token missing or invalid')
  })

  test('if modified case is invalid, error is returned', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })

    const bacterium = await Bacterium.findOne({ name: 'koli' })
    const testCase = await Test.findOne({ name: 'testName' })
    const samples = JSON.stringify([
      {
        description: 'desc 1',
        rightAnswer: true,
      },
      {
        description: 'desc 2',
        rightAnswer: false,
      },
    ])
    const testGroups = JSON.stringify([
      [
        {
          tests: [
            {
              testId: testCase.id,
              positive: true,
            },
          ],
          isRequired: true,
        },
      ],
    ])
    let newCase = {
      name: 'testing case',
      bacterium: bacterium.id,
      anamnesis: 'test anamnesis',
      samples: samples,
      testGroups: testGroups,
      completionText: 'test completion text',
    }
    await api
      .post('/api/case')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newCase)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    newCase = {
      name: 'testing case2',
      bacterium: bacterium.id,
      anamnesis: 'test anamnesis2',
      samples: samples,
      testGroups: testGroups,
      completionText: 'test completion text',
    }
    const postedCase = await api
      .post('/api/case')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newCase)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const changes = [
      {
        name: 'testing case',
      },
      {
        name: 'o',
      },
      {
        name: 'oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo',
      },
      {
        bacterium: 'false-id',
      },
      {
        testGroups: JSON.stringify([
          [
            {
              tests: [
                {
                  testId: 'false-test-id',
                  positive: true,
                },
              ],
              isRequired: true,
            },
          ],
        ]),
      },
    ]
    let updatetCase = await api
      .put(`/api/case/${postedCase.body.id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(changes[0])
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.match(updatetCase.body.error, /Nimen tulee olla uniikki./)
    updatetCase = await api
      .put(`/api/case/${postedCase.body.id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(changes[1])
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.match(updatetCase.body.error, /Nimen tulee olla vähintään 2 merkkiä pitkä./)
    updatetCase = await api
      .put(`/api/case/${postedCase.body.id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(changes[2])
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.match(updatetCase.body.error, /Nimen tulee olla enintään 100 merkkiä pitkä./)
    updatetCase = await api
      .put(`/api/case/${postedCase.body.id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(changes[3])
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.match(updatetCase.body.error, /Annettua bakteeria ei löydy./)
    updatetCase = await api
      .put(`/api/case/${postedCase.body.id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(changes[4])
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.match(updatetCase.body.error, /Annettua testiä ei löydy/)
  })

  test('cannot modify case that does not exist', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const bacterium = await Bacterium.findOne({ name: 'koli' })
    const testCase = await Test.findOne({ name: 'testName' })
    const samples = JSON.stringify([
      {
        description: 'desc 1',
        rightAnswer: true,
      },
      {
        description: 'desc 2',
        rightAnswer: false,
      },
    ])
    const testGroups = JSON.stringify([
      [
        {
          tests: [
            {
              testId: testCase.id,
              positive: true,
            },
          ],
          isRequired: true,
        },
      ],
    ])
    let newCase = {
      name: 'testing case',
      bacterium: bacterium.id,
      anamnesis: 'test anamnesis',
      samples: samples,
      testGroups: testGroups,
      completionText: 'test completion text',
    }
    const res = await api
      .put('/api/case/doesnotexist')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newCase)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.match(res.body.error, /Annettua tapausta ei löydy tietokannasta./)
  })
})

describe('add hints to a case', () => {
  test('admin can add hint to an existing case', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const bacterium = await Bacterium.findOne({ name: 'koli' })
    const testCase = await Test.findOne({ name: 'testName' })
    const samples = JSON.stringify([
      {
        description: 'desc 1',
        rightAnswer: true,
      },
      {
        description: 'desc 2',
        rightAnswer: false,
      },
    ])
    const testGroups = JSON.stringify([
      [
        {
          tests: [
            {
              testId: testCase.id,
              positive: true,
            },
          ],
          isRequired: true,
        },
      ],
    ])
    const newCase = {
      name: 'testing case',
      bacterium: bacterium.id,
      anamnesis: 'test anamnesis',
      samples: samples,
      testGroups: testGroups,
      completionText: 'test completion text',
    }
    await api
      .post('/api/case')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newCase)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const res = await api.get('/api/case').set('Authorization', `bearer ${user.body.token}`)
    const hints = [
      {
        test: testCase.id,
        hint: 'testHint',
      },
    ]
    const hintedCase = await api
      .put(`/api/case/${res.body[0].id}/hints`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(hints)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(hintedCase.body.hints[0].test.name, 'testName')
    assert.strictEqual(hintedCase.body.hints[0].hint, 'testHint')
  })

  test('user cannot add hints to an existing case', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })

    const admin = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const bacterium = await Bacterium.findOne({ name: 'koli' })
    const testCase = await Test.findOne({ name: 'testName' })
    const samples = JSON.stringify([
      {
        description: 'desc 1',
        rightAnswer: true,
      },
      {
        description: 'desc 2',
        rightAnswer: false,
      },
    ])
    const testGroups = JSON.stringify([
      [
        {
          tests: [
            {
              testId: testCase.id,
              positive: true,
            },
          ],
          isRequired: true,
        },
      ],
    ])
    const newCase = {
      name: 'testing case',
      bacterium: bacterium.id,
      anamnesis: 'test anamnesis',
      samples: samples,
      testGroups: testGroups,
      completionText: 'test completion text',
    }
    await api
      .post('/api/case')
      .set('Authorization', `bearer ${admin.body.token}`)
      .send(newCase)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const res = await api.get('/api/case').set('Authorization', `bearer ${admin.body.token}`)
    const hints = [
      {
        test: testCase.id,
        hint: 'testHint',
      },
    ]
    const hintedCase = await api
      .put(`/api/case/${res.body[0].id}/hints`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(hints)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(hintedCase.body.error, 'token missing or invalid')
  })

  test('Cannot add hints to case that does not exist', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const testCase = await Test.findOne({ name: 'testName' })
    const hints = [
      {
        test: testCase.id,
        hint: 'testHint',
      },
    ]
    const res = await api
      .put('/api/case/doesnotexist/hints')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(hints)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.match(res.body.error, /Annettua tapausta ei löydy tietokannasta./)
  })

  test('cannot add hints to non existing test', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const bacterium = await Bacterium.findOne({ name: 'koli' })
    const testCase = await Test.findOne({ name: 'testName' })
    const samples = JSON.stringify([
      {
        description: 'desc 1',
        rightAnswer: true,
      },
      {
        description: 'desc 2',
        rightAnswer: false,
      },
    ])
    const testGroups = JSON.stringify([
      [
        {
          tests: [
            {
              testId: testCase.id,
              positive: true,
            },
          ],
          isRequired: true,
        },
      ],
    ])
    const newCase = {
      name: 'testing case',
      bacterium: bacterium.id,
      anamnesis: 'test anamnesis',
      samples: samples,
      testGroups: testGroups,
      completionText: 'test completion text',
    }
    await api
      .post('/api/case')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newCase)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const res = await api.get('/api/case').set('Authorization', `bearer ${user.body.token}`)
    const hints = [
      {
        test: 'does not exist',
        hint: 'testHint',
      },
    ]
    const hintedCase = await api
      .put(`/api/case/${res.body[0].id}/hints`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(hints)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(hintedCase.body.error, 'Annettua testiä ei löydy.')
  })

  test('cannot add more than one hint to a test', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const bacterium = await Bacterium.findOne({ name: 'koli' })
    const testCase = await Test.findOne({ name: 'testName' })
    const samples = JSON.stringify([
      {
        description: 'desc 1',
        rightAnswer: true,
      },
      {
        description: 'desc 2',
        rightAnswer: false,
      },
    ])
    const testGroups = JSON.stringify([
      [
        {
          tests: [
            {
              testId: testCase.id,
              positive: true,
            },
          ],
          isRequired: true,
        },
      ],
    ])
    const newCase = {
      name: 'testing case',
      bacterium: bacterium.id,
      anamnesis: 'test anamnesis',
      samples: samples,
      testGroups: testGroups,
      completionText: 'test completion text',
    }
    await api
      .post('/api/case')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newCase)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const res = await api.get('/api/case').set('Authorization', `bearer ${user.body.token}`)
    const hints = [
      {
        test: testCase.id,
        hint: 'testHint1',
      },
      {
        test: testCase.id,
        hint: 'testHint2',
      },
    ]
    const hintedCase = await api
      .put(`/api/case/${res.body[0].id}/hints`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(hints)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(hintedCase.body.error, 'Samalla testillä on useampia vinkkejä.')
  })
})

after(async () => {
  await mongoose.connection.close()
  await mongoose.disconnect()
})
