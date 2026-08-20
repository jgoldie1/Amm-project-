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
import SharedCityMultiplayerPanel from './components/SharedCityMultiplayerPanel'
import AuthGateway from './components/AuthGateway'
import CoreJourneyLauncher from './components/CoreJourneyLauncher'
import SafeJourneyLauncher from './components/SafeJourneyLauncher'
import CommunityGuardianLauncher from './components/CommunityGuardianLauncher'
import './accessibility/accessibility.css'
import { installProductionHealthMonitor } from './runtime/ProductionHealthMonitor'
import { installGameStatePersistence } from './game/runtime/gameCompletionCore'

installProductionHealthMonitor()
installGameStatePersistence()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <JudahSplash />
    <App />
    <UniversalSafetyLauncher />
    <MiddleverseLauncher />
    <GameVerseLauncher />
    <AccessibilityPassportPanel />
    <HoloDeliveryLauncher />
    <HoloMarketplaceLauncher />
    <SharedCityMultiplayerPanel />
    <AuthGateway />
    <CoreJourneyLauncher />
    <SafeJourneyLauncher />
    <CommunityGuardianLauncher />
  </StrictMode>
)