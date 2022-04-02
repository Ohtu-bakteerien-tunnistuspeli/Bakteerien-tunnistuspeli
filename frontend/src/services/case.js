import axios from 'axios'
const baseUrl = '/api/case'

const get = (token) => {
    const config = { headers: { Authorization: token } }
    return axios.get(baseUrl, config)
        .then(response => response.data)
        .catch(error => error.response.data)
}

const add = (name, bacterium, anamnesis, completionText, completionImage, samples, testGroups, token) => {
    for (let i = 0; i < testGroups.length; i++) {
        let testGroup = testGroups[i]
        for (let j = 0; j < testGroup.length; j++) {
            let tests = testGroup[j].tests
            for (let k = 0; k < tests.length; k++) {
                if (tests[k].test) {
                    tests[k] = { ...tests[k], testId: tests[k].test.id }
                }
            }
        }
    }
    const formData = new FormData()
    formData.append('name', name)
    formData.append('bacterium', bacterium)
    formData.append('anamnesis', anamnesis)
    formData.append('completionText', completionText)
    formData.append('completionImage', completionImage)
    formData.append('samples', JSON.stringify(samples))
    formData.append('testGroups', JSON.stringify(testGroups))
    const config = { headers: { Authorization: token, 'Content-Type': 'multipart/form-data' } }
    return axios.post(baseUrl, formData, config).then(response => response.data).catch(error => error.response.data)
}

const update = (id, name, bacterium, anamnesis, completionText, completionImage, samples, testGroups, deleteEndImage, token) => {
    for (let i = 0; i < testGroups.length; i++) {
        let testGroup = testGroups[i]
        for (let j = 0; j < testGroup.length; j++) {
            let tests = testGroup[j].tests
            for (let k = 0; k < tests.length; k++) {
                if (tests[k].test) {
                    tests[k] = { ...tests[k], testId: tests[k].test.id }
                }
            }
        }
    }
    const formData = new FormData()
    formData.append('name', name)
    formData.append('bacterium', bacterium)
    formData.append('anamnesis', anamnesis)
    formData.append('completionText', completionText)
    formData.append('completionImage', completionImage)
    formData.append('samples', JSON.stringify(samples))
    formData.append('testGroups', JSON.stringify(testGroups))
    formData.append('deleteEndImage', deleteEndImage)
    const config = { headers: { Authorization: token, 'Content-Type': 'multipart/form-data' } }
    return axios.put(`${baseUrl}/${id}`, formData, config)
        .then(response => response.data)
        .catch(error => error.response.data)
}

const updateHints = (id, hints, token) => {
    const config = { headers: { Authorization: token } }
    return axios.put(`${baseUrl}/${id}/hints`, hints, config)
        .then(response => response.data)
        .catch(error => error.response.data)
}

const deleteCase = (id, token) => {
    const config = { headers: { Authorization: token } }
    return axios.delete(`${baseUrl}/${id}`, config).then(response => response).catch(error => error)
}

export default { get, add, update, updateHints, deleteCase }