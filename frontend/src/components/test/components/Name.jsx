import { Form } from 'react-bootstrap'
import { useSelector } from 'react-redux'

const Name = ({ nameControlId, error, onChange, testName, touched, setTestName, setFieldTouched }) => {
    const library = useSelector(state => state.language)?.library?.frontend.test.components
    const handleChange = (event) => {
        event.preventDefault()
        if (!touched) {
            setFieldTouched('testName', true, true)
        }
        setTestName(event.target.value)
        onChange('testName', event.target.value)
    }

    return (
        <>
            <Form.Group controlId={nameControlId}>
                <Form.Label style={{ paddingTop: '30px' }}>{library.name}</Form.Label>
                <Form.Control
                    type="text"
                    isInvalid={error && touched}
                    value={testName}
                    onChange={handleChange}
                    reset='' />
                <Form.Control.Feedback type="invalid">
                    {error}
                </Form.Control.Feedback>
            </Form.Group>
        </>
    )
}

export default Name