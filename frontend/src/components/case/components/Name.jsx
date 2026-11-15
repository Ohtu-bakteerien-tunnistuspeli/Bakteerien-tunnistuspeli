import { Form } from 'react-bootstrap'
import { useSelector } from 'react-redux'

const Name = ({ name, setName, onChange, error, touched, setFieldTouched }) => {
    const library = useSelector(state => state.language)?.library?.frontend.case.components
    const handleChange = (event) => {
        event.preventDefault()
        if (!touched) {
            setFieldTouched('name', true, true)
        }
        setName(event.target.value)
        onChange('name', event.target.value)
    }
    return (
        <Form.Group controlId='name'>
            <Form.Label>{library.name}</Form.Label>
            <Form.Control
                type='text'
                isInvalid={error && touched}
                value={name}
                onChange={handleChange}
            />
            <Form.Control.Feedback type='invalid' hidden={!touched}>
                {error}
            </Form.Control.Feedback>
        </Form.Group>
    )
}

export default Name