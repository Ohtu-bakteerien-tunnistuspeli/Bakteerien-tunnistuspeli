import ModalImage from '../utility/ModalImage'
import TestForm from './TestForm'

const TestListing = ({ test }) => {
    return (
        <tr key={test.id}>
            <td>{test.name.length < 50 ? test.name : `${test.name.substring(0,50)}...`}</td>
            <td>{test.type}</td>
            <td> {test.controlImage ? <ModalImage imageUrl={test.controlImage.url} width={'30%'} height={'30%'} /> : <></>} </td>
            <td> {test.positiveResultImage ? <ModalImage imageUrl={test.positiveResultImage.url} width={'30%'} height={'30%'} /> : <></>} </td>
            <td>{test.negativeResultImage ? <ModalImage imageUrl={test.negativeResultImage.url} width={'30%'} height={'30%'} /> : <></>} </td>
            <td><TestForm testToEdit={test}></TestForm></td>
        </tr>
    )
}

export default TestListing