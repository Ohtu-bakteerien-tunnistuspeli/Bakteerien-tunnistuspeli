Cypress.Commands.add('login', ({ username, password }) => {
    cy.request('POST', 'http://localhost:3001/api/user/login', {
        username, password
    }).then(({ body }) => {
        body.token = `bearer ${body.token}`
        window.localStorage.setItem('loggedUser', JSON.stringify(body))
        cy.visit('http://localhost:3000')
    })
})

Cypress.Commands.add('addBacterium', ( { name } ) => {
    cy.request({
        url: 'http://localhost:3001/api/bacteria',
        method: 'POST',
        body: { name },
        headers: {
            'Authorization': `${JSON.parse(window.localStorage.getItem('loggedUser')).token}`
        }
    })

    cy.visit('http://localhost:3000')
})


Cypress.Commands.add('addTest', ( { name, type } ) => {
    cy.request({
        url: 'http://localhost:3001/api/test',
        method: 'POST',
        body: { name, type },
        headers: {
            'Authorization': `${JSON.parse(window.localStorage.getItem('loggedUser')).token}`
        }
    })

    cy.visit('http://localhost:3000')
})