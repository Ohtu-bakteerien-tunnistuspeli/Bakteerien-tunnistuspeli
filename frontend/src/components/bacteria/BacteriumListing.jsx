import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'

const BacteriumListing = ({ bacterium, deleteBact, updateBact, isAdmin }) => {
    const library = useSelector(state => state.language)?.library?.frontend.bacteria.listing
    const [isModified, setIsModified] = useState(false)
    const [newName, setNewName] = useState(bacterium.name)
    const modify = () => {
        if (newName) {
            updateBact(newName, bacterium.id, setIsModified, setNewName)
        }
    }
    const stopModify = () => {
        setIsModified(false)
        setNewName(bacterium.name)
    }
    return (
        <tr>
            <td>
                {isModified ?
                    <input className='small-margin' value={newName} id='editField' onChange={({ target }) => setNewName(target.value)} />
                    :
                    <>{bacterium.name.length < 50 ? bacterium.name : `${bacterium.name.substring(0,50)}...`}</>
                }

            </td>
            <td>
                {isModified ?
                    <div style={{ float: 'right' }}>
                        <Button variant='secondary' id='stopEdit' className='small-margin' onClick={stopModify}>{library.stopEdit}</Button>
                        <Button variant='success' id='saveEdit' className='small-margin' onClick={modify}>{library.save}</Button>
                    </div>
                    :
                    <>
                        {isAdmin ?
                            <>
                                <Button variant='danger' className='small-margin-float-right' id='delete' onClick={() => { if (window.confirm('Tahdotko varmasti poistaa tämän bakteerin?')) { deleteBact(bacterium) } }}>{library.delete}
                                    <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-trash" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                    </svg>
                                </Button>
                                <Button variant='primary' className='small-margin-float-right' id='edit' onClick={() => setIsModified(true)}>{library.edit}</Button>
                            </>
                            :
                            <></>
                        }
                    </>
                }
            </td>

        </tr>

    )
}

export default BacteriumListing