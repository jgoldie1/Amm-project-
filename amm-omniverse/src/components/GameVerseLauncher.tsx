import { lazy, Suspense, useEffect, useState } from 'react'
import { useGameStore } from '../game/state/useGameStore'

const GameVerseHub=lazy(()=>import('./GameVerseHub'))
const PlayableBeta=lazy(()=>import('./PlayableBeta'))

type GameVerseDetail={world?:string}

export default function GameVerseLauncher(){
  const setScreen=useGameStore(s=>s.setScreen)
  const [open,setOpen]=useState(false)
  const [playBeta,setPlayBeta]=useState(false)
  const [world,setWorld]=useState<string|undefined>()

  useEffect(()=>{
    const show=(detail?:GameVerseDetail)=>{setWorld(detail?.world);setPlayBeta(false);setOpen(true)}
    ;(window as any).__showGameVerse=(worldSlug?:string)=>show({world:worldSlug})
    ;(window as any).__showPlayableBeta=()=>{setOpen(false);setPlayBeta(true)}
    const handler=(event:Event)=>show((event as CustomEvent<GameVerseDetail>).detail)
    const betaHandler=()=>{setOpen(false);setPlayBeta(true)}
    window.addEventListener('tryamm:gameverse-open',handler)
    window.addEventListener('tryamm:playable-beta-open',betaHandler)
    return()=>{
      window.removeEventListener('tryamm:gameverse-open',handler)
      window.removeEventListener('tryamm:playable-beta-open',betaHandler)
      delete (window as any).__showGameVerse
      delete (window as any).__showPlayableBeta
    }
  },[])

  if(playBeta)return <Suspense fallback={<div style={{position:'fixed',inset:0,zIndex:14000,background:'#04050e'}}/>}><PlayableBeta onClose={()=>{setPlayBeta(false);setOpen(true)}}/></Suspense>
  if(!open)return <div style={{position:'fixed',right:12,bottom:260,zIndex:8995,display:'grid',gap:8,justifyItems:'end'}}>
    <button type="button" aria-label="ENTER GAMEVERSE" onClick={()=>{setWorld(undefined);setOpen(true)}} style={{border:'1px solid #e8b94499',borderRadius:999,padding:'11px 15px',background:'linear-gradient(135deg,#201707,#071b27)',color:'#E8B944',fontSize:10,fontWeight:950,letterSpacing:1,cursor:'pointer',boxShadow:'0 8px 28px #0009'}}>ENTER GAMEVERSE</button>
    <button type="button" aria-label="Open GameVerse playable beta" onClick={()=>setPlayBeta(true)} style={{border:'1px solid #4fe3ff88',borderRadius:999,padding:'9px 13px',background:'linear-gradient(135deg,#071b27,#171129)',color:'#4FE3FF',fontSize:9,fontWeight:950,letterSpacing:1,cursor:'pointer',boxShadow:'0 8px 28px #0009'}}>🎮 PLAY BETA</button>
  </div>
  return <Suspense fallback={<div style={{position:'fixed',inset:0,zIndex:12000,background:'#04050e'}}/>}>
    <GameVerseHub
      initialWorld={world}
      onClose={()=>setOpen(false)}
      onEnterSports={()=>{setOpen(false);setScreen('sports')}}
      onEnterCity={()=>{setOpen(false);setScreen('city')}}
    />
  </Suspense>
}
