const caseRouter = require('express').Router()
const Case = require('../models/case')
const Bacterium = require('../models/bacterium')
const Test = require('../models/testCase')
const isComplete = (caseToCheck) => {
    if (caseToCheck.bacterium && caseToCheck.anamnesis && caseToCheck.completionImage && caseToCheck.samples && caseToCheck.testGroups) {
        return true
    }
    return false
}
const multer = require('multer')
const fileFilter = (req, file, cb) => {
    if (req.user && req.user.admin) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true)
        } else {
            cb(null, false)
        }
    } else {
        cb(null, false)
    }
}
const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, 'images')
    }
})
const upload = multer({ storage, fileFilter })
const path = require('path')
const imageDir = path.join(__dirname, '../images')
const fs = require('fs')
const deleteUploadedImages = (request) => {
    if (request.files && request.files.completionImage) {
        fs.unlink(`${imageDir}/${request.files.completionImage[0].filename}`, (err) => err)
    }
}

caseRouter.get('/', async (request, response) => {
    if (request.user && request.user.admin) {
        const cases = await Case.find({}).populate('bacterium', { name: 1 }).populate({
            path: 'testGroups.test',
            model: 'Test',
            populate: {
                path: 'bacteriaSpecificImages.bacterium',
                model: 'Bacterium'
            }
        })
        response.json(cases.map(caseToMap => caseToMap.toJSON()))
    } else if (request.user) {
        const cases = await Case.find({})
        response.json(cases.map(caseToMap => caseToMap.toJSON()).filter(caseToFilter => caseToFilter.complete).map(caseToMap => { return { name: caseToMap.name, id: caseToMap.id } }))
    } else {
        throw Error('JsonWebTokenError')
    }
})

