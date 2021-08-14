import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addTest } from '../../reducers/testReducer'
import { Modal, Button, Form, Image } from 'react-bootstrap'
import BacteriaSpecificImages from './BacteriaSpecificImages'
import Name from './components/Name.js'
import Type from './components/Type.js'
import DeleteButton from '../utility/DeleteButton.js'
import AddImage from './components/AddImage.js'
import { INITIAL_STATE, marginStyle } from './utility'
import { deleteTest, updateTest } from '../../reducers/testReducer'
import * as Yup from 'yup'
import { Formik } from 'formik'
import Notification from '../utility/Notification'
import { setNotification } from '../../reducers/notificationReducer'
import '../../style.css'

const TestForm = ({ testToEdit }) => {
    /* style parameters */
    const style = { margin: '10px', float: 'right' }
    /* style parameters end */

    /* initial parameters */
    const library = useSelector(state => state.language)?.library?.frontend.test.form
    const validation = useSelector(state => state.language)?.validation?.testCase
    const tests = useSelector(state => state.test)
    const bacteria = useSelector(state => state.bacteria)?.sort((bacterium1, bacterium2) => bacterium1.name.localeCompare(bacterium2.name))
    const user = useSelector(state => state.user)
    const dispatch = useDispatch()
    /* initial parameters end */

    /* states */
    const [testName, setTestName] = useState(testToEdit ? testToEdit.name : '')
    const [testType, setTestType] = useState(testToEdit ? testToEdit.type : '')
    const [bacterium, setBacterium] = useState('')
    const [controlImage, setControlImage] = useState(INITIAL_STATE)
    const [positiveResultImage, setPositiveResultImage] = useState(INITIAL_STATE)
    const [negativeImage, setNegativeImage] = useState(INITIAL_STATE)
    const [bacteriaSpecificImages, setBacteriaImages] = useState(testToEdit && testToEdit.bacteriaSpecificImages.length > 0 ? testToEdit.bacteriaSpecificImages : [])
    const [bacteriaSpecificImage, setBacteriaImage] = useState(INITIAL_STATE)
    const [deletePhotos, setDeletePhotos] = useState({ ctrl: false, pos: false, neg: false })
    const [deleteSpecifics, setDeleteSpecifics] = useState([])
    const [pos, setPos] = useState(testToEdit ? testToEdit.positiveResultImage ? true : false : false)
    const [neg, setNeg] = useState(testToEdit ? (testToEdit.negativeResultImage ? true : false) : false)
    const [ctrl, setCtrl] = useState(testToEdit ? testToEdit.controlImage ? true : false : false)
    const [imgPreviewCtrl, setImgPreviewCtrl] = useState('')
    const [imgPreviewNeg, setImgPreviewNeg] = useState('')
    const [imgPreviewPos, setImgPreviewPos] = useState('')
    const [addedBacteriaImage, setAddedBacteriaImage] = useState(testToEdit ? testToEdit.bacteriaSpecificImages.map(bacImg => bacImg.bacterium.name) : [])
    /* states end */

    /* modal control */
    const [show, setShow] = useState(false)
    const handleShow = () => {
        resetTestForm()
        setShow(true)
    }
    const handleClose = () => {
        resetTestForm()
        setShow(false)
    }
    /* modal control end */

    /* form control */
    const addTests = () => {
        const totalFileSize = countTotalFileSizeForImages()
        if (totalFileSize <= 50e6) {
            dispatch(addTest(testName,
                testType,
                controlImage,
                positiveResultImage,
                negativeImage,
                bacteriaSpecificImages,
                user.token, handleClose))
        } else {
            dispatch(setNotification({ message: library.saveError, success: false, show: true }))
        }
    }

    const countTotalFileSizeForImages = () => {
        let totalSize = 0
        totalSize += controlImage && controlImage.size ? controlImage.size : 0
        totalSize += positiveResultImage && positiveResultImage.size ? positiveResultImage.size : 0
        totalSize += negativeImage && negativeImage.size ? negativeImage.size : 0
        bacteriaSpecificImages.forEach(image => totalSize += image.size ? image.size : 0)
        return totalSize
    }

    const resetTestForm = () => {
        setBacteriaImages(testToEdit && testToEdit.bacteriaSpecificImages.length > 0 ? testToEdit.bacteriaSpecificImages : [])
        setTestName(testToEdit ? testToEdit.name : '')
        setTestType(testToEdit ? testToEdit.type : '')
        setBacterium('')
        setControlImage(INITIAL_STATE)
        setPositiveResultImage(INITIAL_STATE)
        setNegativeImage(INITIAL_STATE)
        setBacteriaImage(INITIAL_STATE)
        setDeletePhotos({ ctrl: false, pos: false, neg: false })
        setDeleteSpecifics([])
        setPos(testToEdit ? testToEdit.positiveResultImage ? true : false : false)
        setNeg(testToEdit ? (testToEdit.negativeResultImage ? true : false) : false)
        setCtrl(testToEdit ? testToEdit.controlImage ? true : false : false)
        setImgPreviewCtrl('')
        setImgPreviewNeg('')
        setImgPreviewPos('')
        setAddedBacteriaImage(testToEdit ? testToEdit.bacteriaSpecificImages.map(bacImg => bacImg.bacterium.name) : [])
    }

    const removeTest = () => {
        dispatch(deleteTest(testToEdit.id, user.token))
    }

    const editTest = () => {
        const photosToDelete = deletePhotos
        const token = user.token
        const id = testToEdit.id
        const totalFileSize = countTotalFileSizeForImages()
        if (totalFileSize <= 50e6) {
            dispatch(updateTest(id, testName,
                testType, controlImage,
                positiveResultImage, negativeImage,
                bacteriaSpecificImages,
                photosToDelete,
                deleteSpecifics,
                token, handleClose, setDeletePhotos, setDeleteSpecifics))
        } else {
            dispatch(setNotification({ message: library.saveError, success: false, show: true }))
        }
    }
    /* form control end */


    /* schema for validation */
    const TestSchema = Yup.object().shape({
        testName: Yup.string()
            .min(validation.name.minlength, validation.name.minMessage)
            .max(validation.name.maxlength, validation.name.maxMessage)
            .required(validation.name.requiredMessage)
            .test('unique', validation.name.uniqueMessage, (name) => {
                if (testToEdit) {
                    if (name === testToEdit.name) {
                        return true
                    }
                }
                if (tests.map(c => c.name).includes(name)) {
                    return false
                }
                return true
            }),
        testType: Yup.string()
            .required(validation.type.requiredMessage),
        bacteriumName: Yup.string()
            .test('unique', validation.bacteriumImage.uniqueMessage, (bacteriumName) => {
                if (!bacteriumName || bacteriumName === '') {
                    return true
                }
                if (addedBacteriaImage.includes(bacteriumName)) {
                    return false
                }
                return true
            })

    })
    /* schema for validation end */

    const onSuccess = () => {
        if (testToEdit) {
            editTest()
        } else {
            addTests()
        }
    }

    const addBacteriumSpecificImage = () => {
        if (!bacterium) {
            return
        }
        if (bacteriaSpecificImage !== INITIAL_STATE) {
            if (bacteriaSpecificImage.name !== 'default' && bacterium !== 'default') {
                let newFile = null
                if (bacteriaSpecificImages === undefined || bacteriaSpecificImage.name !== bacterium) {
                    let file = bacteriaSpecificImage
                    let blob = file.slice(0, file.size, file.type)
                    newFile = new File([blob], bacterium, { type: file.type })
                    setBacteriaImage(newFile)
                }
                if (!newFile) {
                    newFile = bacteriaSpecificImage
                }
                setBacteriaImages(bacteriaSpecificImages.concat(newFile))
                setDeleteSpecifics(deleteSpecifics.filter(img => img !== newFile.name))
                setBacteriaImage(INITIAL_STATE)
                setBacterium('')
                setAddedBacteriaImage(addedBacteriaImage.concat(bacterium))
            }
        }
    }

    const removeBacteriaSpecificImage = (image) => {
        let name = image.name ? image.name : image.bacterium.name
        setDeleteSpecifics(deleteSpecifics.concat(name))
        setBacteriaImages(bacteriaSpecificImages.filter(img => img.bacterium?.name !== name && img.name !== name))
        setAddedBacteriaImage(addedBacteriaImage.filter(bac => bac !== name))
    }

    const handleSpecificImg = (event) => {
        if (event.target.files[0]) {
            let file = event.target.files[0]
            let blob = file.slice(0, file.size, file.type)
            let newFile = new File([blob], bacterium, { type: file.type })
            setBacteriaImage(newFile)
        }
    }

    const cancelPosChange = () => {
        setImgPreviewPos('')
        setPositiveResultImage(INITIAL_STATE)
    }

    const cancelNegChange = () => {
        setImgPreviewNeg('')
        setNegativeImage(INITIAL_STATE)
    }

    const cancelCtrlChange = () => {
        setImgPreviewCtrl('')
        setControlImage(INITIAL_STATE)
    }

    return (
        <div className='formtext'>
            <Modal>
                <Notification></Notification>
            </Modal>
            <Button style={style}
                id={testToEdit ? 'testEditButton' : 'testModalButton'}
                variant='primary'
                onClick={() => handleShow()}>
                {testToEdit ? library.edit : library.add}
            </Button>
            <Modal show={show} size='xl' scrollable='true' onHide={handleClose} backdrop='static'>
                <Modal.Header
                    closeButton>{testToEdit ? library.add : library.add}
                </Modal.Header>
                <Modal.Body>
                    {testToEdit ?
                        <DeleteButton id='deleteTest'
                            onClick={() => {
                                if (window.confirm(library.deleteConfirm)) {
                                    removeTest()
                                }
                            }}
                            text={library.deleteTest}
                        ></DeleteButton>
                        : null
                    }
                    <Formik
                        validationSchema={TestSchema}
                        onSubmit={onSuccess}
                        initialValues={{
                            testName: testName,
                            testType: testType,
                            bacteriumName: bacterium
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
                                <Form
                                    noValidate
                                    onSubmit={handleSubmit}
                                    encType='multipart/form-data'>
                                    <Name nameControlId='name'
                                        testName={testName}
                                        onChange={setFieldValue}
                                        error={errors.testName}
                                        touched={touched.testName}
                                        setTestName={setTestName}
                                        setFieldTouched={setFieldTouched}></Name>

                                    <Type typeControlId='type'
                                        testType={testType}
                                        onChange={setFieldValue}
                                        error={errors.testType}
                                        touched={touched.testType}
                                        setTestType={setTestType}
                                        setFieldTouched={setFieldTouched}></Type>

                                    <div style={{ padding:'10px', border: '1px solid #cccccc', borderRadius: '5px', marginTop: '40px', marginLeft: 0 }}>
                                        <AddImage
                                            title={library.controlImage}
                                            name='controlImage'
                                            value={controlImage.image}
                                            setImage={setControlImage}
                                            imgPreview={imgPreviewCtrl}
                                            setImgPreview={setImgPreviewCtrl}
                                            handleCancel={cancelCtrlChange}
                                            library={library}
                                        ></AddImage>
                                        {testToEdit ?
                                            <Form.Group controlId='editControlImage'>
                                                {ctrl && testToEdit.controlImage ?
                                                    <>
                                                        <p>{ library.oldImage }</p>
                                                        <Image src={`/${testToEdit.controlImage.url}`} thumbnail width={100} />
                                                        <DeleteButton
                                                            id='deleteControl'
                                                            onClick={() => {
                                                                setCtrl(false)
                                                                setDeletePhotos({ ...deletePhotos, ctrl: true })
                                                            }}
                                                            text={library.deleteControlImage}
                                                        ></DeleteButton>
                                                    </>
                                                    : <></>
                                                }
                                            </Form.Group>
                                            :
                                            null
                                        }
                                    </div>

                                    <div style={{ padding:'10px', border: '1px solid #cccccc', borderRadius: '5px' }}>
                                        <AddImage
                                            title={library.positiveDefault}
                                            name='posImg'
                                            value={positiveResultImage.image}
                                            setImage={setPositiveResultImage}
                                            imgPreview={imgPreviewPos}
                                            setImgPreview={setImgPreviewPos}
                                            handleCancel={cancelPosChange}
                                            library={library}
                                        ></AddImage>

                                        {testToEdit ?
                                            <Form.Group controlId='editPositiveResultImage'>
                                                {pos && testToEdit.positiveResultImage ?
                                                    <>
                                                        <p>{ library.oldImage }</p>
                                                        <Image src={`/${testToEdit.positiveResultImage.url}`} thumbnail width={100} />
                                                        <DeleteButton
                                                            id='deletePositive'
                                                            onClick={() => {
                                                                setPos(false)
                                                                setDeletePhotos({ ...deletePhotos, pos: true })
                                                            }}
                                                            text={library.deletePositiveImage}
                                                        ></DeleteButton>
                                                    </>
                                                    : <></>
                                                }
                                            </Form.Group>
                                            :
                                            null
                                        }
                                    </div>

                                    <div style={{ padding:'10px', border: '1px solid #cccccc', borderRadius: '5px' }}>
                                        <AddImage
                                            title={library.negativeDefault}
                                            name='negImg'
                                            value={negativeImage.image}
                                            setImage={setNegativeImage}
                                            imgPreview={imgPreviewNeg}
                                            setImgPreview={setImgPreviewNeg}
                                            handleCancel={cancelNegChange}
                                            library={library}
                                        ></AddImage>
                                        {testToEdit ?
                                            <Form.Group controlId='editNegativeResultImage'>
                                                {neg && testToEdit.negativeResultImage ?
                                                    <>
                                                        <p>{ library.oldImage }</p>
                                                        <Image src={`/${testToEdit.negativeResultImage.url}`} thumbnail width={100} />
                                                        <DeleteButton
                                                            id='deleteNegative'
                                                            onClick={() => {
                                                                setNeg(false)
                                                                setDeletePhotos({ ...deletePhotos, neg: true })
                                                            }}
                                                            text={library.deleteNegativeImage}
                                                        ></DeleteButton>
                                                    </>
                                                    : <></>
                                                }
                                            </Form.Group>
                                            :
                                            null
                                        }
                                    </div>

                                    <BacteriaSpecificImages
                                        controlId={testToEdit ? 'editBacteriaSpecificImages' : 'bacteriaSpecificImages'}
                                        setBacterium={setBacterium}
                                        bacteria={bacteria}
                                        bacterium={bacterium}
                                        handleSpecificImg={handleSpecificImg}
                                        bacteriaSpecificImages={bacteriaSpecificImages}
                                        bacteriaSpecificImage={bacteriaSpecificImage}
                                        addBacteriumSpecificImage={addBacteriumSpecificImage}
                                        removeBacteriaSpecificImage={removeBacteriaSpecificImage}
                                        marginStyle={marginStyle}
                                        addedBacteriaImage={addedBacteriaImage}
                                        onChange={setFieldValue}
                                        error={errors.bacteriumName}
                                        touched={touched.bacteriumName}
                                    />
                                    <Button id={testToEdit ? 'saveChanges' : 'addTest'} variant='success' type='submit'>{testToEdit ? library.saveEdit : library.saveNew}</Button>
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

export default TestForm



