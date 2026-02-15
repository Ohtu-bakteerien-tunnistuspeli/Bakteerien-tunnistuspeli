const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')
const Credit = require('../models/credit')
const { library, validation, SECRET, EMAILUSER, EMAILHOST, EMAILPASSWORD, EMAILPORT } = require('../utils/config')
const nodemailer = require('nodemailer')
const { v4: uuidv4 } = require('uuid')
const validationUser = validation.user
const libraryUser = library.backend.user
const checkPassword = require('zxcvbn')

userRouter.post('/login', async (request, response) => {
  const body = request.body
  const user = await User.findOne({ username: body.username })
  let temporaryPasswordUsed = false
  try {
    if (!user) {
      return response.status(400).json({
        error: libraryUser.invalidUsernameOrPassword,
      })
    }
    let passwordCorrect = await bcrypt.compare(body.password, user.passwordHash)
    if (!passwordCorrect && user.temporaryPassword) {
      const diffTime = Math.abs(new Date() - user.temporaryPassword.generationTime)
      if (diffTime <= 900000) {
        passwordCorrect = await bcrypt.compare(body.password, user.temporaryPassword.passwordHash)
        temporaryPasswordUsed = true
      }
    }
    if (!passwordCorrect) {
      return response.status(400).json({
        error: libraryUser.invalidUsernameOrPassword,
      })
    }
  } catch (error) {
    return response.status(400).json({
      error: libraryUser.invalidUsernameOrPassword,
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }
  const token = jwt.sign(userForToken, SECRET)
  response.status(200).send({
    token,
    username: user.username,
    admin: user.admin,
    classGroup: user.classGroup,
    email: user.email,
    studentNumber: user.studentNumber,
    id: user._id,
    temporaryPasswordUsed,
  })
})

userRouter.post('/register', async (request, response) => {
  const body = request.body
  if (!body.password) {
    return response.status(400).json({ error: validationUser.password.requiredMessage })
  } else if (body.password.length < validationUser.password.minlength) {
    return response.status(400).json({ error: validationUser.password.minMessage })
  } else if (body.password.length > validationUser.password.maxlength) {
    return response.status(400).json({ error: validationUser.password.maxMessage })
  } else if (
    body.password === body.username ||
    body.password === body.classGroup ||
    body.password === body.email ||
    body.password === body.newStudentNumber
  ) {
    return response.status(400).json({ error: validationUser.password.uniqueMessage })
  } else if (checkPassword(body.password).score < 2) {
    return response.status(400).json({ error: validationUser.password.unsecurePasswordMessage })
  } else {
    try {
      if (!body.classGroup) {
        body.classGroup = ''
      }
      if (!body.studentNumber) {
        body.studentNumber = ''
      }

      const saltRounds = 10
      const passwordHash = await bcrypt.hash(body.password, saltRounds)
      const user = new User({
        username: body.username,
        passwordHash: passwordHash,
        admin: false,
        classGroup: body.classGroup,
        email: body.email,
        studentNumber: body.studentNumber,
      })
      await user.save()
      return response.status(200).send()
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }
})

userRouter.get('/', async (request, response) => {
  if (request.user && request.user.admin) {
    const users = await User.find({ username: { $ne: request.user.username } })
    response.json(users.map(user => user.toJSON()))
  } else {
    throw Error('JsonWebTokenError')
  }
})

userRouter.delete('/:id', async (request, response) => {
  if (request.user && String(request.user.id) === String(request.params.id)) {
    try {
      const userToDelete = await User.findById(request.params.id)
      let correct = false
      if (request.headers.data) {
        correct = await bcrypt.compare(
          request.headers.data.substring(1, request.headers.data.length - 1),
          userToDelete.passwordHash
        )
      }
      if (!correct) {
        return response.status(400).json({ error: libraryUser.wrongPassword })
      }
      const creditToDelete = await Credit.findOne({ user: userToDelete })
      await User.findByIdAndDelete(request.params.id)
      if (creditToDelete) {
        await Credit.findByIdAndDelete(creditToDelete.id)
      }
      response.status(204).end()
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  } else if (request.user && request.user.admin) {
    try {
      const userToDelete = await User.findById(request.params.id)
      const creditToDelete = await Credit.findOne({ user: userToDelete })
      await User.findByIdAndDelete(request.params.id)
      if (creditToDelete) {
        await Credit.findByIdAndDelete(creditToDelete.id)
      }
      response.status(204).end()
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  } else {
    throw Error('JsonWebTokenError')
  }
})

userRouter.put('/:id/promote', async (request, response) => {
  if (request.user && request.user.admin) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        request.params.id,
        { admin: true },
        { new: true, runValidators: true }
      )
      return response.status(200).json(updatedUser.toJSON())
    } catch (error) {
      if (error.message.includes('doesnotexist')) {
        return response.status(400).json({ error: libraryUser.userNotFound })
      }
      return response.status(400).json({ error: error.message })
    }
  } else {
    throw Error('JsonWebTokenError')
  }
})

userRouter.put('/:id/demote', async (request, response) => {
  if (request.user && request.user.admin) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        request.params.id,
        { admin: false },
        { new: true, runValidators: true }
      )
      return response.status(200).json(updatedUser.toJSON())
    } catch (error) {
      if (error.message.includes('doesnotexist')) {
        return response.status(400).json({ error: libraryUser.userNotFound })
      }
      return response.status(400).json({ error: error.message })
    }
  } else {
    throw Error('JsonWebTokenError')
  }
})

