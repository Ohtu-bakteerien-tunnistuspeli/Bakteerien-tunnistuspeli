import { Form } from 'react-bootstrap'
import { useSelector } from 'react-redux'

const Type = ({ typeControlId, testType, onChange, error, touched, setTestType, setFieldTouched }) => {
    const library = useSelector(state => state.language)?.library?.frontend.test.components
    const handleChange = (event) => {
        event.preventDefault()
        if (!touched) {
            setFieldTouched(testType, true, true)
        }
        setTestType(event.target.value)
        onChange('testType', event.target.value)
    }
    return (
        <>
            <Form.Group controlId={typeControlId}>
                <Form.Label>{library.type}</Form.Label>
                <Form.Control as='select'
                    value={testType}
                    isInvalid={error && touched}
                    onChange={handleChange}>
                    <option key='1' value='' disabled hidden>{library.chooseType}</option>
                    <option key='2' value='Värjäys'>{library.dye}</option>
                    <option key='3' value='Testi'>{library.test}</option>
                    <option key='4' value='Viljely'>{library.culture}</option>
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                    {error}
                </Form.Control.Feedback>
            </Form.Group>
        </>
    )
}

export default Type