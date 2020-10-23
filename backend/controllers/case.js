const caseRouter = require('express').Router()
const Case = require('../models/case')
const Bacterium = require('../models/bacterium')
const Test = require('../models/testCase')
const config = require('../utils/config')

const isCompletionDone = (caseToCheck) => {
    if ((caseToCheck.completionImage && caseToCheck.completionImage.url) || caseToCheck.completionText) {
        return true
    }
    return false
}
const isComplete = (caseToCheck) => {
    if (caseToCheck.bacterium && caseToCheck.anamnesis && isCompletionDone(caseToCheck) && caseToCheck.samples && caseToCheck.testGroups) {
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
        cb(null, config.IMAGEURL)
    }
})
const upload = multer({ storage, fileFilter })
const imageDir = config.IMAGEURL
const fs = require('fs')
const deleteUploadedImages = (request) => {
    if (request.files && request.files.completionImage) {
        fs.unlink(`${imageDir}/${request.files.completionImage[0].filename}`, (err) => err)
    }
}

caseRouter.get('/', async (request, response) => {
    if (request.user && request.user.admin) {
        const cases = await Case.find({}).populate('bacterium', { name: 1 }).populate({
            path: 'testGroups.tests.test',
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
            if (request.body.completionText) {
                newCase.completionText = request.body.completionText
            }
            if (request.files && request.files.completionImage) {
                newCase.completionImage = { url: request.files.completionImage[0].filename, contentType: request.files.completionImage[0].mimetype }
            }
            if (request.body.samples) {
                newCase.samples = JSON.parse(request.body.samples)
                let descList = newCase.samples.map(sample => sample.description)
                let checkedDescList = []
                for (let i = 0; i < descList.length; i++) {
                    if (checkedDescList.includes(descList[i])) {
                        deleteUploadedImages(request)
                        return response.status(400).json({ error: `Näytettä ${descList[i]} yritetään käyttää tapauksessa useampaan kertaan` })
                    } else {
                        checkedDescList.push(descList[i])
                    }
                }
            }
            if (request.body.testGroups) {
                request.body.testGroups = JSON.parse(request.body.testGroups)
                let addedTestIds = []
                const testGroups = []
                for (let i = 0; i < request.body.testGroups.length; i++) {
                    const newTestGroup = []
                    for (let j = 0; j < request.body.testGroups[i].length; j++) {
                        const testForCase = request.body.testGroups[i][j]
                        let testsFromDb = []
                        for (let k = 0; k < testForCase.tests.length; k++) {
                            let testForAlternativeTests = testForCase.tests[k]
                            let testFromDb
                            try {
                                testFromDb = await Test.findById(testForAlternativeTests.testId)
                            } catch (e) {
                                deleteUploadedImages(request)
                                return response.status(400).json({ error: 'Annettua testiä ei löydy.' })
                            }
                            if (!testFromDb) {
                                deleteUploadedImages(request)
                                return response.status(400).json({ error: 'Annettua testiä ei löydy.' })
                            } else {
                                if (addedTestIds.includes(testFromDb.id)) {
                                    deleteUploadedImages(request)
                                    return response.status(400).json({ error: `Testiä ${testFromDb.name} yritetään käyttää tapauksessa useampaan kertaan` })
                                }
                                addedTestIds.push(testFromDb.id)
                                testsFromDb.push({ test: testFromDb, positive: testForAlternativeTests.positive })
                            }
                        }
                        const testForCaseToAdd = {
                            tests: testsFromDb,
                            isRequired: testForCase.isRequired
                        }
                        newTestGroup.push(testForCaseToAdd)
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
        const deleteEndImage = request.body.deleteEndImage
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
            if (request.body.completionText || request.body.completionText === '') {
                changes.completionText = request.body.completionText
            }
            if (request.files && request.files.completionImage && deleteEndImage === 'false') {
                oldLinks.push(caseToUpdate.completionImage.url)
                changes.completionImage = { url: request.files.completionImage[0].filename, contentType: request.files.completionImage[0].mimetype }
            }
            if (request.body.samples) {
                changes.samples = JSON.parse(request.body.samples)
                let descList = changes.samples.map(sample => sample.description)
                let checkedDescList = []
                for (let i = 0; i < descList.length; i++) {
                    if (checkedDescList.includes(descList[i])) {
                        deleteUploadedImages(request)
                        return response.status(400).json({ error: `Näytettä ${descList[i]} yritetään käyttää tapauksessa useampaan kertaan` })
                    } else {
                        checkedDescList.push(descList[i])
                    }
                }
            }
            if (request.body.testGroups) {
                request.body.testGroups = JSON.parse(request.body.testGroups)
                let addedTestIds = []
                const testGroups = []
                for (let i = 0; i < request.body.testGroups.length; i++) {
                    const newTestGroup = []
                    for (let j = 0; j < request.body.testGroups[i].length; j++) {
                        const testForCase = request.body.testGroups[i][j]
                        let testsFromDb = []
                        for (let k = 0; k < testForCase.tests.length; k++) {
                            let testForAlternativeTests = testForCase.tests[k]
                            let testFromDb
                            try {
                                testFromDb = await Test.findById(testForAlternativeTests.testId)
                            } catch (e) {
                                deleteUploadedImages(request)
                                return response.status(400).json({ error: 'Annettua testiä ei löydy.' })
                            }
                            if (!testFromDb) {
                                deleteUploadedImages(request)
                                return response.status(400).json({ error: 'Annettua testiä ei löydy.' })
                            } else {
                                if (addedTestIds.includes(testFromDb.id)) {
                                    deleteUploadedImages(request)
                                    return response.status(400).json({ error: `Testiä ${testFromDb.name} yritetään käyttää tapauksessa useampaan kertaan` })
                                }
                                addedTestIds.push(testFromDb.id)
                                testsFromDb.push({ test: testFromDb, positive: testForAlternativeTests.positive })
                            }
                        }
                        const testForCaseToAdd = {
                            tests: testsFromDb,
                            isRequired: testForCase.isRequired
                        }
                        newTestGroup.push(testForCaseToAdd)
                    }
                    testGroups.push(newTestGroup)
                }
                changes.testGroups = testGroups
            }
            if (deleteEndImage === 'true') {
                oldLinks.push(caseToUpdate.completionImage.url)
                changes.completionImage = null
            }
            changes.complete = isComplete(changes)
            let updatedCase = await Case.findByIdAndUpdate(request.params.id, changes, { new: true, runValidators: true, context: 'query' })
            let completeChange = { complete: isComplete(updatedCase) }
            updatedCase = await Case.findByIdAndUpdate(request.params.id, completeChange, { new: true, runValidators: true, context: 'query' })
            for (let i = 0; i < oldLinks.length; i++) {
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

module.exports = caseRouter
