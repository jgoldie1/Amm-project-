import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import JudahSplash from './components/JudahSplash'
import UniversalSafetyLauncher from './components/UniversalSafetyLauncher'
import MiddleverseLauncher from './components/MiddleverseLauncher'
import GameVerseLauncher from './components/GameVerseLauncher'
import AccessibilityPassportPanel from './components/AccessibilityPassportPanel'
import HoloDeliveryLauncher from './components/HoloDeliveryLauncher'
import HoloMobilityLauncher from './components/HoloMobilityLauncher'
import HoloMarketplaceLauncher from './components/HoloMarketplaceLauncher'
import MediaStudioLauncher from './components/MediaStudioLauncher'
import HoloDramaLauncher from './components/HoloDramaLauncher'
import BroadcastStudioLauncher from './components/BroadcastStudioLauncher'
import FamilyBusinessPublicSite from './components/FamilyBusinessPublicSite'
import FamilyBusinessDirectory from './components/FamilyBusinessDirectory'
import FamilyBusinessDirectoryLauncher from './components/FamilyBusinessDirectoryLauncher'
import SafeOnboardingGate from './components/SafeOnboardingGate'
import StreetVerseLifeHub from './components/StreetVerseLifeHub'
import StreetVerseCareerHUD from './components/StreetVerseCareerHUD'
import StreetVerseMissionWorldBridge from './components/StreetVerseMissionWorldBridge'
import AIWebsiteBusinessBuilder from './components/AIWebsiteBusinessBuilder'
import JacobieVisionLauncher from './components/JacobieVisionLauncher'
import FirstClassFeatureDock from './components/FirstClassFeatureDock'
import CampusWelcomeBoard from './components/CampusWelcomeBoard'
import ReleaseChangesPanel from './components/ReleaseChangesPanel'
import ProductionReadinessPanel from './components/ProductionReadinessPanel'
import HoloGPTEventAlias from './components/HoloGPTEventAlias'
import StreetVersePortalTransition from './components/StreetVersePortalTransition'
import OmniBICommandCenter from './components/OmniBICommandCenter'
import MetaverseBusinessBuilder from './components/MetaverseBusinessBuilder'
import RevenueLandingCTAs from './components/RevenueLandingCTAs'
import HoloConcierge from './components/HoloConcierge'
import OmniverseCoreLoopHUD from './components/OmniverseCoreLoopHUD'
import UnifiedCommerceHub from './components/UnifiedCommerceHub'
import NeighborhoodCommerceNetwork from './components/NeighborhoodCommerceNetwork'
import VirtualWarehouseNetwork from './components/VirtualWarehouseNetwork'
import HoloFridge from './components/HoloFridge'
import LivingWorldEconomyHUD from './components/LivingWorldEconomyHUD'
import BuildSwarmControl from './components/BuildSwarmControl'
import ProductTryOnHub from './components/ProductTryOnHub'
import HoloMusicLauncher from './components/HoloMusicLauncher'
import OmniCashLauncher from './components/OmniCashLauncher'
import GlobalGrowthHub from './components/GlobalGrowthHub'
import LivingWorldAdaptiveBridge from './components/LivingWorldAdaptiveBridge'
import UniversalAccessRuntime from './components/UniversalAccessRuntime'
import StandaloneProductSite from './components/StandaloneProductSite'
import { getStandaloneSite } from './data/standaloneSiteRegistry'
import './accessibility/accessibility.css'
import { installProductionHealthMonitor } from './runtime/ProductionHealthMonitor'
import { installMediaCloudBridge } from './runtime/mediaCloudBridge'
import { installStreetVerseLivingWorldRuntime } from './runtime/StreetVerseLivingWorldRuntime'
import { installStreetVerseWorldMemory } from './runtime/StreetVerseWorldMemory'
import { installStreetVerseCheckpointRuntime } from './runtime/StreetVerseCheckpointRuntime'
import { installStreetVersePerformanceBudget } from './runtime/StreetVersePerformanceBudget'
import { installStreetVerseCharacterMissionRuntime } from './runtime/StreetVerseCharacterMissionRuntime'
import { installGuardianMissionProgressRuntime } from './runtime/GuardianMissionProgressRuntime'
import { installPublicServiceCareerRuntime } from './runtime/PublicServiceCareerRuntime'
import { installStreetVerseCareerExtractionRuntime } from './runtime/StreetVerseCareerExtractionRuntime'
import { installDynamicDispatchRuntime } from './runtime/DynamicDispatchRuntime'
import { installStreetVerseResilienceRuntime } from './runtime/StreetVerseResilienceRuntime'
import { installStreetVerseUnifiedProgressionRuntime } from './runtime/StreetVerseUnifiedProgressionRuntime'
import { installStreetVerseGameModeRuntime } from './runtime/StreetVerseGameModeRuntime'
import { installStreetVerseCommerceWorldRuntime } from './runtime/StreetVerseCommerceWorldRuntime'
import { installCommerceJobTrainingRuntime } from './runtime/CommerceJobTrainingRuntime'
import { installRegulatedBusinessNetworkRuntime } from './runtime/RegulatedBusinessNetworkRuntime'
import { installWorldEconomyOrchestratorRuntime } from './runtime/WorldEconomyOrchestratorRuntime'
import { installLearnWorkBusinessBridgeRuntime } from './runtime/LearnWorkBusinessBridgeRuntime'
import { installFaithLifeSimulationRuntime } from './runtime/FaithLifeSimulationRuntime'
import { installGlobalCityVerseRuntime } from './runtime/GlobalCityVerseRuntime'
import { installGlobalWorldHierarchyRuntime } from './runtime/GlobalWorldHierarchyRuntime'
import { installGlobalTravelExperienceRuntime } from './runtime/GlobalTravelExperienceRuntime'
import { installNiaSourceRuntime } from './runtime/NiaSourceRuntime'
import { installQuantumSourcingRuntime } from './runtime/QuantumSourcingRuntime'
import { installMetaverseBusinessBuilderRuntime } from './runtime/MetaverseBusinessBuilderRuntime'
import { installAIWebsiteBusinessBuilderRuntime } from './runtime/AIWebsiteBusinessBuilderRuntime'
import { installBusinessTemplateFranchiseRuntime } from './runtime/BusinessTemplateFranchiseRuntime'
import { installAICafeMultiAgentRuntime } from './runtime/AICafeMultiAgentRuntime'
import { installMiddleverseRemoteWorkRuntime } from './runtime/MiddleverseRemoteWorkRuntime'
import { installBroadcastStudioRuntime } from './runtime/BroadcastStudioRuntime'
import { installStubbsHarmonyAIRuntime } from './runtime/StubbsHarmonyAIRuntime'
import { installCreatorExperienceRuntime } from './runtime/CreatorExperienceRuntime'
import { installCreatorCommerceOrchestrator } from './runtime/CreatorCommerceOrchestrator'
import { installSocialShareBridge } from './runtime/SocialShareBridge'
import { installJarvisOrchestratorRuntime } from './runtime/JarvisOrchestratorRuntime'
import { installStreetVerseGrowthNetworkRuntime } from './runtime/StreetVerseGrowthNetworkRuntime'
import { installStreetVerseRacingAfterDarkRuntime } from './runtime/StreetVerseRacingAfterDarkRuntime'
import { installStreetVerseMissionDiscoveryRuntime } from './runtime/StreetVerseMissionDiscoveryRuntime'
import { installSECSConstructRuntime } from './runtime/SECSConstructRuntime'
import { installOmniverseEventFabricRuntime } from './runtime/OmniverseEventFabricRuntime'
import { installStreetVerseCreatorDistrict3D } from './runtime/StreetVerseCreatorDistrict3D'

