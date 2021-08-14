import React from 'react'
import { Form } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import '../../../style.css'
const SelectBacterium = ({ bacteriumId, setBacteriumId, onChange, error, bacteria, touched, setFieldTouched }) => {
    const library = useSelector(state => state.language)?.library?.frontend.case.components
    const handleChange = event => {
        event.preventDefault()
        if(!touched) {
            setFieldTouched('bacteriumId', true, true)
        }
        setBacteriumId(event.target.value)
        onChange('bacteriumId', event.target.value)
    }
    return (
        <Form.Group controlId='bacterium' className='formtext'>
            <Form.Label>{library.bacterium}</Form.Label>
            <Form.Control as='select'
                onChange={handleChange}
                isInvalid={error && touched}
                value={bacteriumId}
            >
                <option value='' disabled hidden>{library.chooseBacterium}</option>
                {bacteria.map(bacterium =>
                    <option key={bacterium.id} value={bacterium.id} >{bacterium.name}</option>
                )}
            </Form.Control>
            <Form.Control.Feedback type='invalid' hidden={!touched}>
                {error}
            </Form.Control.Feedback>
        </Form.Group>
    )
}

export default SelectBacterium