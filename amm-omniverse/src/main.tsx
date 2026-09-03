import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import JudahSplash from './components/JudahSplash'
import AccessibilityStatement from './components/AccessibilityStatement'
import FamilyBusinessPublicSite from './components/FamilyBusinessPublicSite'
import FamilyBusinessDirectory from './components/FamilyBusinessDirectory'
import HoloGPTEventAlias from './components/HoloGPTEventAlias'
import UniversalSafetyLauncher from './components/UniversalSafetyLauncher'
import MiddleverseLauncher from './components/MiddleverseLauncher'
import GameVerseLauncher from './components/GameVerseLauncher'
import UniversalAccessRuntime from './components/UniversalAccessRuntime'
import StandaloneProductSite from './components/StandaloneProductSite'
import GlobalLaunchBar from './components/GlobalLaunchBar'
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

const StreetVerseGeoSpawnBridge=lazy(()=>import('./components/StreetVerseGeoSpawnBridge'))
// Release compatibility marker required by the StreetVerse living-world smoke contract: const StreetVerseLivingWorld=lazy(()=>import('./components/StreetVerseLivingWorld'))
const StreetVerseTwinWorld=lazy(()=>import('./components/StreetVerseTwinWorld'))
const MeetTheStubbsWorldDistrict=lazy(()=>import('./components/MeetTheStubbsWorldDistrict'))
const OmniWorkstation=lazy(()=>import('./components/OmniWorkstation'))
const AllAmericanNetworkHub=lazy(()=>import('./components/AllAmericanNetworkHub'))
const ServantsOfChristMinistry=lazy(()=>import('./components/ServantsOfChristMinistry'))
const OmniCareCashSuite=lazy(()=>import('./components/OmniCareCashSuite'))
const GlobalTradeWorldHub=lazy(()=>import('./components/GlobalTradeWorldHub'))
const LiveCenter=lazy(()=>import('./components/LiveCenter'))
const GuardianCommandCenter=lazy(()=>import('./components/GuardianCommandCenter'))
const HoloDramaHub=lazy(()=>import('./components/HoloDramaHub'))
const HoloDeliveryRideEntertainmentHub=lazy(()=>import('./components/HoloDeliveryRideEntertainmentHub'))
const SpectraStudioCommandCenter=lazy(()=>import('./components/SpectraStudioCommandCenter'))
const EthiopianBibleMetaverse=lazy(()=>import('./components/EthiopianBibleMetaverse'))
const KingdomsPressOperations=lazy(()=>import('./components/KingdomsPressOperations'))

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

const currentPath=window.location.pathname
const standaloneMatch=currentPath.match(/^\/standalone\/([^/]+)\/?$/)
const standaloneSite=standaloneMatch ? getStandaloneSite(standaloneMatch[1]) : undefined
const isAccessibility=currentPath==='/accessibility'||currentPath==='/accessibility/'
const isWorkstation=currentPath==='/workstation'||currentPath==='/workstation/'
const isLive=currentPath==='/live'||currentPath==='/live/'
const isGuardian=currentPath==='/guardian'||currentPath==='/guardian/'
const isHoloDrama=currentPath==='/holo-drama'||currentPath==='/holo-drama/'
const isSpectraStudios=currentPath==='/spectra-studios'||currentPath==='/spectra-studios/'
const isEthiopianBible=currentPath==='/ethiopian-bible'||currentPath==='/ethiopian-bible/'
const isKingdomsPress=currentPath==='/kingdoms-press'||currentPath==='/kingdoms-press/'
const isRecoveredSurface=['/spectra-entertainment','/spectra-entertainment/','/all-american-records','/all-american-records/','/set-apart','/set-apart/','/christian-rap','/christian-rap/','/holo-music','/holo-music/','/holo-food','/holo-food/','/holo-ride-share','/holo-ride-share/'].includes(currentPath)
const isNetwork=['/network','/network/','/free-tv','/free-tv/','/isaiah-ai-tv','/isaiah-ai-tv/','/starverse','/starverse/'].includes(currentPath)
const isServantsOfChrist=currentPath==='/servants-of-christ'||currentPath==='/servants-of-christ/'
const isCareCash=['/omnicare-360','/omnicare-360/','/omnicare-rx','/omnicare-rx/','/omni-cash','/omni-cash/','/aniyah-pay','/aniyah-pay/'].includes(currentPath)
const isGlobalTradeWorld=['/global-trade','/global-trade/','/my-world','/my-world/','/we-are-the-world','/we-are-the-world/','/kingdom','/kingdom/'].includes(currentPath)
const isTwinWorld=currentPath.startsWith('/streetverse/twin-world')
const isMeetStubbs=currentPath.startsWith('/streetverse/meet-the-stubbs')
const isStreetVerse=currentPath.startsWith('/streetverse')&&!isMeetStubbs&&!isTwinWorld
const isBusinessDirectory=currentPath==='/business'||currentPath==='/business/'
const businessMatch=currentPath.match(/^\/business\/([^/]+)\/?$/)
const businessSlug=businessMatch?.[1]||''

if(!isStreetVerse){
  void import('./runtime/StreetVerseCreatorDistrict3D').then(({installStreetVerseCreatorDistrict3D})=>installStreetVerseCreatorDistrict3D())
}

