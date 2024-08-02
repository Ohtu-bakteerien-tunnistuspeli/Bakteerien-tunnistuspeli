const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const { validation } = require('../utils/config')
const validationUser = validation.user
const userSchema = mongoose.Schema({
  username: {
    type: String,
    minlength: [validationUser.username.minlength, validationUser.username.minMessage],
    maxlength: [validationUser.username.maxlength, validationUser.username.maxMessage],
    required: [true, validationUser.username.requiredMessage],
    unique: [true, validationUser.username.uniqueMessage],
  },
  passwordHash: {
    type: String,
    required: true,
  },
  temporaryPassword: {
    passwordHash: {
      type: String,
    },
    generationTime: {
      type: Date,
    },
  },
  admin: {
    type: Boolean,
    required: true,
  },
  classGroup: {
    type: String,
    validate: {
      validator: group => {
        if (group === 'C-') {
          return true
        }
        if (group) {
          return /C-+\d+$/.test(group)
        }
        return true
      },
      message: validationUser.classGroup.validationUserMessage,
    },
    maxlength: [validationUser.classGroup.maxlength, validationUser.classGroup.maxMessage],
  },
  email: {
    type: String,
    validate: {
      validator: mailAddress => {
        return /\S+@\S+/.test(mailAddress)
      },
      message: validationUser.email.validationUserMessage,
    },
    required: [true, validationUser.email.requiredMessage],
    maxlength: [validationUser.email.maxlength, validationUser.email.maxMessage],
    unique: [true, validationUser.email.uniqueMessage],
  },
  studentNumber: {
    type: String,
    validate: {
      validator: number => {
        if (number) {
          return /^[0-9]+/.test(number)
        }
        return true
      },
      message: validationUser.studentNumber.validationUserMessage,
    },
    maxlength: [validationUser.studentNumber.maxlength, validationUser.studentNumber.maxMessage],
  },
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
    delete returnedObject.temporaryPassword
  },
})
userSchema.plugin(uniqueValidator, { message: validationUser.uniqueMessage })
const User = mongoose.model('User', userSchema)

module.exports = User
