
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const Credit = require('../models/credit')
const bcrypt = require('bcrypt')
const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  const adminPassword = await bcrypt.hash('admin', 10)
  const userPassword = await bcrypt.hash('password', 10)
  const admin = new User({
    username: 'adminNew',
    passwordHash: adminPassword,
    admin: true,
    email: 'example11@com',
    studentNumber: '',
    classGroup: ''
  })
  const user = new User({
    username: 'usernameNew',
    passwordHash: userPassword,
    admin: false,
    email: 'examples111@com',
    studentNumber: '7897089',
    classGroup: 'C-122'
  })
  await admin.save()
  await user.save()
})
describe('login ', () => {
  test('login successfull', async () => {
    await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password'
      })
      .expect(200)
  })

  test('failed login', async () => {
    await api
      .post('/api/user/login')
      .send({
        username: 'user',
        password: 'pass'
      })
      .expect(400)
  })
})
describe('register ', () => {
  test('valid user with compulsory fields can register', async () => {
    await api
      .post('/api/user/register')
      .send({
        username: 'testUser',
        password: 'test password hotairballoon',
        email: 'example1@com'
      })
      .expect(200)
    await api
      .post('/api/user/login')
      .send({
        username: 'testUser',
        password: 'test password hotairballoon'
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
        studentNumber: '1234567'
      })
      .expect(200)
    await api
      .post('/api/user/login')
      .send({
        username: 'testUser',
        password: 'test password hotairballoon'
      })
      .expect(200)
  })
  test('invalid user cannot register', async () => {
    const invalidUsers = [{
      username: 'usernameNew',
      password: 'test password hotairballoon',
      email: 'example3@com'
    }, {
      username: 'usernameNew'
    }, {
      username: 'usernameNew',
      password: 't',
      email: 'example4@com'
    }, {
      username: 'u',
      password: 'test password hotairballoon',
      email: 'example5@com'
    }, {
      username: 'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
      password: 'test password hotairballoon',
      email: 'example6@com'
    }, {
      username: 'uniqueUser',
      password: 'test password hotairballoon',
      classGroup: '123',
      email: 'example7@com'
    }, {
      username: 'usernameNew',
      password: 'test password hotairballoon',
      email: 'examplecom8@'
    }, {
      username: 'usernameNew',
      password: 'test password hotairballoon',
      email: ''
    }, {
      username: 'usernameNew',
      password: 'test password hotairballoon',
      classGroup: '123',
      email: 'abcdf'
    }]
    let registerResponse = await api
      .post('/api/user/register')
      .send(invalidUsers[0])
      .expect(400)
    expect(registerResponse.body.error).toContain('Käyttäjänimen ja sähköpostiosoitteen tulee olla uniikkeja.')
    await api
      .post('/api/user/login')
      .send(invalidUsers[0])
      .expect(400)
    registerResponse = await api
      .post('/api/user/register')
      .send(invalidUsers[1])
      .expect(400)
    expect(registerResponse.body.error).toContain('Salasana on pakollinen.')
    await api
      .post('/api/user/login')
      .send(invalidUsers[1])
      .expect(400)
    registerResponse = await api
      .post('/api/user/register')
      .send(invalidUsers[2])
      .expect(400)
    expect(registerResponse.body.error).toContain('Salasanan täytyy olla vähintään 10 merkkiä pitkä.')
    await api
      .post('/api/user/login')
      .send(invalidUsers[2])
      .expect(400)
    registerResponse = await api
      .post('/api/user/register')
      .send(invalidUsers[3])
      .expect(400)
    expect(registerResponse.body.error).toContain('Käyttäjänimen tulee olla vähintään 2 merkkiä pitkä.')
    await api
      .post('/api/user/login')
      .send(invalidUsers[3])
      .expect(400)
    registerResponse = await api
      .post('/api/user/register')
      .send(invalidUsers[4])
      .expect(400)
    expect(registerResponse.body.error).toContain('Käyttäjänimen tulee olla enintään 100 merkkiä pitkä.')
    await api
      .post('/api/user/login')
      .send(invalidUsers[4])
      .expect(400)
    registerResponse = await api
      .post('/api/user/register')
      .send(invalidUsers[5])
      .expect(400)
    expect(registerResponse.body.error).toContain('Vuosikurssin tule alkaa merkeillä \'C-\'')
    await api
      .post('/api/user/login')
      .send(invalidUsers[5])
      .expect(400)
    registerResponse = await api
      .post('/api/user/register')
      .send(invalidUsers[6])
      .expect(400)
    expect(registerResponse.body.error).toContain('Sähköpostiosoite on virheellinen.')
    await api
      .post('/api/user/login')
      .send(invalidUsers[6])
      .expect(400)
    registerResponse = await api
      .post('/api/user/register')
      .send(invalidUsers[7])
      .expect(400)
    expect(registerResponse.body.error).toContain('Sähköpostiosoite on pakollinen.')
    await api
      .post('/api/user/login')
      .send(invalidUsers[7])
      .expect(400)
    registerResponse = await api
      .post('/api/user/register')
      .send(invalidUsers[8])
      .expect(400)
    expect(registerResponse.body.error).toContain('User validation failed: classGroup: Vuosikurssin tule alkaa merkeillä \'C-\' ja loppua lukuun., email: Sähköpostiosoite on virheellinen., username: Käyttäjänimen ja sähköpostiosoitteen tulee olla uniikkeja.')
    await api
      .post('/api/user/login')
      .send(invalidUsers[8])
      .expect(400)
  })

  test('if student number is not given empty string will be used instead', async () => {
    const user = {
      username: 'newUser12',
      password: 'test password hotairballoon',
      email: 'example@example.fi',
    }
    await api
      .post('/api/user/register')
      .send(user)
      .expect(200)
    const loginRes = await api
      .post('/api/user/login')
      .send(user)
      .expect(200)
    expect(loginRes.body.studentNumber).toEqual('')
  })

  test('if student number is null empty string will be used instead', async () => {
    const user = {
      username: 'newUser12',
      password: 'test password hotairballoon',
      email: 'example@example.fi',
      studentNumber: null
    }
    await api
      .post('/api/user/register')
      .send(user)
      .expect(200)
    const loginRes = await api
      .post('/api/user/login')
      .send(user)
      .expect(200)
    expect(loginRes.body.studentNumber).toEqual('')
  })

  test('if class group is not given empty string will be used instead', async () => {
    const user = {
      username: 'newUser12',
      password: 'test password hotairballoon',
      email: 'example@example.fi',
    }
    await api
      .post('/api/user/register')
      .send(user)
      .expect(200)
    const loginRes = await api
      .post('/api/user/login')
      .send(user)
      .expect(200)
    expect(loginRes.body.classGroup).toEqual('')
  })

  test('if student number is null empty string will be used instead', async () => {
    const user = {
      username: 'newUser12',
      password: 'test password hotairballoon',
      email: 'example@example.fi',
      classGroup: null
    }
    await api
      .post('/api/user/register')
      .send(user)
      .expect(200)
    const loginRes = await api
      .post('/api/user/login')
      .send(user)
      .expect(200)
    expect(loginRes.body.classGroup).toEqual('')
  })
})

