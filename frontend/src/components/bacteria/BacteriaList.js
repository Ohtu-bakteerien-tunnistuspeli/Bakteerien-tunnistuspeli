import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import BacteriumForm from './BacteriumForm'
import BacteriumListing from './BacteriumListing'
import { deleteBacterium, updateBacterium } from '../../reducers/bacteriaReducer'
import { Table } from 'react-bootstrap'

const BacteriaList = () => {
    const library = useSelector(state => state.language)?.library?.frontend.bacteria.list
    const bacteria = useSelector(state => state.bacteria)?.sort((bacterium1, bacterium2) => bacterium1.name.localeCompare(bacterium2.name))
    const user = useSelector(state => state.user)
    const [bacteriaToShow, setBacteriaToShow] = useState(bacteria)
    const [filterByBacteriaName, setFilterByName] = useState('')
    const dispatch = useDispatch()
    const [timer, setTimer] = useState(null)
    useEffect(() => {
        if (timer) {
            clearTimeout(timer)
        }
        setTimer(setTimeout(() => {
            if (filterByBacteriaName === '') {
                setBacteriaToShow(bacteria)
            } else {
                setBacteriaToShow(bacteria.filter(bac => bac.name && bac.name.startsWith(filterByBacteriaName)))
            }
        }, 1000))
    }, [filterByBacteriaName, bacteria])

    const deleteBact = bacterium => {
        dispatch(deleteBacterium(bacterium, user.token))
    }
    const updateBact = (newName, id, setIsModified, setNewName) => {
        dispatch(updateBacterium(id, newName, user.token, setIsModified, setNewName))
    }

    return (
        <div>
            {library.filterByName}<input id='bacteriaFilterByName' type='text' value={filterByBacteriaName} onChange={({ target }) => setFilterByName(target.value)}></input>&nbsp;
            <h2>{library.title}</h2>
            {bacteria.length !== 0 ?
                <Table id='bacteriumTable' borderless hover>
                    <thead>
                        <tr>
                            <th>{library.name}</th>
                            <th>
                                {user?.admin ?
                                    <BacteriumForm></BacteriumForm>
                                    :
                                    <></>
                                }
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {bacteriaToShow.map(bacterium =>
                            <BacteriumListing key={bacterium.id} bacterium={bacterium} deleteBact={deleteBact} updateBact={updateBact} isAdmin={user?.admin}></BacteriumListing>
                        )}
                    </tbody>
                </Table>
                :
                <>
                    {user?.admin ?
                        <BacteriumForm></BacteriumForm>
                        :
                        <></>
                    }
                    <div>{library.noBacteria}</div>
                </>
            }
        </div>
    )
}

export default BacteriaList