const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('../utils/config')
const validation = config.validation.user
const userSchema = mongoose.Schema({
  username: {
    type: String,
    minlength: [validation.username.minlength, validation.username.minMessage],
    maxlength: [validation.username.maxlength, validation.username.maxMessage],
    required: [true, validation.username.requiredMessage],
    unique: [true, validation.username.uniqueMessage]
  },
  passwordHash: {
    type: String,
    required: true
  },
  temporaryPassword: {
    passwordHash: {
      type: String
    },
    generationTime: {
      type: Date
    }
  },
  admin: {
    type: Boolean,
    required: true
  },
  classGroup: {
    type: String,
    validate: {
      validator: (group) => {
        if(group === 'C-') {
          return true
        }
        if (group) {
          return /C-+\d+$/.test(group)
        }
        return true
      },
      message: validation.classGroup.validationMessage
    },
    maxlength: [validation.classGroup.maxlength, validation.classGroup.maxMessage]
  },
  email: {
    type: String,
    validate: {
      validator: (mailAddress) => {
        return /\S+@\S+/.test(mailAddress)
      },
      message: validation.email.validationMessage
    },
    required: [true, validation.email.requiredMessage],
    maxlength: [validation.email.maxlength, validation.email.maxMessage],
    unique: [true, validation.email.uniqueMessage]
  },
  studentNumber: {
    type: String,
    validate: {
      validator: (number) => {
        if (number) {
          return /^[0-9]+/.test(number)
        }
        return true
      },
      message: validation.studentNumber.validationMessage
    },
    maxlength: [validation.studentNumber.maxlength, validation.studentNumber.maxMessage],
  },
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
    delete returnedObject.temporaryPassword
  }
})
userSchema.plugin(uniqueValidator, { message: validation.uniqueMessage })
const User = mongoose.model('User', userSchema)

module.exports = User