import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App'
import './i18n/i18n'
import { HashRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('app-container')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)
