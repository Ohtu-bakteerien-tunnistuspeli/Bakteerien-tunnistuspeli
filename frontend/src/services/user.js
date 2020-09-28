import axios from 'axios'
const baseUrl = '/api/user'


const login = (credentials) => {
    const request = axios.post(`${baseUrl}/login`, credentials)
    // eslint-disable-next-line no-unused-vars
    return request.then(response => response.data).catch(error => { return })
}

const register = (credentials) => {
    const request = axios.post(`${baseUrl}/register`, credentials)
    // eslint-disable-next-line no-unused-vars
    return request.then(response => response).catch(error => error.response.data)
}

export default { login, register }