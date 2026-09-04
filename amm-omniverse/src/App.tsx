import { lazy, Suspense, useState } from 'react'
import { useGameStore } from './game/state/useGameStore'
import { NotifToast } from './components/UIScreens'
import TryAMMHome from './components/TryAMMHome'
import InstallPrompt from './components/InstallPrompt'
import { BennieButton } from './components/BennieChatbot'
import { SwipeNavigator, SwipeTutorial } from './components/SwipeNavigator'
import LivingWorldsBridge from './components/LivingWorldsBridge'
import './styles.css'

const CityView = lazy(() => import('./components/CityView'))
const SportsRealm = lazy(() => import('./components/RealmScreens').then(m => ({ default: m.SportsRealm })))
const MarketplaceRealm = lazy(() => import('./components/RealmScreens').then(m => ({ default: m.MarketplaceRealm })))
const MusicRealm = lazy(() => import('./components/RealmScreens').then(m => ({ default: m.MusicRealm })))
const FaithRealm = lazy(() => import('./components/RealmScreens').then(m => ({ default: m.FaithRealm })))
const BlockchainRealm = lazy(() => import('./components/RealmScreens').then(m => ({ default: m.BlockchainRealm })))
const PricingScreen = lazy(() => import('./components/PricingScreen'))
const HoloverseHub = lazy(() => import('./components/HoloverseHub'))
const BennieChat = lazy(() => import('./components/BennieChat'))
const OmniverseCommandCenter = lazy(() => import('./components/OmniverseCommandCenter'))
const AdvancedWorldSystems = lazy(() => import('./components/AdvancedWorldSystems'))
const KingdomsPressOperations = lazy(() => import('./components/KingdomsPressOperations'))
const ImmersiveWorldViewport = lazy(() => import('./components/ImmersiveWorldViewport'))
const AICafeRestaurant = lazy(() => import('./components/AICafeRestaurant'))
const SchoolNetworkPortal = lazy(() => import('./components/SchoolNetworkPortal'))
const HoloServicesHub = lazy(() => import('./components/HoloServicesHub'))
const HoloCoreCenter = lazy(() => import('./components/HoloCoreCenter'))
const FamilyLegacyHub = lazy(() => import('./components/FamilyLegacyHub'))
const QuantumEngineCenter = lazy(() => import('./components/QuantumEngineCenter'))
const SecurityCenter = lazy(() => import('./components/SecurityCenter'))
const OmniWearCenter = lazy(() => import('./components/OmniWearCenter'))
const TryAMMConnectCenter = lazy(() => import('./components/TryAMMConnectCenter'))
const EconomicLoopCenter = lazy(() => import('./components/EconomicLoopCenter'))
const QuantumZoomViewer = lazy(() => import('./components/QuantumZoomViewer'))
const NextDevelopmentTargetCenter = lazy(() => import('./components/NextDevelopmentTargetCenter'))
const QuantumTagArena = lazy(() => import('./components/QuantumTagArena'))
const ProAudioSuite = lazy(() => import('./components/ProAudioSuite'))
const SignLanguageHub = lazy(() => import('./components/SignLanguageHub'))
const AccessibilityRemoteHub = lazy(() => import('./components/AccessibilityRemoteHub'))
const LiveCenter = lazy(() => import('./components/LiveCenter'))
const StreamStudioFX = lazy(() => import('./components/StreamStudioFX'))
const QuantumLagBuster = lazy(() => import('./components/QuantumLagBuster'))
const QuantumBeatCenter = lazy(() => import('./components/QuantumBeatCenter'))
const OTTIsaiahTV = lazy(() => import('./components/OTTIsaiahTV'))
const PoyoAIStudio = lazy(() => import('./components/PoyoAIStudio'))
const PropertyVerseCenter = lazy(() => import('./components/PropertyVerseCenter'))
const StaysAgencyFamilyHub = lazy(() => import('./components/StaysAgencyFamilyHub'))

