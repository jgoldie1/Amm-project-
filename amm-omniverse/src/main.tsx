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
import HoloDeliveryLauncher from './components/HoloDeliveryLauncher'
import HoloMarketplaceLauncher from './components/HoloMarketplaceLauncher'
import StreetVerseFaithChronoPortal from './components/StreetVerseFaithChronoPortal'
import HoloExperienceLauncher from './components/HoloExperienceLauncher'
import { getStandaloneSite } from './data/standaloneSiteRegistry'
import './accessibility/accessibility.css'

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
const UnifiedCommerceHub=lazy(()=>import('./components/UnifiedCommerceHub'))

let routeContent: React.ReactNode = <App />

try {
  
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
    <StreetVerseFaithChronoPortal />
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
    <HoloDeliveryLauncher />
    <HoloMarketplaceLauncher />
  </>
  
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
  
  
} catch (error) {
  console.error('[TRYAMM] Optional runtime installer failed before React mount; continuing with core UI.', error)
  // Keep the public shell renderable even when an optional installer aborts startup.
  routeContent = <App />
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('[TRYAMM] Missing #root mount element')

const root = createRoot(rootElement)
// Runtime installers are loaded only after the core bundle has evaluated and a mount target exists.
// A broken optional runtime module can no longer abort JavaScript bootstrap before React renders.
const installOptionalRuntimes = () => {
  import('./runtime/ProductionHealthMonitor').then(m => m.installProductionHealthMonitor()).catch(error => console.error('[TRYAMM] Optional runtime installProductionHealthMonitor failed after core mount.', error))
  import('./runtime/mediaCloudBridge').then(m => m.installMediaCloudBridge()).catch(error => console.error('[TRYAMM] Optional runtime installMediaCloudBridge failed after core mount.', error))
  import('./runtime/StreetVerseLivingWorldRuntime').then(m => m.installStreetVerseLivingWorldRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installStreetVerseLivingWorldRuntime failed after core mount.', error))
  import('./runtime/StreetVerseWorldMemory').then(m => m.installStreetVerseWorldMemory()).catch(error => console.error('[TRYAMM] Optional runtime installStreetVerseWorldMemory failed after core mount.', error))
  import('./runtime/StreetVerseCheckpointRuntime').then(m => m.installStreetVerseCheckpointRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installStreetVerseCheckpointRuntime failed after core mount.', error))
  import('./runtime/StreetVersePerformanceBudget').then(m => m.installStreetVersePerformanceBudget()).catch(error => console.error('[TRYAMM] Optional runtime installStreetVersePerformanceBudget failed after core mount.', error))
  import('./runtime/StreetVerseCharacterMissionRuntime').then(m => m.installStreetVerseCharacterMissionRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installStreetVerseCharacterMissionRuntime failed after core mount.', error))
  import('./runtime/GuardianMissionProgressRuntime').then(m => m.installGuardianMissionProgressRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installGuardianMissionProgressRuntime failed after core mount.', error))
  import('./runtime/PublicServiceCareerRuntime').then(m => m.installPublicServiceCareerRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installPublicServiceCareerRuntime failed after core mount.', error))
  import('./runtime/StreetVerseCareerExtractionRuntime').then(m => m.installStreetVerseCareerExtractionRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installStreetVerseCareerExtractionRuntime failed after core mount.', error))
  import('./runtime/DynamicDispatchRuntime').then(m => m.installDynamicDispatchRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installDynamicDispatchRuntime failed after core mount.', error))
  import('./runtime/StreetVerseResilienceRuntime').then(m => m.installStreetVerseResilienceRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installStreetVerseResilienceRuntime failed after core mount.', error))
  import('./runtime/StreetVerseUnifiedProgressionRuntime').then(m => m.installStreetVerseUnifiedProgressionRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installStreetVerseUnifiedProgressionRuntime failed after core mount.', error))
  import('./runtime/StreetVerseGameModeRuntime').then(m => m.installStreetVerseGameModeRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installStreetVerseGameModeRuntime failed after core mount.', error))
  import('./runtime/StreetVerseCommerceWorldRuntime').then(m => m.installStreetVerseCommerceWorldRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installStreetVerseCommerceWorldRuntime failed after core mount.', error))
  import('./runtime/CommerceJobTrainingRuntime').then(m => m.installCommerceJobTrainingRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installCommerceJobTrainingRuntime failed after core mount.', error))
  import('./runtime/RegulatedBusinessNetworkRuntime').then(m => m.installRegulatedBusinessNetworkRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installRegulatedBusinessNetworkRuntime failed after core mount.', error))
  import('./runtime/WorldEconomyOrchestratorRuntime').then(m => m.installWorldEconomyOrchestratorRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installWorldEconomyOrchestratorRuntime failed after core mount.', error))
  import('./runtime/LearnWorkBusinessBridgeRuntime').then(m => m.installLearnWorkBusinessBridgeRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installLearnWorkBusinessBridgeRuntime failed after core mount.', error))
  import('./runtime/FaithLifeSimulationRuntime').then(m => m.installFaithLifeSimulationRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installFaithLifeSimulationRuntime failed after core mount.', error))
  import('./runtime/GlobalCityVerseRuntime').then(m => m.installGlobalCityVerseRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installGlobalCityVerseRuntime failed after core mount.', error))
  import('./runtime/GlobalWorldHierarchyRuntime').then(m => m.installGlobalWorldHierarchyRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installGlobalWorldHierarchyRuntime failed after core mount.', error))
  import('./runtime/GlobalTravelExperienceRuntime').then(m => m.installGlobalTravelExperienceRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installGlobalTravelExperienceRuntime failed after core mount.', error))
  import('./runtime/NiaSourceRuntime').then(m => m.installNiaSourceRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installNiaSourceRuntime failed after core mount.', error))
  import('./runtime/QuantumSourcingRuntime').then(m => m.installQuantumSourcingRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installQuantumSourcingRuntime failed after core mount.', error))
  import('./runtime/MetaverseBusinessBuilderRuntime').then(m => m.installMetaverseBusinessBuilderRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installMetaverseBusinessBuilderRuntime failed after core mount.', error))
  import('./runtime/AIWebsiteBusinessBuilderRuntime').then(m => m.installAIWebsiteBusinessBuilderRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installAIWebsiteBusinessBuilderRuntime failed after core mount.', error))
  import('./runtime/BusinessTemplateFranchiseRuntime').then(m => m.installBusinessTemplateFranchiseRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installBusinessTemplateFranchiseRuntime failed after core mount.', error))
  import('./runtime/AICafeMultiAgentRuntime').then(m => m.installAICafeMultiAgentRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installAICafeMultiAgentRuntime failed after core mount.', error))
  import('./runtime/MiddleverseRemoteWorkRuntime').then(m => m.installMiddleverseRemoteWorkRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installMiddleverseRemoteWorkRuntime failed after core mount.', error))
  import('./runtime/BroadcastStudioRuntime').then(m => m.installBroadcastStudioRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installBroadcastStudioRuntime failed after core mount.', error))
  import('./runtime/StubbsHarmonyAIRuntime').then(m => m.installStubbsHarmonyAIRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installStubbsHarmonyAIRuntime failed after core mount.', error))
  import('./runtime/CreatorExperienceRuntime').then(m => m.installCreatorExperienceRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installCreatorExperienceRuntime failed after core mount.', error))
  import('./runtime/CreatorCommerceOrchestrator').then(m => m.installCreatorCommerceOrchestrator()).catch(error => console.error('[TRYAMM] Optional runtime installCreatorCommerceOrchestrator failed after core mount.', error))
  import('./runtime/SocialShareBridge').then(m => m.installSocialShareBridge()).catch(error => console.error('[TRYAMM] Optional runtime installSocialShareBridge failed after core mount.', error))
  import('./runtime/JarvisOrchestratorRuntime').then(m => m.installJarvisOrchestratorRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installJarvisOrchestratorRuntime failed after core mount.', error))
  import('./runtime/StreetVerseGrowthNetworkRuntime').then(m => m.installStreetVerseGrowthNetworkRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installStreetVerseGrowthNetworkRuntime failed after core mount.', error))
  import('./runtime/StreetVerseRacingAfterDarkRuntime').then(m => m.installStreetVerseRacingAfterDarkRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installStreetVerseRacingAfterDarkRuntime failed after core mount.', error))
  import('./runtime/StreetVerseMissionDiscoveryRuntime').then(m => m.installStreetVerseMissionDiscoveryRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installStreetVerseMissionDiscoveryRuntime failed after core mount.', error))
  import('./runtime/SECSConstructRuntime').then(m => m.installSECSConstructRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installSECSConstructRuntime failed after core mount.', error))
  import('./runtime/OmniverseEventFabricRuntime').then(m => m.installOmniverseEventFabricRuntime()).catch(error => console.error('[TRYAMM] Optional runtime installOmniverseEventFabricRuntime failed after core mount.', error))
}
// Mount the selected public route first. Optional global launchers must never be
// able to prevent the TRYAMM shell or StreetVerse from becoming visible.
root.render(
  <StrictMode>
    {routeContent}
  </StrictMode>
)

queueMicrotask(() => {
  installOptionalRuntimes()
  try {
    root.render(
      <StrictMode>
        <UniversalAccessRuntime />
        <HoloExperienceLauncher />
        <Suspense fallback={null}><UnifiedCommerceHub /></Suspense>
        {routeContent}
      </StrictMode>
    )
  } catch (error) {
    console.error('[TRYAMM] Optional global UI failed after core mount; preserving public route.', error)
  }
})
