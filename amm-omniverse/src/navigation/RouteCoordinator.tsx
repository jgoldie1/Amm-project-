import { useEffect } from 'react'
import { useGameStore } from '../game/state/useGameStore'
import { PATH_BY_SCREEN, ROUTE_BY_PATH, normalizeRoutePath } from './routeRegistry'

function currentRoutePath(){
  const hash=window.location.hash.replace(/^#/,'').trim()
  if(hash)return normalizeRoutePath(hash)
  const pathname=window.location.pathname.trim()
  return normalizeRoutePath(pathname&&pathname!=='/'?pathname:'/')
}

function openCurrentRoute(){
  const path=currentRoutePath()
  const route=ROUTE_BY_PATH.get(path)
  if(!route)return
  if(route.kind==='screen'&&route.screen){
    if(useGameStore.getState().screen!==route.screen)useGameStore.getState().setScreen(route.screen)
    return
  }
  if(route.opener){
    const fn=(window as any)[route.opener]
    if(typeof fn==='function')fn()
  }
}

export default function RouteCoordinator(){
  const screen=useGameStore(s=>s.screen)

  useEffect(()=>{
    ;(window as any).__tryammNavigate=(path:string)=>{
      const normalized=normalizeRoutePath(path)
      if(window.location.hash!==`#${normalized}`)window.location.hash=normalized
      else openCurrentRoute()
    }
    ;(window as any).__showHoloGPT=()=>window.dispatchEvent(new CustomEvent('tryamm:open-hologpt'))
    const onRoute=()=>openCurrentRoute()
    window.addEventListener('hashchange',onRoute)
    window.addEventListener('popstate',onRoute)
    // Run after App assigns its overlay openers. Pathname fallback keeps direct /streetverse links working.
    const timer=window.setTimeout(onRoute,0)
    return()=>{window.clearTimeout(timer);window.removeEventListener('hashchange',onRoute);window.removeEventListener('popstate',onRoute);delete (window as any).__tryammNavigate}
  },[])

  useEffect(()=>{
    const path=PATH_BY_SCREEN.get(screen)
    if(!path)return
    const current=currentRoutePath()
    const currentRoute=ROUTE_BY_PATH.get(current)
    // Do not erase an explicitly-open overlay hash when its underlying screen changes.
    if(currentRoute?.kind==='overlay')return
    if(current!==path)history.replaceState(null,'',`${location.pathname}${location.search}#${path}`)
  },[screen])

  return null
}
