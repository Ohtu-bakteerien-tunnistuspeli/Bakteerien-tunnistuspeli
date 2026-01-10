const seed = async () => {
  const User = require('../models/user')
  const Bacterium = require('../models/bacterium')
  const TestCase = require('../models/testCase')
  const Case = require('../models/case')
  const Credit = require('../models/credit')
  const bcrypt = require('bcrypt')

  await Case.deleteMany({})
  await TestCase.deleteMany({})
  await Bacterium.deleteMany({})
  await Credit.deleteMany({})
  await User.deleteMany({})

  const saltRounds = 10
  let passwordHash = await bcrypt.hash('useruser12', saltRounds)
  const user = new User({
    username: 'user',
    email: 'user@example.com',
    admin: false,
    studentNumber: '834183479234',
    classGroup: 'C-13',
    passwordHash,
  })
  await user.save()
  passwordHash = await bcrypt.hash('adminadmin', saltRounds)
  const admin = new User({
    username: 'admin',
    email: 'admin@example.com',
    studentNumber: '',
    classGroup: '',
    admin: true,
    passwordHash,
  })
  await admin.save()

  const cred1 = new Credit({
    user: user,
    testCases: ['Maitotila 3', 'Maitotila 5'],
  })
  await cred1.save()

  const bac1 = new Bacterium({
    name: 'Streptococcus agalactiae',
  })

  const bac2 = new Bacterium({
    name: 'Staphylococcus aureus',
  })

  await bac1.save()
  await bac2.save()

  const intialTestCase1 = new TestCase({
    name: 'Veriagar, +37 °C, aerobinen kasvatus',
    type: 'Viljely',
  })

  const intialTestCase2 = new TestCase({
    name: 'Gram-värjäys',
    type: 'Värjäys',
  })

  const intialTestCase3 = new TestCase({
    name: 'Katalaasitesti',
    type: 'Testi',
  })
  const intialTestCase4 = new TestCase({
    name: 'HIRS-sarja (hippuraatti, inuliini, raffinoosi, sorbitoli)',
    type: 'Testi',
  })

  const intialTestCase5 = new TestCase({
    name: 'Eskuliiniveriagar',
    type: 'Viljely',
  })

  const intialTestCase6 = new TestCase({
    name: 'Edwardsin agar',
    type: 'Viljely',
  })

  const intialTestCase7 = new TestCase({
    name: 'CAMP-testi',
    type: 'Testi',
  })

  await intialTestCase1.save()
  await intialTestCase2.save()
  await intialTestCase3.save()
  await intialTestCase4.save()
  await intialTestCase5.save()
  await intialTestCase6.save()
  await intialTestCase7.save()

  const initialCase = new Case({
    name: 'Maitotila 1',
    bacterium: bac1,
    anamnesis: 'Vasemman takaneljänneksen maito on hiukan kokkareista...',
    completionText: 'You completed the initial case!',
    hints: [],
    samples: [
      {
        description: 'Maitonäyte Muurikin kaikista neljänneksistä',
        rightAnswer: true,
      },
      {
        description: 'Tankkimaitonäyte',
        rightAnswer: false,
      },
      {
        description: 'Ulostenäyte Muurikilta',
        rightAnswer: false,
      },
      {
        description: 'Virtsanäyte Muurikilta',
        rightAnswer: false,
      },
    ],
    testGroups: [
      [
        { tests: [{ test: intialTestCase1, positive: true }], isRequired: false },
        {
          tests: [
            { test: intialTestCase2, positive: true },
            { test: intialTestCase4, positive: true },
          ],
          isRequired: true,
        },
      ],
      [{ tests: [{ test: intialTestCase3, positive: false }], isRequired: true }],
    ],
    complete: true,
  })
  await initialCase.save()

  const initialCase2 = new Case({
    name: 'Maitotila 2',
    bacterium: bac1,
    anamnesis: 'Vasemman takaneljänneksen maito on hiukan kokkareista...',
    completionText: 'You completed the initial case!',
    hints: [],
    samples: [
      {
        description: 'Maitonäyte Muurikin kaikista neljänneksistä',
        rightAnswer: true,
      },
      {
        description: 'Tankkimaitonäyte',
        rightAnswer: false,
      },
      {
        description: 'Ulostenäyte Muurikilta',
        rightAnswer: false,
      },
      {
        description: 'Virtsanäyte Muurikilta',
        rightAnswer: false,
      },
    ],
    testGroups: [],
    complete: true,
  })
  await initialCase2.save()
}

module.exports = seed
