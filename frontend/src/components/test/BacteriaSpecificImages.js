import React, { useState } from 'react'
import { Button, Form, Image } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import '../../style.css'

const BacteriaSpecificImages = ({ controlId, setBacterium, bacteria,
    bacterium, handleSpecificImg,
    bacteriaSpecificImages, bacteriaSpecificImage,
    addBacteriumSpecificImage, removeBacteriaSpecificImage,
    marginStyle, onChange, error, addedBacteriaImage }) => {
    const library = useSelector(state => state.language)?.library?.frontend.test.bacteriaImages
    const [inputResetter, newInput] = useState(0) //eslint-disable-line

    const handleChange = (event) => {
        event.preventDefault()
        setBacterium(event.target.value)
        onChange('bacteriumName', event.target.value)
    }

    const handleAdd = (event) => {
        event.preventDefault()
        onChange('bacteriumName', '')
        event.target.value = null
        const reset = Math.random()
        newInput(inputResetter + reset)
        addBacteriumSpecificImage()
    }

    return (
        <Form.Group controlId={controlId}>
            <Form.Label style={{ paddingTop: '40px' }}><h4>{library.title}</h4></Form.Label>
            <ul >
                {bacteriaSpecificImages.map((image, i) => {
                    return (
                        <li className='imagetext' key={i}>{image.name ? image.name : image.bacterium.name} &ensp;&ensp;
                            {image.url ?
                                <Image src={`/${image.url}`} thumbnail width={100} /> :
                                <Image src={URL.createObjectURL(image)} width={100}></Image>
                            }
                            <Button
                                onClick={() => removeBacteriaSpecificImage(image)}
                                variant='danger'
                                size='sm'>
                                {library.deleteImage}
                            </Button>
                        </li>
                    )
                }
                )}
            </ul>
            <Form.Label style={marginStyle}>{library.bacterium}</Form.Label>
            <Form.Control
                as='select'
                className='fomrtext'
                value={bacterium}
                isInvalid={error}
                onChange={(event) => handleChange(event)}>
                <option value='' disabled hidden>{library.chooseBacterium}</option>
                {bacteria.filter(bact => !addedBacteriaImage.includes(bact.name)).map(bact =>
                    <option key={bact.id} value={bact.name}>{bact.name}</option>
                )}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
                {error}
            </Form.Control.Feedback>
            <Form.Control
                key={inputResetter}
                style={marginStyle}
                name='bacteriaSpecificImage'
                type='file'
                accept=".png, .jpg, .jpeg"
                value={bacteriaSpecificImage.image}
                onChange={handleSpecificImg}
            />
            <Button style={marginStyle} type='button' onClick={handleAdd}>{library.saveImage}</Button>
        </Form.Group>
    )
}

export default BacteriaSpecificImages