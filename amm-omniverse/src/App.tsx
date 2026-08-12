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
import './styles.css'

const ProAudioSuite = lazy(() => import('./components/ProAudioSuite'))

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
  const [showSwipeTip, setShowSwipeTip] = useState(() => !localStorage.getItem('amm_swiped'))

  ;(window as any).__showPricing = () => setShowPricing(true)
  ;(window as any).__showHoloverse = () => setShowHoloverse(true)
  ;(window as any).__showBennie = () => setShowBennie(true)
  ;(window as any).__showProAudio = () => setShowProAudio(true)
  ;(window as any).__showOmniverse = () => setShowOmniverse(true)
  ;(window as any).__showAdvancedWorlds = () => setShowAdvanced(true)
  ;(window as any).__showKingdomsPress = () => setShowPress(true)
  ;(window as any).__showImmersiveWorlds = () => setShowImmersive(true)

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
            <button type="button" aria-label="Open advanced Living Worlds systems" onClick={() => setShowAdvanced(true)} style={{position:'fixed',right:12,bottom:112,zIndex:9000,background:'linear-gradient(135deg,#102d4e,#35134e)',color:'#78d5ff',border:'1px solid #78d5ff88',borderRadius:999,padding:'8px 12px',fontFamily:'monospace',fontSize:10,fontWeight:900,cursor:'pointer',boxShadow:'0 0 18px rgba(120,213,255,.15)'}}>✦ SPACE • TIME • LIFE</button>
            <button type="button" aria-label="Open Kingdoms Press operations" onClick={() => setShowPress(true)} style={{position:'fixed',right:12,bottom:150,zIndex:9000,background:'linear-gradient(135deg,#4a123c,#211435)',color:'#ff9ee8',border:'1px solid #ff9ee877',borderRadius:999,padding:'8px 12px',fontFamily:'monospace',fontSize:10,fontWeight:900,cursor:'pointer',boxShadow:'0 0 18px rgba(255,158,232,.12)'}}>📚 KINGDOMS PRESS</button>
            <button type="button" aria-label="Open immersive Living Worlds viewport" onClick={() => setShowImmersive(true)} style={{position:'fixed',right:12,bottom:188,zIndex:9000,background:'linear-gradient(135deg,#071a31,#17321f)',color:'#bdeaff',border:'1px solid #8cff9877',borderRadius:999,padding:'8px 12px',fontFamily:'monospace',fontSize:10,fontWeight:900,cursor:'pointer',boxShadow:'0 0 18px rgba(140,255,152,.12)'}}>◈ IMMERSIVE WORLD</button>
          </>
        )}

        {showPricing && <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#020212' }}><PricingScreen onClose={() => setShowPricing(false)} /></div>}
        {showHoloverse && <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: '#020212' }}><HoloverseHub onClose={() => setShowHoloverse(false)} /></div>}
        {showBennie && <div style={{ position: 'fixed', inset: 0, zIndex: 9997, background: '#020212' }}><BennieChat onClose={() => setShowBennie(false)} /></div>}
        {showProAudio && <Suspense fallback={null}><div style={{ position: 'fixed', inset: 0, zIndex: 9996, background: '#03040c' }}><ProAudioSuite onClose={() => setShowProAudio(false)} /></div></Suspense>}
        {showOmniverse && <OmniverseCommandCenter onClose={() => setShowOmniverse(false)} />}
        {showAdvanced && <AdvancedWorldSystems onClose={() => setShowAdvanced(false)} />}
        {showPress && <KingdomsPressOperations onClose={() => setShowPress(false)} />}
        {showImmersive && <ImmersiveWorldViewport onClose={() => setShowImmersive(false)} />}

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
