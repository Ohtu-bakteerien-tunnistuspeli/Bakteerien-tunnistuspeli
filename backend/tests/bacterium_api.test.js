const assert = require('node:assert')
const { test, beforeEach, describe, after } = require('node:test')
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

beforeEach(async () => {
  await Case.deleteMany({})
  await Test.deleteMany({})
  await Bacterium.deleteMany({})
  await User.deleteMany({})
  await new Bacterium(initialBacteria[0]).save()
  await new Bacterium(initialBacteria[1]).save()
  const adminPassword = await bcrypt.hash('admin', 10)
  const userPassword = await bcrypt.hash('password', 10)
  const admin = new User({
    username: 'adminNew',
    passwordHash: adminPassword,
    admin: true,
    email: 'example1111111@com',
  })
  const user = new User({
    username: 'usernameNew',
    passwordHash: userPassword,
    admin: false,
    email: 'examples55555@com',
  })
  await admin.save()
  await user.save()
})

describe('bacteria format', () => {
  test('bacteria are returned as json', async () => {
    const user = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin',
      })
      .expect(200)
    await api
      .get('/api/bacteria')
      .set('Authorization', `bearer ${user.body.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
})

describe('addition of a bacterium ', () => {
  test('admin can add a bacterium', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const res = await api.get('/api/bacteria').set('Authorization', `bearer ${user.body.token}`)
    const initialLength = res.body.length
    const newBacterium = {
      name: 'testing bacterium',
    }
    await api
      .post('/api/bacteria')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newBacterium)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const resAfterAdding = await api.get('/api/bacteria').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(resAfterAdding.body.length, initialLength + 1)
  })

  test('an invalid bacterium is not added and returns error message', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const res = await api.get('/api/bacteria').set('Authorization', `bearer ${user.body.token}`)

    const initialLength = res.body.length
    const newBacteria = [
      {
        name: 'a',
      },
      {
        name: 'koli',
      },
      {
        name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      },
    ]
    let addResponse = await api
      .post('/api/bacteria')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newBacteria[0])
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.match(
      addResponse.body.error,
      /Bacterium validation failed: name: Nimen tulee olla vähintään 2 merkkiä pitkä./
    )
    let resAfterAdding = await api.get('/api/bacteria').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(resAfterAdding.body.length, initialLength)
    addResponse = await api
      .post('/api/bacteria')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newBacteria[1])
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.match(addResponse.body.error, /Nimen tulee olla uniikki./)
    resAfterAdding = await api.get('/api/bacteria').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(resAfterAdding.body.length, initialLength)
    addResponse = await api
      .post('/api/bacteria')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newBacteria[2])
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.match(addResponse.body.error, /Nimen tulee olla enintään 100 merkkiä pitkä./)
    resAfterAdding = await api.get('/api/bacteria').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(resAfterAdding.body.length, initialLength)
  })

  test('user cannot add a bacterium', async () => {
    const adminUser = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })
    const res = await api.get('/api/bacteria').set('Authorization', `bearer ${adminUser.body.token}`)
    const initialLength = res.body.length
    const newBacterium = {
      name: 'testing bacterium',
    }
    const addResponse = await api
      .post('/api/bacteria')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newBacterium)
      .expect(401)
      .expect('Content-Type', /application\/json/)
    assert.match(addResponse.body.error, /token missing or invalid/)
    const resAfterAdding = await api.get('/api/bacteria').set('Authorization', `bearer ${adminUser.body.token}`)
    assert.strictEqual(resAfterAdding.body.length, initialLength)
  })
})

describe('deletion of a bacterium', () => {
  test('admin can delete a bacterium', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const res = await api.get('/api/bacteria').set('Authorization', `bearer ${user.body.token}`)
    const initialLength = res.body.length
    const newBacterium = {
      name: 'testing bacterium',
    }
    await api
      .post('/api/bacteria')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newBacterium)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const resAfterAdding = await api.get('/api/bacteria').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(resAfterAdding.body.length, initialLength + 1)
    await api
      .delete(`/api/bacteria/${resAfterAdding.body[0].id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .expect(204)
    const resAfterDelete = await api.get('/api/bacteria').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(resAfterDelete.body.length, initialLength)
  })

  test('user cannot delete a bacterium', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })
    const adminUser = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const res = await api.get('/api/bacteria').set('Authorization', `bearer ${adminUser.body.token}`)
    const initialLength = res.body.length
    const deleteResponse = await api
      .delete(`/api/bacteria/${res.body[0].id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .expect(401)
      .expect('Content-Type', /application\/json/)
    assert.match(deleteResponse.body.error, /token missing or invalid/)
    const resAfterDelete = await api.get('/api/bacteria').set('Authorization', `bearer ${adminUser.body.token}`)
    assert.strictEqual(resAfterDelete.body.length, initialLength)
  })

  test('admin cannot delete a bacterium if it is used in test', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const res = await api.get('/api/bacteria').set('Authorization', `bearer ${user.body.token}`)
    const initialLength = res.body.length
    const newBacterium = {
      name: 'testing bacterium',
    }
    await api
      .post('/api/bacteria')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newBacterium)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const resAfterAdding = await api.get('/api/bacteria').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(resAfterAdding.body.length, initialLength + 1)
    await Test({
      name: 'testTest',
      type: 'testType',
      bacteriaSpecificImages: [{ bacterium: resAfterAdding.body[0].id, contentType: 'image' }],
    }).save()
    const deletionRes = await api
      .delete(`/api/bacteria/${resAfterAdding.body[0].id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.match(deletionRes.body.error, /Bakteeri on käytössä testissä eikä sitä voi poistaa./)
    const resAfterDelete = await api.get('/api/bacteria').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(resAfterDelete.body.length, initialLength + 1)
  })

  test('admin cannot delete a bacterium if it is used in case', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const res = await api.get('/api/bacteria').set('Authorization', `bearer ${user.body.token}`)
    const initialLength = res.body.length
    const newBacterium = {
      name: 'testing bacterium',
    }
    await api
      .post('/api/bacteria')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(newBacterium)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const resAfterAdding = await api.get('/api/bacteria').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(resAfterAdding.body.length, initialLength + 1)
    await Case({
      name: 'testCase',
      type: 'testType',
      anamnesis: 'test anamnesis',
      bacterium: resAfterAdding.body[0].id,
    }).save()
    const deletionRes = await api
      .delete(`/api/bacteria/${resAfterAdding.body[0].id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.match(deletionRes.body.error, /Bakteeri on käytössä tapauksessa eikä sitä voi poistaa./)
    const resAfterDelete = await api.get('/api/bacteria').set('Authorization', `bearer ${user.body.token}`)
    assert.strictEqual(resAfterDelete.body.length, initialLength + 1)
  })
})

describe('modifying a bacterium', () => {
  test('admin can modify an existing bacterium', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })

    const bacteriumToUpdate = await Bacterium.findOne({ name: 'koli' })
    const updatedBacterium = await api
      .put(`/api/bacteria/${bacteriumToUpdate.id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send({ id: bacteriumToUpdate.id, name: 'Bakteeri' })
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(bacteriumToUpdate.id, updatedBacterium.body.id)
    assert.strictEqual(updatedBacterium.body.name, 'Bakteeri')
  })

  test('user cannot modify an existing bacterium', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })

    const bacteriumToUpdate = await Bacterium.findOne({ name: 'koli' })
    bacteriumToUpdate.name = 'Bakteeri'

    const updatetBacterium = await api
      .put(`/api/bacteria/${bacteriumToUpdate.id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(bacteriumToUpdate)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(updatetBacterium.body.error, 'token missing or invalid')
  })

  test('if name is not unique, error is returned', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })

    const bacteriumToUpdate = await Bacterium.findOne({ name: 'koli' })
    const updatedBacterium = await api
      .put(`/api/bacteria/${bacteriumToUpdate.id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send({ id: bacteriumToUpdate.id, name: 'tetanus' })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.match(updatedBacterium.body.error, /Nimen tulee olla uniikki./)
  })

  test('cannot modify bacterium that does not exist', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const bacteriumToUpdate = { name: 'newBacterium' }
    const updatedBacterium = await api
      .put('/api/bacteria/doesnotexist')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(bacteriumToUpdate)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    assert.match(updatedBacterium.body.error, /Annettua bakteeria ei löydy tietokannasta./)
  })
})

after(async () => {
  await mongoose.connection.close()
  await mongoose.disconnect()
})
