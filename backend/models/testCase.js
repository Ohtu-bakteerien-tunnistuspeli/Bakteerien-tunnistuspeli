const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const { validation } = require('../utils/config')
const validationTestCase = validation.testCase
const testSchema = mongoose.Schema({
  name: {
    type: String,
    minlength: [validationTestCase.name.minlength, validationTestCase.name.minMessage],
    maxlength: [validationTestCase.name.maxlength, validationTestCase.name.maxMessage],
    required: [true, validationTestCase.name.requiredMessage],
    unique: [true, validationTestCase.name.uniqueMessage],
  },
  type: {
    type: String,
    minlength: [validationTestCase.type.minlength, validationTestCase.type.minMessage],
    maxlength: [validationTestCase.type.maxlength, validationTestCase.type.maxMessage],
    required: [true, validationTestCase.type.requiredMessage],
  },
  controlImage: {
    url: {
      type: String,
    },
    contentType: {
      type: String,
    },
  },
  positiveResultImage: {
    url: {
      type: String,
    },
    contentType: {
      type: String,
    },
  },
  negativeResultImage: {
    url: {
      type: String,
    },
    contentType: {
      type: String,
    },
  },
  bacteriaSpecificImages: [
    {
      bacterium: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bacterium',
      },
      url: {
        type: String,
      },
      contentType: {
        type: String,
      },
    },
  ],
})

testSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})
testSchema.plugin(uniqueValidator, { message: validationTestCase.name.uniqueMessage })
const Test = mongoose.model('Test', testSchema)

module.exports = Test
