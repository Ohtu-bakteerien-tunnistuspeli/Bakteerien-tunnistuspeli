const mongoose = require('mongoose')
const creditSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  testCases: [
    {
      type: String,
    },
  ],
})

creditSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

const Credit = mongoose.model('Credit', creditSchema)

module.exports = Credit
