require('dotenv').config()
const validation = require('./../lib/validation.json')
const library = require('./../lib/library.json')

const PORT = process.env.PORT
const SECRET = process.env.SECRET
const IMAGEURL = process.env.IMAGEURL
const EMAILHOST = process.env.EMAILHOST
const EMAILUSER = process.env.EMAILUSER
const EMAILPASSWORD = process.env.EMAILPASSWORD
const EMAILPORT = process.env.EMAILPORT
const EMAILPROXY = process.env.EMAILPROXY

let MONGODB_URI
if (process.env.NODE_ENV === 'production') {
  MONGODB_URI = process.env.MONGODB_URI
} else if (process.env.NODE_ENV === 'development') {
  MONGODB_URI = process.env.MONGODB_URI_DEV
}

module.exports = {
  SECRET,
  PORT,
  MONGODB_URI,
  IMAGEURL,
  EMAILHOST,
  EMAILUSER,
  EMAILPASSWORD,
  EMAILPORT,
  EMAILPROXY,
  validation,
  library,
}
