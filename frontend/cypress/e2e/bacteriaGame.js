/// <reference types="cypress" />
describe('Game', () => {
    beforeEach(() => {
        cy.request('POST', 'http://localhost:3001/api/testing/init')
        cy.visit('http://localhost:3000')
        cy.contains('Kirjaudu sisään').click()
    })

    it('Login page can be opened', () => {
        cy.contains('Kirjaudu Bakteeripeliin')
    })

    it('Login page contains login fields and button', () => {
        cy.get('#username').should('be.visible')
        cy.get('#password').should('be.visible')
        cy.get('#submit').should('contain', 'Kirjaudu')
    })

    it('User can check the terms and conditions from the footer', () => {
        cy.contains('Käyttöehdot').click()
        cy.contains('Bakteerien tunnistuspelin käyttöehdot')
    })

    it('User can check the privacy policy from the footer', () => {
        cy.contains('Tietosuojailmoitus').click()
        cy.contains('Rekisterinpitäjä eli tietojesi käsittelystä vastuussa')
    })

    it('User can check the image copyrights from the footer', () => {
        cy.contains('Kuvien käyttöoikeudet').click()
        cy.contains('Bakteeripelin kuvien käyttöoikeude')
    })

    it('User can log in', () => {
        cy.get('#username').type('admin')
        cy.get('#password').type('adminadmin')
        cy.get('#submit').click()

        cy.get('div').should('not.contain', 'Kirjaudu Bakteeripeliin')
        cy.contains('Kirjauduit sisään onnistuneesti')
    })

    it('User cannot log in with invalid credentials', () => {
        cy.get('#username').type('username')
        cy.get('#password').type('pass')
        cy.get('#submit').click()

        cy.contains('Kirjaudu Bakteeripeliin')
    })

    it('User can sign up with valid credentials and then log in', () => {
        cy.contains('Rekisteröidy').click()
        cy.contains('Rekisteröidy Bakteeripeliin')

        cy.get('#username').type('newUser')
        cy.get('#password').type('newpass')
        cy.get('#passwordAgain').type('newpass')

        cy.get('#acceptCheckBox').click()

        cy.get('#submit').click()

        cy.get('#username').type('newUser')
        cy.get('#password').type('newpass')
        cy.get('#submit').click()

        cy.get('div').should('not.contain', 'Kirjaudu Bakteeripeliin')
    })

    it('User can register with all fields filled in and then login', () => {
        cy.contains('Rekisteröidy').click()
        cy.contains('Rekisteröidy Bakteeripeliin')

        cy.get('#username').type('newUser1')
        cy.get('#password').type('newpass1')
        cy.get('#email').type('example@e.com')
        cy.get('#classGroup').type('C-67')
        cy.get('#studentNumber').type('12345678')

        cy.get('#acceptCheckBox').click()

        cy.get('#submit').click()

        cy.get('#username').type('newUser1')
        cy.get('#password').type('newpass1')
        cy.get('#submit').click()

        cy.get('div').should('not.contain', 'Kirjaudu Bakteeripeliin')


    })

    it('User cannot sign up without accepting the terms and conditions', () => {
        cy.contains('Rekisteröidy').click()
        cy.contains('Rekisteröidy Bakteeripeliin')

        cy.get('#username').type('newUser')
        cy.get('#password').type('newpassThatisLongEnough10')
        cy.get('#passwordAgain').type('newpass')
        cy.get('#email').type('example@e.com')
        cy.get('#classGroup').type('67')
        cy.get('#studentNumber').type('12345678')
        cy.get('#submit').click()

        cy.contains('Käyttöehtojen hyväksyminen on pakollista')
        cy.contains('Rekisteröidy Bakteeripeliin')
    })

    it('User cannot sign up with taken username', () => {
        cy.contains('Rekisteröidy').click()
        cy.contains('Rekisteröidy Bakteeripeliin')

        cy.get('#username').type('admin')
        cy.get('#password').type('newpassThatIsLongEnough21')
        cy.get('#passwordAgain').type('newpassThatIsLongEnough21')
        cy.get('#acceptCheckBox').click()
        cy.get('#email').type('example@e.com')
        cy.get('#classGroup').type('67')
        cy.get('#studentNumber').type('12345678')

        cy.get('#submit').click()

        cy.contains('Käyttäjänimen ja sähköpostiosoitteen tulee olla uniikkeja.')
        cy.contains('Rekisteröidy Bakteeripeliin')
    })

    it('User cannot sign up if passwords do not match', () => {
        cy.contains('Rekisteröidy').click()
        cy.contains('Rekisteröidy Bakteeripeliin')

        cy.get('#username').type('newUser')
        cy.get('#password').type('newpassThatIsLongEnough21')
        cy.get('#passwordAgain').type('newpasThatIsLongEnough21')
        cy.get('#acceptCheckBox').click()
        cy.get('#email').type('example@e.com')
        cy.get('#classGroup').type('67')
        cy.get('#studentNumber').type('12345678')

        cy.get('#submit').click()

        cy.contains('Salasanojen tulee olla samat.')
        cy.contains('Rekisteröidy Bakteeripeliin')
    })

    it('User cannot sign up with empty username', () => {
        cy.contains('Rekisteröidy').click()
        cy.contains('Rekisteröidy Bakteeripeliin')

        cy.get('#password').type('newpass')
        cy.get('#passwordAgain').type('newpass')
        cy.get('#acceptCheckBox').click()

        cy.get('#submit').click()

        cy.contains('Käyttäjänimi on pakollinen')
        cy.contains('Rekisteröidy Bakteeripeliin')
    })

    it('User cannot sign up with empty password', () => {
        cy.contains('Rekisteröidy').click()
        cy.contains('Rekisteröidy Bakteeripeliin')

        cy.get('#username').type('newUser')
        cy.get('#acceptCheckBox').click()
        cy.get('#submit').click()

        cy.contains('Salasana on pakollinen')
        cy.contains('Rekisteröidy Bakteeripeliin')
    })

    describe('After logging in as a normal user', () => {
        beforeEach(() => {
            cy.login({ username: 'user', password: 'useruser10' })
        })

        it('a new bacterium cannot be added', () => {
            cy.get('div').should('not.contain', 'Lisää')
        })

        it('user can log out', () => {
            cy.contains('Kirjaudu ulos').click()
            cy.contains('Kirjaudu Bakteeripeliin')
        })

        it('User can still check the terms and conditions from the footer', () => {
            cy.contains('Käyttöehdot').click()
            cy.contains('Bakteerien tunnistuspelin käyttöehdot')
        })

        it('User can still check the privacy policy from the footer', () => {
            cy.contains('Tietosuojailmoitus').click()
            cy.contains('Rekisterinpitäjä eli tietojesi käsittelystä vastuussa')
        })

        it('User can still check the image copyrights from the footer', () => {
            cy.contains('Kuvien käyttöoikeudet').click()
            cy.contains('Bakteeripelin kuvien käyttöoikeudet')
        })

        it('User can go to own profile page', () => {
            cy.contains('user').click()
            cy.contains('Oma profiilini')
        })

    })

    describe('After logging in as admin', () => {
        beforeEach(() => {
            cy.login({ username: 'admin', password: 'adminadmin' })
        })

        it('a new bacterium can be added', () => {
            cy.contains('Bakteerien hallinta').click()
            cy.get('#newBacterium').type('testibakteeri')
            cy.contains('Lisää').click()

            cy.contains('testibakteeri')
        })

        it('user can log out', () => {
            cy.contains('Kirjaudu ulos').click()
            cy.contains('Kirjaudu Bakteeripeliin')
        })

        it('Admin can go to own profile page', () => {
            cy.contains('admin').click()
            cy.contains('Oma profiilini')
        })

        describe('and there is a bacterium', () => {
            beforeEach(() => {
                cy.addBacterium({ name: 'pneumokokki2' })
            })

            it('it can be found on the list', () => {
                cy.contains('Bakteerien hallinta').click()
                cy.contains('pneumokokki2')
            })

            it('it can be deleted from the list', () => {
                cy.addBacterium({ name: 'testdelete' })
                cy.contains('Bakteerien hallinta').click()
                cy.contains('testdelete').parent().find('#delete').click()
                cy.get('div').should('not.contain', 'testdelete')
            })

            it('it can be edited', () => {
                cy.contains('Bakteerien hallinta').click()
                cy.contains('pneumokokki2').parent().find('#edit').click()

                cy.get('#bacteriumTable').find('#editField').type('pneumokokki3')
                cy.get('#bacteriumTable').find('#saveEdit').click()

                cy.contains('pneumokokki3')
            })

            it('its edit field can be exited without saving changes', () => {
                cy.contains('Bakteerien hallinta').click()
                cy.contains('pneumokokki2').parent().find('#edit').click()
                cy.get('#bacteriumTable').find('#editField').type('pneumokokki3')
                cy.get('#bacteriumTable').find('#stopEdit').click()

                cy.get('div').should('not.contain', 'pneumokokki3')
                cy.contains('pneumokokki2')
            })

        })
    })

    after(() => {
        cy.request('POST', 'http://localhost:3001/api/testing/init')
    })
})
