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
import JacobieVisionLauncher from './components/JacobieVisionLauncher'
import FirstClassFeatureDock from './components/FirstClassFeatureDock'
import CampusWelcomeBoard from './components/CampusWelcomeBoard'
import ReleaseChangesPanel from './components/ReleaseChangesPanel'
import ProductionReadinessPanel from './components/ProductionReadinessPanel'
import HoloGPTEventAlias from './components/HoloGPTEventAlias'
import StreetVersePortalTransition from './components/StreetVersePortalTransition'
import RevenueLandingCTAs from './components/RevenueLandingCTAs'
import HoloConcierge from './components/HoloConcierge'
import UnifiedCommerceHub from './components/UnifiedCommerceHub'
import NeighborhoodCommerceNetwork from './components/NeighborhoodCommerceNetwork'
import VirtualWarehouseNetwork from './components/VirtualWarehouseNetwork'
import HoloFridge from './components/HoloFridge'
import LivingWorldEconomyHUD from './components/LivingWorldEconomyHUD'
import BuildSwarmControl from './components/BuildSwarmControl'
import ProductTryOnHub from './components/ProductTryOnHub'
import HoloMusicLauncher from './components/HoloMusicLauncher'
import LivingWorldAdaptiveBridge from './components/LivingWorldAdaptiveBridge'
import UniversalAccessRuntime from './components/UniversalAccessRuntime'
import './accessibility/accessibility.css'
import { installProductionHealthMonitor } from './runtime/ProductionHealthMonitor'
import { installMediaCloudBridge } from './runtime/mediaCloudBridge'
import { installStreetVerseLivingWorldRuntime } from './runtime/StreetVerseLivingWorldRuntime'
import { installStreetVerseWorldMemory } from './runtime/StreetVerseWorldMemory'
import { installStreetVerseCheckpointRuntime } from './runtime/StreetVerseCheckpointRuntime'
import { installStreetVersePerformanceBudget } from './runtime/StreetVersePerformanceBudget'
import { installStreetVerseCharacterMissionRuntime } from './runtime/StreetVerseCharacterMissionRuntime'
import { installStreetVerseGameModeRuntime } from './runtime/StreetVerseGameModeRuntime'
import { installGlobalCityVerseRuntime } from './runtime/GlobalCityVerseRuntime'
import { installCreatorExperienceRuntime } from './runtime/CreatorExperienceRuntime'
import { installCreatorCommerceOrchestrator } from './runtime/CreatorCommerceOrchestrator'
import { installSocialShareBridge } from './runtime/SocialShareBridge'
import { installJarvisOrchestratorRuntime } from './runtime/JarvisOrchestratorRuntime'

installProductionHealthMonitor()
installMediaCloudBridge()
installStreetVerseLivingWorldRuntime()
installStreetVerseWorldMemory()
installStreetVerseCheckpointRuntime()
installStreetVersePerformanceBudget()
installStreetVerseCharacterMissionRuntime()
installStreetVerseGameModeRuntime()
installGlobalCityVerseRuntime()
installCreatorExperienceRuntime()
installCreatorCommerceOrchestrator()
installSocialShareBridge()
installJarvisOrchestratorRuntime()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UniversalAccessRuntime />
    <JudahSplash />
    <App />
    <StreetVersePortalTransition />
    <LivingWorldAdaptiveBridge />
    <RevenueLandingCTAs />
    <UniversalSafetyLauncher />
    <MiddleverseLauncher />
    <GameVerseLauncher />
    <MediaStudioLauncher />
    <JacobieVisionLauncher />
    <HoloGPTEventAlias />
    <FirstClassFeatureDock />
    <CampusWelcomeBoard />
    <ReleaseChangesPanel />
    <ProductionReadinessPanel />
    <AccessibilityPassportPanel />
    <HoloDeliveryLauncher />
    <HoloMarketplaceLauncher />
    <UnifiedCommerceHub />
    <NeighborhoodCommerceNetwork />
    <VirtualWarehouseNetwork />
    <HoloFridge />
    <LivingWorldEconomyHUD />
    <BuildSwarmControl />
    <ProductTryOnHub />
    <HoloMusicLauncher />
    <HoloConcierge />
  </StrictMode>
)
