const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('../utils/config')
const validation = config.validation.testCase
const testSchema = mongoose.Schema({
  name: {
    type: String,
    minlength: [validation.name.minlength, validation.name.minMessage],
    maxlength: [validation.name.maxlength, validation.name.maxMessage],
    required: [true, validation.name.requiredMessage],
    unique: [true, validation.name.uniqueMessage]
  },
  type: {
    type: String,
    minlength: [validation.type.minlength, validation.type.minMessage],
    maxlength: [validation.type.maxlength, validation.type.maxMessage],
    required: [true, validation.type.requiredMessage]
  },
  controlImage: {
    url: {
      type: String
    },
    contentType: {
      type: String
    }
  },
  positiveResultImage: {
    url: {
      type: String
    },
    contentType: {
      type: String
    }
  },
  negativeResultImage: {
    url: {
      type: String
    },
    contentType: {
      type: String
    }
  },
  bacteriaSpecificImages: [{
    bacterium: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bacterium'
    },
    url: {
      type: String
    },
    contentType: {
      type: String
    }
  }]
})

testSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
testSchema.plugin(uniqueValidator, { message: validation.name.uniqueMessage })
const Test = mongoose.model('Test', testSchema)

module.exports = Test