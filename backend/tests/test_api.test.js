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

const initialTestCases = [
  { name: 'test1', type: 'type1' },
  { name: 'test2', type: 'type2' },
]

beforeEach(async () => {
  await Bacterium.deleteMany({})
  await User.deleteMany({})
  await Test.deleteMany({})
  await Case.deleteMany({})
  const testObjects = initialTestCases.map(test => new Test(test))
  const promiseArray = testObjects.map(test => test.save())
  await Promise.all(promiseArray)
  const adminPassword = await bcrypt.hash('admin', 10)
  const admin = new User({ username: 'adminNew', passwordHash: adminPassword, admin: true, email: 'example111111@com' })
  await admin.save()
  const userPassword = await bcrypt.hash('user', 10)
  const user = new User({ username: 'userNew', passwordHash: userPassword, admin: false, email: 'examples1@com' })
  await user.save()
})

describe('test format', () => {
  test('tests are returned as JSON', async () => {
    const user = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin',
      })
      .expect(200)
    await api
      .get('/api/test')
      .set('Authorization', `bearer ${user.body.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
})

describe('addition of a test', () => {
  test('admin can add a test', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const testsBeforeAdding = await api.get('/api/test').set('Authorization', `bearer ${user.body.token}`)
    const newTest = {
      name: 'newTest',
      type: 'newType',
    }
    await api
      .post('/api/test')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newTest)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const testsAfterAdding = await api.get('/api/test').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(testsAfterAdding.body.length, testsBeforeAdding.body.length + 1)
  })

  test('user cannot add a test', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'userNew',
      password: 'user',
    })
    const testsBeforeAdding = await api.get('/api/test').set('Authorization', `bearer ${user.body.token}`)
    const newTest = {
      name: 'newTest',
      type: 'newType',
    }
    const addResponse = await api
      .post('/api/test')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newTest)
      .expect(401)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(addResponse.body.error, 'token missing or invalid')
    const testsAfterAdding = await api.get('/api/test').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(testsAfterAdding.body.length, testsBeforeAdding.body.length)
  })

  test('cannot add two tests with same name', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const testsBeforeAdding = await api.get('/api/test').set('Authorization', `bearer ${user.body.token}`)
    const newTest1 = {
      name: 'newTest',
      type: 'newType1',
    }
    const newTest2 = {
      name: 'newTest',
      type: 'newType2',
    }
    await api.post('/api/test').set('Authorization', `bearer ${user.body.token}`).send(newTest1).expect(201)
    const res2 = await api
      .post('/api/test')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newTest2)
      .expect(400)
    assert.strictEqual(res2.body.error, 'Test validation failed: name: Nimen tulee olla uniikki.')
    const testsAfterAdding = await api.get('/api/test').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(testsAfterAdding.body.length, testsBeforeAdding.body.length + 1)
  })

  test('multiple tests with same type can be added', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const newTest1 = {
      name: 'newTest1',
      type: 'sameType',
    }
    const newTest2 = {
      name: 'newTest2',
      type: 'sameType',
    }
    await api.post('/api/test').set('Authorization', `bearer ${user.body.token}`).send(newTest1).expect(201)
    await api.post('/api/test').set('Authorization', `bearer ${user.body.token}`).send(newTest2).expect(201)
  })

  test('test name is required', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const newTest = {
      type: 'newType',
    }
    const res = await api.post('/api/test').set('Authorization', `bearer ${user.body.token}`).send(newTest).expect(400)
    assert.strictEqual(res.body.error, 'Test validation failed: name: Nimi on pakollinen.')
  })

  test('test type is required', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const newTest = {
      name: 'newTest',
    }
    const res = await api.post('/api/test').set('Authorization', `bearer ${user.body.token}`).send(newTest).expect(400)
    assert.strictEqual(res.body.error, 'Test validation failed: type: Tyyppi on pakollinen.')
  })

  test('test name length should be at least two', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const testsBeforeAdding = await api.get('/api/test').set('Authorization', `bearer ${user.body.token}`)
    const newTest1 = {
      name: 't',
      type: 'newType',
    }
    const newTest2 = {
      name: 'tt',
      type: 'newType',
    }
    const res1 = await api
      .post('/api/test')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newTest1)
      .expect(400)
    assert.strictEqual(res1.body.error, 'Test validation failed: name: Nimen tulee olla vähintään 2 merkkiä pitkä.')
    await api.post('/api/test').set('Authorization', `bearer ${user.body.token}`).send(newTest2).expect(201)
    const testsAfterAdding = await api.get('/api/test').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(testsAfterAdding.body.length, testsBeforeAdding.body.length + 1)
  })

  test('test type length should be at least two', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const testsBeforeAdding = await api.get('/api/test').set('Authorization', `bearer ${user.body.token}`)
    const newTest1 = {
      name: 'newTest1',
      type: 't',
    }
    const newTest2 = {
      name: 'newTest2',
      type: 'tt',
    }
    const res1 = await api
      .post('/api/test')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newTest1)
      .expect(400)
    assert.strictEqual(res1.body.error, 'Test validation failed: type: Tyypin tulee olla vähintään 2 merkkiä pitkä.')
    await api.post('/api/test').set('Authorization', `bearer ${user.body.token}`).send(newTest2).expect(201)
    const testsAfterAdding = await api.get('/api/test').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(testsAfterAdding.body.length, testsBeforeAdding.body.length + 1)
  })

  test('test name cannot be longer than 100 characters', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const newTest1 = {
      name: new Array(101).join('a'),
      type: 'newType',
    }
    const newTest2 = {
      name: new Array(102).join('a'),
      type: 'newType',
    }
    await api.post('/api/test').set('Authorization', `bearer ${user.body.token}`).send(newTest1).expect(201)
    const res = await api.post('/api/test').set('Authorization', `bearer ${user.body.token}`).send(newTest2).expect(400)
    assert.strictEqual(res.body.error, 'Test validation failed: name: Nimen tulee olla enintään 100 merkkiä pitkä.')
  })

  test('test type cannot be longer than 100 characters', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const newTest1 = {
      name: 'newTest1',
      type: new Array(101).join('a'),
    }
    const newTest2 = {
      name: 'newTest2',
      type: new Array(102).join('a'),
    }
    await api.post('/api/test').set('Authorization', `bearer ${user.body.token}`).send(newTest1).expect(201)
    const res = await api.post('/api/test').set('Authorization', `bearer ${user.body.token}`).send(newTest2).expect(400)
    assert.strictEqual(res.body.error, 'Test validation failed: type: Tyypin tulee olla enintään 100 merkkiä pitkä.')
  })
})

describe('modifying of a test', () => {
  test('admin can modify existing test', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const newTest = {
      name: 'newTest',
      type: 'newType',
    }
    const res = await api.post('/api/test').set('Authorization', `bearer ${user.body.token}`).send(newTest)
    const resTest = {
      ...res.body,
      name: 'modified name',
    }
    await api
      .put(`/api/test/${resTest.id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(resTest)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    const allTests = await api.get('/api/test').set('Authorization', `bearer ${user.body.token}`)
    const testNames = allTests.body.map(test => test.name)
    assert(testNames.includes('modified name'))
  })

  test('user cannot modify existing test', async () => {
    const adminUser = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const userUser = await api.post('/api/user/login').send({
      username: 'userNew',
      password: 'user',
    })
    const newTest = {
      name: 'newTest',
      type: 'newType',
    }
    const res = await api.post('/api/test').set('Authorization', `bearer ${adminUser.body.token}`).send(newTest)
    const resTest = {
      ...res.body,
      name: 'modified name',
    }
    await api
      .put(`/api/test/${resTest.id}`)
      .set('Authorization', `bearer ${userUser.body.token}`)
      .send(resTest)
      .expect(401)
    const allTests = await api.get('/api/test').set('Authorization', `bearer ${adminUser.body.token}`)
    const testNames = allTests.body.map(test => test.name)
    assert(testNames.includes('newTest'))
  })

  test('cannot modify test that does not exist', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const newTest = {
      id: 'doesnotexist',
      name: 'testThatDoesNotExist',
      type: 'type',
    }
    const res = await api
      .put(`/api/test/${newTest.id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newTest)
      .expect(400)
    assert.strictEqual(res.body.error, 'Annettua testiä ei löydy tietokannasta')
  })

  test('modified name needs to be unique', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const newTest1 = {
      name: 'uniqueName',
      type: 'type',
    }
    const newTest2 = {
      name: 'newTest',
      type: 'type',
    }
    await api.post('/api/test').set('Authorization', `bearer ${user.body.token}`).send(newTest1)
    const res = await api.post('/api/test').set('Authorization', `bearer ${user.body.token}`).send(newTest2)
    const modifiedTest = {
      ...res.body,
      name: 'uniqueName',
    }
    const modifyRes = await api
      .put(`/api/test/${modifiedTest.id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(modifiedTest)
      .expect(400)
    assert.strictEqual(modifyRes.body.error, 'Validation failed: name: Nimen tulee olla uniikki.')
  })
})

describe('deleting of a test', () => {
  test('admin can delete a test', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const testsBeforeDelete = await api.get('/api/test').set('Authorization', `bearer ${user.body.token}`)
    await api
      .delete(`/api/test/${testsBeforeDelete.body[0].id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .expect(204)
    const testsAfterDelete = await api.get('/api/test').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(testsAfterDelete.body.length, testsBeforeDelete.body.length - 1)
  })

  test('user cannot delete a test', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'userNew',
      password: 'user',
    })
    const testsBeforeDelete = await api.get('/api/test').set('Authorization', `bearer ${user.body.token}`)
    const res = await api
      .delete(`/api/test/${testsBeforeDelete.body[0].id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .expect(401)
    assert.strictEqual(res.body.error, 'token missing or invalid')
    const testsAfterDelete = await api.get('/api/test').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(testsAfterDelete.body.length, testsBeforeDelete.body.length)
  })

  test('test cannot be deleted if it is used in a case', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const newTest = {
      name: 'newTest',
      type: 'newType',
    }
    const res = await api
      .post('/api/test')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newTest)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const testsBeforeDelete = await api.get('/api/test').set('Authorization', `bearer ${user.body.token}`)
    const testGroups = JSON.stringify([[{ tests: [{ testId: res.body.id }] }]])
    const newCase = {
      name: 'testCase',
      type: 'testType',
      anamnesis: 'test anamnesis',
      testGroups: testGroups,
    }
    await api.post('/api/case').set('Authorization', `bearer ${user.body.token}`).send(newCase).expect(201)
    const deletionRes = await api
      .delete(`/api/test/${res.body.id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(deletionRes.body.error, 'Testi on käytössä ainakin yhdessä tapauksessa, eikä sitä voida poistaa')
    const testsAfterDelete = await api.get('/api/test').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(testsBeforeDelete.body.length, testsAfterDelete.body.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})
