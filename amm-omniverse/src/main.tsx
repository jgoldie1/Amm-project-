import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import HoloSearchLauncher from './components/HoloSearchLauncher'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <HoloSearchLauncher />
  </StrictMode>
)
