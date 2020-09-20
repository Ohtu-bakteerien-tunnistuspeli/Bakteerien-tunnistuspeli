import React from 'react'
import { useSelector, /*useDispatch*/ } from 'react-redux'
import TestForm from './TestForm'
import TestListing from './TestListing'

const TestList = () => {
    const style = {margin: '10px', fontSize: '40px'}
    const test = useSelector(state => state.test)?.sort((test1, test2) => test1.name.localeCompare(test2.name))
    const user = useSelector(state => state.user)
   // const dispatch = useDispatch()

    return (
        <div>
            <h2 style={style}>Testit</h2>
            {test ?
                <ul>
                    {test.map(test =>
                        <TestListing key={test.id} test={test} isAdmin={user?.admin}></TestListing>
                    )}
                </ul>
                :
                <div>Testejä haetaan</div>
            }
            {user?.admin ?
                <TestForm></TestForm>
                :
                <></>
            }

        </div>
    )
}

export default TestList