const StreetVerseGeoSpawnBridge=lazy(()=>import('./components/StreetVerseGeoSpawnBridge'))
// Release compatibility marker: lazy(()=>import('./components/StreetVerseLivingWorld'))
const StreetVerseTwinWorld=lazy(()=>import('./components/StreetVerseTwinWorld'))
const MeetTheStubbsWorldDistrict=lazy(()=>import('./components/MeetTheStubbsWorldDistrict'))

installProductionHealthMonitor()
installMediaCloudBridge()
installStreetVerseLivingWorldRuntime()
installStreetVerseWorldMemory()
installStreetVerseCheckpointRuntime()
installStreetVersePerformanceBudget()
installStreetVerseCharacterMissionRuntime()
installGuardianMissionProgressRuntime()
installPublicServiceCareerRuntime()
installStreetVerseCareerExtractionRuntime()
installDynamicDispatchRuntime()
installStreetVerseResilienceRuntime()
installStreetVerseUnifiedProgressionRuntime()
installStreetVerseGameModeRuntime()
installStreetVerseCommerceWorldRuntime()
installCommerceJobTrainingRuntime()
installRegulatedBusinessNetworkRuntime()
installWorldEconomyOrchestratorRuntime()
installLearnWorkBusinessBridgeRuntime()
installFaithLifeSimulationRuntime()
installGlobalCityVerseRuntime()
installGlobalWorldHierarchyRuntime()
installGlobalTravelExperienceRuntime()
installNiaSourceRuntime()
installQuantumSourcingRuntime()
installMetaverseBusinessBuilderRuntime()
installAIWebsiteBusinessBuilderRuntime()
installBusinessTemplateFranchiseRuntime()
installAICafeMultiAgentRuntime()
installMiddleverseRemoteWorkRuntime()
installBroadcastStudioRuntime()
installStubbsHarmonyAIRuntime()
installCreatorExperienceRuntime()
installCreatorCommerceOrchestrator()
installSocialShareBridge()
installJarvisOrchestratorRuntime()
installStreetVerseGrowthNetworkRuntime()
installStreetVerseRacingAfterDarkRuntime()
installStreetVerseMissionDiscoveryRuntime()
installSECSConstructRuntime()
installOmniverseEventFabricRuntime()
installStreetVerseCreatorDistrict3D()

