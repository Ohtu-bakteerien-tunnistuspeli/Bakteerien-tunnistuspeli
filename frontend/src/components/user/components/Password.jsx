import { Form } from 'react-bootstrap'

const Password = ({ password, namedClass, label, setPassword, onChange, error, touched, setFieldTouched, instruction, controlId }) => {
    const handleChange = (event) => {
        event.preventDefault()
        if (setPassword) {
            if(!touched && setFieldTouched) {
                setFieldTouched(controlId, true, true)
            }
            setPassword(event.target.value)
        }
        onChange(controlId, event.target.value)
    }
    return (
        <Form.Group controlId={controlId}>
            <Form.Label className={namedClass}>{label}</Form.Label>
            <Form.Control
                type='password'
                isInvalid={error && touched}
                value={password}
                placeholder='***********'
                onChange={handleChange}
            />
            <Form.Text muted>
                {instruction}
            </Form.Text>
            <Form.Control.Feedback type='invalid' hidden={!touched}>
                {error}
            </Form.Control.Feedback>
        </Form.Group>
    )
}

export default Password