describe('getting users', () => {
  test('users are returned as array', async () => {
    const user = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin'
      })
      .expect(200)
    const usersRes = await api
      .get('/api/user')
      .set('Authorization', `bearer ${user.body.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(usersRes.body.length).toEqual(1)
  })

  test('returned users do not contain one getting them', async () => {
    const user = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin'
      })
      .expect(200)
    const usersRes = await api
      .get('/api/user')
      .set('Authorization', `bearer ${user.body.token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    const users = usersRes.body.map(listUser => listUser.username)
    expect(users).not.toContain('adminNew')
    expect(users).toContain('usernameNew')
  })

  test('user cannot get users', async () => {
    const user = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password'
      })
      .expect(200)
    await api
      .get('/api/user')
      .set('Authorization', `bearer ${user.body.token}`)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })
})

describe('delete', () => {
  test('user can delete itself', async () => {
    const user = await User.findOne({ username: 'usernameNew' })
    const loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password'
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
        password: 'password'
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
        password: 'password2'
      })
      .expect(200)
    const loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password'
      })
      .expect(200)
    await api
      .delete(`/api/user/${user.id}`)
      .set('Authorization', `bearer ${loggedUser.body.token}`)
      .expect(401)
    await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew2',
        password: 'password2'
      })
      .expect(200)
  })

  test('admin can delete user', async () => {
    const user = await User.findOne({ username: 'usernameNew' })
    await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password'
      })
      .expect(200)
    const admin = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin'
      })
    await api
      .delete(`/api/user/${user.id}`)
      .set('Authorization', `bearer ${admin.body.token}`)
      .expect(204)
    await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password'
      })
      .expect(400)
  })

  test('deleting user deletes its credits', async () => {
    const user = await User.findOne({ username: 'usernameNew' })
    await Credit({ user, testCases: [] }).save()
    let credit = await Credit.findOne({ user })
    expect(credit).toBeDefined()
    const loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password'
      })
      .expect(200)
    await api
      .delete(`/api/user/${user.id}`)
      .set('Authorization', `bearer ${loggedUser.body.token}`)
      .set('data', '"password"')
      .expect(204)
    credit = await Credit.findOne({ user })
    expect(credit).toBeNull()
  })
})

