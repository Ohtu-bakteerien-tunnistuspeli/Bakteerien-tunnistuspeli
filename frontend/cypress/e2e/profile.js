/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="cypress" />
describe('Profile management', () => {
    beforeEach(() => {
        cy.request('POST', 'http://localhost:3001/api/testing/init')
    })

    describe('After logging in as a normal user', () => {
        beforeEach(() => {
            cy.login({ username: 'user', password: 'useruser10' })
        })

        it('User can go to own profile page', () => {
            cy.contains('user').click()
            cy.contains('Oma profiilini')
        })

        describe('When in profile page', () => {
            beforeEach(() => {
                cy.contains('user').click()
            })
            it('User can delete itself', () => {
                cy.get('#deleteUser').click()
                cy.get('#confirmField').type('useruser10')
                cy.get('#confirm').click()
                cy.contains('Kirjaudu Bakteeripeliin')
                cy.get('#username').type('user')
                cy.get('#password').type('useruser10')
                cy.get('#submit').click()
                cy.contains('Kirjaudu Bakteeripeliin')
            })

            it('Cannot delete itself without giving correct confirmation text', () => {
                cy.get('#deleteUser').click()
                cy.get('#confirmField').type('use')
                cy.get('#confirm').click()
                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(500)
                cy.contains('Väärä salasana')
            })

            it('Can quit deleting itself', () => {
                cy.get('#deleteUser').click()
                cy.get('#confirmField').type('useruser10')
                cy.get('.close').click()
                cy.contains('Oma profiilini')
            })

            it('User can view their info', () => {
                cy.contains('Käyttäjänimi')
                cy.contains('Opiskelijanumero')
                cy.contains('Sähköposti')
                cy.contains('Vuosikurssi')
                cy.contains('Suoritukset')
                cy.contains('user@example.com')
                cy.contains('Ei suorituksia')
            })

            it('User can change their username', () => {
                cy.contains('Muokkaa käyttäjätietoja').click()
                cy.get('#username').type('2')
                cy.get('#confirmField').type('useruser10')
                cy.get('#updateUserInfo').click()
                cy.contains('user2')
                cy.wait(500)
                cy.contains('Kirjaudu ulos').click()
                cy.get('#username').type('user2')
                cy.get('#password').type('useruser10')
                cy.get('#submit').click()
                cy.contains('Etusivu')
            })

            it('User can change their password', () => {
                cy.contains('Muokkaa käyttäjätietoja').click()
                cy.get('#password').type('bakteeripelin12@b59tautiC')
                cy.get('#passwordAgain').type('bakteeripelin12@b59tautiC')
                cy.get('#confirmField').type('useruser10')
                cy.get('#updateUserInfo').click()
                cy.wait(500)
                cy.contains('Kirjaudu ulos').click()
                cy.get('#username').type('user')
                cy.get('#password').type('bakteeripelin12@b59tautiC')
                cy.get('#submit').click()
                cy.contains('Etusivu')
            })

            it('User can change their email', () => {
                cy.contains('Muokkaa käyttäjätietoja').click()
                cy.get('#email').clear().type('uusi@example.com')
                cy.get('#confirmField').type('useruser10')
                cy.get('#updateUserInfo').click()
                cy.contains('uusi@example.com')
            })

            it('User can change their student number', () => {
                cy.contains('Muokkaa käyttäjätietoja').click()
                cy.get('#studentNumber').clear().type('012345')
                cy.get('#confirmField').type('useruser10')
                cy.get('#updateUserInfo').click()
                cy.contains('012345')
            })

            it('User can change their class group', () => {
                cy.contains('Muokkaa käyttäjätietoja').click()
                cy.get('#classGroup').clear().type('70')
                cy.get('#confirmField').type('useruser10')
                cy.get('#updateUserInfo').click()
                cy.contains('C-70')
            })

            it('User cannot change their info when an incorrect password is given', () => {
                cy.contains('Muokkaa käyttäjätietoja').click()
                cy.get('#classGroup').clear().type('70')
                cy.get('#confirmField').type('useruser12')
                cy.get('#updateUserInfo').click()
                cy.get('.close').click()
                cy.contains('C-12')
            })

            it('User info modification can be cancelled and changes are not saved', () => {
                cy.contains('Muokkaa käyttäjätietoja').click()
                cy.get('#username').clear().type('newName')
                cy.get('#email').clear().type('new@email.com')
                cy.get('#studentNumber').clear().type('777')
                cy.get('#classGroup').clear().type('70')
                cy.get('#confirmField').type('useruser12')
                cy.get('#updateUserInfo').click()
                cy.get('.close').click()
                cy.contains('user')
                cy.contains('user@example.com')
                cy.contains('1234567')
                cy.contains('C-12')
            })

            it('Password is not changed if new passwords do not match', () => {
                cy.contains('Muokkaa käyttäjätietoja').click()
                cy.get('#password').type('useruser123')
                cy.get('#passwordAgain').type('useruser456')
                cy.get('#confirmField').type('useruser10')
                cy.get('#updateUserInfo').click()
                cy.get('.close').click({ multiple: true })
                cy.wait(500)
                cy.contains('Kirjaudu ulos').click()
                cy.get('#username').type('user')
                cy.get('#password').type('useruser123')
                cy.get('#submit').click()
                cy.contains('Kirjaudu Bakteeripeliin')
                cy.get('#password').clear().type('useruser456')
                cy.get('#submit').click()
                cy.contains('Kirjaudu Bakteeripeliin')
                cy.get('#password').clear().type('useruser10')
                cy.get('#submit').click()
                cy.contains('Etusivu')
            })

        })
    })

    describe('After logging in as admin', () => {
        beforeEach(() => {
            cy.login({ username: 'admin', password: 'adminadmin' })
        })

        it('Admin can go to own profile page', () => {
            cy.contains('admin').click()
            cy.contains('Oma profiilini')
        })

        describe('When in profile page', () => {
            beforeEach(() => {
                cy.contains('admin').click()
            })

            it('Cannot delete itself without giving correct confirmation text', () => {
                cy.get('#deleteUser').click()
                cy.get('#confirmField').type('dmin')
                cy.get('#confirm').click()
                cy.wait(500)
                cy.contains('Väärä salasana')
            })

            it('Can quit deleting itself', () => {
                cy.get('#deleteUser').click()
                cy.get('#confirmField').type('adminadmin')
                cy.get('.close').click()
                cy.contains('Oma profiilini')
            })

            it('Admin can view their info', () => {
                cy.contains('Käyttäjänimi')
                cy.contains('Opiskelijanumero')
                cy.contains('Sähköposti')
                cy.contains('Vuosikurssi')
                cy.contains('Suoritukset')
                cy.contains('admin@examples.com')
                cy.contains('Ei suorituksia')
            })

            it('Admin can delete itself', () => {
                cy.get('#deleteUser').click()
                cy.get('#confirmField').type('adminadmin')
                cy.get('#confirm').click()
                cy.contains('Kirjaudu Bakteeripeliin')
                cy.get('#username').type('admin')
                cy.get('#password').type('adminadmin')
                cy.get('#submit').click()
                cy.contains('Kirjaudu Bakteeripeliin')
            })

        })
    })

    after(() => {
        cy.request('POST', 'http://localhost:3001/api/testing/init')
    })
})