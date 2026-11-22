import axios from 'axios'
const baseUrl = '/api/credit'

const get = token => {
  const config = { headers: { Authorization: token } }
  return axios
    .get(baseUrl, config)
    .then(response => response.data)
    .catch(error => error.response.data)
}

const deleteCredits = (credits, token) => {
  const config = { headers: { Authorization: token }, data: credits }
  return axios
    .delete(baseUrl, config)
    .then(response => response.data)
    .catch(error => error.response.data)
}

export default { get, deleteCredits }
