const router = require('express').Router()
const bcrypt = require('bcrypt')
const Bacterium = require('../models/bacterium')
const User = require('../models/user')
const Test = require('../models/testCase')
const Case = require('../models/case')
const Credit = require('../models/credit')


router.post('/reset_bacteria', async (request, response) => {
  try {
    await Bacterium.deleteMany({})
    response.status(204).end()
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

router.post('/reset_users', async (request, response) => {
  try {
    await User.deleteMany({})
    response.status(204).end()
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

router.post('/reset_tests', async (request, response) => {
  try {
    await Test.deleteMany({})
    response.status(204).end()
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

router.post('/reset_cases', async (request, response) => {
  try {
    await Case.deleteMany({})
    response.status(204).end()
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

router.post('/reset_credits', async (request, response) => {
  try {
    await Credit.deleteMany({})
    response.status(204).end()
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

router.post('/credits', async (request, response) => {
  try {
    const pwd = await bcrypt.hash('user', 10)
    const user1 = await new User({ username: 'user1', passwordHash: pwd, admin: false, email: 'example1@com', classGroup: 'C-15', studentNumber: '15678815' }).save()
    const user2 = await new User({ username: 'user2', passwordHash: pwd, admin: false, email: 'example2@com', classGroup: 'C-21', studentNumber: '15678678' }).save()
    const user3 = await new User({ username: 'user3', passwordHash: pwd, admin: false, email: 'example3@com', classGroup: 'C-21', studentNumber: '15674567' }).save()
    const user1Credit = new Credit({
      user: user1.id,
      testCases: [
        'Maitotila 6',
        'Maitotila 4'
      ]
    })
    const user2Credit = new Credit({
      user: user2.id,
      testCases: [
        'Maitotila 23',
        'Maitotila 4'
      ]
    })
    const user3Credit = new Credit({
      user: user3.id,
      testCases: [
        'Maitotila 5',
        'Maitotila 7'
      ]
    })
    await user1Credit.save()
    await user2Credit.save()
    await user3Credit.save()
    response.status(200).end()
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

router.post('/init', async (request, response) => {
  try {
    await Credit.deleteMany({})
    await Bacterium.deleteMany({})
    await Test.deleteMany({})
    await Case.deleteMany({})
    await User.deleteMany({})

    const saltRounds = 10
    let passwordHash = await bcrypt.hash('useruser10', saltRounds)
    const user = new User({
      username: 'user',
      email: 'user@example.com',
      studentNumber: '1234567',
      classGroup: 'C-12',
      admin: false,
      passwordHash
    })
    await user.save()
    passwordHash = await bcrypt.hash('adminadmin', saltRounds)
    const admin = new User({
      username: 'admin',
      email: 'admin@examples.com',
      studentNumber: '',
      classGroup: '',
      admin: true,
      passwordHash
    })
    await admin.save()

    const bac1 = new Bacterium({
      name: 'Streptococcus agalactiae'
    })

    const bac2 = new Bacterium({
      name: 'Staphylococcus aureus'
    })

    const bac3 = new Bacterium({
      name: 'Tetanus'
    })

    const bac4 = new Bacterium({
      name: 'Koli'
    })

    await bac4.save()
    await bac1.save()
    await bac2.save()
    await bac3.save()

    const initialTestCase1 = new Test({
      name: 'Veriagar, +37 °C, aerobinen kasvatus',
      type: 'Viljely'
    })

    const initialTestCase2 = new Test({
      name: 'Gram-värjäys',
      type: 'Värjäys'
    })

    const initialTestCase3 = new Test({
      name: 'Katalaasitesti',
      type: 'Testi'
    })
    const initialTestCase4 = new Test({
      name: 'HIRS-sarja (hippuraatti, inuliini, raffinoosi, sorbitoli)',
      type: 'Testi'
    })

    const initialTestCase5 = new Test({
      name: 'Eskuliiniveriagar',
      type: 'Viljely'
    })

    const initialTestCase6 = new Test({
      name: 'Edwardsin agar',
      type: 'Viljely'
    })

    const initialTestCase7 = new Test({
      name: 'CAMP-testi',
      type: 'Testi'
    })

    const initialTestCase8 = new Test({
      name: 'Cypress Testi',
      type: 'Viljely'
    })

    await initialTestCase1.save()
    await initialTestCase2.save()
    await initialTestCase3.save()
    await initialTestCase4.save()
    await initialTestCase5.save()
    await initialTestCase6.save()
    await initialTestCase7.save()
    await initialTestCase8.save()

    const initialCase = new Case({
      name: 'Maitotila 1',
      bacterium: bac1,
      anamnesis: 'Vasemman takaneljänneksen maito on hiukan kokkareista...',
      samples: [
        {
          description: 'Maitonäyte Muurikin kaikista neljänneksistä',
          rightAnswer: true
        },
        {
          description: 'Tankkimaitonäyte',
          rightAnswer: false
        },
        {
          description: 'Ulostenäyte Muurikilta',
          rightAnswer: false
        },
        {
          description: 'Virtsanäyte Muurikilta',
          rightAnswer: false
        }
      ],
      testGroups: [
        [{ tests: [{ test: initialTestCase1, positive: true }], isRequired: false }, { tests: [{ test: initialTestCase2, positive: true }, { test: initialTestCase4, positive: true }], isRequired: true }],
        [{ tests: [{ test: initialTestCase3, positive: false }], isRequired: true }]
      ]
    })
    await initialCase.save()
    response.status(200).json()
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

router.post('/cases', async (request, response) => {
  try {
    await Bacterium.deleteMany({})
    await Test.deleteMany({})
    await Case.deleteMany({})

    const bacterium = await new Bacterium({ name: 'Streptococcus agalactiae' }).save()
    const veriagar = await new Test({ name: 'Veriagar, +37 C, aerobinen kasvatus', type: 'Viljely' }).save()
    const gram = await new Test({ name: 'Gramvärjäys', type: 'Värjäys' }).save()
    const katalaasi = await new Test({ name: 'Katalaasitesti', type: 'Testi' }).save()
    const hirs = await new Test({ name: 'HIRS-sarja', type: 'Testi' }).save()
    const eskuliini = await new Test({ name: 'Eskuliiniveriagar', type: 'Viljely' }).save()
    const edwards = await new Test({ name: 'Edwardsin agar', type: 'Viljely' }).save()
    const camp = await new Test({ name: 'CAMP-testi', type: 'Testi' }).save()
    const lancefield = await new Test({ name: 'Lancefield määritys', type: 'Testi' }).save()
    const penisilliini = await new Test({ name: 'Penisilliinin sietokoe agarvaluamenetelmällä', type: 'Testi' }).save()
    await new Test({ name: 'Testi ei kuulu testiryhmiin', type: 'Testi' }).save()
    const textForAnamesis = 'Tilalla on 27 lypsävää lehmää parsinavetassa ja lisäksi nuorkarjaa. Kuivikkeena käytetään kutteria, vesi tulee omasta kaivosta. Pääosa lehmistä on omaa tuotantoa, mutta navetan laajennuksen yhteydessä edellisenä kesänä hankittiin muutama uusi tiine eläin, jotka poikivat loppusyksystä.'
    'Yleisesti utareterveys on ollut tilalla hyvä; yksi lehmä on solutellut jo pidempään. Muurikki on alkanut oireilla vasta hiljan. Varsinaisia yleisoireita ei ole aivan hienoista vaisuutta lukuun ottamatta. Utare on kuitenkin selvästi turvonnut, soluluku noussut kaikissa neljänneksissä ja maitomäärä pudonnut.'
    'Vasemman takaneljänneksen maito on hiukan kokkareista. '
    const samples = [{
      description: 'Tankin maitonäyte',
      rightAnswer: false
    }, {
      description: 'Ulostenäyte Muurikilta',
      rightAnswer: false
    }, {
      description: 'Maitonäyte Muurikin kaikista neljänneksistä',
      rightAnswer: true
    }, {
      description: 'Virtsanäyte Muurikilta',
      rightAnswer: false
    },
    ]
    let case1 = {
      name: 'Maitotila 1',
      bacterium: bacterium.id,
      anamnesis: textForAnamesis,
      completionText: 'Well Done!',
      samples: samples,
      testGroups: [[]],
      complete: true
    }
    let case2 = {
      name: 'Maitotila 2',
      bacterium: bacterium.id,
      anamnesis: 'Purely for testing',
      samples: [],
      testGroups: [[]],
      complete: false
    }
    const testGroups = [
      [
        {
          tests: [{
            test: veriagar.id,
            positive: true
          }],
          isRequired: true,
        }
      ], [
        {
          tests: [{
            test: gram.id,
            positive: true
          }],
          isRequired: true
        }
      ], [
        {
          tests: [{
            test: katalaasi.id,
            positive: false
          }],
          isRequired: true,
        }
      ], [
        {
          tests: [{
            test: hirs.id,
            positive: true
          }],
          isRequired: true,
        }, {
          tests: [{
            test: eskuliini.id,
            positive: true
          }, {
            test: edwards.id,
            positive: true
          }],
          isRequired: true,
        }, {
          tests: [{
            test: penisilliini.id,
            positive: true
          }],
          isRequired: true,
        }, {
          tests: [{
            test: lancefield.id,
            positive: true
          }],
          isRequired: false,
        }, {
          tests: [{
            test: camp.id,
            postive: true,
          }],
          isRequired: false,
        },
      ],
    ]
    case1.testGroups = testGroups
    await new Case(case1).save()
    await new Case(case2).save()

    response.status(200).json()
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

router.post('/test_editing', async (request, response) => {
  try {
    await Bacterium.deleteMany({})
    await Test.deleteMany({})
    await Case.deleteMany({})
    const initialTestCase = new Test({
      name: 'Cypress Testi',
      type: 'Viljely'
    })

    await initialTestCase.save()
    response.status(200).json()
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

module.exports = router