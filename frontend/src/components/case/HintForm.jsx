import { useState } from 'react'
import { Modal, Form, Button, Table } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { updateCaseHints } from '../../reducers/caseReducer'
import * as Yup from 'yup'
import { useFormik } from 'formik'

const HintForm = ({ caseToUpdate }) => {
  const library = useSelector(state => state.language)?.library?.frontend.case.hintForm
  const validation = useSelector(state => state.language)?.validation?.case.hints.hint
  const user = useSelector(state => state.user)
  const tests = useSelector(state => state.test)?.sort((test1, test2) => test1.name.localeCompare(test2.name))
  const [hints, setHints] = useState(caseToUpdate.hints)
  const [currentTest, setCurrentTest] = useState(null)
  const dispatch = useDispatch()
  const saveUpdatedHints = () => {
    dispatch(
      updateCaseHints(
        caseToUpdate.id,
        hints
          .filter(hint => hint.hint.length > 0)
          .map(hint => {
            return { hint: hint.hint, test: hint.test.id }
          }),
        handleClose,
        user.token
      )
    )
  }
  const handleHintChange = event => {
    formik.handleChange(event)
    if (hints.filter(hint => hint.test.name === currentTest.name).length > 0) {
      setHints(
        hints.map(hintObj =>
          hintObj.test.name === currentTest.name ? { hint: event.target.value, test: hintObj.test } : hintObj
        )
      )
    } else {
      setHints(hints.concat({ hint: event.target.value, test: currentTest }))
    }
  }

  const handleTestChange = event => {
    setCurrentTest(tests.filter(test => test.id === event.target.value)[0])
  }

  const [show, setShow] = useState(false)
  const handleShow = () => setShow(true)
  const handleClose = () => setShow(false)

  const formik = useFormik({
    initialValues: {
      hint:
        hints.length > 0 &&
        currentTest &&
        hints.filter(pair => pair.test.id === currentTest.id) &&
        hints.filter(pair => pair.test.id === currentTest.id).length > 0
          ? hints.filter(hint => hint.test.name === currentTest.name)[0].hint
          : '',
    },
    onSubmit: saveUpdatedHints,
    validationSchema: Yup.object({
      hint: Yup.string()
        .max(validation.maxlength, validation.maxMessage)
        .min(validation.minlength, validation.minMessage),
    }),
  })

  return (
    <>
      <Button variant="outline-primary" className="small-margin-float-right" id="addHint" onClick={handleShow}>
        {library.add}
      </Button>
      <Modal show={show} size="xl" scrollable="true" onHide={handleClose}>
        <Modal.Header closeButton>{library.modalHeader}</Modal.Header>
        <Modal.Body>
          <Form onSubmit={formik.handleSubmit}>
            <Form.Label>{library.testErrorMessages}</Form.Label>
            {hints.filter(hint => hint.hint.length > 0).length > 0 ? (
              <Table>
                <thead>
                  <tr>
                    <th>{library.test}</th>
                    <th>{library.hint}</th>
                  </tr>
                </thead>
                <tbody>
                  {hints
                    .filter(hint => hint.hint.length > 0)
                    .map(hint => (
                      <tr key={hint.test.id}>
                        <td>{hint.test.name}</td>
                        <td>{hint.hint}</td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            ) : (
              <></>
            )}
            {tests ? (
              <div>
                <Form.Control id="selectTest" as="select" onChange={handleTestChange} defaultValue="default">
                  <option value="default" disabled hidden>
                    {library.chooseTest}
                  </option>
                  {tests.map(test => (
                    <option key={test.id} value={test.id}>
                      {test.name}
                    </option>
                  ))}
                </Form.Control>
                {currentTest ? (
                  <div>
                    <Form.Label>{`${currentTest.name}${library.errorMessage}`}</Form.Label>
                    <Form.Control
                      id="testHint"
                      name="hint"
                      onChange={handleHintChange}
                      value={
                        hints.filter(pair => pair.test.id === currentTest.id).length > 0
                          ? hints.filter(hint => hint.test.name === currentTest.name)[0].hint
                          : ''
                      }
                    />
                    {formik.touched.hint && formik.errors.hint ? <div>{formik.errors.hint}</div> : null}
                  </div>
                ) : (
                  <></>
                )}
              </div>
            ) : (
              <></>
            )}
            <Button id="saveEdit" variant="primary" type="submit">
              {library.save}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default HintForm
