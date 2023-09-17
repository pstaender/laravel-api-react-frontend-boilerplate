import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { RecoilRoot } from 'recoil'
import './i18n/i18n'

const container = document.getElementById('app-container')
const root = createRoot(container)

root.render(
  <RecoilRoot>
    <App />
  </RecoilRoot>
)