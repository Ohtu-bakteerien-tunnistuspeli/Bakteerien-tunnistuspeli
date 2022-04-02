import axios from 'axios'
const baseUrl = '/api/test'


const get = (token) => {
    const config = { headers: { Authorization: token } }
    return axios.get(baseUrl, config).then(response => response.data).catch(error => error.response.data)
}

const add =  (name, type, contImg, posImg, negImg, bacteriaSpes, token) => {
    const formData = new FormData()
    formData.append('name', name )
    formData.append('type', type )
    formData.append('controlImage', contImg)
    formData.append('positiveResultImage', posImg )
    formData.append('negativeResultImage', negImg)
    bacteriaSpes.forEach(bact => formData.append('bacteriaSpecificImages', bact))
    const config = { headers: { Authorization: token, 'Content-Type' : 'multipart/form-data' } }
    return axios.post(baseUrl, formData , config).then(response => response.data).catch(error => error.response.data)
}

const update = (id, name, type, contImg, photoPos, photoNeg, bacteriaSpesif, photosToDelete, deleteSpecifics, token) => {
    const formData = new FormData()
    formData.append('id', id )
    formData.append('name', name )
    formData.append('type', type )
    formData.append('controlImage', contImg)
    formData.append('positiveResultImage', photoPos )
    formData.append('negativeResultImage', photoNeg)
    bacteriaSpesif.forEach(bact => formData.append('bacteriaSpecificImages', bact))
    formData.append('deleteSpecifics', JSON.stringify(deleteSpecifics))
    formData.append('deleteCtrl', photosToDelete.ctrl)
    formData.append('deletePos', photosToDelete.pos)
    formData.append('deleteNeg', photosToDelete.neg)
    const config = { headers: { Authorization: token, 'Content-Type' : 'multipart/form-data' } }
    return axios.put(`${baseUrl}/${id}`, formData, config)
        .then(response => response.data)
        .catch(error => error.response.data)
}

const deleteTest = (id, token) => {
    const config = { headers: { Authorization: token } }
    return axios.delete(`${baseUrl}/${id}`, config)
        .then(response => response)
        .catch(error => error.response.data)
}

export default { get, add, update, deleteTest }