const currentPath=window.location.pathname
const standaloneMatch=currentPath.match(/^\/standalone\/([^/]+)\/?$/)
const standaloneSite=standaloneMatch ? getStandaloneSite(standaloneMatch[1]) : undefined
const isTwinWorld=currentPath.startsWith('/streetverse/twin-world')
const isMeetStubbs=currentPath.startsWith('/streetverse/meet-the-stubbs')
const isStreetVerse=currentPath.startsWith('/streetverse')&&!isMeetStubbs&&!isTwinWorld
const isBusinessDirectory=currentPath==='/business'||currentPath==='/business/'
const businessMatch=currentPath.match(/^\/business\/([^/]+)\/?$/)
const businessSlug=businessMatch?.[1]||''
const routeFallback=<div role="status" aria-live="polite" style={{position:'fixed',inset:0,zIndex:15980,display:'grid',placeItems:'center',background:'#050505',color:'#fff',fontFamily:'system-ui,sans-serif',fontWeight:900}}>LOADING STREETVERSE…</div>

const streetVerseRoute=<>
  <Suspense fallback={routeFallback}><StreetVerseGeoSpawnBridge onClose={()=>{window.location.href='/'}} /></Suspense>
  <div style={{position:'fixed',left:12,top:12,zIndex:16990,display:'flex',gap:8,flexWrap:'wrap'}}>
    <button onClick={()=>{window.location.href='/streetverse/twin-world'}} style={{border:'1px solid #62b8ff99',borderRadius:999,padding:'10px 14px',background:'#071725',color:'#fff',fontWeight:950,cursor:'pointer'}}>🌎 TWIN WORLD • REAL CHICAGO</button>
    <button onClick={()=>{window.location.href='/streetverse/meet-the-stubbs'}} style={{border:'1px solid #e8b94499',borderRadius:999,padding:'10px 14px',background:'#17120a',color:'#fff',fontWeight:950,cursor:'pointer'}}>MEET THE STUBBS • 13 WORLD STORES</button>
  </div>
</>

const mainShell=<>
  <JudahSplash />
  <App />
  <SafeOnboardingGate />
  <StreetVersePortalTransition />
  <LivingWorldAdaptiveBridge />
  <RevenueLandingCTAs />
  <UniversalSafetyLauncher />
  <MiddleverseLauncher />
  <GameVerseLauncher />
  <MediaStudioLauncher />
  <HoloDramaLauncher />
  <BroadcastStudioLauncher />
  <StreetVerseLifeHub />
  <StreetVerseCareerHUD />
  <StreetVerseMissionWorldBridge />
  <AIWebsiteBusinessBuilder />
  <FamilyBusinessDirectoryLauncher />
  <JacobieVisionLauncher />
  <HoloGPTEventAlias />
  <FirstClassFeatureDock />
  <CampusWelcomeBoard />
  <ReleaseChangesPanel />
  <ProductionReadinessPanel />
  <OmniBICommandCenter />
  <MetaverseBusinessBuilder />
  <AccessibilityPassportPanel />
  <HoloDeliveryLauncher />
  <HoloMobilityLauncher />
  <HoloMarketplaceLauncher />
  <UnifiedCommerceHub />
  <NeighborhoodCommerceNetwork />
  <VirtualWarehouseNetwork />
  <HoloFridge />
  <LivingWorldEconomyHUD />
  <BuildSwarmControl />
  <ProductTryOnHub />
  <HoloMusicLauncher />
  <OmniCashLauncher />
  <GlobalGrowthHub />
  <HoloConcierge />
  <OmniverseCoreLoopHUD />
</>

let routeContent
if(standaloneSite)routeContent=<StandaloneProductSite site={standaloneSite} />
else if(isBusinessDirectory)routeContent=<FamilyBusinessDirectory />
else if(businessSlug)routeContent=<FamilyBusinessPublicSite slug={businessSlug} onClose={()=>{window.location.href='/business'}} />
else if(isTwinWorld)routeContent=<Suspense fallback={routeFallback}><StreetVerseTwinWorld onClose={()=>{window.location.href='/'}} /></Suspense>
else if(isMeetStubbs)routeContent=<Suspense fallback={routeFallback}><MeetTheStubbsWorldDistrict onClose={()=>{window.location.href='/streetverse'}} /></Suspense>
else if(isStreetVerse)routeContent=streetVerseRoute
else routeContent=mainShell

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UniversalAccessRuntime />
    {routeContent}
  </StrictMode>
)
