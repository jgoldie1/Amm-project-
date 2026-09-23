import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import StreetVerseSafeWorld from './components/StreetVerseSafeWorld'
import './accessibility/accessibility.css'

// Minimal Release-1 certification entry. This file intentionally excludes the
// full TRYAMM runtime graph so the deterministic HTML Chicago world can mount
// before any optional 3D, media, commerce, or global runtime code is evaluated.
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
  </StrictMode>,
)
