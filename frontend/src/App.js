import React, { useEffect } from 'react'
import { Switch, Route, /*Redirect, Link, useRouteMatch, useHistory*/ } from 'react-router-dom'
//import SkeletonComponent from './components/Skeleton'
import { useDispatch, useSelector} from 'react-redux'
import { returnUser } from './reducers/userReducer'
import { getBacteria } from './reducers/bacteriaReducer'
import Login from './components/Login'
import BacteriaList from './components/BacteriaList'

const App = () => {
    //const match = useRouteMatch('/hello/:name')
    //const name = match ? match.params.name : ''
    //const history = useHistory()
    const dispatch = useDispatch()
    const bacteria = useSelector(state => state.bacteria)
   // const user = useSelector(state => state.user)
    
    useEffect(() => {
        dispatch(returnUser())
        //if (!bacteria && user) {
        if(!bacteria) {
            dispatch(getBacteria())
        }
        // eslint-disable-next-line
    }, [dispatch])

    return (
        <div >
            <Switch>
                <Route path='/bakteeriLista'>
                    <BacteriaList></BacteriaList>
                </Route>
                <Route path='/'>
                    <Login></Login>
                </Route>
                {/*<Route path='/skeleton'>
                    <SkeletonComponent></SkeletonComponent>
                    <button onClick={() => history.push('/hello')}>to hello</button>
                </Route>
                <Route path="/hello/:name">
                    <h1>HELLO {name}</h1>
                    <button onClick={() => history.push('/skeleton')}>to skeleton</button>
                </Route>
                <Route path='/hello'>
                    <h1>
                        <Link to='/hello/WORLD'>HELLO</Link>
                    </h1>
                </Route>
                <Route path='/'>
                    <Redirect to='/skeleton'></Redirect>
    </Route>*/}
            </Switch>
        </div>
    )
}

export default App