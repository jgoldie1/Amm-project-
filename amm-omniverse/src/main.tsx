import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import UniversalAccessRuntime from './components/UniversalAccessRuntime'
import AccessibilityStatement from './components/AccessibilityStatement'
import './accessibility/accessibility.css'

const StreetVerseGeoSpawnBridge=lazy(()=>import('./components/StreetVerseGeoSpawnBridge'))
const StreetVerseNextLevelHUD=lazy(()=>import('./components/StreetVerseNextLevelHUD'))

const currentPath=window.location.pathname
const isAccessibility=currentPath==='/accessibility'||currentPath==='/accessibility/'
const isStreetVerse=currentPath.startsWith('/streetverse')
const routeFallback=<div role="status" aria-live="polite" style={{position:'fixed',inset:0,display:'grid',placeItems:'center',background:'#050505',color:'#fff'}}>LOADING…</div>

let routeContent
if(isAccessibility) routeContent=<AccessibilityStatement />
else if(isStreetVerse) routeContent=<><Suspense fallback={routeFallback}><StreetVerseGeoSpawnBridge onClose={()=>{window.location.href='/'}} /><StreetVerseNextLevelHUD /></Suspense></>
else routeContent=<App />

createRoot(document.getElementById('root')!).render(<StrictMode><UniversalAccessRuntime />{routeContent}</StrictMode>)
