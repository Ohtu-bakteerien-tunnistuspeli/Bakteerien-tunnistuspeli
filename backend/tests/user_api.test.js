const { test, beforeEach, describe, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const Credit = require('../models/credit')
const bcrypt = require('bcrypt')
const api = supertest(app)

describe('user ', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const adminPassword = await bcrypt.hash('admin', 10)
    const userPassword = await bcrypt.hash('password', 10)
    await new User({
      username: 'adminNew',
      passwordHash: adminPassword,
      admin: true,
      email: 'example11@com',
      studentNumber: '',
      classGroup: '',
    }).save()
    await new User({
      username: 'usernameNew',
      passwordHash: userPassword,
      admin: false,
      email: 'examples111@com',
      studentNumber: '7897089',
      classGroup: 'C-122',
    }).save()
  })

  test('login successfull', async () => {
    await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
  })

  test('failed login', async () => {
    await api
      .post('/api/user/login')
      .send({
        username: 'user',
        password: 'pass',
      })
      .expect(400)
  })

  test('valid user with compulsory fields can register', async () => {
    await api
      .post('/api/user/register')
      .send({
        username: 'testUser',
        password: 'test password hotairballoon',
        email: 'example1@com',
      })
      .expect(200)
    await api
      .post('/api/user/login')
      .send({
        username: 'testUser',
        password: 'test password hotairballoon',
      })
      .expect(200)
  })

  test('valid user with all fields can register', async () => {
    await api
      .post('/api/user/register')
      .send({
        username: 'testUser',
        password: 'test password hotairballoon',
        email: 'example2@com',
        classGroup: 'C-76',
        studentNumber: '1234567',
      })
      .expect(200)
    await api
      .post('/api/user/login')
      .send({
        username: 'testUser',
        password: 'test password hotairballoon',
      })
      .expect(200)
  })

  test('invalid user cannot register', async () => {
    const invalidUsers = [
      {
        username: 'usernameNew',
        password: 'test password hotairballoon',
        email: 'example3@com',
      },
      {
        username: 'usernameNew',
      },
      {
        username: 'usernameNew',
        password: 't',
        email: 'example4@com',
      },
      {
        username: 'u',
        password: 'test password hotairballoon',
        email: 'example5@com',
      },
      {
        username:
          'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
        password: 'test password hotairballoon',
        email: 'example6@com',
      },
      {
        username: 'uniqueUser',
        password: 'test password hotairballoon',
        classGroup: '123',
        email: 'example7@com',
      },
      {
        username: 'usernameNew',
        password: 'test password hotairballoon',
        email: 'examplecom8@',
      },
      {
        username: 'usernameNew',
        password: 'test password hotairballoon',
        email: '',
      },
      {
        username: 'usernameNew',
        password: 'test password hotairballoon',
        classGroup: '123',
        email: 'abcdf',
      },
    ]
    let registerResponse = await api.post('/api/user/register').send(invalidUsers[0]).expect(400)
    assert.match(registerResponse.body.error, /Käyttäjänimen ja sähköpostiosoitteen tulee olla uniikkeja./)
    await api.post('/api/user/login').send(invalidUsers[0]).expect(400)
    registerResponse = await api.post('/api/user/register').send(invalidUsers[1]).expect(400)
    assert.match(registerResponse.body.error, /Salasana on pakollinen./)
    await api.post('/api/user/login').send(invalidUsers[1]).expect(400)
    registerResponse = await api.post('/api/user/register').send(invalidUsers[2]).expect(400)
    assert.match(registerResponse.body.error, /Salasanan täytyy olla vähintään 10 merkkiä pitkä./)
    await api.post('/api/user/login').send(invalidUsers[2]).expect(400)
    registerResponse = await api.post('/api/user/register').send(invalidUsers[3]).expect(400)
    assert.match(registerResponse.body.error, /Käyttäjänimen tulee olla vähintään 2 merkkiä pitkä./)
    await api.post('/api/user/login').send(invalidUsers[3]).expect(400)
    registerResponse = await api.post('/api/user/register').send(invalidUsers[4]).expect(400)
    assert.match(registerResponse.body.error, /Käyttäjänimen tulee olla enintään 100 merkkiä pitkä./)
    await api.post('/api/user/login').send(invalidUsers[4]).expect(400)
    registerResponse = await api.post('/api/user/register').send(invalidUsers[5]).expect(400)
    assert.match(registerResponse.body.error, /Vuosikurssin tule alkaa merkeillä 'C-'/)
    await api.post('/api/user/login').send(invalidUsers[5]).expect(400)
    registerResponse = await api.post('/api/user/register').send(invalidUsers[6]).expect(400)
    assert.match(registerResponse.body.error, /Sähköpostiosoite on virheellinen./)
    await api.post('/api/user/login').send(invalidUsers[6]).expect(400)
    registerResponse = await api.post('/api/user/register').send(invalidUsers[7]).expect(400)
    assert.match(registerResponse.body.error, /Sähköpostiosoite on pakollinen./)
    await api.post('/api/user/login').send(invalidUsers[7]).expect(400)
    registerResponse = await api.post('/api/user/register').send(invalidUsers[8]).expect(400)
    assert.match(
      registerResponse.body.error,
      /User validation failed: classGroup: Vuosikurssin tule alkaa merkeillä 'C-' ja loppua lukuun., email: Sähköpostiosoite on virheellinen., username: Käyttäjänimen ja sähköpostiosoitteen tulee olla uniikkeja./
    )
    await api.post('/api/user/login').send(invalidUsers[8]).expect(400)
  })

  test('if student number is not given empty string will be used instead', async () => {
    const user = {
      username: 'newUser12',
      password: 'test password hotairballoon',
      email: 'example@example.fi',
    }
    await api.post('/api/user/register').send(user).expect(200)
    const loginRes = await api.post('/api/user/login').send(user).expect(200)
    assert.strictEqual(loginRes.body.studentNumber, '')
  })

  test('if student number is null empty string will be used instead', async () => {
    const user = {
      username: 'newUser12',
      password: 'test password hotairballoon',
      email: 'example@example.fi',
      studentNumber: null,
    }
    await api.post('/api/user/register').send(user).expect(200)
    const loginRes = await api.post('/api/user/login').send(user).expect(200)
    assert.strictEqual(loginRes.body.studentNumber, '')
  })

  test('if class group is not given empty string will be used instead', async () => {
    const user = {
      username: 'newUser12',
      password: 'test password hotairballoon',
      email: 'example@example.fi',
    }
    await api.post('/api/user/register').send(user).expect(200)
    const loginRes = await api.post('/api/user/login').send(user).expect(200)
    assert.strictEqual(loginRes.body.classGroup, '')
  })

  test('if student number is null empty string will be used instead', async () => {
    const user = {
      username: 'newUser12',
      password: 'test password hotairballoon',
      email: 'example@example.fi',
      classGroup: null,
    }
    await api.post('/api/user/register').send(user).expect(200)
    const loginRes = await api.post('/api/user/login').send(user).expect(200)
    assert.strictEqual(loginRes.body.classGroup, '')
  })

  test('users are returned as array', async () => {
    const user = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin',
      })
      .expect(200)
    const usersRes = await api
      .get('/api/user')
      .set('Authorization', `bearer ${user.body.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(usersRes.body.length, 1)
  })

  test('returned users do not contain one getting them', async () => {
    const user = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin',
      })
      .expect(200)
    const usersRes = await api
      .get('/api/user')
      .set('Authorization', `bearer ${user.body.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    const users = usersRes.body.map(listUser => listUser.username)
    assert(!users.includes('adminNew'))
    assert(users.includes('usernameNew'))
  })

  test('user cannot get users', async () => {
    const user = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    await api
      .get('/api/user')
      .set('Authorization', `bearer ${user.body.token}`)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('user can delete itself', async () => {
    const user = await User.findOne({ username: 'usernameNew' })
    const loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    await api
      .delete(`/api/user/${user.id}`)
      .set('Authorization', `bearer ${loggedUser.body.token}`)
      .set('data', '"password"')
      .expect(204)
    await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(400)
  })

  test('user cannot delete others', async () => {
    const userPassword = await bcrypt.hash('password2', 10)
    let user = new User({ username: 'usernameNew2', passwordHash: userPassword, admin: false, email: 'example@com' })
    await user.save()
    user = await User.findOne({ username: 'usernameNew2' })
    await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew2',
        password: 'password2',
      })
      .expect(200)
    const loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    await api.delete(`/api/user/${user.id}`).set('Authorization', `bearer ${loggedUser.body.token}`).expect(401)
    await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew2',
        password: 'password2',
      })
      .expect(200)
  })

  test('admin can delete user', async () => {
    const user = await User.findOne({ username: 'usernameNew' })
    await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    const admin = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    await api.delete(`/api/user/${user.id}`).set('Authorization', `bearer ${admin.body.token}`).expect(204)
    await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(400)
  })

  test('deleting user deletes its credits', async () => {
    const user = await User.findOne({ username: 'usernameNew' })
    await Credit({ user, testCases: [] }).save()
    let credit = await Credit.findOne({ user })
    const loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    await api
      .delete(`/api/user/${user.id}`)
      .set('Authorization', `bearer ${loggedUser.body.token}`)
      .set('data', '"password"')
      .expect(204)
    credit = await Credit.findOne({ user })
    assert.strictEqual(credit, null)
  })

  test('admin can promote user', async () => {
    const user = await User.findOne({ username: 'usernameNew' })
    let loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    assert.strictEqual(loggedUser.body.admin, false)
    const admin = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    await api.put(`/api/user/${user.id}/promote`).set('Authorization', `bearer ${admin.body.token}`).expect(200)
    loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    assert.strictEqual(loggedUser.body.admin, true)
  })

  test('admin cannot promote non existing user', async () => {
    const admin = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    await api.put('/api/user/does not exist/promote').set('Authorization', `bearer ${admin.body.token}`).expect(400)
  })

  test('user cannot promote', async () => {
    const user = await User.findOne({ username: 'usernameNew' })
    let loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    assert.strictEqual(loggedUser.body.admin, false)
    await api.put(`/api/user/${user.id}/promote`).set('Authorization', `bearer ${loggedUser.body.token}`).expect(401)
    loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    assert.strictEqual(loggedUser.body.admin, false)
  })

  test('admin can demote user', async () => {
    await User.findOneAndUpdate({ username: 'usernameNew' }, { admin: true })
    const user = await User.findOne({ username: 'usernameNew' })
    let loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    assert.strictEqual(loggedUser.body.admin, true)
    const admin = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    await api.put(`/api/user/${user.id}/demote`).set('Authorization', `bearer ${admin.body.token}`).expect(200)
    loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    assert.strictEqual(loggedUser.body.admin, false)
  })

  test('admin cannot demote non existing user', async () => {
    const admin = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    await api.put('/api/user/does not exist/demote').set('Authorization', `bearer ${admin.body.token}`).expect(400)
  })

  test('user cannot demote', async () => {
    const user = await User.findOne({ username: 'adminNew' })
    let loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    let admin = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    assert.strictEqual(admin.body.admin, true)
    await api.put(`/api/user/${user.id}/promote`).set('Authorization', `bearer ${loggedUser.body.token}`).expect(401)
    admin = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    assert.strictEqual(admin.body.admin, true)
  })

  test('password is required', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'pass', newPassword: 'newPassword' })
      .expect(400)
    assert.match(res.body.error, /Väärä salasana./)
  })

  test('no fields are changed if only password is sent', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'password' })
      .expect(200)
    const body = res.body
    assert.strictEqual(body.username, 'usernameNew')
    assert.strictEqual(body.email, 'examples111@com')
    assert.strictEqual(body.studentNumber, '7897089')
    assert.strictEqual(body.classGroup, 'C-122')
    assert.strictEqual(body.admin, false)
    await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
  })

  test('admin can change own password', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin',
      })
      .expect(200)
    await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'admin', newPassword: 'newPasswordThatIsLongEnough123' })
      .expect(200)
      .expect('Content-Type', /application\/json/)
    await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'newPasswordThatIsLongEnough123',
      })
      .expect(200)
  })

  test('user can change own password', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'password', newPassword: 'test password hotairballoon' })
      .expect(200)
    await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'test password hotairballoon',
      })
      .expect(200)
  })

  test('password is required', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ newPassword: 'newPassword' })
      .expect(400)
    assert.match(res.body.error, /Salasana on pakollinen./)
  })

  test('new password needs to be long enough', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'password', newPassword: 'uu' })
      .expect(400)
    assert.match(res.body.error, /Salasanan täytyy olla vähintään 10 merkkiä pitkä./)
  })

  test('new password cannot be too long', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'password', newPassword: new Array(150).join('a') })
      .expect(400)
    assert.match(res.body.error, /Salasanan täytyy olla enintään 100 merkkiä pitkä./)
  })

  test('admin can change own student number', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin',
      })
      .expect(200)
    assert.doesNotMatch(loginResponse.body.studentNumber, /12345/)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'admin', newStudentNumber: '12345' })
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.match(res.body.studentNumber, /12345/)
  })

  test('user can change own student number', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)

    assert.doesNotMatch(loginResponse.body.studentNumber, /12345/)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'password', newStudentNumber: '12345' })
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.match(res.body.studentNumber, /12345/)
  })

  test('password is required for changing student number', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ newStudentNumber: '12345' })
      .expect(400)
    assert.strictEqual(res.body.error, 'Salasana on pakollinen.')
  })

  test('student number cannot be changed with incorrect password', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin',
      })
      .expect(200)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'incorrect', newStudentNumber: '12345' })
      .expect(400)
    assert.strictEqual(res.body.error, 'Väärä salasana.')
  })

  test('cannot change student number to null', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin',
      })
      .expect(200)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'admin', newStudentNumber: null })
      .expect(200)
    assert.strictEqual(res.body.studentNumber, '')
  })

  test('can change student number to empty', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    assert.strictEqual(loginResponse.body.studentNumber, '7897089')
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'password', newStudentNumber: '' })
      .expect(200)
    assert.strictEqual(res.body.studentNumber, '')
  })

  test('admin can change own email', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin',
      })
      .expect(200)
    assert.doesNotMatch(loginResponse.body.email, /newmail@com/)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'admin', newEmail: 'newmail@com' })
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(res.body.email, 'newmail@com')
  })

  test('user can change own email', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    assert.doesNotMatch(loginResponse.body.email, /newmail@com/)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'password', newEmail: 'newmail@com' })
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(res.body.email, 'newmail@com')
  })

  test('password is required', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin',
      })
      .expect(200)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ newEmail: 'newmail@com' })
      .expect(400)
    assert.strictEqual(res.body.error, 'Salasana on pakollinen.')
  })

  test('admin can change own class group', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin',
      })
      .expect(200)
    assert.doesNotMatch(loginResponse.body.classGroup, /C-168/)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'admin', newClassGroup: 'C-168' })
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(res.body.classGroup, 'C-168')
  })

  test('user can change own class group', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    assert.doesNotMatch(loginResponse.body.classGroup, /C-168/)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'password', newClassGroup: 'C-168' })
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(res.body.classGroup, 'C-168')
  })

  test('password is required', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin',
      })
      .expect(200)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ newClassGroup: 'C-168' })
      .expect(400)
    assert.match(res.body.error, /Salasana on pakollinen./)
  })

  test('cannot change class group to null', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin',
      })
      .expect(200)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'admin', newClassGroup: null })
      .expect(200)
    assert.strictEqual(res.body.classGroup, '')
  })

  test('can change class group to empty', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    assert.strictEqual(loginResponse.body.classGroup, 'C-122')
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'password', newClassGroup: '' })
      .expect(200)
    assert.strictEqual(res.body.classGroup, '')
  })

  test('admin can change own username', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin',
      })
      .expect(200)
    assert.doesNotMatch(loginResponse.body.username, /newname/)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'admin', newUsername: 'newname' })
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(res.body.username, 'newname')
  })

  test('user can change own username', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password',
      })
      .expect(200)
    assert.doesNotMatch(loginResponse.body.username, /newname/)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'password', newUsername: 'newname' })
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(res.body.username, 'newname')
  })

  test('password is required', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin',
      })
      .expect(200)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ newUsername: 'newname' })
      .expect(400)
    assert.match(res.body.error, /Salasana on pakollinen./)
  })

  test('Modifying: changing every field at once', async () => {
    const loginResponse = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({
        password: 'admin',
        newUsername: 'newname',
        newPassword: 'test password hotairballoon',
        newEmail: 'newmail@email',
        newStudentNumber: '211323',
        newClassGroup: 'C-24',
      })
      .expect(200)
    assert.match(res.body.username, /newname/)
    assert.match(res.body.email, /newmail@email/)
    assert.match(res.body.studentNumber, /211323/)
    assert.match(res.body.classGroup, /C-24/)
    await api
      .post('/api/user/login')
      .send({
        username: 'newname',
        password: 'test password hotairballoon',
      })
      .expect(200)
  })

  test('no fields are changed if one field fails validation', async () => {
    const loginResponse = await api.post('/api/user/login').send({
      username: 'adminNew',
      password: 'admin',
    })
    await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({
        password: 'admin',
        newUsername: 'newname',
        newPassword: 'newPassword',
        newEmail: 'newmail',
        newStudentNumber: '211323',
        newClassGroup: 'C-24',
      })
      .expect(400)
    const res = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin',
      })
      .expect(200)
    assert.doesNotMatch(res.body.username, /newname/)
    assert.doesNotMatch(res.body.email, /newmail/)
    assert.doesNotMatch(res.body.studentNumber, /211323/)
    assert.doesNotMatch(res.body.classGroup, /C-24/)
    await api
      .post('/api/user/login')
      .send({
        username: 'newname',
        password: 'newPassword',
      })
      .expect(400)
  })
})

after(async () => {
  await mongoose.connection.close()
  await mongoose.disconnect()
})
