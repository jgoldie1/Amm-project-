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
import IllinoisRegionalLauncher from './components/IllinoisRegionalLauncher'
import StreetVerseLifePathLauncher from './components/StreetVerseLifePathLauncher'
import StreetVerseExpansionHub from './components/StreetVerseExpansionHub'
import TryAMMMobileLauncher from './components/TryAMMMobileLauncher'
import HoloArenaLauncher from './components/HoloArenaLauncher'
import SampleRightsCenter from './components/SampleRightsCenter'
import ServicesWorkCommerceHub from './components/ServicesWorkCommerceHub'
import './accessibility/accessibility.css'
import { installProductionHealthMonitor } from './runtime/ProductionHealthMonitor'

installProductionHealthMonitor()

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
    <IllinoisRegionalLauncher />
    <StreetVerseLifePathLauncher />
    <StreetVerseExpansionHub />
    <TryAMMMobileLauncher />
    <HoloArenaLauncher />
    <SampleRightsCenter />
    <ServicesWorkCommerceHub />
  </StrictMode>
)
