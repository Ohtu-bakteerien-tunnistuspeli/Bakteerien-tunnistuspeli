const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const { validation } = require('../utils/config')
const validationBacterium = validation.bacterium
const bacteriumSchema = mongoose.Schema({
  name: {
    type: String,
    minlength: [validationBacterium.name.minlength, validationBacterium.name.minMessage],
    maxlength: [validationBacterium.name.maxlength, validationBacterium.name.maxMessage],
    required: [true, validationBacterium.name.requiredMessage],
    unique: [true, validationBacterium.name.uniqueMessage],
  },
})

bacteriumSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})
bacteriumSchema.plugin(uniqueValidator, { message: validationBacterium.name.uniqueMessage })
const Bacterium = mongoose.model('Bacterium', bacteriumSchema)

module.exports = Bacterium
