import { useSelector } from 'react-redux'
import { Form } from 'react-bootstrap'

const ValidatedTextField = ({ value, setValue, onChange, error, touched, setFieldTouched, fieldId, namedClass }) => {
    const library = useSelector(state => state.language)?.library?.frontend.user.components
    const handleChange = (event) => {
        event.preventDefault()
        if (!touched) {
            setFieldTouched(fieldId, true, true)
        }
        setValue(event.target.value)
        onChange(fieldId, event.target.value)
    }
    return (
        <Form.Group controlId={fieldId}>
            <Form.Label className={namedClass}>{library[fieldId]}</Form.Label>
            <Form.Control
                name={fieldId}
                type='text'
                isInvalid={error && touched}
                value={value}
                onChange={handleChange}
            />
            <Form.Control.Feedback type='invalid' hidden={!touched}>
                {error}
            </Form.Control.Feedback>
        </Form.Group>
    )
}

export default ValidatedTextField