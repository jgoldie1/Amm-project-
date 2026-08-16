import { lazy, Suspense, useState } from 'react'
import { useGameStore } from './game/state/useGameStore'
import CityView from './components/CityView'
import { SportsRealm, MarketplaceRealm, MusicRealm, FaithRealm, BlockchainRealm } from './components/RealmScreens'
import { IntroScreen, LoginScreen, NotifToast } from './components/UIScreens'
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
import HoloServicesHub from './components/HoloServicesHub'
import HoloCoreCenter from './components/HoloCoreCenter'
import FamilyLegacyHub from './components/FamilyLegacyHub'
import QuantumEngineCenter from './components/QuantumEngineCenter'
import './styles.css'

const ProAudioSuite = lazy(() => import('./components/ProAudioSuite'))
const SignLanguageHub = lazy(() => import('./components/SignLanguageHub'))
const AccessibilityRemoteHub = lazy(() => import('./components/AccessibilityRemoteHub'))

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
  const [showHoloServices, setShowHoloServices] = useState(false)
  const [showHoloCore, setShowHoloCore] = useState(false)
  const [showFamilyLegacy, setShowFamilyLegacy] = useState(false)
  const [showQuantumEngine, setShowQuantumEngine] = useState(false)
  const [showSignLanguage, setShowSignLanguage] = useState(false)
  const [showAccessibilityRemote, setShowAccessibilityRemote] = useState(false)
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
  ;(window as any).__showHoloServices = () => setShowHoloServices(true)
  ;(window as any).__showHoloCore = () => setShowHoloCore(true)
  ;(window as any).__showFamilyLegacy = () => setShowFamilyLegacy(true)
  ;(window as any).__showQuantumEngine = () => setShowQuantumEngine(true)
  ;(window as any).__showSignLanguage = () => setShowSignLanguage(true)
  ;(window as any).__showOmniAccess = () => setShowAccessibilityRemote(true)

  const signedIn = screen !== 'intro' && screen !== 'login'

  return (
    <SwipeNavigator>
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#020212' }}>
        <LivingWorldsBridge />

        {screen === 'intro' && <IntroScreen />}
        {screen === 'login' && <LoginScreen />}
        {screen === 'city' && <CityView />}
        {screen === 'sports' && <SportsRealm />}
        {screen === 'marketplace' && <MarketplaceRealm />}
        {screen === 'music' && <MusicRealm />}
        {screen === 'faith' && <FaithRealm />}
        {screen === 'blockchain' && <BlockchainRealm />}

        <NotifToast />
        <BennieButton />
        <InstallPrompt />

        {signedIn && (
          <>
            <button type="button" aria-label="Open Omniverse command center" onClick={() => setShowOmniverse(true)} style={{position:'fixed',right:12,bottom:72,zIndex:9000,background:'linear-gradient(135deg,#221744,#003f39)',color:'#ffd700',border:'1px solid #00ffcc88',borderRadius:999,padding:'9px 13px',fontFamily:'monospace',fontSize:11,fontWeight:900,cursor:'pointer',boxShadow:'0 0 18px rgba(0,255,204,.18)'}}>◉ OMNIVERSE</button>
            <button type="button" aria-label="Open Holo Core" onClick={() => setShowHoloCore(true)} style={{position:'fixed',right:12,bottom:112,zIndex:9000,background:'linear-gradient(135deg,#122541,#2e173e)',color:'#ffd166',border:'1px solid #ffd16688',borderRadius:999,padding:'8px 12px',fontFamily:'monospace',fontSize:10,fontWeight:900,cursor:'pointer',boxShadow:'0 0 18px rgba(255,209,102,.14)'}}>◎ HOLO CORE</button>
            <button type="button" aria-label="Open Holo Services" onClick={() => setShowHoloServices(true)} style={{position:'fixed',right:12,bottom:150,zIndex:9000,background:'linear-gradient(135deg,#06213f,#05343d)',color:'#52e5ff',border:'1px solid #52e5ff88',borderRadius:999,padding:'8px 12px',fontFamily:'monospace',fontSize:10,fontWeight:900,cursor:'pointer',boxShadow:'0 0 18px rgba(82,229,255,.16)'}}>✦ HOLO SERVICES</button>
            <button type="button" aria-label="Open AI Cafe" onClick={() => setShowCafe(true)} style={{position:'fixed',right:12,bottom:188,zIndex:9000,background:'linear-gradient(135deg,#3a2613,#1e160e)',color:'#ffd166',border:'1px solid #ffd16677',borderRadius:999,padding:'8px 12px',fontFamily:'monospace',fontSize:10,fontWeight:900,cursor:'pointer'}}>☕ AI CAFÉ</button>
            <button type="button" aria-label="Open advanced Living Worlds systems" onClick={() => setShowAdvanced(true)} style={{position:'fixed',right:12,bottom:226,zIndex:9000,background:'linear-gradient(135deg,#102d4e,#35134e)',color:'#78d5ff',border:'1px solid #78d5ff88',borderRadius:999,padding:'8px 12px',fontFamily:'monospace',fontSize:10,fontWeight:900,cursor:'pointer'}}>SPACE • TIME • LIFE</button>
            <button type="button" aria-label="Open Kingdoms Press operations" onClick={() => setShowPress(true)} style={{position:'fixed',right:12,bottom:264,zIndex:9000,background:'linear-gradient(135deg,#4a123c,#211435)',color:'#ff9ee8',border:'1px solid #ff9ee877',borderRadius:999,padding:'8px 12px',fontFamily:'monospace',fontSize:10,fontWeight:900,cursor:'pointer'}}>📚 KINGDOMS PRESS</button>
            <button type="button" aria-label="Open immersive Living Worlds viewport" onClick={() => setShowImmersive(true)} style={{position:'fixed',right:12,bottom:302,zIndex:9000,background:'linear-gradient(135deg,#071a31,#17321f)',color:'#bdeaff',border:'1px solid #8cff9877',borderRadius:999,padding:'8px 12px',fontFamily:'monospace',fontSize:10,fontWeight:900,cursor:'pointer'}}>◈ IMMERSIVE WORLD</button>
            <button type="button" aria-label="Open Family Legacy systems" onClick={() => setShowFamilyLegacy(true)} style={{position:'fixed',right:12,bottom:340,zIndex:9000,background:'linear-gradient(135deg,#3b2b08,#2a102e)',color:'#ffe493',border:'1px solid #ffe49388',borderRadius:999,padding:'8px 12px',fontFamily:'monospace',fontSize:10,fontWeight:900,cursor:'pointer'}}>♜ FAMILY LEGACY</button>
            <button type="button" aria-label="Open Quantum adaptive engine" onClick={() => setShowQuantumEngine(true)} style={{position:'fixed',right:12,bottom:378,zIndex:9000,background:'linear-gradient(135deg,#07263a,#27144a)',color:'#73efff',border:'1px solid #73efff88',borderRadius:999,padding:'8px 12px',fontFamily:'monospace',fontSize:10,fontWeight:900,cursor:'pointer'}}>⚛ QUANTUM ENGINE</button>
            <button type="button" aria-label="Open Sign Language Hub" onClick={() => setShowSignLanguage(true)} style={{position:'fixed',right:12,bottom:416,zIndex:9000,background:'linear-gradient(135deg,#ffffff,#bdeaff)',color:'#071225',border:'1px solid #ffffffaa',borderRadius:999,padding:'8px 12px',fontFamily:'monospace',fontSize:10,fontWeight:900,cursor:'pointer'}}>🤟 SIGN LANGUAGE</button>
            <button type="button" aria-label="Open Omni accessibility and universal remote" onClick={() => setShowAccessibilityRemote(true)} style={{position:'fixed',right:12,bottom:454,zIndex:9000,background:'linear-gradient(135deg,#4fe3ff,#8fffc1)',color:'#04121a',border:'1px solid #ffffffaa',borderRadius:999,padding:'8px 12px',fontFamily:'monospace',fontSize:10,fontWeight:900,cursor:'pointer'}}>♿ OMNI ACCESS</button>
          </>
        )}

        {showPricing && <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#020212' }}><PricingScreen onClose={() => setShowPricing(false)} /></div>}
        {showHoloverse && <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: '#020212' }}><HoloverseHub onClose={() => setShowHoloverse(false)} /></div>}
        {showBennie && <div style={{ position: 'fixed', inset: 0, zIndex: 9997, background: '#020212' }}><BennieChat onClose={() => setShowBennie(false)} /></div>}
        {showProAudio && <Suspense fallback={null}><div style={{ position: 'fixed', inset: 0, zIndex: 9996, background: '#03040c' }}><ProAudioSuite onClose={() => setShowProAudio(false)} /></div></Suspense>}
        {showOmniverse && <OmniverseCommandCenter onClose={() => setShowOmniverse(false)} />}
        {showHoloCore && <HoloCoreCenter onClose={() => setShowHoloCore(false)} />}
        {showHoloServices && <HoloServicesHub onClose={() => setShowHoloServices(false)} />}
        {showCafe && <AICafeRestaurant onClose={() => setShowCafe(false)} />}
        {showAdvanced && <AdvancedWorldSystems onClose={() => setShowAdvanced(false)} />}
        {showPress && <KingdomsPressOperations onClose={() => setShowPress(false)} />}
        {showImmersive && <ImmersiveWorldViewport onClose={() => setShowImmersive(false)} />}
        {showFamilyLegacy && <FamilyLegacyHub onClose={() => setShowFamilyLegacy(false)} />}
        {showQuantumEngine && <QuantumEngineCenter onClose={() => setShowQuantumEngine(false)} />}
        {showSignLanguage && <Suspense fallback={null}><div style={{position:'fixed',inset:0,zIndex:10000,background:'#050816'}}><SignLanguageHub onClose={() => setShowSignLanguage(false)} /></div></Suspense>}
        {showAccessibilityRemote && <Suspense fallback={null}><AccessibilityRemoteHub onClose={() => setShowAccessibilityRemote(false)} /></Suspense>}

        {showSwipeTip && signedIn && (
          <SwipeTutorial onDismiss={() => {
            setShowSwipeTip(false)
            localStorage.setItem('amm_swiped', '1')
          }} />
        )}
      </div>
    </SwipeNavigator>
  )
}
