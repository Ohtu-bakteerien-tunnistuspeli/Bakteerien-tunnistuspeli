import { BrowserRouter as Router } from 'react-router-dom'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './App'
import store from './store'
import './style.css'

ReactDOM.render(
  <Provider store={store} className="full">
    <Router className="full">
      <App className="full" />
    </Router>
  </Provider>,
  document.getElementById('root')
)
