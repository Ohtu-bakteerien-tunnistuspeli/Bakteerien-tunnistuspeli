import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { register } from '../../reducers/userReducer'
import { useHistory } from 'react-router-dom'
import { Form, Button, Modal } from 'react-bootstrap'
import { setNotification } from '../../reducers/notificationReducer'
import PasswordQualityIndicator from './components/PasswordQualityIndicator'
import Password from './components/Password'
import ValidatedTextField from './components/ValidatedTextField'
import Classgroup from './components/Classgroup'
import GDBRText from './GDPRText'
import PrivacyText from './PrivacyText'
import * as Yup from 'yup'
import { Formik } from 'formik'

const Register = () => {
  const validation = useSelector(state => state.language)?.validation?.user
  const library = useSelector(state => state.language)?.library?.frontend.user.register
  const dispatch = useDispatch()
  const history = useHistory()
  const [accept, setAccept] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showModal2, setShowModal2] = useState(false)
  const [username, setNewUsername] = useState('')
  const [password, setNewPassword] = useState('')
  const [email, setNewEmail] = useState('')
  const [studentNumber, setNewStudentNumber] = useState('')
  const [classGroup, setNewClassgroup] = useState('')
  const checkPassWord = require('zxcvbn') // eslint-disable-line

  const UserSchema = Yup.object().shape({
    username: Yup.string()
      .required(validation.username.requiredMessage)
      .min(validation.username.minlength, validation.username.minMessage)
      .max(validation.username.maxlength, validation.username.maxMessage),
    password: Yup.string()
      .required(validation.password.requiredMessage)
      .min(validation.password.minlength, validation.password.minMessage)
      .max(validation.password.maxlength, validation.password.maxMessage)
      .test('secure', validation.password.unsecurePasswordMessage, password => {
        if (password) {
          if (checkPassWord(password).score < 2) {
            return false
          }
        }
        return true
      })
      .when('username', {
        is: true,
        then: Yup.string().notOneOf([Yup.ref('username'), null], validation.password.uniqueMessage),
        otherwise: Yup.string().required(validation.password.requiredMessage),
      })
      .when('email', {
        is: true,
        then: Yup.string().notOneOf([Yup.ref('email'), null], validation.password.uniqueMessage),
        otherwise: Yup.string().required(validation.password.requiredMessage),
      })
      .when('classGroup', {
        is: true,
        then: Yup.string().notOneOf([Yup.ref('classGroup'), null], validation.password.uniqueMessage),
        otherwise: Yup.string().required(validation.password.requiredMessage),
      })
      .when('studentNumber', {
        is: true,
        then: Yup.string().notOneOf([Yup.ref('studentNumber'), null], validation.password.uniqueMessage),
        otherwise: Yup.string().required(validation.password.requiredMessage),
      }),
    passwordAgain: Yup.string(),
    email: Yup.string()
      .required(validation.email.requiredMessage)
      .email(validation.email.validationMessage)
      .max(validation.email.maxlength, validation.email.maxMessage),
    classGroup: Yup.string()
      .test('validation', validation.classGroup.validationMessage, classGroup => {
        if (!classGroup) {
          return true
        }
        if (classGroup === '') {
          return true
        }
        if (classGroup === 'C-') {
          return true
        }
        return /^C-[0-9]*$|^C-$/.test(classGroup)
      })
      .max(validation.classGroup.maxlength, validation.classGroup.maxMessage),
    studentNumber: Yup.string()
      .test('unique', validation.studentNumber.validationMessage, studentNumber => {
        if (!studentNumber) {
          return true
        }
        return /^[0-9]+$/.test(studentNumber)
      })
      .max(validation.studentNumber.maxlength, validation.studentNumber.maxMessage),
  })

  const handleRegister = async values => {
    if (accept) {
      if (password === values.passwordAgain) {
        dispatch(register(username, email, studentNumber, `C-${classGroup}`, password.trim(), history))
      } else {
        dispatch(setNotification({ message: library.samePasswordAndSecondPassword, success: false }))
      }
    } else {
      dispatch(setNotification({ message: library.gdbr, success: false }))
    }
  }

  return (
    <div>
      <h2>{library.title}</h2>
      <Formik
        validationSchema={UserSchema}
        onSubmit={handleRegister}
        initialValues={{
          username: '',
          password: '',
          passwordAgain: '',
          email: '',
          classGroup: 'C-',
          studentNumber: '',
        }}
      >
        {({ handleSubmit, errors, setFieldValue, touched, values, setFieldTouched }) => {
          return (
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <ValidatedTextField
                  namedClass="required-field"
                  value={username}
                  username={username}
                  onChange={setFieldValue}
                  error={errors.username}
                  touched={touched.username}
                  setFieldTouched={setFieldTouched}
                  setValue={setNewUsername}
                  fieldId="username"
                />
                <ValidatedTextField
                  namedClass="required-field"
                  value={email}
                  email={email}
                  onChange={setFieldValue}
                  error={errors.email}
                  touched={touched.email}
                  setFieldTouched={setFieldTouched}
                  setValue={setNewEmail}
                  fieldId="email"
                />
                <ValidatedTextField
                  studentnumber={studentNumber}
                  value={studentNumber}
                  onChange={setFieldValue}
                  error={errors.studentNumber}
                  touched={touched.studentNumber}
                  setFieldTouched={setFieldTouched}
                  setValue={setNewStudentNumber}
                  fieldId="studentNumber"
                />
                <Classgroup
                  classgroup={classGroup}
                  value={classGroup}
                  onChange={setFieldValue}
                  error={errors.classGroup}
                  touched={touched.classGroup}
                  setFieldTouched={setFieldTouched}
                  setClassgroup={setNewClassgroup}
                />
                <Password
                  typeControlId="password"
                  controlId={'password'}
                  namedClass="required-field"
                  password={password}
                  value={password}
                  label={library.password}
                  onChange={setFieldValue}
                  error={errors.password}
                  touched={touched.password}
                  setFieldTouched={setFieldTouched}
                  setPassword={setNewPassword}
                />
                <PasswordQualityIndicator
                  value={checkPassWord(values.password).score}
                  show={values.password.length > 0}
                  messages={validation.password}
                />
                <Form.Label className="required-field">{library.passwordAgain}</Form.Label>
                <Form.Control
                  type="password"
                  id="passwordAgain"
                  isInvalid={errors.passwordAgain && touched.passwordAgain}
                  onChange={event => setFieldValue('passwordAgain', event.target.value)}
                />
                <div className="form-group form-inline">
                  <Form.Label className="required-field">
                    {library.readTermsStart}&nbsp;
                    {
                      <a href="#" onClick={() => setShowModal(true)}>
                        {library.terms}
                      </a> //eslint-disable-line
                    }
                    &nbsp;{library.and}&nbsp;
                    {
                      <a href="#" onClick={() => setShowModal2(true)}>
                        {library.privacy}
                      </a> //eslint-disable-line
                    }
                    &nbsp;
                  </Form.Label>
                  <Form.Check
                    type="checkbox"
                    label=""
                    id="acceptCheckBox"
                    value={accept}
                    onChange={() => setAccept(!accept)}
                  />
                </div>
                <Button id="submit" variant="success" type="submit">
                  {library.button}
                </Button>
              </Form.Group>
            </Form>
          )
        }}
      </Formik>
      <Modal show={showModal} size="lg" onHide={() => setShowModal(false)}>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <GDBRText></GDBRText>
        </Modal.Body>
      </Modal>
      <Modal show={showModal2} size="lg" onHide={() => setShowModal2(false)}>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <PrivacyText></PrivacyText>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default Register
