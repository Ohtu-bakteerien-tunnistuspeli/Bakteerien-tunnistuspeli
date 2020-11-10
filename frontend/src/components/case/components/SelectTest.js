import React, { useState } from 'react'
import { Button, Form } from 'react-bootstrap'

const SelectTest = ({ addTest, testGroupIndex, testForCaseIndex, addedTests, tests, hasAlternative }) => {
    const [test, setTest] = useState('')
    return (
        <>
            <td>
                <Form.Control
                    as='select'
                    id={testGroupIndex === 0 ? 'testSelect' : `testSelect${testGroupIndex}`}
                    value={test ? JSON.stringify(test) : ''}
                    onChange={(event) => event.target.value !== '' ? setTest(JSON.parse(event.target.value)) : setTest('')}
                >
                    <option value='' disabled hidden>Valitse testi</option>
                    {
                        tests.filter(t => !addedTests?.includes(t.id)).map(t =>
                            <option key={t.id} value={JSON.stringify(t)}>{t.name}</option>
                        )
                    }
                </Form.Control>
            </td>
            <td><Button
                id={testGroupIndex === 0 ? 'addTest' : `addTest${testGroupIndex}`}
                onClick={() => {
                    addTest(testGroupIndex, testForCaseIndex, test)
                    setTest('')
                }}>{hasAlternative ? 'Lisää vaihtoehtoinen testi' : 'Lisää testi'}</Button></td>
        </>
    )
}

export default SelectTest