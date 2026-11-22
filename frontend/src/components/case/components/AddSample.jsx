import { Button, Form } from 'react-bootstrap'
import { useSelector } from 'react-redux'

const AddSample = ({ sample, samples, setSample, addSample, error, onChange, touched, setFieldTouched }) => {
  const library = useSelector(state => state.language)?.library?.frontend.case.components
  const handleChange = event => {
    event.preventDefault()
    if (!touched) {
      setFieldTouched('sample', true, true)
    }
    setSample({ ...sample, description: event.target.value })
    onChange('sample', event.target.value)
  }
  return (
    <Form.Group>
      <Form.Control id="sample" value={sample.description} onChange={handleChange} isInvalid={error} />
      <Form.Control.Feedback type="invalid" hidden={!touched}>
        {error}
      </Form.Control.Feedback>
      <Form.Check
        style={{ display: 'inline-block', paddingRight: '2px' }}
        type="checkbox"
        id="isRightAnswer"
        label={library.sampleRightAnswer}
        checked={sample.rightAnswer}
        disabled={samples.filter(sample => sample.rightAnswer).length > 0}
        onChange={() => setSample({ ...sample, rightAnswer: !sample.rightAnswer })}
      />
      <Button type="button" id="addSample" onClick={() => addSample(sample.description, sample.rightAnswer, onChange)}>
        +
      </Button>
    </Form.Group>
  )
}

export default AddSample
