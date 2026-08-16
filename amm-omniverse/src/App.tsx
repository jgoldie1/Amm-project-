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
import OmniLaunchHub from './components/OmniLaunchHub'
import './styles.css'

const ProAudioSuite = lazy(() => import('./components/ProAudioSuite'))

export default function App() {
  const screen = useGameStore(s => s.screen)
  const [showPricing, setShowPricing] = useState(false)
  const [showHoloverse, setShowHoloverse] = useState(false)
  const [showBennie, setShowBennie] = useState(false)
  const [showProAudio, setShowProAudio] = useState(false)
  const [showOmni, setShowOmni] = useState(false)
  const [showSwipeTip, setShowSwipeTip] = useState(() => !localStorage.getItem('amm_swiped'))

  ;(window as any).__showPricing = () => setShowPricing(true)
  ;(window as any).__showHoloverse = () => setShowHoloverse(true)
  ;(window as any).__showBennie = () => setShowBennie(true)
  ;(window as any).__showProAudio = () => setShowProAudio(true)
  ;(window as any).__showOmni = () => setShowOmni(true)

  const insideApp = screen !== 'intro' && screen !== 'login'

  return (
    <SwipeNavigator>
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#020212', position: 'relative' }}>
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

        {insideApp && (
          <button
            onClick={() => setShowOmni(true)}
            aria-label="Open Omni launch hub"
            style={{
              position: 'fixed', right: 14, bottom: 72, zIndex: 9995,
              width: 58, height: 58, borderRadius: '50%', cursor: 'pointer',
              border: '1px solid #00ffcc', color: '#00ffcc', fontWeight: 900,
              fontFamily: 'monospace', letterSpacing: 1, background: 'rgba(2,2,18,.92)',
              boxShadow: '0 0 24px rgba(0,255,204,.28)'
            }}
          >
            OMNI
          </button>
        )}

        {showPricing && <div style={{position:'fixed',inset:0,zIndex:9999,background:'#020212'}}><PricingScreen onClose={() => setShowPricing(false)} /></div>}
        {showHoloverse && <div style={{position:'fixed',inset:0,zIndex:9998,background:'#020212'}}><HoloverseHub onClose={() => setShowHoloverse(false)} /></div>}
        {showBennie && <div style={{position:'fixed',inset:0,zIndex:9997,background:'#020212'}}><BennieChat onClose={() => setShowBennie(false)} /></div>}
        {showProAudio && <Suspense fallback={null}><div style={{position:'fixed',inset:0,zIndex:9996,background:'#03040c'}}><ProAudioSuite onClose={() => setShowProAudio(false)} /></div></Suspense>}
        {showOmni && <div style={{position:'fixed',inset:0,zIndex:10000,background:'#020212'}}><OmniLaunchHub onClose={() => setShowOmni(false)} onOpenHoloverse={() => { setShowOmni(false); setShowHoloverse(true) }} onOpenStudio={() => { setShowOmni(false); setShowProAudio(true) }} onOpenPricing={() => { setShowOmni(false); setShowPricing(true) }} /></div>}

        {showSwipeTip && insideApp && (
          <SwipeTutorial onDismiss={() => {
            setShowSwipeTip(false)
            localStorage.setItem('amm_swiped', '1')
          }} />
        )}
      </div>
    </SwipeNavigator>
  )
}
