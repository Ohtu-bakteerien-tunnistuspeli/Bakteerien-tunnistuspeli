/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="cypress" />
describe('credit management', () => {
    beforeEach(() => {
        cy.request('POST', 'http://localhost:3001/api/testing/init')
        cy.request('POST', 'http://localhost:3001/api/testing/credits')
        cy.login({ username: 'admin', password: 'adminadmin' })
    })

    describe('Filtering credits', () => {

        it('Class group filter shows only correct credits', () => {
            cy.contains('Suoritusten hallinta').click()
            cy.contains('user1')
            cy.contains('user2')
            cy.contains('user3')
            cy.get('#classGroupFilter').type('C-15')
            cy.contains('user1')
            cy.should('not.contain', 'user2')
            cy.should('not.contain', 'user3')
            cy.get('#classGroupFilter').clear()
        })

        it('Student number filter shows only correct results', () => {
            cy.contains('Suoritusten hallinta').click()
            cy.contains('user1')
            cy.contains('user2')
            cy.contains('user3')
            cy.get('#studentNumberFilter').type('1567')
            cy.contains('user1')
            cy.contains('user2')
            cy.contains('user3')
            cy.get('#studentNumberFilter').type('8')
            cy.contains('user1')
            cy.contains('user2')
            cy.should('not.contain', 'user3')
            cy.get('#studentNumberFilter').type('8')
            cy.contains('user1')
            cy.should('not.contain', 'user2')
            cy.should('not.contain', 'user3')
            cy.get('#studentNumberFilter').type('15')
            cy.contains('user1')
            cy.get('#studentNumberFilter').clear()
        })
    })

    describe('Deleting credits', () => {

        it('Only filtered credits are deleted', () => {
            cy.contains('Suoritusten hallinta').click()
            cy.contains('user1')
            cy.contains('user2')
            cy.contains('user3')
            cy.get('#classGroupFilter').type('C-21')
            cy.wait(5000)
            cy.get('#deleteCredits').click()
            cy.get('#classGroupFilter').clear()
            cy.wait(500)
            cy.contains('user1')
            cy.should('not.contain', 'user2')
            cy.should('not.contain', 'user3')
        })
    })

    describe('Showing individual stats in modal', () => {

        it('modal can be opened', () => {
            cy.contains('Suoritusten hallinta').click()
            cy.contains('user1')
            cy.contains('user2')
            cy.contains('user3')
            cy.get('#creditShowLink').click()
            cy.contains('Käyttäjänimi:')
            cy.contains('Vuosikurssi:')
            cy.contains('Opiskelijanumero:')
            cy.contains('Sähköposti:')
            cy.contains('Suoritukset:')
            cy.contains('Maitotila')
        })
    })

    after(() => {
        cy.request('POST', 'http://localhost:3001/api/testing/init')
    })
})