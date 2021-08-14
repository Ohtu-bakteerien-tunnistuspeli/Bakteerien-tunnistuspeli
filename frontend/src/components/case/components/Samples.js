import React from 'react'
import Sample from './Sample.js'
import { Form, Table } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import '../../../style.css'

const Samples = ({ samples, deleteSample }) => {
    const library = useSelector(state => state.language)?.library?.frontend.case.components
    return (
        <Form.Group style={{ padding: '20px' }} id='samples' className='formtext'>
            <Form.Label>{library.samples}</Form.Label>
            <Table>
                <tbody>
                    {samples.map(s =>
                        <Sample key={s.description}
                            sample={s}
                            sampleChange={deleteSample} >
                        </Sample>
                    )}
                </tbody>
            </Table>
        </Form.Group>
    )
}

export default Samples