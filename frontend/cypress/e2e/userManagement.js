/// <reference types="cypress" />
describe('User management', () => {
    beforeEach(() => {
        cy.request('POST', 'http://localhost:3001/api/testing/init')
        cy.login({ username: 'admin', password: 'adminadmin' })
    })

    it('User cannot access user management', () => {
        cy.login({ username: 'user', password: 'useruser10' })
        cy.get('div').should('not.contain', 'Käyttäjien hallinta')
    })

    it('User list does not contain one looking at it', () => {
        cy.contains('Käyttäjien hallinta').click()
        cy.get('#userTable').should('not.contain', 'admin')
        cy.get('td').should('contain', 'user')
    })

    describe('Delete', () => {
        it('User can be deleted', () => {
            cy.contains('Käyttäjien hallinta').click()
            cy.get('td').should('contain', 'user')
            cy.get('#deleteUser').click()
            cy.get('#confirmField').type('user')
            cy.get('#confirm').click()
            cy.contains('Käyttäjän user poisto onnistui.')
            cy.get('td').should('not.contain', 'user')
        })

        it('Cannot delete wihout giving correct confirmation text', () => {
            cy.contains('Käyttäjien hallinta').click()
            cy.get('td').should('contain', 'user')
            cy.get('#deleteUser').click({ force: true })
            cy.get('#confirmField').type('use')
            cy.get('#confirm').should('be.disabled')
        })

        it('Can quit deleting', () => {
            cy.contains('Käyttäjien hallinta').click()
            cy.get('td').should('contain', 'user')
            cy.get('#deleteUser').click({ force: true })
            cy.get('#confirmField').type('use')
            cy.get('.close').click()
            cy.get('td').should('contain', 'user')
        })
    })

    describe('Promote', () => {
        it('User can be promoted', () => {
            cy.login({ username: 'user', password: 'useruser10' })
            cy.get('div').should('not.contain', 'Käyttäjien hallinta')
            cy.login({ username: 'admin', password: 'adminadmin' })
            cy.contains('Käyttäjien hallinta').click()
            cy.get('#promoteUser').click({ force: true })
            cy.get('#confirmField').type('user')
            cy.get('#confirm').click()
            cy.contains('Käyttäjän user ylennys onnistui.')
            cy.login({ username: 'user', password: 'useruser10' })
            cy.get('div').should('contain', 'Käyttäjien hallinta')
        })

        it('Cannot promote wihout giving correct confirmation text', () => {
            cy.contains('Käyttäjien hallinta').click()
            cy.get('td').should('contain', 'user')
            cy.get('#promoteUser').click()
            cy.get('#confirmField').type('use')
            cy.get('#confirm').should('be.disabled')
        })

        it('Can quit promoting', () => {
            cy.login({ username: 'user', password: 'useruser10' })
            cy.get('div').should('not.contain', 'Käyttäjien hallinta')
            cy.login({ username: 'admin', password: 'adminadmin' })
            cy.contains('Käyttäjien hallinta').click()
            cy.get('#promoteUser').click()
            cy.get('#confirmField').type('user')
            cy.get('.close').click()
            cy.login({ username: 'user', password: 'useruser10' })
            cy.get('div').should('not.contain', 'Käyttäjien hallinta')
        })
    })

    describe('Demote', () => {
        beforeEach(() => {
            cy.contains('Käyttäjien hallinta').click()
            cy.get('#promoteUser').click({ force: true })
            cy.get('#confirmField').type('user')
            cy.get('#confirm').click()
            cy.contains('Etusivu').click()
        })

        it('User can be demoted', () => {
            cy.login({ username: 'user', password: 'useruser10' })
            cy.get('div').should('contain', 'Käyttäjien hallinta')
            cy.login({ username: 'admin', password: 'adminadmin' })
            cy.contains('Käyttäjien hallinta').click()
            cy.get('#demoteUser').click({ force: true })
            cy.get('#confirmField').type('user')
            cy.get('#confirm').click()
            cy.contains('Käyttäjän user alennus onnistui.')
            cy.login({ username: 'user', password: 'useruser10' })
            cy.get('div').should('not.contain', 'Käyttäjien hallinta')
        })

        it('Cannot demote wihout giving correct confirmation text', () => {
            cy.contains('Käyttäjien hallinta').click()
            cy.get('td').should('contain', 'user')
            cy.get('#demoteUser').click({ force: true })
            cy.get('#confirmField').type('use')
            cy.get('#confirm').should('be.disabled')
        })

        it('Can quit demoting', () => {
            cy.login({ username: 'user', password: 'useruser10' })
            cy.get('div').should('contain', 'Käyttäjien hallinta')
            cy.login({ username: 'admin', password: 'adminadmin' })
            cy.contains('Käyttäjien hallinta').click()
            cy.get('#demoteUser').click({ force: true })
            cy.get('#confirmField').type('user')
            cy.get('.close').click()
            cy.login({ username: 'user', password: 'useruser10' })
            cy.get('div').should('contain', 'Käyttäjien hallinta')
        })
    })

    after(() => {
        cy.request('POST', 'http://localhost:3001/api/testing/init')
    })
})