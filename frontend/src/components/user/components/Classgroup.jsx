import { useSelector } from 'react-redux'
import { Form, InputGroup } from 'react-bootstrap'

const Classgroup = ({ classgroup, setClassgroup, onChange, error, touched, setFieldTouched, fieldId }) => {
  const library = useSelector(state => state.language)?.library?.frontend.user.components
  const handleChange = event => {
    event.preventDefault()
    if (!touched) {
      setFieldTouched(fieldId, true, true)
    }
    setClassgroup(event.target.value)
    onChange(fieldId, event.target.value)
  }

  return (
    <Form.Group controlId={fieldId}>
      <Form.Label>{library.classGroup}</Form.Label>
      <InputGroup>
        <Form.Control
          className="choose-class-field"
          type="text"
          name={fieldId}
          isInvalid={error && touched}
          value={classgroup}
          onChange={handleChange}
        />
        <Form.Control.Feedback type="invalid" hidden={!touched}>
          {error}
        </Form.Control.Feedback>
      </InputGroup>
    </Form.Group>
  )
}

export default Classgroup
