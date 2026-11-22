import axios from 'axios'
const baseUrl = '/api/game'

const get = (id, token) => {
  const config = { headers: { Authorization: token } }
  return axios
    .get(`${baseUrl}/${id}`, config)
    .then(response => response.data)
    .catch(error => error.response.data)
}

const sampleCheck = (id, samples, token) => {
  const config = { headers: { Authorization: token } }
  return axios
    .post(`${baseUrl}/${id}/checkSamples`, samples, config)
    .then(response => response.data)
    .catch(error => error.response.data)
}

const testCheck = (id, tests, token) => {
  const config = { headers: { Authorization: token } }
  return axios
    .post(`${baseUrl}/${id}/checkTests`, tests, config)
    .then(response => response.data)
    .catch(error => error.response.data)
}

const bacteriumCheck = (id, bacterium, token) => {
  const config = { headers: { Authorization: token } }
  return axios
    .post(`${baseUrl}/${id}/checkBacterium`, bacterium, config)
    .then(response => response.data)
    .catch(error => error.response.data)
}

export default { get, sampleCheck, testCheck, bacteriumCheck }
