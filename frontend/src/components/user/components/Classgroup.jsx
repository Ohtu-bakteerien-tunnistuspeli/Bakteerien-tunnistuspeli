import { useSelector } from 'react-redux'
import { Form, InputGroup } from 'react-bootstrap'

const Classgroup = ({ classgroup, setClassgroup, onChange, error, touched, setFieldTouched }) => {
    const library = useSelector(state => state.language)?.library?.frontend.user.components
    const handleChange = (event) => {
        event.preventDefault()
        if (!touched) {
            setFieldTouched('classGroup', true, true)
        }
        setClassgroup(event.target.value)
        onChange('classGroup', event.target.value ? `C-${event.target.value}` : '')
    }

    return (
        <Form.Group controlId='classGroup'>
            <Form.Label>{library.classGroup}</Form.Label>
            <InputGroup>
                <InputGroup.Prepend>
                    <InputGroup.Text>C-</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                    className="choose-class-field"
                    type='tel'
                    name='classGroup'
                    isInvalid={error && touched}
                    value={classgroup}
                    onChange={handleChange}
                    onClick={handleChange}
                    onFocus={handleChange}
                />
                <Form.Control.Feedback type='invalid' hidden={!touched}>
                    {error}
                </Form.Control.Feedback>
            </InputGroup>
        </Form.Group>
    )
}

export default Classgroup