/// <reference types="cypress" />
describe('Test management', () => {
    beforeEach(() => {
        cy.request('POST', 'http://localhost:3001/api/testing/init')
        cy.login({ username: 'admin', password: 'adminadmin' })
    })

    it('User cannot access test management', () => {
        cy.login({ username: 'user', password: 'useruser10' })
        cy.get('div').should('not.contain', 'Testien hallinta')
    })

    describe('Tests can be added', () => {

        it('A new test without images can be added', () => {
            cy.contains('Testien hallinta').click()
            cy.should('not.contain', 'Lancefield määritys')
            cy.get('#testModalButton').click({ force: true })
            cy.get('#name').type('Lancefield määritys')
            cy.get('#type').select('Testi')
            cy.get('#addTest').click()
            cy.contains('Testi lisätty onnistuneesti')
            cy.contains('Katalaasitesti')
        })

        it('If test name is not unique, test is not added and error is reported', () => {
            cy.contains('Testien hallinta').click()
            cy.get('#testModalButton').click({ force: true })
            cy.get('#name').type('Lancefield määritys')
            cy.get('#type').select('Testi')
            cy.get('#addTest').click()
            cy.contains('Testi lisätty onnistuneesti')
            cy.contains('Lancefield määritys')
            cy.get('#testModalButton').click()
            cy.get('#name').type('Lancefield määritys')
            cy.get('#type').select('Testi')
            cy.get('#addTest').click()
            cy.contains('Nimen tulee olla uniikki')
        })

        it('If name validation fails, test is not added and error is reported', () => {
            cy.contains('Testien hallinta').click()
            cy.get('#testModalButton').click({ force: true })
            cy.get('#name').type('a')
            cy.get('#type').select('Viljely')
            cy.get('#addTest').click()
            cy.contains('Nimen tulee olla vähintään 2 merkkiä pitkä')
        })

        it('If type validation fails, test is not added and error is reported', () => {
            cy.contains('Testien hallinta').click()
            cy.get('#testModalButton').click({ force: true })
            cy.get('#name').type('Katalaasitesti')
            cy.get('#addTest').click()
            cy.contains('Tyyppi on pakollinen.')
        })
    })

    describe('Tests can be deleted', () => {
        beforeEach(() => {
            cy.request('POST', 'http://localhost:3001/api/testing/test_editing')
            cy.visit('http://localhost:3000/')
        })

        it('Test can be deleted', () => {
            cy.contains('Testien hallinta').click()
            cy.contains('Cypress Testi')
            cy.get('#testEditButton').click({ force: true })
            cy.get('#deleteTest').click()
            cy.contains('Testi poistettiin onnistuneesti')
            cy.should('not.contain', 'Cypress Testi')
        })
    })

    describe('Tests can be modified', () => {
        beforeEach(() => {
            cy.request('POST', 'http://localhost:3001/api/testing/test_editing')
            cy.visit('http://localhost:3000/')
        })

        it('Test name can be edited', () => {
            cy.contains('Testien hallinta').click()
            cy.get('#testEditButton').click({ force: true })
            cy.get('#name').type(' edited')
            cy.get('#saveChanges').click()
            cy.contains('Cypress Testi edited')
        })

        it('Test type can be edited', () => {
            cy.contains('Testien hallinta').click()
            cy.get('#testEditButton').click({ force: true })
            cy.get('#type').select('Värjäys')
            cy.get('#saveChanges').click()
            cy.contains('Värjäys')
        })
    })

    after(() => {
        cy.request('POST', 'http://localhost:3001/api/testing/init')
    })
})
