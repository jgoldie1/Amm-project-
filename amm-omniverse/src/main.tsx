import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import JudahSplash from './components/JudahSplash'
import UniversalSafetyLauncher from './components/UniversalSafetyLauncher'
import MiddleverseLauncher from './components/MiddleverseLauncher'
import GameVerseLauncher from './components/GameVerseLauncher'
import AccessibilityPassportPanel from './components/AccessibilityPassportPanel'
import HoloDeliveryLauncher from './components/HoloDeliveryLauncher'
import HoloMarketplaceLauncher from './components/HoloMarketplaceLauncher'
import MediaStudioLauncher from './components/MediaStudioLauncher'
import RevenueLandingCTAs from './components/RevenueLandingCTAs'
import './accessibility/accessibility.css'
import { installProductionHealthMonitor } from './runtime/ProductionHealthMonitor'
import { installMediaCloudBridge } from './runtime/mediaCloudBridge'

installProductionHealthMonitor()
installMediaCloudBridge()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <JudahSplash />
    <App />
    <RevenueLandingCTAs />
    <UniversalSafetyLauncher />
    <MiddleverseLauncher />
    <GameVerseLauncher />
    <MediaStudioLauncher />
    <AccessibilityPassportPanel />
    <HoloDeliveryLauncher />
    <HoloMarketplaceLauncher />
  </StrictMode>
)