userRouter.post('/temporarypassword', async (request, response) => {
  let user = await User.findOne({ username: request.body.username })
  if (!user) {
    user = await User.findOne({ studentNumber: request.body.username })
  }
  if (user && user.email === request.body.email) {
    try {
      let transporter
      if (EMAILHOST.includes('outlook')) {
        transporter = nodemailer.createTransport({
          host: EMAILHOST,
          port: EMAILPORT,
          secure: false,
          tls: {
            ciphers: 'SSLv3',
          },
          auth: {
            user: EMAILUSER,
            pass: EMAILPASSWORD,
          },
        })
      } else if (EMAILHOST.includes('helsinki')) {
        transporter = nodemailer.createTransport({
          from: EMAILUSER,
          host: EMAILHOST,
          port: EMAILPORT,
          secure: false,
        })
      } else {
        transporter = nodemailer.createTransport({
          host: EMAILHOST,
          port: EMAILPORT,
          secure: true,
          auth: {
            user: EMAILUSER,
            pass: EMAILPASSWORD,
          },
        })
      }

      const temporaryPassword = uuidv4()
      await transporter.sendMail({
        from: EMAILUSER,
        to: user.email,
        subject: libraryUser.temporaryPasswordEmailSubject,
        text: `${libraryUser.temporaryPasswordEmailTextStart}${temporaryPassword}${libraryUser.temporaryPasswordEmailTextEnd}`,
        html: `${libraryUser.temporaryPasswordEmailHtmlStart}${temporaryPassword}${libraryUser.temporaryPasswordEmailHtmlEnd}`,
      })
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(temporaryPassword, saltRounds)
      await User.findByIdAndUpdate(
        user.id,
        { temporaryPassword: { passwordHash, generationTime: new Date() } },
        { new: true, runValidators: true }
      )
    } catch (error) {
      return response.status(400).json({ error: libraryUser.emailError })
    }
    return response
      .status(200)
      .json({ message: `${libraryUser.emailSuccessStart}${user.email}${libraryUser.emailSuccessEnd}` })
  } else {
    return response.status(400).json({ error: libraryUser.userNotFoundOrEmailWrong })
  }
})

userRouter.put('/', async (request, response) => {
  if (request.user) {
    const body = request.body
    if (!body.password) {
      return response.status(400).json({ error: validationUser.password.requiredMessage })
    } else {
      try {
        const user = await User.findOne({ username: request.user.username })
        let passwordCorrect = user === null ? false : await bcrypt.compare(body.password, user.passwordHash)
        if (!passwordCorrect && user.temporaryPassword) {
          const diffTime = Math.abs(new Date() - user.temporaryPassword.generationTime)
          if (diffTime <= 900000) {
            passwordCorrect = await bcrypt.compare(body.password, user.temporaryPassword.passwordHash)
          }
        }
        if (passwordCorrect) {
          let changes = {}

          if (body.newUsername) {
            changes = { ...changes, username: body.newUsername }
          }

          if (body.newEmail) {
            changes = { ...changes, email: body.newEmail }
          }

          if (body.newPassword) {
            if (body.newPassword.length < validationUser.password.minlength) {
              return response.status(400).json({ error: validationUser.password.minMessage })
            } else if (body.newPassword.length > validationUser.password.maxlength) {
              return response.status(400).json({ error: validationUser.password.maxMessage })
            } else if (
              body.newPassword === body.newUsername ||
              body.newPassword === body.newClassGroup ||
              body.newPassword === body.newEmail ||
              body.newPassword === body.newStudentNumber
            ) {
              return response.status(400).json({ error: validationUser.password.uniqueMessage })
            } else if (checkPassword(body.newPassword).score < 2) {
              return response.status(400).json({ error: validationUser.password.unsecurePasswordMessage })
            } else {
              const saltRounds = 10
              const passwordHash = await bcrypt.hash(body.newPassword, saltRounds)
              changes = { ...changes, passwordHash: passwordHash }
            }
          }

          if (body.newStudentNumber || body.newStudentNumber === '') {
            changes = { ...changes, studentNumber: body.newStudentNumber }
          }

          if (body.newClassGroup || body.newClassGroup === '') {
            changes = { ...changes, classGroup: body.newClassGroup }
          }

          const updatedUser = await User.findByIdAndUpdate(user.id, changes, {
            new: true,
            runValidators: true,
          })
          return response.status(200).json(updatedUser.toJSON())
        } else {
          return response.status(400).json({ error: libraryUser.wrongPassword })
        }
      } catch (error) {
        if (error.message.includes('doesnotexist')) {
          return response.status(400).json({ error: libraryUser.userNotFound })
        }
        return response.status(400).json({ error: error.message })
      }
    }
  } else {
    throw Error('JsonWebTokenError')
  }
})

module.exports = userRouter
