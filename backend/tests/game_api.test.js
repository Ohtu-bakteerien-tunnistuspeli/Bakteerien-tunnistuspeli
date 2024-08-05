const assert = require('node:assert')
const { test, describe, beforeEach, after } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const bcrypt = require('bcrypt')
const api = supertest(app)

const Bacterium = require('../models/bacterium')
const User = require('../models/user')
const Test = require('../models/testCase')
const Case = require('../models/case')

describe('Game api', async () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await Case.deleteMany({})
    await Test.deleteMany({})
    await Bacterium.deleteMany({})
    const adminPassword = await bcrypt.hash('admin', 10)
    const userPassword = await bcrypt.hash('password', 10)
    await new User({ username: 'adminNew', passwordHash: adminPassword, admin: true, email: 'example11111@com' }).save()
    await new User({
      username: 'usernameNew',
      passwordHash: userPassword,
      admin: false,
      email: 'example22222@com',
    }).save()

    const bacterium = await new Bacterium({ name: 'Streptococcus agalactiaee' }).save()
    const veriagar = await new Test({ name: 'Veriagar, +37 C, aerobinen kasvatuss', type: 'Viljely' }).save()
    const gram = await new Test({ name: 'Gramvärjäyss', type: 'Värjäys' }).save()
    const katalaasi = await new Test({ name: 'Katalaasitestii', type: 'Testi' }).save()
    const hirs = await new Test({ name: 'HIRS-sarjaa', type: 'Testi' }).save()
    const eskuliini = await new Test({ name: 'Eskuliiniveriagarr', type: 'Viljely' }).save()
    const edwards = await new Test({ name: 'Edwardsin agarr', type: 'Viljely' }).save()
    const camp = await new Test({ name: 'CAMP-testii', type: 'Testi' }).save()
    const lancefield = await new Test({ name: 'Lancefield määrityss', type: 'Testi' }).save()
    const penisilliini = await new Test({ name: 'Penisilliinin sietokoe agarvaluamenetelmällää', type: 'Testi' }).save()

    const textForAnamesis =
      'Tilalla on 27 lypsävää lehmää parsinavetassa ja lisäksi nuorkarjaa. Kuivikkeena käytetään kutteria, vesi tulee omasta kaivosta. Pääosa lehmistä on omaa tuotantoa, mutta navetan laajennuksen yhteydessä edellisenä kesänä hankittiin muutama uusi tiine eläin, jotka poikivat loppusyksystä.'
    ;('Yleisesti utareterveys on ollut tilalla hyvä; yksi lehmä on solutellut jo pidempään. Muurikki on alkanut oireilla vasta hiljan. Varsinaisia yleisoireita ei ole aivan hienoista vaisuutta lukuun ottamatta. Utare on kuitenkin selvästi turvonnut, soluluku noussut kaikissa neljänneksissä ja maitomäärä pudonnut.')
    ;('Vasemman takaneljänneksen maito on hiukan kokkareista. ')
    const samples = [
      {
        description: 'Tankin maitonäyte',
        rightAnswer: false,
      },
      {
        description: 'Ulostenäyte Muurikilta',
        rightAnswer: false,
      },
      {
        description: 'Maitonäyte Muurikin kaikista neljänneksistä',
        rightAnswer: true,
      },
      {
        description: 'Virtsanäyte Muurikilta',
        rightAnswer: false,
      },
    ]
    let case1 = {
      name: 'Maitotila 11',
      bacterium: bacterium,
      anamnesis: textForAnamesis,
      samples: samples,
      testGroups: [[]],
      complete: true,
      completionImage: {
        url: 'image',
        contentType: 'string',
      },
    }
    let case2 = {
      name: 'Maitotila 12',
      bacterium: bacterium,
      anamnesis: textForAnamesis,
      samples: samples,
      testGroups: [[]],
      complete: false,
      completionImage: {
        url: 'image',
        contentType: 'string',
      },
    }
    const testGroups = [
      [
        {
          tests: [
            {
              test: veriagar,
              positive: true,
            },
          ],
          isRequired: true,
        },
      ],
      [
        {
          tests: [
            {
              test: gram,
              positive: true,
            },
          ],
          isRequired: true,
        },
      ],
      [
        {
          tests: [
            {
              test: katalaasi,
              positive: false,
            },
          ],
          isRequired: true,
        },
      ],
      [
        {
          tests: [
            {
              test: hirs,
              positive: true,
            },
          ],
          isRequired: true,
        },
        {
          tests: [
            {
              test: eskuliini,
              positive: true,
            },
            {
              test: edwards,
              positive: true,
            },
          ],
          isRequired: true,
        },
        {
          tests: [
            {
              test: penisilliini,
              positive: true,
            },
          ],
          isRequired: true,
        },
        {
          tests: [
            {
              test: lancefield,
              positive: true,
            },
          ],
          isRequired: false,
        },
        {
          tests: [
            {
              test: camp,
              postive: true,
            },
          ],
          isRequired: false,
        },
      ],
    ]
    case1.testGroups = testGroups
    case2.testGroups = testGroups
    await new Case(case1).save()
    await new Case(case2).save()
  })

  test('user can get list of cases', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })

    const getResponse = await api
      .get('/api/case')
      .set('Authorization', `bearer ${user.body.token}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
    assert.strictEqual(getResponse.body.length, 1)
    assert(getResponse.body[0].id)
    assert(getResponse.body[0].name)
    assert(!getResponse.body[0].samples)
    assert(!getResponse.body[0].testGroups)
    assert(!getResponse.body[0].anamnesis)
    assert(!getResponse.body[0].bacterium)
    assert(!getResponse.body[0].completionImage)
  })

  test('non-user cannot get list of cases', async () => {
    await api
      .get('/api/case')
      .expect('Content-Type', /application\/json/)
      .expect(401)
  })

  test('user can get single case to play', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })
    const caseToTest = await Case.findOne({ name: 'Maitotila 11' })
    const getResponse = await api
      .get(`/api/game/${caseToTest.id}`)
      .set('Authorization', `bearer ${user.body.token}`)
      .expect('Content-Type', /application\/json/)
      .expect(200)
    assert(getResponse.body.id)
    assert(getResponse.body.name)
    assert(getResponse.body.samples)
    assert(!getResponse.body.testGroups)
    assert(getResponse.body.anamnesis)
    assert(!getResponse.body.bacterium)
    assert(!getResponse.body.completionImage)
  })

  test('getting bad case returns error 400', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })
    await api
      .get('/api/game/badId')
      .set('Authorization', `bearer ${user.body.token}`)
      .expect('Content-Type', /application\/json/)
      .expect(400)
  })

  test('non-user cannot get single case to play', async () => {
    const caseToTest = await Case.findOne({ name: 'Maitotila 11' })
    await api
      .get(`/api/game/${caseToTest.id}`)
      .expect('Content-Type', /application\/json/)
      .expect(401)
  })

  test('giving correct samples gives correct answer', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })
    const caseToTest = await Case.findOne({ name: 'Maitotila 11' })
    const samples = { samples: ['Maitonäyte Muurikin kaikista neljänneksistä'] }
    const checkingResponse = await api
      .post(`/api/game/${caseToTest.id}/checkSamples`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(samples)
      .expect('Content-Type', /application\/json/)
      .expect(200)
    assert.strictEqual(checkingResponse.body.correct, true)
  })

  test('giving wrong samples gives incorrect answer', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })
    const caseToTest = await Case.findOne({ name: 'Maitotila 11' })
    const samples = { samples: ['Virtsanäyte Muurikilta'] }
    const checkingResponse = await api
      .post(`/api/game/${caseToTest.id}/checkSamples`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(samples)
      .expect('Content-Type', /application\/json/)
      .expect(200)
    assert.strictEqual(checkingResponse.body.correct, false)
  })

  test('giving wrong number of samples gives incorrect answer', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })
    const caseToTest = await Case.findOne({ name: 'Maitotila 11' })
    const samples = { samples: ['Maitonäyte Muurikin kaikista neljänneksistä', 'Virtsanäyte Muurikilta'] }
    const checkingResponse = await api
      .post(`/api/game/${caseToTest.id}/checkSamples`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(samples)
      .expect('Content-Type', /application\/json/)
      .expect(200)
    assert.strictEqual(checkingResponse.body.correct, false)
  })

  test('giving no samples gives incorrect answer', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })
    const caseToTest = await Case.findOne({ name: 'Maitotila 11' })
    const samples = { samples: [] }
    const checkingResponse = await api
      .post(`/api/game/${caseToTest.id}/checkSamples`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(samples)
      .expect('Content-Type', /application\/json/)
      .expect(200)
    assert.strictEqual(checkingResponse.body.correct, false)
  })

  test('checking samples for bad case return error 400', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })
    const samples = { samples: ['Maitonäyte Muurikin kaikista neljänneksistä'] }
    await api
      .post('/api/game/badId/checkSamples')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(samples)
      .expect('Content-Type', /application\/json/)
      .expect(400)
  })

  test('non-user cannot check samples', async () => {
    const caseToTest = await Case.findOne({ name: 'Maitotila 11' })
    const samples = { samples: ['Maitonäyte Muurikin kaikista neljänneksistä'] }
    await api
      .post(`/api/game/${caseToTest.id}/checkSamples`)
      .send(samples)
      .expect('Content-Type', /application\/json/)
      .expect(401)
  })

  test('giving correct bacterium gives correct answer', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })
    const caseToTest = await Case.findOne({ name: 'Maitotila 11' })
    const bacterium = { bacteriumName: 'Streptococcus agalactiaee' }
    const checkingResponse = await api
      .post(`/api/game/${caseToTest.id}/checkBacterium`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(bacterium)
      .expect('Content-Type', /application\/json/)
      .expect(200)
    assert.strictEqual(checkingResponse.body.correct, true)
    assert(checkingResponse.body.completionImageUrl)
  })

  test('giving correct bacterium in lower case gives correct answer', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })
    const caseToTest = await Case.findOne({ name: 'Maitotila 11' })
    const bacterium = { bacteriumName: 'streptococcus agalactiaee' }
    const checkingResponse = await api
      .post(`/api/game/${caseToTest.id}/checkBacterium`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(bacterium)
      .expect('Content-Type', /application\/json/)
      .expect(200)
    assert.strictEqual(checkingResponse.body.correct, true)
    assert(checkingResponse.body.completionImageUrl)
  })

  test('giving correct bacterium in upper case gives correct answer', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })
    const caseToTest = await Case.findOne({ name: 'Maitotila 11' })
    const bacterium = { bacteriumName: 'STREPTOCOCCUS AGALACTIAEE' }
    const checkingResponse = await api
      .post(`/api/game/${caseToTest.id}/checkBacterium`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(bacterium)
      .expect('Content-Type', /application\/json/)
      .expect(200)
    assert.strictEqual(checkingResponse.body.correct, true)
    assert(checkingResponse.body.completionImageUrl)
  })

  test('giving wrong bacterium gives incorrect answer', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })
    const caseToTest = await Case.findOne({ name: 'Maitotila 11' })
    const bacterium = { bacteriumName: 'Koli' }
    const checkingResponse = await api
      .post(`/api/game/${caseToTest.id}/checkBacterium`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(bacterium)
      .expect('Content-Type', /application\/json/)
      .expect(200)
    assert.strictEqual(checkingResponse.body.correct, false)
  })

  test('giving no bacterium gives incorrect answer', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })
    const caseToTest = await Case.findOne({ name: 'Maitotila 11' })
    const bacterium = {}
    const checkingResponse = await api
      .post(`/api/game/${caseToTest.id}/checkBacterium`)
      .set('Authorization', `bearer ${user.body.token}`)
      .send(bacterium)
      .expect('Content-Type', /application\/json/)
      .expect(200)
    assert(!checkingResponse.body.correct)
  })

  test('checking bacterium for bad case returns error 400', async () => {
    const user = await api.post('/api/user/login').send({
      username: 'usernameNew',
      password: 'password',
    })
    const bacterium = { bacteriumName: 'Streptococcus agalactiaee' }
    await api
      .post('/api/game/badid/checkBacterium')
      .set('Authorization', `bearer ${user.body.token}`)
      .send(bacterium)
      .expect('Content-Type', /application\/json/)
      .expect(400)
  })

  test('non-user cannot check bacterium', async () => {
    const caseToTest = await Case.findOne({ name: 'Maitotila 11' })
    const bacterium = { bacteriumName: 'Streptococcus agalactiaee' }
    await api
      .post(`/api/game/${caseToTest.id}/checkBacterium`)
      .send(bacterium)
      .expect('Content-Type', /application\/json/)
      .expect(401)
  })
})

after(async () => {
  await mongoose.connection.close()
})
