const testRouter = require('express').Router()
const Test = require('../models/test')
const Bacterium = require('../models/bacterium')
const multer = require('multer')
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}
const storage = multer.memoryStorage()
const upload = multer({ storage, fileFilter })

testRouter.get('/', async (request, response) => {
    if (request.user) {
        const tests = await Test.find({}).populate('Bacterium', { name: 1 })
        response.json(tests.map(test => test.toJSON()))
    } else {
        throw Error('JsonWebTokenError')
    }
})

testRouter.post('/', upload.fields([{ name: 'positiveResultImage', maxCount: 1 }, { name: 'negativeResultImage', maxCount: 1 }, { name: 'bacteriaSpecificImage', maxCount: 100 }]), async (request, response) => {
    if (request.user.admin) {
        try {
            const test = new Test({
                name: request.body.name,
                type: request.body.type,
                positiveResultImage: { data: Buffer.from(request.files.positiveResultImage[0].buffer).toString('base64'), contentType: request.files.positiveResultImage[0].mimetype },
                negativeResultImage: { data: Buffer.from(request.files.negativeResultImage[0].buffer).toString('base64'), contentType: request.files.negativeResultImage[0].mimetype },
                bacteriaSpecificImages: []
            })
            if (request.files.bacteriaSpecificImages) {
                request.files.bacteriaSpecificImages.forEach(async (file) => {
                    const bacterium = await Bacterium.findById(file.fieldname)
                    test.bacteriaSpecificImages.push({ data: Buffer.from(file.buffer).toString('base64'), contentType: file.mimetype, bacterium })
                })
            }
            const savedTest = await test.save()
            return response.status(201).json(savedTest)
        } catch (error) {
            return response.status(400).json({ error: error.message })
        }
    } else {
        throw Error('JsonWebTokenError')
    }
})


module.exports = testRouter