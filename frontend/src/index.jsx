import { BrowserRouter as Router } from 'react-router'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App'
import store from './store'
import './style.css'

const Root = () => {
  return (
    <Provider store={store} className="full">
      <Router className="full">
        <App className="full" />
      </Router>
    </Provider>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<Root />)
