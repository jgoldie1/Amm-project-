import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import UniversalSafetyLauncher from './components/UniversalSafetyLauncher'
import { installProductionHealthMonitor } from './runtime/ProductionHealthMonitor'

installProductionHealthMonitor()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <UniversalSafetyLauncher />
  </StrictMode>
)