export default function App() {
  const screen = useGameStore(s => s.screen)
  const [showPricing, setShowPricing] = useState(false)
  const [showHoloverse, setShowHoloverse] = useState(false)
  const [showBennie, setShowBennie] = useState(false)
  const [showProAudio, setShowProAudio] = useState(false)
  const [showOmniverse, setShowOmniverse] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showPress, setShowPress] = useState(false)
  const [showImmersive, setShowImmersive] = useState(false)
  const [showCafe, setShowCafe] = useState(false)
  const [showSchoolNetwork, setShowSchoolNetwork] = useState(false)
  const [showHoloServices, setShowHoloServices] = useState(false)
  const [showHoloCore, setShowHoloCore] = useState(false)
  const [showFamilyLegacy, setShowFamilyLegacy] = useState(false)
  const [showQuantumEngine, setShowQuantumEngine] = useState(false)
  const [showSignLanguage, setShowSignLanguage] = useState(false)
  const [showAccessibilityRemote, setShowAccessibilityRemote] = useState(false)
  const [showLive, setShowLive] = useState(false)
  const [showStreamFX, setShowStreamFX] = useState(false)
  const [showLagBuster, setShowLagBuster] = useState(false)
  const [showQuantumBeat, setShowQuantumBeat] = useState(false)
  const [showOTT, setShowOTT] = useState(false)
  const [showSecurity, setShowSecurity] = useState(false)
  const [showOmniWear, setShowOmniWear] = useState(false)
  const [showConnect, setShowConnect] = useState(false)
  const [showPoyo, setShowPoyo] = useState(false)
  const [showEconomicLoop, setShowEconomicLoop] = useState(false)
  const [showQuantumZoom, setShowQuantumZoom] = useState(false)
  const [showNextDevelopment, setShowNextDevelopment] = useState(false)
  const [showQuantumTag, setShowQuantumTag] = useState(false)
  const [showPropertyVerse, setShowPropertyVerse] = useState(false)
  const [showStaysAgencyFamily, setShowStaysAgencyFamily] = useState(false)
  const [showNexus, setShowNexus] = useState(false)
  const [showSwipeTip, setShowSwipeTip] = useState(() => !localStorage.getItem('amm_swiped'))

  ;(window as any).__showPricing = () => setShowPricing(true)
  ;(window as any).__showHoloverse = () => setShowHoloverse(true)
  ;(window as any).__showBennie = () => setShowBennie(true)
  ;(window as any).__showProAudio = () => setShowProAudio(true)
  ;(window as any).__showOmniverse = () => setShowOmniverse(true)
  ;(window as any).__showAdvancedWorlds = () => setShowAdvanced(true)
  ;(window as any).__showSpaceVerse = () => setShowAdvanced(true)
  ;(window as any).__showPropertyVerse = () => setShowPropertyVerse(true)
  ;(window as any).__showStaysAgencyFamily = () => setShowStaysAgencyFamily(true)
  ;(window as any).__showKingdomsPress = () => setShowPress(true)
  ;(window as any).__showImmersiveWorlds = () => setShowImmersive(true)
  ;(window as any).__showAICafe = () => setShowCafe(true)
  ;(window as any).__showSchoolNetwork = () => setShowSchoolNetwork(true)
  ;(window as any).__showHoloServices = () => setShowHoloServices(true)
  ;(window as any).__showHoloCore = () => setShowHoloCore(true)
  ;(window as any).__showFamilyLegacy = () => setShowFamilyLegacy(true)
  ;(window as any).__showQuantumEngine = () => setShowQuantumEngine(true)
  ;(window as any).__showSignLanguage = () => setShowSignLanguage(true)
  ;(window as any).__showOmniAccess = () => setShowAccessibilityRemote(true)
  ;(window as any).__showTryAMMLive = () => setShowLive(true)
  ;(window as any).__showStreamStudioFX = () => setShowStreamFX(true)
  ;(window as any).__showQuantumLagBuster = () => setShowLagBuster(true)
  ;(window as any).__showQuantumBeat = () => setShowQuantumBeat(true)
  ;(window as any).__showIsaiahTV = () => setShowOTT(true)
  ;(window as any).__showSecurityCenter = () => setShowSecurity(true)
  ;(window as any).__showOmniWear = () => setShowOmniWear(true)
  ;(window as any).__showTryAMMConnect = () => setShowConnect(true)
  ;(window as any).__showHoloFon = () => setShowConnect(true)
  ;(window as any).__showQuantumEmail = () => setShowConnect(true)
  ;(window as any).__showPoyoAI = () => setShowPoyo(true)
  ;(window as any).__showEconomicLoop = () => setShowEconomicLoop(true)
  ;(window as any).__showQuantumZoom = () => setShowQuantumZoom(true)
  ;(window as any).__showNextDevelopment = () => setShowNextDevelopment(true)
  ;(window as any).__showQuantumTag = () => setShowQuantumTag(true)
  ;(window as any).__showCommandNexus = () => setShowNexus(true)

  const signedIn = screen !== 'intro' && screen !== 'login'
  const nexusItems = [
    ['TAG','QUANTUM TAG',()=>setShowQuantumTag(true),'BETA'],
    ['∞','ECONOMIC LOOP',()=>setShowEconomicLoop(true),'BETA'],
    ['🛡','SECURITY',()=>setShowSecurity(true),'LIVE'],
    ['AI','POYO AI STUDIO',()=>setShowPoyo(true),'BETA'],
    ['📡','TRYAMM CONNECT',()=>setShowConnect(true),'BETA'],
    ['📱','HOLO FON',()=>setShowConnect(true),'BETA'],
    ['✉','QUANTUM EMAIL',()=>setShowConnect(true),'BETA'],
    ['◉','OMNIVERSE',()=>setShowOmniverse(true),'BETA'],
    ['🏠','PROPERTYVERSE',()=>setShowPropertyVerse(true),'BETA'],
    ['🏡','STAYS · AGENCY · FAMILY',()=>setShowStaysAgencyFamily(true),'BETA'],
    ['◎','HOLO CORE',()=>setShowHoloCore(true),'BETA'],
    ['✦','HOLO SERVICES',()=>setShowHoloServices(true),'BETA'],
    ['⌚','OMNIWEAR',()=>setShowOmniWear(true),'BETA'],
    ['☕','AI CAFÉ',()=>setShowCafe(true),'BETA'],
    ['🎓','SCHOOL NETWORK',()=>setShowSchoolNetwork(true),'BETA'],
    ['◈','MY WORLD / IMMERSIVE',()=>setShowImmersive(true),'BETA'],
    ['SPACE','SPACEVERSE • TIME',()=>setShowAdvanced(true),'BETA'],
    ['🔭','QUANTUM ZOOM',()=>setShowQuantumZoom(true),'BETA'],
    ['ROAD','NEXT BUILD',()=>setShowNextDevelopment(true),'BETA'],
    ['📚','KINGDOMS PRESS',()=>setShowPress(true),'BETA'],
    ['♜','FAMILY LEGACY',()=>setShowFamilyLegacy(true),'BETA'],
    ['⚛','QUANTUM ENGINE',()=>setShowQuantumEngine(true),'BETA'],
    ['🤟','SIGN LANGUAGE',()=>setShowSignLanguage(true),'BETA'],
    ['♿','OMNI ACCESS',()=>setShowAccessibilityRemote(true),'BETA'],
    ['✨','STREAM FX',()=>setShowStreamFX(true),'BETA'],
    ['⚡','LAG BUSTER',()=>setShowLagBuster(true),'BETA'],
    ['♫','QUANTUM BEAT',()=>setShowQuantumBeat(true),'BETA'],
    ['▣','ISAIAH AI TV',()=>setShowOTT(true),'BETA'],
    ['💿','PRO AUDIO',()=>setShowProAudio(true),'BETA'],
    ['🌐','HOLOVERSE',()=>setShowHoloverse(true),'BETA'],
    ['$','PRICING',()=>setShowPricing(true),'LIVE'],
  ] as const

  return (
    <SwipeNavigator>
      <Suspense fallback={null}>
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#020212' }}>
        <LivingWorldsBridge />
        {screen === 'intro' && <TryAMMHome />}
        {screen === 'city' && <CityView />}
        {screen === 'sports' && <SportsRealm />}
        {screen === 'marketplace' && <MarketplaceRealm />}
        {screen === 'music' && <MusicRealm />}
        {screen === 'faith' && <FaithRealm />}
        {screen === 'blockchain' && <BlockchainRealm />}
        <NotifToast /><BennieButton /><InstallPrompt />

        {signedIn && <>
          <button type="button" aria-label="Open TryAMM LIVE Center" onClick={() => setShowLive(true)} style={{position:'fixed',left:12,bottom:72,zIndex:9000,background:'linear-gradient(135deg,#ff334e,#8f1744)',color:'#fff',border:'1px solid #ff8fa4aa',borderRadius:999,padding:'10px 14px',fontFamily:'monospace',fontSize:11,fontWeight:900,cursor:'pointer',boxShadow:'0 8px 28px #0008'}}>● LIVE</button>
          <button type="button" aria-label="Open Command Nexus" onClick={() => setShowNexus(v=>!v)} style={{position:'fixed',right:12,bottom:72,zIndex:9000,background:'linear-gradient(135deg,#0d2934,#181326)',color:'#e8b944',border:'1px solid #4fe3ff88',borderRadius:999,padding:'10px 14px',fontFamily:'monospace',fontSize:11,fontWeight:900,cursor:'pointer',boxShadow:'0 8px 28px #0008'}}>✦ COMMAND NEXUS</button>
        </>}

        {showNexus && signedIn && <div role="dialog" aria-label="TRYAMM Command Nexus" style={{position:'fixed',right:12,bottom:118,zIndex:10010,width:'min(92vw,440px)',maxHeight:'68vh',overflowY:'auto',background:'linear-gradient(160deg,#09131f,#070710)',border:'1px solid #4fe3ff66',borderRadius:22,boxShadow:'0 24px 80px #000c',padding:14}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,padding:'4px 4px 12px'}}><div><div style={{color:'#4fe3ff',fontSize:10,fontWeight:900,letterSpacing:3}}>TRYAMM</div><div style={{fontSize:18,color:'#fff',fontWeight:950}}>Command Nexus</div></div><button aria-label="Close Command Nexus" onClick={()=>setShowNexus(false)} style={{width:34,height:34,borderRadius:'50%',border:'1px solid #394557',background:'#101522',color:'#fff',cursor:'pointer'}}>×</button></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>
            {nexusItems.map(([icon,label,action,status])=><button key={label} onClick={()=>{setShowNexus(false);action()}} style={{minHeight:74,textAlign:'left',padding:11,border:'1px solid #1c2c3e',borderRadius:14,background:'#0b111b',color:'#fff',cursor:'pointer'}}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><span style={{fontSize:18}}>{icon}</span><span style={{fontSize:8,color:status==='LIVE'?'#78ffb4':'#e8b944',fontWeight:900}}>{status}</span></div><div style={{fontSize:10,fontWeight:950,marginTop:9,letterSpacing:.5}}>{label}</div></button>)}
          </div>
          <div style={{marginTop:10,fontSize:9,color:'#718096',lineHeight:1.5}}>Advanced systems stay available here without covering the main experience. Readiness labels distinguish live and beta features.</div>
        </div>}

        {showPricing && <div style={{position:'fixed',inset:0,zIndex:9999,background:'#020212'}}><PricingScreen onClose={() => setShowPricing(false)} /></div>}
        {showHoloverse && <div style={{position:'fixed',inset:0,zIndex:9998,background:'#020212'}}><HoloverseHub onClose={() => setShowHoloverse(false)} /></div>}
        {showBennie && <div style={{position:'fixed',inset:0,zIndex:9997,background:'#020212'}}><BennieChat onClose={() => setShowBennie(false)} /></div>}
        {showProAudio && <div style={{position:'fixed',inset:0,zIndex:9996,background:'#03040c'}}><ProAudioSuite onClose={() => setShowProAudio(false)} /></div>}
        {showPoyo && <PoyoAIStudio onClose={() => setShowPoyo(false)} />}
        {showEconomicLoop && <EconomicLoopCenter onClose={() => setShowEconomicLoop(false)} />}
        {showQuantumZoom && <QuantumZoomViewer onClose={() => setShowQuantumZoom(false)} />}
        {showNextDevelopment && <NextDevelopmentTargetCenter onClose={() => setShowNextDevelopment(false)} />}
        {showQuantumTag && <QuantumTagArena onClose={() => setShowQuantumTag(false)} />}
        {showOmniverse && <OmniverseCommandCenter onClose={() => setShowOmniverse(false)} />}
        {showPropertyVerse && <PropertyVerseCenter onClose={() => setShowPropertyVerse(false)} />}
        {showStaysAgencyFamily && <StaysAgencyFamilyHub onClose={() => setShowStaysAgencyFamily(false)} />}
        {showHoloCore && <HoloCoreCenter onClose={() => setShowHoloCore(false)} />}
        {showHoloServices && <HoloServicesHub onClose={() => setShowHoloServices(false)} />}
        {showOmniWear && <OmniWearCenter onClose={() => setShowOmniWear(false)} />}
        {showConnect && <TryAMMConnectCenter onClose={() => setShowConnect(false)} />}
        {showCafe && <AICafeRestaurant onClose={() => setShowCafe(false)} />}
        {showSchoolNetwork && <SchoolNetworkPortal onClose={() => setShowSchoolNetwork(false)} />}
        {showAdvanced && <AdvancedWorldSystems onClose={() => setShowAdvanced(false)} />}
        {showPress && <KingdomsPressOperations onClose={() => setShowPress(false)} />}
        {showImmersive && <ImmersiveWorldViewport onClose={() => setShowImmersive(false)} />}
        {showFamilyLegacy && <FamilyLegacyHub onClose={() => setShowFamilyLegacy(false)} />}
        {showQuantumEngine && <QuantumEngineCenter onClose={() => setShowQuantumEngine(false)} />}
        {showSecurity && <SecurityCenter onClose={() => setShowSecurity(false)} />}
        {showSignLanguage && <div style={{position:'fixed',inset:0,zIndex:10000,background:'#050816'}}><SignLanguageHub onClose={() => setShowSignLanguage(false)} /></div>}
        {showAccessibilityRemote && <AccessibilityRemoteHub onClose={() => setShowAccessibilityRemote(false)} />}
        {showLive && <div style={{position:'fixed',inset:0,zIndex:10020,background:'#030611'}}><LiveCenter onClose={() => setShowLive(false)} /></div>}
        {showStreamFX && <StreamStudioFX onClose={() => setShowStreamFX(false)} />}
        {showLagBuster && <QuantumLagBuster onClose={() => setShowLagBuster(false)} />}
        {showQuantumBeat && <QuantumBeatCenter onClose={() => setShowQuantumBeat(false)} />}
        {showOTT && <OTTIsaiahTV onClose={() => setShowOTT(false)} />}

        {showSwipeTip && signedIn && <SwipeTutorial onDismiss={() => {setShowSwipeTip(false);localStorage.setItem('amm_swiped','1')}} />}
      </div>
      </Suspense>
    </SwipeNavigator>
  )
}
