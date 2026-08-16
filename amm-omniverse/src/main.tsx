import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import UniversalSafetyLauncher from './components/UniversalSafetyLauncher'
import MiddleverseLauncher from './components/MiddleverseLauncher'
import GameVerseLauncher from './components/GameVerseLauncher'
import { installProductionHealthMonitor } from './runtime/ProductionHealthMonitor'

installProductionHealthMonitor()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <UniversalSafetyLauncher />
    <MiddleverseLauncher />
    <GameVerseLauncher />
  </StrictMode>
)
