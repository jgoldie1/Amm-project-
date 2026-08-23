import { lazy, Suspense, useEffect, useState } from 'react'
import { useGameStore } from '../game/state/useGameStore'

const GameVerseHub=lazy(()=>import('./GameVerseHub'))
const PlayableBeta=lazy(()=>import('./PlayableBeta'))

type GameVerseDetail={world?:string}

function shouldOpenPlayableBeta(){
  if(typeof window==='undefined')return false
  const url=new URL(window.location.href)
  return url.pathname==='/play'||url.pathname==='/game'||url.searchParams.get('play')==='beta'||url.searchParams.get('game')==='streetverse'
}

export default function GameVerseLauncher(){
  const setScreen=useGameStore(s=>s.setScreen)
  const [open,setOpen]=useState(false)
  const [playBeta,setPlayBeta]=useState(()=>shouldOpenPlayableBeta())
  const [world,setWorld]=useState<string|undefined>()

  useEffect(()=>{
    const show=(detail?:GameVerseDetail)=>{setWorld(detail?.world);setOpen(true)}
    const launchBeta=()=>{setOpen(false);setPlayBeta(true)}
    ;(window as any).__showGameVerse=(worldSlug?:string)=>show({world:worldSlug})
    ;(window as any).__showPlayableBeta=launchBeta
    const handler=(event:Event)=>show((event as CustomEvent<GameVerseDetail>).detail)
    const betaHandler=()=>launchBeta()
    const popHandler=()=>{if(shouldOpenPlayableBeta())launchBeta()}
    window.addEventListener('tryamm:gameverse-open',handler)
    window.addEventListener('tryamm:playable-beta-open',betaHandler)
    window.addEventListener('popstate',popHandler)
    return()=>{
      window.removeEventListener('tryamm:gameverse-open',handler)
      window.removeEventListener('tryamm:playable-beta-open',betaHandler)
      window.removeEventListener('popstate',popHandler)
      delete (window as any).__showGameVerse
      delete (window as any).__showPlayableBeta
    }
  },[])

  const closeBeta=()=>{
    setPlayBeta(false)
    if(window.location.pathname==='/play'||window.location.pathname==='/game'){
      window.history.replaceState({},'',window.location.origin+'/')
    }
  }

  if(playBeta)return <Suspense fallback={<div style={{position:'fixed',inset:0,zIndex:14000,background:'#04050e'}}/>}><PlayableBeta onClose={closeBeta}/></Suspense>
  if(!open)return <button type="button" aria-label="Open StreetVerse playable beta" onClick={()=>setPlayBeta(true)} style={{position:'fixed',right:12,bottom:122,zIndex:8995,border:'1px solid #4fe3ff88',borderRadius:999,padding:'10px 14px',background:'linear-gradient(135deg,#071b27,#171129)',color:'#4FE3FF',fontSize:10,fontWeight:950,letterSpacing:1,cursor:'pointer',boxShadow:'0 8px 28px #0009'}}>🎮 PLAY STREETVERSE</button>
  return <Suspense fallback={<div style={{position:'fixed',inset:0,zIndex:12000,background:'#04050e'}}/>}>
    <GameVerseHub
      initialWorld={world}
      onClose={()=>setOpen(false)}
      onEnterSports={()=>{setOpen(false);setScreen('sports')}}
      onEnterCity={()=>{setOpen(false);setScreen('city')}}
    />
  </Suspense>
}
