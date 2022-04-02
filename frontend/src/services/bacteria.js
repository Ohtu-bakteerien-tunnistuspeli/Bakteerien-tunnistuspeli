import axios from 'axios'
const baseUrl = '/api/bacteria'


const get = (token) => {
    const config = { headers: { Authorization: token } }
    return axios.get(baseUrl, config).then(response => response.data).catch(error => error.response.data)
}

const add = (name, token) => {
    const config = { headers: { Authorization: token } }
    return axios.post(baseUrl, { name: name }, config).then(response => response.data).catch(error => error.response.data)
}

const update = (id, name, token) => {
    const config = { headers: { Authorization: token } }
    return axios.put(`${baseUrl}/${id}`, { name: name }, config).then(response => response.data).catch(error => error.response.data)
}

const deleteBacterium = (id, token) => {
    const config = { headers: { Authorization: token } }
    return axios.delete(`${baseUrl}/${id}`, config).then(response => response).catch(error => error.response.data)
}

export default { get, add, update, deleteBacterium }