describe('promote', () => {
  test('admin can promote user', async () => {
    const user = await User.findOne({ username: 'usernameNew' })
    let loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password'
      })
      .expect(200)
    expect(loggedUser.body.admin).toBeFalsy()
    const admin = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin'
      })
    await api
      .put(`/api/user/${user.id}/promote`)
      .set('Authorization', `bearer ${admin.body.token}`)
      .expect(200)
    loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password'
      })
      .expect(200)
    expect(loggedUser.body.admin).toBeTruthy()
  })

  test('admin cannot promote non existing user', async () => {
    const admin = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin'
      })
    await api
      .put('/api/user/does not exist/promote')
      .set('Authorization', `bearer ${admin.body.token}`)
      .expect(400)
  })

  test('user cannot promote', async () => {
    const user = await User.findOne({ username: 'usernameNew' })
    let loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password'
      })
      .expect(200)
    expect(loggedUser.body.admin).toBeFalsy()
    await api
      .put(`/api/user/${user.id}/promote`)
      .set('Authorization', `bearer ${loggedUser.body.token}`)
      .expect(401)
    loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password'
      })
      .expect(200)
    expect(loggedUser.body.admin).toBeFalsy()
  })
})

describe('demote', () => {
  test('admin can demote user', async () => {
    await User.findOneAndUpdate({ username: 'usernameNew' }, { admin: true })
    const user = await User.findOne({ username: 'usernameNew' })
    let loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password'
      })
      .expect(200)
    expect(loggedUser.body.admin).toBeTruthy()
    const admin = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin'
      })
    await api
      .put(`/api/user/${user.id}/demote`)
      .set('Authorization', `bearer ${admin.body.token}`)
      .expect(200)
    loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password'
      })
      .expect(200)
    expect(loggedUser.body.admin).toBeFalsy()
  })

  test('admin cannot demote non existing user', async () => {
    const admin = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin'
      })
    await api
      .put('/api/user/does not exist/demote')
      .set('Authorization', `bearer ${admin.body.token}`)
      .expect(400)
  })

  test('user cannot demote', async () => {
    const user = await User.findOne({ username: 'adminNew' })
    let loggedUser = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password'
      })
      .expect(200)
    let admin = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin'
      })
    expect(admin.body.admin).toBeTruthy()
    await api
      .put(`/api/user/${user.id}/promote`)
      .set('Authorization', `bearer ${loggedUser.body.token}`)
      .expect(401)
    admin = await api
      .post('/api/user/login')
      .send({
        username: 'adminNew',
        password: 'admin'
      })
    expect(admin.body.admin).toBeTruthy()
  })
})

