describe('Case management', () => {
    beforeEach(() => {
        cy.login({ username: 'admin', password: 'admin' })
        cy.request('POST', 'http://localhost:3001/api/testing/reset_bacteria')
        cy.request('POST', 'http://localhost:3001/api/testing/reset_tests')
        cy.request('POST', 'http://localhost:3001/api/testing/reset_cases')
        cy.addBacterium({ name: 'Tetanus' })
        cy.addTest({ name: 'Testi', type: 'Viljely' })
        cy.addTest({ name: 'Testi2', type: 'Viljely' })
        cy.addTest({ name: 'Testi3', type: 'Viljely' })
        cy.visit('http://localhost:3000')
    })

    describe('Add case', () => {
        beforeEach(() => {
        })

        it('A new case with correct data without image can be added', () => {
            cy.contains('Tapausten hallinta').click()
            cy.should('not.contain', 'Maatila')
            cy.wait(500)
            cy.get('#caseModalButton').click({ force: true })
            cy.get('#name').type('Maatila')
            cy.get('#anamnesis').type('Monta nautaa kipeänä.')
            cy.get('#bacterium').select('Tetanus')
            cy.get('#sample').type('Verinäyte')
            cy.get('#isRightAnswer').click()
            cy.get('#addSample').click()
            cy.contains('Verinäyte')
            cy.get('#addTestGroup').click()
            cy.get('#addTestForCase').click()
            cy.get('#testSelect').select('Testi')
            cy.get('#addTest').click()
            cy.get('#required').click()
            cy.get('#positive').click()
            cy.get('#testGroupTable').contains('Testi')
            cy.get('#testGroupTable').get('#positive').should('be.checked')
            cy.get('#testGroupTable').get('#required').should('be.checked')
            cy.get('#addCase').click()
            cy.contains('Tapauksen Maatila lisäys onnistui.', { timeout: 100 })
            cy.contains('Maatila')
        })

        it('A new case with correct data with all the data fields be added', () => {
            cy.contains('Tapausten hallinta').click()
            cy.should('not.contain', 'Maatila')
            cy.wait(500)
            cy.get('#caseModalButton').click({ force: true })
            cy.get('#name').type('Maatila')
            cy.get('#anamnesis').type('Monta nautaa kipeänä.')
            cy.get('#completionText').type('monta nautaa oli kipeänä')
            cy.get('#completionImage').click()
            cy.get('#bacterium').select('Tetanus')
            cy.get('#sample').type('Verinäyte')
            cy.get('#isRightAnswer').click()
            cy.get('#addSample').click()
            cy.contains('Verinäyte')
            cy.get('#addTestGroup').click()
            cy.get('#addTestForCase').click()
            cy.get('#testSelect').select('Testi')
            cy.get('#addTest').click()
            cy.get('#required').click()
            cy.get('#positive').click()
            cy.get('#testGroupTable').contains('Testi')
            cy.get('#testGroupTable').get('#positive').should('be.checked')
            cy.get('#testGroupTable').get('#required').should('be.checked')
            cy.get('#addCase').click()
            cy.wait(500)
            cy.contains('Tapauksen Maatila lisäys onnistui.', { timeout: 100 })
            cy.contains('Maatila')
        })

        it('If the validation of the field name, case is not added and error is reported', () => {
            cy.contains('Tapausten hallinta').click()
            cy.wait(500)
            cy.get('#caseModalButton').click({ force: true })
            cy.get('#name').type('M')
            cy.get('#anamnesis').type('Monta nautaa kipeänä.')
            cy.get('#bacterium').select('Tetanus')
            cy.get('#sample').type('Verinäyte')
            cy.get('#isRightAnswer').click()
            cy.get('#addSample').click()
            cy.contains('Verinäyte')
            cy.get('#addTestGroup').click()
            cy.get('#addTestForCase').click()
            cy.get('#testSelect').select('Testi')
            cy.get('#addTest').click()
            cy.get('#testGroupTable').contains('Testi')
            cy.get('#testGroupTable').get('#positive').should('not.be.checked')
            cy.get('#testGroupTable').get('#required').should('not.be.checked')
            cy.contains('Nimi on liian lyhyt.')
        })

        it('If the field name is not unique, case is not added and error is reported', () => {
            cy.contains('Tapausten hallinta').click()
            cy.wait(500)
            cy.get('#caseModalButton').click({ force: true })
            cy.get('#name').type('Maatila')
            cy.get('#anamnesis').type('Monta nautaa kipeänä.')
            cy.get('#bacterium').select('Tetanus')
            cy.get('#sample').type('Verinäyte')
            cy.get('#addSample').click()
            cy.get('#addTestGroup').click()
            cy.get('#addTestForCase').click()
            cy.get('#testSelect').select('Testi')
            cy.get('#addTest').click()
            cy.get('#testGroupTable').contains('Testi')
            cy.get('#addCase').click()
            cy.wait(500)
            cy.get('#caseModalButton').click({ force: true })
            cy.get('#name').type('Maatila')
            cy.get('#anamnesis').type('Monta nautaa kipeänä.')
            cy.get('#bacterium').select('Tetanus')
            cy.get('#sample').type('Verinäyte')
            cy.get('#addSample').click()
            cy.contains('Nimen tulee olla uniikki')
        })

        it('A user can not add a case', () => {
            cy.login({ username: 'user', password: 'user' })
            cy.get('div').should('not.contain', 'Tapausten hallinta')
        })

    })

    describe('Modify a case', () => {
        beforeEach(() => {
        })

        it('The case Tapaus can be modified', () => {
            cy.login({ username: 'admin', password: 'admin' })
            cy.contains('Tapausten hallinta').click()
            cy.should('not.contain', 'Maatila')
            cy.wait(500)
            cy.get('#caseModalButton').click({ force: true })
            cy.get('#name').type('Maatila')
            cy.get('#anamnesis').type('Monta nautaa kipeänä.')
            cy.get('#bacterium').select('Tetanus')
            cy.get('#sample').type('Verinäyte')
            cy.get('#isRightAnswer').click()
            cy.get('#addSample').click()
            cy.contains('Verinäyte')
            cy.get('#addTestGroup').click()
            cy.get('#addTestForCase').click()
            cy.get('#testSelect').select('Testi')
            cy.get('#addTest').click()
            cy.get('#testGroupTable').contains('Testi')
            cy.get('#addCase').click()
            cy.get('#caseEditButton').click()
            cy.get('#name').type('Maatila2')
            cy.get('#saveEdit').click()
            cy.contains('MaatilaMaatila2')
        })

        it('The user can add hints and see them only when answer is wrong', () => {
            cy.login({ username: 'admin', password: 'admin' })
            cy.contains('Tapausten hallinta').click()
            cy.wait(500)
            cy.get('#caseModalButton').click({ force: true })
            cy.get('#name').type('Maatilatapaus')
            cy.get('#anamnesis').type('Monta nautaa kipeänä.')
            cy.get('#bacterium').select('Tetanus')
            cy.get('#sample').type('Verinäyte')
            cy.get('#isRightAnswer').click()
            cy.get('#addSample').click()
            cy.contains('Verinäyte')

            cy.get('#addTestGroup').click()
            cy.get('#addTestForCase').click()
            cy.get('#testSelect').select('Testi')
            cy.get('#addTest').click()
            cy.get('#testGroupTable').contains('Testi')
            cy.get('#required').click()
            cy.get('#positive').click()
            cy.get('#addTestGroup').click()
            cy.get('#addTestForCase1').click()
            cy.get('#testSelect1').select('Testi2')
            cy.get('#addTest1').click()
            cy.get('#testGroupTable1').contains('Testi2')
            cy.get('#addTestGroup').click()
            cy.get('#addTestForCase2').click()
            cy.get('#testSelect2').select('Testi3')
            cy.get('#addTest2').click()
            cy.get('#testGroupTable2').contains('Testi3')

            cy.get('#addCase').click()

            cy.get('#addHint').click()
            cy.get('#selectTest').select('Testi2')
            cy.get('#testHint').type('Vinkkii')
            cy.contains('Tallenna muutokset').click()

            cy.get('#addHint').click()
            cy.contains('Testi2')
            cy.contains('Vinkkii')
            cy.contains('Tallenna muutokset').click()

            cy.contains('Etusivu').click()
            cy.get('#caseTable').contains('Maatilatapaus').click()
            cy.contains('Toiminnot').click()
            cy.get('[type="checkbox"]').eq('0').check()
            cy.get('#checkSamples').click()
            cy.contains('Testi3').click()
            cy.contains('Väärä vastaus')
            cy.contains('Testi2').click()
            cy.contains('Vinkkii')
            cy.contains('Testi').click()
            cy.contains('Testi2').click()
            cy.contains('Oikea vastaus')
            cy.should('not.contain', 'Vinkkii')
        })
    })

    describe('Remove a case', () => {
        beforeEach(() => {
            cy.login({ username: 'admin', password: 'admin' })
        })

        it('The case Tapaus can be deleted', () => {
            cy.contains('Tapausten hallinta').click()
            cy.should('not.contain', 'Maatila')
            cy.wait(500)
            cy.get('#caseModalButton').click({ force: true })
            cy.get('#name').type('Maatila')
            cy.get('#anamnesis').type('Monta nautaa kipeänä.')
            cy.get('#bacterium').select('Tetanus')
            cy.get('#sample').type('Verinäyte')
            cy.get('#isRightAnswer').click()
            cy.get('#addSample').click()
            cy.contains('Verinäyte')
            cy.get('#addTestGroup').click()
            cy.get('#addTestForCase').click()
            cy.get('#testSelect').select('Testi')
            cy.get('#addTest').click()
            cy.get('#testGroupTable').contains('Testi')
            cy.get('#required').click()
            cy.get('#positive').click()
            cy.get('#addCase').click()
            cy.contains('Maatila')
            cy.get('#deleteCase').click()
        })
    })
    after(() => {
        cy.request('POST', 'http://localhost:3001/api/testing/reset_bacteria')
        cy.request('POST', 'http://localhost:3001/api/testing/reset_tests')
        cy.request('POST', 'http://localhost:3001/api/testing/reset_cases')
    })
})