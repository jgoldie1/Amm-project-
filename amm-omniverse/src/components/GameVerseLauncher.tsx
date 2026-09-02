import { lazy, Suspense, useEffect, useState } from 'react'
import { useGameStore } from '../game/state/useGameStore'
import StreetVerseOmniWorld from './StreetVerseOmniWorld'

const GameVerseHub=lazy(()=>import('./GameVerseHub'))

type GameVerseDetail={world?:string}
const PLAYABLE_PATHS=new Set(['/play','/game','/streetverse','/streetverse/play'])

function shouldOpenStreetVerse(){
  if(typeof window==='undefined')return false
  const url=new URL(window.location.href)
  return PLAYABLE_PATHS.has(url.pathname)||url.searchParams.get('play')==='streetverse'||url.searchParams.get('game')==='streetverse'
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

  if(playStreetVerse)return <StreetVerseOmniWorld onClose={closeStreetVerse}/>
  if(!open)return null
  return <Suspense fallback={<div style={{position:'fixed',inset:0,zIndex:12000,background:'#04050e'}}/>}><GameVerseHub initialWorld={world} onClose={()=>setOpen(false)} onEnterSports={()=>{setOpen(false);setScreen('sports')}} onEnterCity={()=>{setOpen(false);setScreen('city')}}/></Suspense>
}