describe('modifying user', () => {

  test('password is required', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password'
      })
      .expect(200)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'pass', newPassword: 'newPassword' })
      .expect(400)
    expect(res.body.error).toContain('Väärä salasana.')
  })

  test('no fields are changed if only password is sent', async () => {
    const loginResponse = await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password'
      })
      .expect(200)
    const res = await api
      .put('/api/user')
      .set('Authorization', `bearer ${loginResponse.body.token}`)
      .send({ password: 'password' })
      .expect(200)
    const body = res.body
    expect(body.username).toEqual('usernameNew')
    expect(body.email).toEqual('examples111@com')
    expect(body.studentNumber).toEqual('7897089')
    expect(body.classGroup).toEqual('C-122')
    expect(body.admin).toBeFalsy()
    await api
      .post('/api/user/login')
      .send({
        username: 'usernameNew',
        password: 'password'
      })
      .expect(200)
  })

  describe('changing password', () => {
    test('admin can change own password', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'adminNew',
          password: 'admin'
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
          password: 'newPasswordThatIsLongEnough123'
        })
        .expect(200)
    })

    test('user can change own password', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'usernameNew',
          password: 'password'
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
          password: 'test password hotairballoon'
        })
        .expect(200)
    })

    test('password is required', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'usernameNew',
          password: 'password'
        })
        .expect(200)
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ newPassword: 'newPassword' })
        .expect(400)
      expect(res.body.error).toContain('Salasana on pakollinen.')
    })

    test('new password needs to be long enough', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'usernameNew',
          password: 'password'
        })
        .expect(200)
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ password: 'password', newPassword: 'uu' })
        .expect(400)
      expect(res.body.error).toContain('Salasanan täytyy olla vähintään 10 merkkiä pitkä.')
    })

    test('new password cannot be too long', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'usernameNew',
          password: 'password'
        })
        .expect(200)
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ password: 'password', newPassword: new Array(150).join('a') })
        .expect(400)
      expect(res.body.error).toContain('Salasanan täytyy olla enintään 100 merkkiä pitkä.')
    })
  })

  describe('changing student number', () => {
    test('admin can change own student number', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'adminNew',
          password: 'admin'
        })
        .expect(200)
      expect(loginResponse.body.studentNumber).not.toContain('12345')
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ password: 'admin', newStudentNumber: '12345' })
        .expect(200)
        .expect('Content-Type', /application\/json/)
      expect(res.body.studentNumber).toContain('12345')
    })

    test('user can change own student number', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'usernameNew',
          password: 'password'
        })
        .expect(200)
      expect(loginResponse.body.studentNumber).not.toContain('12345')
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ password: 'password', newStudentNumber: '12345' })
        .expect(200)
        .expect('Content-Type', /application\/json/)
      expect(res.body.studentNumber).toContain('12345')
    })

    test('password is required for changing student number', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'usernameNew',
          password: 'password'
        })
        .expect(200)
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ newStudentNumber: '12345' })
        .expect(400)
      expect(res.body.error).toContain('Salasana on pakollinen.')
    })

    test('student number cannot be changed with incorrect password', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'adminNew',
          password: 'admin'
        })
        .expect(200)
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ password: 'incorrect', newStudentNumber: '12345' })
        .expect(400)
      expect(res.body.error).toContain('Väärä salasana.')
    })

    test('cannot change student number to null', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'adminNew',
          password: 'admin'
        })
        .expect(200)
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ password: 'admin', newStudentNumber: null })
        .expect(200)
      expect(res.body.studentNumber).toEqual('')
    })

    test('can change student number to empty', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'usernameNew',
          password: 'password'
        })
        .expect(200)
      expect(loginResponse.body.studentNumber).toEqual('7897089')
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ password: 'password', newStudentNumber: '' })
        .expect(200)
      expect(res.body.studentNumber).toEqual('')
    })
  })

  describe('changing email', () => {
    test('admin can change own email', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'adminNew',
          password: 'admin'
        })
        .expect(200)
      expect(loginResponse.body.email).not.toContain('newmail@com')
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ password: 'admin', newEmail: 'newmail@com' })
        .expect(200)
        .expect('Content-Type', /application\/json/)
      expect(res.body.email).toContain('newmail@com')
    })

    test('user can change own email', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'usernameNew',
          password: 'password'
        })
        .expect(200)
      expect(loginResponse.body.email).not.toContain('newmail@com')
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ password: 'password', newEmail: 'newmail@com' })
        .expect(200)
        .expect('Content-Type', /application\/json/)
      expect(res.body.email).toContain('newmail@com')
    })

    test('password is required', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'adminNew',
          password: 'admin'
        })
        .expect(200)
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ newEmail: 'newmail@com' })
        .expect(400)
      expect(res.body.error).toContain('Salasana on pakollinen.')
    })
  })

  describe('changing class group', () => {
    test('admin can change own class group', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'adminNew',
          password: 'admin'
        })
        .expect(200)
      expect(loginResponse.body.classGroup).not.toContain('C-168')
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ password: 'admin', newClassGroup: 'C-168' })
        .expect(200)
        .expect('Content-Type', /application\/json/)
      expect(res.body.classGroup).toContain('C-168')
    })

    test('user can change own class group', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'usernameNew',
          password: 'password'
        })
        .expect(200)
      expect(loginResponse.body.classGroup).not.toContain('C-168')
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ password: 'password', newClassGroup: 'C-168' })
        .expect(200)
        .expect('Content-Type', /application\/json/)
      expect(res.body.classGroup).toContain('C-168')
    })

    test('password is required', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'adminNew',
          password: 'admin'
        })
        .expect(200)
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ newClassGroup: 'C-168' })
        .expect(400)
      expect(res.body.error).toContain('Salasana on pakollinen.')
    })

    test('cannot change class group to null', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'adminNew',
          password: 'admin'
        })
        .expect(200)
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ password: 'admin', newClassGroup: null })
        .expect(200)
      expect(res.body.classGroup).toEqual('')
    })

    test('can change class group to empty', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'usernameNew',
          password: 'password'
        })
        .expect(200)
      expect(loginResponse.body.classGroup).toEqual('C-122')
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ password: 'password', newClassGroup: '' })
        .expect(200)
      expect(res.body.classGroup).toEqual('')
    })
  })

  describe('changing username', () => {
    test('admin can change own username', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'adminNew',
          password: 'admin'
        })
        .expect(200)
      expect(loginResponse.body.username).not.toContain('newname')
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ password: 'admin', newUsername: 'newname' })
        .expect(200)
        .expect('Content-Type', /application\/json/)
      expect(res.body.username).toContain('newname')
    })

    test('user can change own username', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'usernameNew',
          password: 'password'
        })
        .expect(200)
      expect(loginResponse.body.username).not.toContain('newname')
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ password: 'password', newUsername: 'newname' })
        .expect(200)
        .expect('Content-Type', /application\/json/)
      expect(res.body.username).toContain('newname')
    })

    test('password is required', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'adminNew',
          password: 'admin'
        })
        .expect(200)
      const res = await api
        .put('/api/user')
        .set('Authorization', `bearer ${loginResponse.body.token}`)
        .send({ newUsername: 'newname' })
        .expect(400)
      expect(res.body.error).toContain('Salasana on pakollinen.')
    })
  })

  describe('modifying multiple fields', () => {
    test('changing every field at once', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'adminNew',
          password: 'admin'
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
          newClassGroup: 'C-24'
        })
        .expect(200)
      expect(res.body.username).toContain('newname')
      expect(res.body.email).toContain('newmail@email')
      expect(res.body.studentNumber).toContain('211323')
      expect(res.body.classGroup).toContain('C-24')
      await api
        .post('/api/user/login')
        .send({
          username: 'newname',
          password: 'test password hotairballoon'
        })
        .expect(200)
    })

    test('no fields are changed if one field fails validation', async () => {
      const loginResponse = await api
        .post('/api/user/login')
        .send({
          username: 'adminNew',
          password: 'admin'
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
          newClassGroup: 'C-24'
        })
        .expect(400)
      const res = await api
        .post('/api/user/login')
        .send({
          username: 'adminNew',
          password: 'admin'
        })
        .expect(200)
      expect(res.body.username).not.toContain('newname')
      expect(res.body.email).not.toContain('newmail')
      expect(res.body.studentNumber).not.toContain('211323')
      expect(res.body.classGroup).not.toContain('C-24')
      await api
        .post('/api/user/login')
        .send({
          username: 'newname',
          password: 'newPassword'
        })
        .expect(400)
    })
  })
})

afterAll(async () => {
  await mongoose.connection.close()
  await mongoose.disconnect()
})

// "error": "Invalid username or password"