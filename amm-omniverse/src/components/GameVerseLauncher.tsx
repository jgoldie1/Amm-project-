import { Component, lazy, Suspense, useEffect, useState, type ErrorInfo, type ReactNode } from 'react'
import { useGameStore } from '../game/state/useGameStore'

const StreetVerseOmniWorld=lazy(()=>import('./StreetVerseOmniWorld'))
const StreetVerseSafeWorld=lazy(()=>import('./StreetVerseSafeWorld'))
const GameVerseHub=lazy(()=>import('./GameVerseHub'))

type GameVerseDetail={world?:string}
const PLAYABLE_PATHS=new Set(['/play','/game','/streetverse','/streetverse/play'])

function shouldOpenStreetVerse(){
  if(typeof window==='undefined')return false
  const url=new URL(window.location.href)
  return PLAYABLE_PATHS.has(url.pathname)||url.searchParams.get('play')==='streetverse'||url.searchParams.get('game')==='streetverse'
}
function shouldUseSafeWorld(){
  if(typeof window==='undefined')return false
  const url=new URL(window.location.href)
  if(url.searchParams.get('full3d')==='1')return false
  if(url.searchParams.get('safe')==='1')return true
  const ua=navigator.userAgent
  const ios=ua.match(/OS (\d+)_/i)
  if(/iPhone|iPad|iPod/i.test(ua)&&ios&&Number(ios[1])<17)return true
  try{
    const c=document.createElement('canvas')
    return !Boolean(c.getContext('webgl2')||c.getContext('webgl'))
  }catch{return true}
}

type BoundaryProps={fallback:ReactNode;children:ReactNode}
type BoundaryState={failed:boolean}
class StreetVerseBoundary extends Component<BoundaryProps,BoundaryState>{
  state:BoundaryState={failed:false}
  static getDerivedStateFromError(){return {failed:true}}
  componentDidCatch(error:Error,info:ErrorInfo){console.error('StreetVerse 3D render failed; switching to safe world',error,info)}
  render(){return this.state.failed?this.props.fallback:this.props.children}
}

export default function GameVerseLauncher(){
  const setScreen=useGameStore(s=>s.setScreen)
  const [open,setOpen]=useState(false)
  const [playStreetVerse,setPlayStreetVerse]=useState(()=>shouldOpenStreetVerse())
  const [world,setWorld]=useState<string|undefined>()

  useEffect(()=>{
    const show=(detail?:GameVerseDetail)=>{setWorld(detail?.world);setOpen(true)}
    const launchStreetVerse=()=>{setOpen(false);window.history.pushState({},'',window.location.origin+'/streetverse');setPlayStreetVerse(true)}
    ;(window as any).__showGameVerse=(worldSlug?:string)=>show({world:worldSlug})
    ;(window as any).__showPlayableBeta=launchStreetVerse
    ;(window as any).__launchStreetVerse=launchStreetVerse
    ;(window as any).__showStreetVerse=launchStreetVerse
    const handler=(event:Event)=>show((event as CustomEvent<GameVerseDetail>).detail)
    const streetVerseHandler=()=>launchStreetVerse()
    const popHandler=()=>{if(shouldOpenStreetVerse())setPlayStreetVerse(true)}
    window.addEventListener('tryamm:gameverse-open',handler)
    window.addEventListener('tryamm:playable-beta-open',streetVerseHandler)
    window.addEventListener('tryamm:streetverse-open',streetVerseHandler)
    window.addEventListener('popstate',popHandler)
    return()=>{
      window.removeEventListener('tryamm:gameverse-open',handler)
      window.removeEventListener('tryamm:playable-beta-open',streetVerseHandler)
      window.removeEventListener('tryamm:streetverse-open',streetVerseHandler)
      window.removeEventListener('popstate',popHandler)
      delete (window as any).__showGameVerse;delete (window as any).__showPlayableBeta;delete (window as any).__launchStreetVerse;delete (window as any).__showStreetVerse
    }
  },[])

  const closeStreetVerse=()=>{setPlayStreetVerse(false);if(PLAYABLE_PATHS.has(window.location.pathname))window.history.replaceState({},'',window.location.origin+'/')}

  if(playStreetVerse){
    const fallback=<Suspense fallback={<div style={{position:'fixed',inset:0,zIndex:17000,background:'#02050a',color:'#fff',display:'grid',placeItems:'center'}}>Loading StreetVerse safe mode…</div>}><StreetVerseSafeWorld onClose={closeStreetVerse}/></Suspense>
    if(shouldUseSafeWorld())return fallback
    return <StreetVerseBoundary fallback={fallback}><Suspense fallback={<div style={{position:'fixed',inset:0,zIndex:12000,background:'#04050e',color:'#fff',display:'grid',placeItems:'center'}}>Loading StreetVerse 3D…</div>}><StreetVerseOmniWorld onClose={closeStreetVerse}/></Suspense></StreetVerseBoundary>
  }
  if(!open)return null
  return <Suspense fallback={<div style={{position:'fixed',inset:0,zIndex:12000,background:'#04050e'}}/>}><GameVerseHub initialWorld={world} onClose={()=>setOpen(false)} onEnterSports={()=>{setOpen(false);setScreen('sports')}} onEnterCity={()=>{setOpen(false);setScreen('city')}}/></Suspense>
}
