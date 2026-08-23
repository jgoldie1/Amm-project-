import { lazy, Suspense, useState } from 'react'
import { useGameStore } from './game/state/useGameStore'
import CityView from './components/CityView'
import { SportsRealm, MarketplaceRealm, MusicRealm, FaithRealm, BlockchainRealm } from './components/RealmScreens'
import { LoginScreen, NotifToast } from './components/UIScreens'
import TryAMMHome from './components/TryAMMHome'
import InstallPrompt from './components/InstallPrompt'
import PricingScreen from './components/PricingScreen'
import HoloverseHub from './components/HoloverseHub'
import { BennieButton } from './components/BennieChatbot'
import BennieChat from './components/BennieChat'
import { SwipeNavigator, SwipeTutorial } from './components/SwipeNavigator'
import LivingWorldsBridge from './components/LivingWorldsBridge'
import OmniverseCommandCenter from './components/OmniverseCommandCenter'
import AdvancedWorldSystems from './components/AdvancedWorldSystems'
import KingdomsPressOperations from './components/KingdomsPressOperations'
import ImmersiveWorldViewport from './components/ImmersiveWorldViewport'
import AICafeRestaurant from './components/AICafeRestaurant'
import SchoolNetworkPortal from './components/SchoolNetworkPortal'
import HoloServicesHub from './components/HoloServicesHub'
import HoloCoreCenter from './components/HoloCoreCenter'
import FamilyLegacyHub from './components/FamilyLegacyHub'
import QuantumEngineCenter from './components/QuantumEngineCenter'
import SecurityCenter from './components/SecurityCenter'
import OmniWearCenter from './components/OmniWearCenter'
import './styles.css'

const ProAudioSuite = lazy(() => import('./components/ProAudioSuite'))
const SignLanguageHub = lazy(() => import('./components/SignLanguageHub'))
const AccessibilityRemoteHub = lazy(() => import('./components/AccessibilityRemoteHub'))
const LiveCenter = lazy(() => import('./components/LiveCenter'))
const StreamStudioFX = lazy(() => import('./components/StreamStudioFX'))
const QuantumLagBuster = lazy(() => import('./components/QuantumLagBuster'))
const QuantumBeatCenter = lazy(() => import('./components/QuantumBeatCenter'))
const OTTIsaiahTV = lazy(() => import('./components/OTTIsaiahTV'))

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
  const [showNexus, setShowNexus] = useState(false)
  const [showSwipeTip, setShowSwipeTip] = useState(() => !localStorage.getItem('amm_swiped'))

  ;(window as any).__showPricing = () => setShowPricing(true)
  ;(window as any).__showHoloverse = () => setShowHoloverse(true)
  ;(window as any).__showBennie = () => setShowBennie(true)
  ;(window as any).__showProAudio = () => setShowProAudio(true)
  ;(window as any).__showOmniverse = () => setShowOmniverse(true)
  ;(window as any).__showAdvancedWorlds = () => setShowAdvanced(true)
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
  ;(window as any).__showCommandNexus = () => setShowNexus(true)

  const signedIn = screen !== 'intro' && screen !== 'login'
  const nexusItems = [
    ['🛡','SECURITY',()=>setShowSecurity(true),'LIVE'],
    ['◉','OMNIVERSE',()=>setShowOmniverse(true),'BETA'],
    ['◎','HOLO CORE',()=>setShowHoloCore(true),'BETA'],
    ['✦','HOLO SERVICES',()=>setShowHoloServices(true),'BETA'],
    ['⌚','OMNIWEAR',()=>setShowOmniWear(true),'BETA'],
    ['☕','AI CAFÉ',()=>setShowCafe(true),'BETA'],
    ['🎓','SCHOOL NETWORK',()=>setShowSchoolNetwork(true),'BETA'],
    ['◈','IMMERSIVE WORLD',()=>setShowImmersive(true),'BETA'],
    ['SPACE','TIME • LIFE',()=>setShowAdvanced(true),'BETA'],
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
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#020212' }}>
        <LivingWorldsBridge />
        {screen === 'intro' && <TryAMMHome />}
        {screen === 'login' && <LoginScreen />}
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
        {showProAudio && <Suspense fallback={null}><div style={{position:'fixed',inset:0,zIndex:9996,background:'#03040c'}}><ProAudioSuite onClose={() => setShowProAudio(false)} /></div></Suspense>}
        {showOmniverse && <OmniverseCommandCenter onClose={() => setShowOmniverse(false)} />}
        {showHoloCore && <HoloCoreCenter onClose={() => setShowHoloCore(false)} />}
        {showHoloServices && <HoloServicesHub onClose={() => setShowHoloServices(false)} />}
        {showOmniWear && <OmniWearCenter onClose={() => setShowOmniWear(false)} />}
        {showCafe && <AICafeRestaurant onClose={() => setShowCafe(false)} />}
        {showSchoolNetwork && <SchoolNetworkPortal onClose={() => setShowSchoolNetwork(false)} />}
        {showAdvanced && <AdvancedWorldSystems onClose={() => setShowAdvanced(false)} />}
        {showPress && <KingdomsPressOperations onClose={() => setShowPress(false)} />}
        {showImmersive && <ImmersiveWorldViewport onClose={() => setShowImmersive(false)} />}
        {showFamilyLegacy && <FamilyLegacyHub onClose={() => setShowFamilyLegacy(false)} />}
        {showQuantumEngine && <QuantumEngineCenter onClose={() => setShowQuantumEngine(false)} />}
        {showSecurity && <SecurityCenter onClose={() => setShowSecurity(false)} />}
        {showSignLanguage && <Suspense fallback={null}><div style={{position:'fixed',inset:0,zIndex:10000,background:'#050816'}}><SignLanguageHub onClose={() => setShowSignLanguage(false)} /></div></Suspense>}
        {showAccessibilityRemote && <Suspense fallback={null}><AccessibilityRemoteHub onClose={() => setShowAccessibilityRemote(false)} /></Suspense>}
        {showLive && <Suspense fallback={null}><div style={{position:'fixed',inset:0,zIndex:10020,background:'#030611'}}><LiveCenter onClose={() => setShowLive(false)} /></div></Suspense>}
        {showStreamFX && <Suspense fallback={null}><StreamStudioFX onClose={() => setShowStreamFX(false)} /></Suspense>}
        {showLagBuster && <Suspense fallback={null}><QuantumLagBuster onClose={() => setShowLagBuster(false)} /></Suspense>}
        {showQuantumBeat && <Suspense fallback={null}><QuantumBeatCenter onClose={() => setShowQuantumBeat(false)} /></Suspense>}
        {showOTT && <Suspense fallback={null}><OTTIsaiahTV onClose={() => setShowOTT(false)} /></Suspense>}

        {showSwipeTip && signedIn && <SwipeTutorial onDismiss={() => {setShowSwipeTip(false);localStorage.setItem('amm_swiped','1')}} />}
      </div>
    </SwipeNavigator>
  )
}
