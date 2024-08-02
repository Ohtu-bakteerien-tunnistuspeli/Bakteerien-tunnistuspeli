const creditRouter = require('express').Router()
const Credit = require('../models/credit')

creditRouter.get('/', async (request, response) => {
  if (request.user && request.user.admin) {
    const credits = await Credit.find({}).populate('user')
    response.json(credits.map(credit => credit.toJSON()))
  } else if (request.user && !request.user.admin) {
    const credits = await Credit.find({ user: request.user.id }).populate('user')
    response.json(credits.map(credit => credit.toJSON()))
  } else {
    throw Error('JsonWebTokenError')
  }
})

creditRouter.delete('/', async (request, response) => {
  if (request.user && request.user.admin) {
    const creditsToDelete = request.body
    try {
      const promiseArray = creditsToDelete.map(credit => Credit.findByIdAndRemove(credit))
      await Promise.all(promiseArray)
    } catch (error) {
      //do nothing
    }
    response.status(204).end()
  } else {
    throw Error('JsonWebTokenError')
  }
})

module.exports = creditRouter
