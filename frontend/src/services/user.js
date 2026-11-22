import axios from 'axios'
const baseUrl = '/api/user'

const get = token => {
  const config = { headers: { Authorization: token } }
  return axios
    .get(baseUrl, config)
    .then(response => response.data)
    .catch(error => error.response.data)
}

const login = credentials => {
  const request = axios.post(`${baseUrl}/login`, credentials)
  // eslint-disable-next-line no-unused-vars
  return request
    .then(response => response.data)
    .catch(error => {
      return
    })
}

const register = credentials => {
  const request = axios.post(`${baseUrl}/register`, credentials)
  // eslint-disable-next-line no-unused-vars
  return request.then(response => response).catch(error => error.response.data)
}

const deleteUser = (id, confirmText, token) => {
  const config = { headers: { Authorization: token, data: JSON.stringify(confirmText) } }
  return axios
    .delete(`${baseUrl}/${id}`, config)
    .then(response => response)
    .catch(error => error.response.data)
}

const promote = (id, token) => {
  const config = { headers: { Authorization: token } }
  return axios
    .put(`${baseUrl}/${id}/promote`, {}, config)
    .then(response => response.data)
    .catch(error => error.response.data)
}

const demote = (id, token) => {
  const config = { headers: { Authorization: token } }
  return axios
    .put(`${baseUrl}/${id}/demote`, {}, config)
    .then(response => response.data)
    .catch(error => error.response.data)
}

const update = (username, email, studentNumber, classGroup, oldPassword, password, token) => {
  const config = { headers: { Authorization: token } }
  if (password === '') {
    return axios
      .put(
        baseUrl,
        {
          newUsername: username,
          newEmail: email,
          password: oldPassword,
          newStudentNumber: studentNumber,
          newClassGroup: classGroup,
        },
        config
      )
      .then(response => response.data)
      .catch(error => error.response.data)
  } else {
    return axios
      .put(
        baseUrl,
        {
          newUsername: username,
          newEmail: email,
          password: oldPassword,
          newPassword: password,
          newStudentNumber: studentNumber,
          newClassGroup: classGroup,
        },
        config
      )
      .then(response => response.data)
      .catch(error => error.response.data)
  }
}

const temporaryPasswordGenerate = credentials => {
  return axios
    .post(`${baseUrl}/temporarypassword`, credentials)
    .then(response => response.data)
    .catch(error => error.response.data)
}

export default {
  get,
  login,
  register,
  deleteUser,
  promote,
  demote,
  update,
  temporaryPasswordGenerate,
}
