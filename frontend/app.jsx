import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App'
import './i18n/i18n'

ReactDOM.createRoot(document.getElementById('app-container')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
