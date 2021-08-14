import React, { useState } from 'react'
import Samples from './components/Samples.js'
import AddSample from './components/AddSample.js'
import TestGroup from './components/TestGroup.js'
import SelectBacterium from './components/SelectBaterium.js'
import Name from './components/Name.js'
import TextEditField from './components/TextEditField'
import { useDispatch, useSelector } from 'react-redux'
import { addCase } from '../../reducers/caseReducer'
import { Modal, Button, Form, Accordion, Card, Image } from 'react-bootstrap'
import Notification from '../utility/Notification.js'
import * as Yup from 'yup'
import { Formik } from 'formik'
import { updateCase } from '../../reducers/caseReducer'
import ShowPreviewImage from '../test/components/ShowPreviewImage.js'
import '../../style.css'

const CaseForm = ({ caseToEdit }) => {
    const testsFromTestGroups = () => {
        const testIds = []

        for (const testGroup of caseToEdit.testGroups) {
            for (const testAlts of testGroup) {
                for (const t of testAlts.tests) {
                    testIds.push(t.test.id)
                }
            }
        }

        return testIds
    }

    /* initial parameters */
    const library = useSelector(state => state.language)?.library?.frontend.case.form
    const validation = useSelector(state => state.language)?.validation?.case
    const cases = useSelector(state => state.case)
    const bacteria = useSelector(state => state.bacteria)?.sort((bacterium1, bacterium2) => bacterium1.name.localeCompare(bacterium2.name))
    const user = useSelector(state => state.user)
    const tests = useSelector(state => state.test)?.sort((test1, test2) => test1.name.localeCompare(test2.name))
    /* initial parameters end*/

    /* parameters for style */
    const marginStyle = { margin: '10px' }
    /* parameters for style end*/

    /* states */
    const [name, setName] = useState(caseToEdit ? caseToEdit.name : '')
    const [bacteriumId, setBacteriumId] = useState(caseToEdit ? caseToEdit.bacterium.id : '')
    const [anamnesis, setAnamnesis] = useState(caseToEdit ? caseToEdit.anamnesis : '')
    const [completionText, setCompletionText] = useState(caseToEdit ? caseToEdit.completionText : '')
    const INITIAL_STATE = {
        id: '',
        image: undefined,
    }
    const [completionImage, setCompletionImage] = useState(INITIAL_STATE)
    const [deleteEndImage, setDeleteEndImage] = useState(false)
    const [img, setImg] = useState(caseToEdit && caseToEdit.completionImage ? true : false)
    const [sample, setSample] = useState({ description: '', rightAnswer: false })
    const [samples, setSamples] = useState(caseToEdit ? caseToEdit.samples : [])
    const [samplesAccordion, setSamplesAccodrion] = useState('0')
    const [testGroups, setTestGroups] = useState(caseToEdit ? caseToEdit.testGroups.map(testGroup => testGroup.slice().map(testForCase => { return { ...testForCase, tests: testForCase.tests.slice() } })) : [])
    const [addedTests, setAddedTests] = useState(caseToEdit ? testsFromTestGroups : [])
    const [testGroupAccordion, setTestGroupAccodrion] = useState('0')
    const [testGroupManagement, setTestGroupManagement] = useState(true)
    const [imgPreview, setImgPreview] = useState('')
    const [inputResetter, newInput] = useState(0)
    /* states end*/

    /* modal */
    const [show, setShow] = useState(false)
    const handleShow = () => {
        resetCaseForm()
        setShow(true)
    }
    const handleClose = () => {
        setShow(false)
        resetCaseForm()
    }
    /* modal end */

    const dispatch = useDispatch()

    /* schema for validation */
    const CaseSchema = Yup.object().shape({
        name: Yup.string()
            .min(validation.name.minlength, validation.name.minMessage)
            .max(validation.name.maxlength, validation.name.maxMessage)
            .required(validation.name.requiredMessage)
            .test('unique', validation.name.uniqueMessage, (name) => {
                if (caseToEdit) {
                    if (name === caseToEdit.name) {
                        return true
                    }
                }
                if (cases.map(c => c.name).includes(name)) {
                    return false
                }
                return true
            }),
        bacteriumId: Yup.string()
            .required(validation.bacterium.requiredMessage),
        sample: Yup.string()
            .test('unique', validation.samples.description.uniqueMessage, (sample) => {
                if (sample === '') {
                    return true
                }
                if (samples.map(s => s.description).includes(sample)) {
                    return false
                }
                return true
            })
            .max(validation.samples.description.maxlength, validation.samples.description.maxMessage),
        test: Yup.string()
            .test('unique', validation.test.uniqueMessage, (test) => {
                if (!test) {
                    return true
                }
                if (addedTests.includes(JSON.parse(test).id)) {
                    return false
                }
                return true
            }),
        anamnesis: Yup.string()
            .max(validation.anamnesis.maxlength, validation.anamnesis.maxMessage),
        completionText: Yup.string()
            .max(validation.completionText.maxlength, validation.completionText.maxMessage)
    })
    /* schema for validation end */

    /* form control */
    const onSuccess = () => {
        if (caseToEdit) {
            saveUpdatedCase()
        } else {
            addNewCase()
        }
    }

    const saveUpdatedCase = () => {
        const id = caseToEdit.id
        dispatch(updateCase(id, name,
            bacteriumId, anamnesis, completionText, completionImage, samples,
            testGroups, deleteEndImage, user.token, handleClose))
    }

    const addNewCase = () => {
        dispatch(addCase(name, bacteriumId, anamnesis, completionText, completionImage, samples, testGroups, user.token, handleClose))
    }

    const resetCaseForm = () => {
        setName(caseToEdit ? caseToEdit.name : '')
        setBacteriumId(caseToEdit ? caseToEdit.bacterium.id : '')
        setAnamnesis(caseToEdit  && caseToEdit.anamnesis ? caseToEdit.anamnesis : '')
        setCompletionText(caseToEdit && caseToEdit.completionText ? caseToEdit.completionText : '')
        setCompletionImage(INITIAL_STATE)
        setDeleteEndImage(false)
        setImg(caseToEdit && caseToEdit.completionImage ? true : false)
        setSample({ description: '', rightAnswer: false })
        setSamples(caseToEdit ? caseToEdit.samples : [])
        setTestGroups(caseToEdit ? caseToEdit.testGroups.map(testGroup => testGroup.slice().map(testForCase => { return { ...testForCase, tests: testForCase.tests.slice() } })) : [])
        setAddedTests(caseToEdit ? testsFromTestGroups : [])
        setImgPreview('')
    }
    /* form control end */

    /* sample control */
    const deleteSample = (sampleToDelete) => setSamples(samples.filter(s => s.description !== sampleToDelete.description))
    const addSample = (description, rightAnswer, onChange) => {
        if (description !== '') {
            if (!samples.map(sample => sample.description).includes(description)) {
                setSamples(samples.concat({ description, rightAnswer }))
                setSample({
                    description: '',
                    rightAnswer: false
                })
                onChange('sample', '')
            }
        }
    }
    /* sample control end */

    /* testgroup control */
    const removeTestGroup = (tg) => {
        let newTests = addedTests
        for (const testGroup of tg) {
            for (const test of testGroup.tests) {
                newTests = newTests.filter(testId => testId !== test.test.id)
            }
        }
        setAddedTests(newTests)
        setTestGroups(testGroups.filter(testgroup => testgroup !== tg))
    }

    const addTestGroup = () => {
        setTestGroups([...testGroups, []])
    }

    const addEmptyTestForCase = (testGroupIndex) => {
        let newTestGroups = testGroups.slice()
        newTestGroups[testGroupIndex].push({ tests: [], isRequired: false })
        setTestGroups(newTestGroups)
    }

    const removeTestForCase = (testGroupIndex, testForCaseIndex) => {
        let newTestGroups = testGroups.slice()
        let removedTests = []
        newTestGroups[testGroupIndex][testForCaseIndex].tests.forEach(test => removedTests.push(test.test.id))
        setAddedTests(addedTests.filter(testId => !removedTests.includes(testId)))
        newTestGroups[testGroupIndex] = newTestGroups[testGroupIndex].filter((testForCase, i) => i !== testForCaseIndex) //eslint-disable-line
        setTestGroups(newTestGroups)
    }

    const changeTestForCaseIsRequired = (testGroupIndex, testForCaseIndex) => {
        let newTestGroups = testGroups.slice()
        newTestGroups[testGroupIndex][testForCaseIndex].isRequired = !testGroups[testGroupIndex][testForCaseIndex].isRequired
        setTestGroups(newTestGroups)
    }

    const addTest = (testGroupIndex, testForCaseIndex, test) => {
        if (!addedTests.includes(test.id) && test.id) {
            let newTestGroups = testGroups.slice()
            newTestGroups[testGroupIndex][testForCaseIndex].tests.push({ test, positive: false })
            setTestGroups(newTestGroups)
            setAddedTests(addedTests.concat(test.id))
        }
    }

    const removeTest = (testGroupIndex, testForCaseIndex, testIndex) => {
        let newTestGroups = testGroups.slice()
        setAddedTests(addedTests.filter(testId => testId !== newTestGroups[testGroupIndex][testForCaseIndex].tests[testIndex].test.id))
        newTestGroups[testGroupIndex][testForCaseIndex].tests = newTestGroups[testGroupIndex][testForCaseIndex].tests.filter((test, i) => i !== testIndex) //eslint-disable-line
        setTestGroups(newTestGroups)
    }

    const changeTestPositive = (testGroupIndex, testForCaseIndex, testIndex) => {
        let newTestGroups = testGroups.slice()
        newTestGroups[testGroupIndex][testForCaseIndex].tests[testIndex].positive = !testGroups[testGroupIndex][testForCaseIndex].tests[testIndex].positive
        setTestGroups(newTestGroups)
    }
    /* testgroup control end */

    /* image */
    const handleImageAdd = (event) => {
        if (event.target.files[0]) {
            setImgPreview(URL.createObjectURL(event.target.files[0]))
            setCompletionImage(event.target.files[0])
        } else {
            setImgPreview('')
            setCompletionImage(INITIAL_STATE)
        }
    }

    const cancelImgChange = (event) => {
        event.preventDefault()
        event.target.value = null
        const reset = Math.random()
        newInput(inputResetter + reset)
        setImgPreview('')
        setCompletionImage(INITIAL_STATE)
    }
    /* image end */

    const testGroupSwitch = (a, b) => {
        let newTestGroups = testGroups.slice()
        newTestGroups[a] = testGroups[b]
        newTestGroups[b] = testGroups[a]
        setTestGroups(newTestGroups)
    }

    return (
        <div className='formtext'>
            <Modal>
                <Notification></Notification>
            </Modal>
            <Button id={caseToEdit ? 'caseEditButton' : 'caseModalButton'} className="small-margin-float-right" variant='primary' onClick={handleShow}>
                {caseToEdit ? library.edit : library.add}
            </Button>
            <Modal show={show} size='xl' scrollable='true' onHide={handleClose} backdrop='static'>
                <Modal.Header closeButton>{caseToEdit ? library.edit : library.add}</Modal.Header>
                <Modal.Body>
                    <Formik
                        validationSchema={CaseSchema}
                        onSubmit={onSuccess}
                        initialValues={{
                            name: name,
                            bacteriumId: bacteriumId,
                            sample: '',
                            test: '',
                            anamnesis: '',
                            completionText: ''
                        }}
                    >
                        {({
                            handleSubmit,
                            errors,
                            setFieldValue,
                            touched,
                            setFieldTouched
                        }) => {
                            return (
                                <Form noValidate onSubmit={handleSubmit}>
                                    <Name
                                        name={name}
                                        setName={setName}
                                        onChange={setFieldValue}
                                        error={errors.name}
                                        touched={touched.name}
                                        setFieldTouched={setFieldTouched}
                                    ></Name>
                                    <SelectBacterium
                                        bacteriumId={bacteriumId}
                                        setBacteriumId={setBacteriumId}
                                        bacteria={bacteria}
                                        onChange={setFieldValue}
                                        error={errors.bacteriumId}
                                        touched={touched.bacteriumId}
                                        setFieldTouched={setFieldTouched}
                                    ></SelectBacterium>
                                    <Form.Group id='anamnesis'>
                                        <Form.Label>{library.anamnesis}</Form.Label>
                                        <TextEditField
                                            fieldId='anamnesisField'
                                            value={anamnesis}
                                            handleChange={(value) => {
                                                setFieldTouched('anamnesis', true, true)
                                                setAnamnesis(value)
                                                setFieldValue('anamnesis', value)
                                            }}
                                            invalid={errors.anamnesis && touched.anamnesis}
                                        />
                                        <Form.Control.Feedback type='invalid' style={{ display: 'block' }} hidden={!touched.anamnesis}>
                                            {errors.anamnesis}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group id='completionText'>
                                        <Form.Label>{library.completionText}</Form.Label>
                                        <TextEditField
                                            fieldId='completionTextField'
                                            value={completionText}
                                            handleChange={(value) => {
                                                setFieldTouched('completionText', true, true)
                                                setCompletionText(value)
                                                setFieldValue('completionText', value)
                                            }}
                                            invalid={errors.completionText && touched.completionText}
                                        />
                                        <Form.Control.Feedback type='invalid' style={{ display: 'block' }} hidden={!touched.completionText}>
                                            {errors.completionText}
                                        </Form.Control.Feedback>
                                        <br></br>
                                    </Form.Group>
                                    <div style={ { marginBottom: '40px' } }>
                                        {caseToEdit ?
                                            <Form.Group controlId='editCompletionImage'>
                                                <Form.Label style={marginStyle}>{library.completionImage}</Form.Label>
                                                <br />
                                                {imgPreview !== '' ?
                                                    <>
                                                        <p style={ { marginLeft: '10px', marginTop: '20px', marginBottom: '10px', fontSize: '0.8em' } }>{ library.newImage }</p>
                                                        <ShowPreviewImage imgPreview ={ imgPreview }></ShowPreviewImage>
                                                        <Button variant='warning' style={ { marginLeft: '30px' } } id='cancelImage' onClick={ cancelImgChange }>{library.cancelAddedImage}</Button>
                                                    </>
                                                    :
                                                    <></>
                                                }
                                                <Form.Control
                                                    key={inputResetter}
                                                    style={{ marginLeft: '10px', marginTop: '20px', marginBottom: '10px', marginRight: '15px' }}
                                                    name='editCompletionImg'
                                                    value={completionImage.image}
                                                    type='file'
                                                    accept=".png, .jpg, .jpeg"
                                                    onChange={handleImageAdd}
                                                />
                                                {img && caseToEdit.completionImage ?
                                                    <>
                                                        <p style={ { marginLeft: '10px', marginTop: '20px', marginBottom: '0', fontSize: '0.8em' } }>{ library.oldImage }</p>
                                                        <Image style={marginStyle} src={`/${caseToEdit.completionImage.url}`} thumbnail width={100} />
                                                        <Button variant='danger' style={marginStyle} id='deleteImage' onClick={() => { setImg(false); setDeleteEndImage(true) }}>{library.deleteCompletionImage}
                                                            <svg width='1em' height='1em' viewBox='0 0 16 16' className='bi bi-trash' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
                                                                <path d='M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z' />
                                                                <path fillRule='evenodd' d='M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z' />
                                                            </svg>
                                                        </Button>
                                                    </>
                                                    :
                                                    <></>
                                                }
                                            </Form.Group> :
                                            <Form.Group controlId='completionImage' style={{ marginBottom: '20px' }}>
                                                <Form.Label>{library.completionImage}</Form.Label>
                                                <br />
                                                {imgPreview !== '' ?
                                                    <>
                                                        <p style={ { marginLeft: '10px', marginTop: '20px', marginBottom: '10px', fontSize: '0.8em' } }>{ library.newImage }</p>
                                                        <ShowPreviewImage imgPreview ={ imgPreview }></ShowPreviewImage>
                                                        <Button variant='warning' style={ { marginLeft: '30px' } } id='cancelImage' onClick={ cancelImgChange }>{library.cancelAddedImage}</Button>
                                                    </>
                                                    :
                                                    <></>
                                                }
                                                <Form.Control
                                                    key={inputResetter}
                                                    name='completionImage'
                                                    type='file'
                                                    value={completionImage.image}
                                                    accept=".png, .jpg, .jpeg"
                                                    onChange={handleImageAdd} />
                                            </Form.Group>
                                        }
                                    </div>
                                    <Accordion activeKey={samplesAccordion}>
                                        <Card>
                                            <Accordion.Toggle as={Card.Header} onClick={() => setSamplesAccodrion(samplesAccordion === '-1' ? '0' : '-1')}><Form.Label>{library.samples.titleStart}{samplesAccordion === '-1' ? library.samples.toShow : library.samples.toHide}{library.samples.titleEnd}</Form.Label></Accordion.Toggle>
                                            <Accordion.Collapse eventKey='0'>
                                                <Card.Body>
                                                    <Samples samples={samples}
                                                        deleteSample={deleteSample}></Samples>
                                                    <AddSample
                                                        sample={sample}
                                                        samples={samples}
                                                        setSample={setSample}
                                                        addSample={addSample}
                                                        error={errors.sample}
                                                        onChange={setFieldValue}
                                                        setFieldTouched={setFieldTouched}
                                                        touched={touched.sample}
                                                    ></AddSample>
                                                </Card.Body>
                                            </Accordion.Collapse>
                                        </Card>
                                    </Accordion>
                                    <Accordion activeKey={testGroupAccordion}>
                                        <Card>
                                            <Accordion.Toggle as={Card.Header} onClick={() => setTestGroupAccodrion(testGroupAccordion === '-1' ? '0' : '-1')}><Form.Label>{library.testGroups.titleStart}{testGroupAccordion === '-1' ? library.testGroups.toShow : library.testGroups.toHide}{library.testGroups.titleEnd}</Form.Label></Accordion.Toggle>
                                            <Accordion.Collapse eventKey='0'>
                                                <Card.Body>
                                                    <Form.Check
                                                        label={library.testGroups.showEdit}
                                                        type='checkbox'
                                                        id='showTestGroupManagement'
                                                        checked={testGroupManagement}
                                                        onChange={() => setTestGroupManagement(!testGroupManagement)} />
                                                    {testGroups.map((testGroup, i) =>
                                                        <TestGroup key={i}
                                                            testgroup={testGroup}
                                                            index={i}
                                                            removeTestGroup={removeTestGroup}
                                                            testGroupsSize={testGroups.length}
                                                            testGroupSwitch={testGroupSwitch}
                                                            addEmptyTestForCase={addEmptyTestForCase}
                                                            removeTestForCase={removeTestForCase}
                                                            changeTestForCaseIsRequired={changeTestForCaseIsRequired}
                                                            addTest={addTest}
                                                            removeTest={removeTest}
                                                            changeTestPositive={changeTestPositive}
                                                            tests={tests}
                                                            addedTests={addedTests}
                                                            testGroupManagement={testGroupManagement}
                                                        />
                                                    )}
                                                    {testGroupManagement ? <Button id='addTestGroup' onClick={() => addTestGroup()} block>{library.testGroups.startNewTestGroup}</Button> : <></>}
                                                </Card.Body>
                                            </Accordion.Collapse>
                                        </Card>
                                    </Accordion>
                                    {caseToEdit ? <Button id='saveEdit' variant='success' type='submit'>
                                        {library.saveEdit}
                                    </Button> : <Button
                                        variant='success'
                                        type='submit'
                                        id='addCase'>
                                        {library.saveNew}
                                    </Button>}
                                    { Object.keys(errors).length > 0 ?
                                        <p style={{ color: 'red' }}>{library.validationError}</p>
                                        : null
                                    }
                                </Form>
                            )
                        }}
                    </Formik>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default CaseForm