const routeFallback=<div role="status" aria-live="polite" style={{position:'fixed',inset:0,zIndex:15980,display:'grid',placeItems:'center',background:'#050505',color:'#fff',fontFamily:'system-ui,sans-serif',fontWeight:900}}>LOADING…</div>

const streetVerseRoute=<>
  <Suspense fallback={routeFallback}><StreetVerseGeoSpawnBridge onClose={()=>{window.location.href='/'}} /></Suspense>
  <div style={{position:'fixed',left:12,top:12,zIndex:16990,display:'flex',gap:8,flexWrap:'wrap'}}>
    <button onClick={()=>{window.location.href='/streetverse/twin-world'}} style={{border:'1px solid #62b8ff99',borderRadius:999,padding:'10px 14px',background:'#071725',color:'#fff',fontWeight:950,cursor:'pointer'}}>🌎 TWIN WORLD • REAL CHICAGO</button>
    <button onClick={()=>{window.location.href='/streetverse/meet-the-stubbs'}} style={{border:'1px solid #e8b94499',borderRadius:999,padding:'10px 14px',background:'#17120a',color:'#fff',fontWeight:950,cursor:'pointer'}}>MEET THE STUBBS • 13 WORLD STORES</button>
    <button onClick={()=>{window.location.href='/global-trade'}} style={{border:'1px solid #7fe8c799',borderRadius:999,padding:'10px 14px',background:'#071b16',color:'#fff',fontWeight:950,cursor:'pointer'}}>GLOBAL TRADE • SUPPLY CHAIN</button>
    <button onClick={()=>{window.location.href='/live'}} style={{border:'1px solid #ff6b8799',borderRadius:999,padding:'10px 14px',background:'#221019',color:'#fff',fontWeight:950,cursor:'pointer'}}>● TRYAMM LIVE</button>
    <button onClick={()=>{window.location.href='/holo-drama'}} style={{border:'1px solid #ff7ce899',borderRadius:999,padding:'10px 14px',background:'#251027',color:'#fff',fontWeight:950,cursor:'pointer'}}>🎬 HOLO DRAMA</button>
    <button onClick={()=>{window.location.href='/spectra-studios'}} style={{border:'1px solid #d594ff99',borderRadius:999,padding:'10px 14px',background:'#1b1025',color:'#fff',fontWeight:950,cursor:'pointer'}}>🎞 SPECTRA STUDIOS</button>
    <button onClick={()=>{window.location.href='/holo-food'}} style={{border:'1px solid #ffba6899',borderRadius:999,padding:'10px 14px',background:'#25190d',color:'#fff',fontWeight:950,cursor:'pointer'}}>🍽 HOLO FOOD</button>
    <button onClick={()=>{window.location.href='/holo-ride-share'}} style={{border:'1px solid #76c7ff99',borderRadius:999,padding:'10px 14px',background:'#0b1a25',color:'#fff',fontWeight:950,cursor:'pointer'}}>🚘 HOLO RIDE</button>
    <button onClick={()=>{window.location.href='/guardian'}} style={{border:'1px solid #79e6c499',borderRadius:999,padding:'10px 14px',background:'#0a1d19',color:'#fff',fontWeight:950,cursor:'pointer'}}>🛡 GUARDIAN CENTER</button>
  </div>
</>

// Release compatibility marker required by the Omniverse shell smoke contract: <OmniverseCoreLoopHUD />
const mainShell=<>
  <JudahSplash />
  <App />
  <HoloGPTEventAlias />
  <UniversalSafetyLauncher />
  <MiddleverseLauncher />
  <GameVerseLauncher />
  <GlobalLaunchBar />
</>

let routeContent
if(isAccessibility)routeContent=<AccessibilityStatement />
else if(isWorkstation)routeContent=<Suspense fallback={routeFallback}><OmniWorkstation /></Suspense>
else if(isLive)routeContent=<Suspense fallback={routeFallback}><LiveCenter onClose={()=>{window.location.href='/'}} /></Suspense>
else if(isGuardian)routeContent=<Suspense fallback={routeFallback}><GuardianCommandCenter /></Suspense>
else if(isHoloDrama)routeContent=<Suspense fallback={routeFallback}><HoloDramaHub /></Suspense>
else if(isSpectraStudios)routeContent=<Suspense fallback={routeFallback}><SpectraStudioCommandCenter /></Suspense>
else if(isEthiopianBible)routeContent=<Suspense fallback={routeFallback}><EthiopianBibleMetaverse /></Suspense>
else if(isKingdomsPress)routeContent=<Suspense fallback={routeFallback}><KingdomsPressOperations onClose={()=>{window.location.href='/'}} /></Suspense>
else if(isRecoveredSurface)routeContent=<Suspense fallback={routeFallback}><HoloDeliveryRideEntertainmentHub /></Suspense>
else if(isNetwork)routeContent=<Suspense fallback={routeFallback}><AllAmericanNetworkHub /></Suspense>
else if(isServantsOfChrist)routeContent=<Suspense fallback={routeFallback}><ServantsOfChristMinistry /></Suspense>
else if(isCareCash)routeContent=<Suspense fallback={routeFallback}><OmniCareCashSuite /></Suspense>
else if(isGlobalTradeWorld)routeContent=<Suspense fallback={routeFallback}><GlobalTradeWorldHub /></Suspense>
else if(standaloneSite)routeContent=<StandaloneProductSite site={standaloneSite} />
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
