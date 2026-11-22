import { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import { INITIAL_STATE } from '../utility.js'
import ShowPreviewImage from './ShowPreviewImage.js'

const AddImage = ({ title, name, value, setImage, imgPreview, setImgPreview, handleCancel, library }) => {
  const [inputResetter, newInput] = useState(0)

  const handleImageAdd = target => {
    if (target.files[0]) {
      setImgPreview(URL.createObjectURL(target.files[0]))
      setImage(target.files[0])
    } else {
      setImgPreview('')
      setImage(INITIAL_STATE)
    }
  }

  const cancelImage = event => {
    event.preventDefault()
    event.target.value = null
    const reset = Math.random()
    newInput(inputResetter + reset)
    handleCancel()
  }

  return (
    <Form.Group style={{ paddingTop: '20px' }} controlId={name}>
      <Form.Label>{title}</Form.Label>
      {imgPreview !== '' ? (
        <>
          <p style={{ marginLeft: '10px', marginTop: '20px', marginBottom: '10px', fontSize: '0.8em' }}>
            {library.newImage}
          </p>
          <ShowPreviewImage imgPreview={imgPreview}></ShowPreviewImage>
          <Button variant="warning" style={{ marginLeft: '30px' }} id="cancelImage" onClick={cancelImage}>
            {library.cancelAddedImage}
          </Button>
        </>
      ) : (
        <></>
      )}
      <Form.Control
        key={inputResetter}
        name={name}
        type="file"
        accept=".png, .jpg, .jpeg"
        value={value}
        onChange={({ target }) => {
          handleImageAdd(target)
        }}
      />
    </Form.Group>
  )
}

export default AddImage
