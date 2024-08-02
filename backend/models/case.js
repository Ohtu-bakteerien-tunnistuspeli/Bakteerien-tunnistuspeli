const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const { validation } = require('../utils/config')
const validationCase = validation.case
const caseSchema = mongoose.Schema({
  name: {
    type: String,
    minlength: [validationCase.name.minlength, validationCase.name.minMessage],
    maxlength: [validationCase.name.maxlength, validationCase.name.maxMessage],
    required: [true, validationCase.name.requiredMessage],
    unique: [true, validationCase.name.uniqueMessage],
  },
  bacterium: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bacterium',
  },
  anamnesis: {
    type: String,
    maxlength: [validationCase.anamnesis.maxlength, validationCase.anamnesis.maxMessage],
  },
  completionText: {
    type: String,
    maxlength: [validationCase.completionText.maxlength, validationCase.completionText.maxMessage],
  },
  completionImage: {
    url: {
      type: String,
    },
    contentType: {
      type: String,
    },
  },
  samples: [
    {
      description: {
        type: String,
        maxlength: [validationCase.samples.description.maxlength, validationCase.samples.description.maxMessage],
      },
      rightAnswer: {
        type: Boolean,
      },
    },
  ],
  testGroups: [
    [
      {
        tests: [
          {
            test: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Test',
            },
            positive: {
              type: Boolean,
            },
          },
        ],
        isRequired: {
          type: Boolean,
        },
      },
    ],
  ],
  hints: [
    {
      test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
      },
      hint: {
        type: String,
        maxlength: [validationCase.hints.hint.maxlength, validationCase.hints.hint.maxMessage],
      },
    },
  ],
  complete: {
    type: Boolean,
  },
})

caseSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})
caseSchema.plugin(uniqueValidator, { message: validationCase.name.uniqueMessage })
const Case = mongoose.model('Case', caseSchema)

module.exports = Case
