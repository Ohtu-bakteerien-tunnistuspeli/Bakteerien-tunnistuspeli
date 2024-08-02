const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('../utils/config')
const validation = config.validation.bacterium
const bacteriumSchema = mongoose.Schema({
  name: {
    type: String,
    minlength: [validation.name.minlength, validation.name.minMessage],
    maxlength: [validation.name.maxlength, validation.name.maxMessage],
    required: [true, validation.name.requiredMessage],
    unique: [true, validation.name.uniqueMessage]
  }
})

bacteriumSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
bacteriumSchema.plugin(uniqueValidator, { message: validation.name.uniqueMessage })
const Bacterium = mongoose.model('Bacterium', bacteriumSchema)

module.exports = Bacterium