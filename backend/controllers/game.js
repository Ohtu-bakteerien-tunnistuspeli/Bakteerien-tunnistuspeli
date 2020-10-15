const gameRouter = require('express').Router()
const Case = require('../models/case')

gameRouter.get('/:id', async (request, response) => {
    if (request.user) {
        try {
            let caseToGet = await Case.findById(request.params.id)
            caseToGet = caseToGet.toJSON()
            caseToGet.samples = caseToGet.samples.map(sample => { return { description: sample.description } })
            delete caseToGet.bacterium
            delete caseToGet.complete
            delete caseToGet.testGroups
            delete caseToGet.completionImage
            response.json(caseToGet)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    } else {
        throw Error('JsonWebTokenError')
    }
})

gameRouter.post('/:id/checkSamples', async (request, response) => {
    if (request.user) {
        try {
            const caseToCheck = await Case.findById(request.params.id)
            let isRight = true
            let correctSamples = caseToCheck.samples.filter(sample => sample.rightAnswer).map(sample => sample.description)
            if (request.body.samples && correctSamples.length === request.body.samples.length) {
                correctSamples.forEach(sample => {
                    if (!request.body.samples.includes(sample)) {
                        isRight = false
                    }
                })
            } else {
                isRight = false
            }
            if (isRight) {
                return response.status(200).json({ correct: true })
            } else {
                return response.status(200).json({ correct: false })
            }
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    } else {
        throw Error('JsonWebTokenError')
    }
})

gameRouter.post('/:id/checkTests', async (request, response) => {
    if (request.user) {
        try {
            const caseToCheck = await Case.findById(request.params.id).populate({
                path: 'testGroups.tests.test',
                model: 'Test',
                populate: {
                    path: 'bacteriaSpecificImages.bacterium',
                    model: 'Bacterium'
                }
            })
            const testGroups = caseToCheck.testGroups
            const testsToCheck = request.body.tests
            let extraTests = []
            let currentRequiredTests = []
            let groupIndex = 0

            if (!testsToCheck || testsToCheck.length === 0) {
                return response.status(400).json({ error: 'Testin lähettämisessä tapahtui virhe.' })
            }
            let latestTestForCase
            for (let i = 0; i < testsToCheck.length; i++) {
                if (currentRequiredTests.length === 0 && testGroups.length > groupIndex) {
                    const newGroups = testGroups[groupIndex]
                    const req = newGroups.filter(group => group.isRequired === true)
                    let extra = newGroups.filter(group => group.isRequired === false)
                    extra = extra.map(e => e.tests)
                    extra = [].concat.apply([], extra)
                    extraTests = [...extraTests, ...extra]
                    currentRequiredTests = [...currentRequiredTests, ...req.map(test => test.tests)]
                    groupIndex = groupIndex + 1
                }

                const testToCheck = testsToCheck[i]

                let requiredIndex = -1
                for (let j = 0; j < currentRequiredTests.length; j++) {
                    const currentGroup = currentRequiredTests[j]
                    if (currentGroup.map(t => t.test.id).includes(testToCheck)) {
                        requiredIndex = j
                        break
                    }
                }

                if (requiredIndex !== -1) {
                    const group = currentRequiredTests[requiredIndex]
                    latestTestForCase = group.filter(test => test.test.id === testToCheck)[0]
                    extraTests = [...extraTests, ...group.filter(test => test.test.id !== testToCheck)]
                    currentRequiredTests = currentRequiredTests.filter((test, ind) => ind !== requiredIndex)
                } else if (extraTests.map(testForCase => testForCase.test.id).includes(testToCheck)) {
                    latestTestForCase = extraTests.filter(testForCase => testForCase.test.id === testToCheck)[0]
                    extraTests = extraTests.filter(testForCase => testForCase.test.id !== testToCheck)
                } else {
                    return response.status(200).json({ correct: false })
                }
            }

            let requiredDone = false
            let allDone = false

            if (groupIndex === testGroups.length && currentRequiredTests.length === 0) {
                requiredDone = true
            }

            if (requiredDone && extraTests.length === 0) {
                allDone = true
            }

            let imageUrl
            if (latestTestForCase.positive) {
                const bacteriaSpecificImages = latestTestForCase.test.bacteriaSpecificImages.filter(bacteriaImage => bacteriaImage.bacterium.name === caseToCheck.bacterium.name)
                if (bacteriaSpecificImages.length > 0) {
                    imageUrl = bacteriaSpecificImages[0].url
                } else {
                    imageUrl = latestTestForCase.test.positiveResultImage.url
                }
            } else {
                imageUrl = latestTestForCase.test.negativeResultImage.url
            }
            return response.status(200).json({ correct: true, imageUrl, testName: latestTestForCase.test.name, allDone, requiredDone })

        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    } else {
        throw Error('JsonWebTokenError')
    }
})

gameRouter.post('/:id/checkBacterium', async (request, response) => {
    if (request.user) {
        try {
            const caseToCheck = await Case.findById(request.params.id).populate('bacterium', { name: 1 })
            if (request.body.bacteriumName && caseToCheck.bacterium.name.toLowerCase() === request.body.bacteriumName.toLowerCase()) {
                return response.status(200).json({ correct: true, completionImageUrl: caseToCheck.completionImage.url })
            } else {
                return response.status(200).json({ correct: false })
            }
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    } else {
        throw Error('JsonWebTokenError')
    }
})

module.exports = gameRouter