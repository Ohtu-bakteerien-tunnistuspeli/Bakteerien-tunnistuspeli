const caseRouter = require('express').Router()
const Case = require('../models/case')
const Bacterium = require('../models/bacterium')
const Test = require('../models/test')
const isComplete = (caseToCheck) => {
    if (caseToCheck.bacterium && caseToCheck.anamnesis && caseToCheck.completitionText && caseToCheck.samples && caseToCheck.testGroups) {
        return true
    }
    return false
}

caseRouter.get('/', async (request, response) => {
    if (request.user.admin) {
        const cases = await Case.find({}).populate('Bacterium', { name: 1 }).populate({
            path: 'test',
            model: 'Test',
            populate: {
                path: 'bacterium',
                model: 'Bacterium'
            }
        })
        response.json(cases.map(caseToMap => caseToMap.toJSON()))
    } else {
        throw Error('JsonWebTokenError')
    }
})

caseRouter.post('/', async (request, response) => {
    if (request.user.admin) {
        try {
            const newCase = new Case({
                name: request.body.name,
            })
            if (request.body.bacterium) {
                const bacterium = await Bacterium.findById(request.body.bacterium)
                if (!bacterium) {
                    return response.status(400).json({ error: 'Annettua bakteeria ei löydy.' })
                }
                newCase.bacterium = bacterium
            }
            if (request.body.anamnesis) {
                newCase.anamnesis = request.body.anamnesis
            }
            if (request.body.completitionText) {
                newCase.completitionText = request.body.completitionText
            }
            if (request.body.samples) {
                newCase.samples = request.body.samples
            }
            if (request.body.testGroups) {
                const testGroups = []
                for (let i = 0; i < request.body.testGroups.length; i++) {
                    const newTestGroup = []
                    for (let k = 0; k < request.body.testGroups[i].length; k++) {
                        const test = request.body.testGroups[i][k]
                        const testToAdd = {
                            test: await Test.findById(test.testId),
                            requred: test.required,
                            positive: test.positive,
                            alternativeTests: test.alternativeTests
                        }
                        if (testToAdd.test) {
                            newTestGroup.push(testToAdd)
                        }
                    }
                    testGroups.push(newTestGroup)
                }
                newCase.testGroups = testGroups
            }
            newCase.complete = isComplete(newCase)
            const savedCase = await newCase.save()
            return response.status(201).json(savedCase)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    } else {
        throw Error('JsonWebTokenError')
    }
})


module.exports = caseRouter