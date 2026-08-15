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
import { lazy, Suspense, useState } from 'react'
const ProAudioSuite = lazy(() => import('./components/ProAudioSuite'))
const SignLanguageHub = lazy(() => import('./components/SignLanguageHub'))
import './styles.css'

export default function App() {
  const screen = useGameStore(s => s.screen)
  const [showPricing, setShowPricing] = useState(false)
  const [showHoloverse, setShowHoloverse] = useState(false)
  const [showBennie, setShowBennie] = useState(false)
  const [showProAudio, setShowProAudio] = useState(false)
  const [showSignLanguage, setShowSignLanguage] = useState(false)
  const [showSwipeTip, setShowSwipeTip] = useState(() => !localStorage.getItem('amm_swiped'))

  ;(window as any).__showPricing = () => setShowPricing(true)
  ;(window as any).__showHoloverse = () => setShowHoloverse(true)
  ;(window as any).__showBennie = () => setShowBennie(true)
  ;(window as any).__showProAudio = () => setShowProAudio(true)
  ;(window as any).__showSignLanguage = () => setShowSignLanguage(true)

  return (
    <SwipeNavigator>
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#020212' }}>
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

        {screen !== 'intro' && screen !== 'login' && (
          <button
            type="button"
            aria-label="Open Sign Language Hub"
            title="Sign Language Hub"
            onClick={() => setShowSignLanguage(true)}
            style={{ position: 'fixed', right: 18, bottom: 82, zIndex: 9100, width: 52, height: 52, borderRadius: 18, border: '1px solid rgba(255,255,255,.24)', background: '#ffffff', color: '#080d22', fontSize: 24, cursor: 'pointer', boxShadow: '0 12px 32px rgba(0,0,0,.35)' }}
          >
            🤟
          </button>
        )}

        {showPricing && <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#020212' }}><PricingScreen onClose={() => setShowPricing(false)} /></div>}
        {showHoloverse && <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: '#020212' }}><HoloverseHub onClose={() => setShowHoloverse(false)} /></div>}
        {showBennie && <div style={{ position: 'fixed', inset: 0, zIndex: 9997, background: '#020212' }}><BennieChat onClose={() => setShowBennie(false)} /></div>}
        {showProAudio && <Suspense fallback={null}><div style={{ position: 'fixed', inset: 0, zIndex: 9996, background: '#03040c' }}><ProAudioSuite onClose={() => setShowProAudio(false)} /></div></Suspense>}
        {showSignLanguage && <Suspense fallback={null}><div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: '#050816' }}><SignLanguageHub onClose={() => setShowSignLanguage(false)} /></div></Suspense>}
        {showSwipeTip && screen !== 'intro' && screen !== 'login' && <SwipeTutorial onDismiss={() => { setShowSwipeTip(false); localStorage.setItem('amm_swiped', '1') }} />}
      </div>
    </SwipeNavigator>
  )
}
