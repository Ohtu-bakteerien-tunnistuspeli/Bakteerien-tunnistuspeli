const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('../utils/config')
const validation = config.validation.case
const caseSchema = mongoose.Schema({
  name: {
    type: String,
    minlength: [validation.name.minlength, validation.name.minMessage],
    maxlength: [validation.name.maxlength, validation.name.maxMessage],
    required: [true, validation.name.requiredMessage],
    unique: [true, validation.name.uniqueMessage]
  },
  bacterium: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bacterium'
  },
  anamnesis: {
    type: String,
    maxlength: [validation.anamnesis.maxlength, validation.anamnesis.maxMessage]
  },
  completionText: {
    type: String,
    maxlength: [validation.completionText.maxlength, validation.completionText.maxMessage]
  },
  completionImage: {
    url: {
      type: String
    },
    contentType: {
      type: String
    }
  },
  samples: [
    {
      description: {
        type: String,
        maxlength: [validation.samples.description.maxlength, validation.samples.description.maxMessage]
      },
      rightAnswer: {
        type: Boolean
      }
    }
  ],
  testGroups: [[
    {
      tests: [{
        test: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Test'
        },
        positive: {
          type: Boolean
        }
      }],
      isRequired: {
        type: Boolean
      }
    }
  ]],
  hints: [{
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test'
    },
    hint: {
      type: String,
      maxlength: [validation.hints.hint.maxlength, validation.hints.hint.maxMessage]
    }
  }],
  complete: {
    type: Boolean
  }
})

caseSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
caseSchema.plugin(uniqueValidator, { message: validation.name.uniqueMessage })
const Case = mongoose.model('Case', caseSchema)

module.exports = Case