caseRouter.post('/', upload.fields([{ name: 'completionImage', maxCount: 1 }]), async (request, response) => {
    if (request.user && request.user.admin) {
        try {
            const newCase = new Case({
                name: request.body.name,
            })
            if (request.body.bacterium) {
                let bacterium
                try {
                    bacterium = await Bacterium.findById(request.body.bacterium)
                } catch (e) {
                    deleteUploadedImages(request)
                    return response.status(400).json({ error: 'Annettua bakteeria ei löydy.' })
                }
                if (!bacterium) {
                    deleteUploadedImages(request)
                    return response.status(400).json({ error: 'Annettua bakteeria ei löydy.' })
                }
                newCase.bacterium = bacterium
            }
            if (request.body.anamnesis) {
                newCase.anamnesis = request.body.anamnesis
            }
            if (request.files && request.files.completionImage) {
                newCase.completionImage = { url: request.files.completionImage[0].filename, contentType: request.files.completionImage[0].mimetype }
            }
            if (request.body.samples) {
                newCase.samples = JSON.parse(request.body.samples)
            }
            if (request.body.testGroups) {
                request.body.testGroups = JSON.parse(request.body.testGroups)
                const testGroups = []
                for (let i = 0; i < request.body.testGroups.length; i++) {
                    const newTestGroup = []
                    for (let k = 0; k < request.body.testGroups[i].length; k++) {
                        const test = request.body.testGroups[i][k]
                        let testFromDb
                        try {
                            testFromDb = await Test.findById(test.testId)
                        } catch (e) {
                            deleteUploadedImages(request)
                            return response.status(400).json({ error: 'Annettua testiä ei löydy.' })
                        }
                        if (!testFromDb) {
                            deleteUploadedImages(request)
                            return response.status(400).json({ error: 'Annettua testiä ei löydy.' })
                        }
                        const testToAdd = {
                            test: testFromDb,
                            isRequired: test.isRequired,
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
            } else {
                newCase.testGroups = null
            }

            newCase.complete = isComplete(newCase)
            const savedCase = await newCase.save()
            return response.status(201).json(savedCase)
        } catch (error) {
            deleteUploadedImages(request)
            return response.status(400).json({ error: error.message })
        }
    } else {
        deleteUploadedImages(request)
        throw Error('JsonWebTokenError')
    }
})

caseRouter.delete('/:id', async (request, response) => {
    if (request.user && request.user.admin) {
        try {
            const caseToDelete = await Case.findById(request.params.id)
            fs.unlink(`${imageDir}/${caseToDelete.completionImage.url}`, (err) => err)
            await Case.findByIdAndRemove(request.params.id)
            response.status(204).end()
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    } else {
        throw Error('JsonWebTokenError')
    }
})

caseRouter.put('/:id', upload.fields([{ name: 'completionImage', maxCount: 1 }]), async (request, response) => {
    if (request.user && request.user.admin) {
        const oldLinks = []
        try {
            const caseToUpdate = await Case.findById(request.params.id)
            if (!caseToUpdate) {
                deleteUploadedImages(request)
                return response.status(400).json({ error: 'Annettua tapausta ei löydy tietokannasta.' })
            }
            let changes = {
                name: request.body.name
            }
            if (request.body.bacterium) {
                let bacterium
                try {
                    bacterium = await Bacterium.findById(request.body.bacterium)
                } catch (e) {
                    deleteUploadedImages(request)
                    return response.status(400).json({ error: 'Annettua bakteeria ei löydy.' })
                }
                if (!bacterium) {
                    deleteUploadedImages(request)
                    return response.status(400).json({ error: 'Annettua bakteeria ei löydy.' })
                }
                changes.bacterium = bacterium
            }
            if (request.body.anamnesis) {
                changes.anamnesis = request.body.anamnesis
            }
            if (request.files && request.files.completionImage) {
                oldLinks.push(caseToUpdate.completionImage.url)
                //fs.unlink(`${imageDir}/${caseToUpdate.completionImage.url}`, (err) => err)
                changes.completionImage = { url: request.files.completionImage[0].filename, contentType: request.files.completionImage[0].mimetype }
            }
            if (request.body.samples) {
                changes.samples = JSON.parse(request.body.samples)
            }
            if (request.body.testGroups) {
                request.body.testGroups = JSON.parse(request.body.testGroups)
                const testGroups = []
                for (let i = 0; i < request.body.testGroups.length; i++) {
                    const newTestGroup = []
                    for (let k = 0; k < request.body.testGroups[i].length; k++) {
                        const test = request.body.testGroups[i][k]
                        let testFromDb
                        try {
                            testFromDb = await Test.findById(test.testId)
                        } catch (e) {
                            deleteUploadedImages(request)
                            return response.status(400).json({ error: 'Annettua testiä ei löydy.' })
                        }
                        if (!testFromDb) {
                            deleteUploadedImages(request)
                            return response.status(400).json({ error: 'Annettua testiä ei löydy.' })
                        }
                        const testToAdd = {
                            test: testFromDb,
                            isRequired: test.isRequired,
                            positive: test.positive,
                            alternativeTests: test.alternativeTests
                        }
                        if (testToAdd.test) {
                            newTestGroup.push(testToAdd)
                        }
                    }
                    testGroups.push(newTestGroup)
                }
                changes.testGroups = testGroups
            }
            changes.complete = isComplete(changes)
            const updatedCase = await Case.findByIdAndUpdate(request.params.id, changes, { new: true, runValidators: true, context: 'query' })
            var i
            for (i = 0; i < oldLinks.length; i++) {
                fs.unlink(`${imageDir}/${oldLinks[i]}`, (err) => err)
            }
            return response.status(200).json(updatedCase)
        } catch (error) {
            deleteUploadedImages(request)
            return response.status(400).json({ error: error.message })
        }
    } else {
        deleteUploadedImages(request)
        throw Error('JsonWebTokenError')
    }
})

caseRouter.get('/:id', async (request, response) => {
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

caseRouter.post('/:id/checkSamples', async (request, response) => {
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

module.exports = caseRouter