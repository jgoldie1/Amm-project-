import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import StreetVerseSafeWorld from './components/StreetVerseSafeWorld'
import StreetVerseReelEventBridge from './components/StreetVerseReelEventBridge'
import './accessibility/accessibility.css'

const params = new URLSearchParams(window.location.search)
const communityAreaNumber = params.get('communityArea') || params.get('community') || undefined

document.documentElement.dataset.tryammStreetverseSafe = 'true'
document.documentElement.dataset.tryammStreetverseCommunity = String(communityAreaNumber || '')
document.documentElement.dataset.tryammStreetverseInitialSearch = window.location.search

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('[TRYAMM] Missing #root mount element')

createRoot(rootElement).render(
  <StrictMode>
    <StreetVerseSafeWorld
      communityAreaNumber={communityAreaNumber}
      onClose={() => { window.location.href = '/' }}
    />
    <StreetVerseReelEventBridge />
  </StrictMode>,
)
