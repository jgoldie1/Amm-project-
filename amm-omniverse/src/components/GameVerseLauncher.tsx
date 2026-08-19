import { lazy, Suspense, useEffect, useState } from 'react'
import { useGameStore } from '../game/state/useGameStore'
import { bootstrapPlayableGame, type PlayableGateResult } from '../game/runtime/gameBootstrap'

const GameVerseHub=lazy(()=>import('./GameVerseHub'))
const PlayableBeta=lazy(()=>import('./PlayableBeta'))

type GameVerseDetail={world?:string}

export default function GameVerseLauncher(){
  const setScreen=useGameStore(s=>s.setScreen)
  const [open,setOpen]=useState(false)
  const [playBeta,setPlayBeta]=useState(false)
  const [world,setWorld]=useState<string|undefined>()
  const [checking,setChecking]=useState(false)
  const [gate,setGate]=useState<PlayableGateResult|undefined>()

  const requestPlayable=async()=>{
    setChecking(true)
    const result=await bootstrapPlayableGame({gameId:'tryamm-playable-beta',region:'auto'})
    setGate(result)
    setChecking(false)
    if(result.allowed){setOpen(false);setPlayBeta(true)}
  }

  useEffect(()=>{
    const show=(detail?:GameVerseDetail)=>{setWorld(detail?.world);setOpen(true)}
    ;(window as any).__showGameVerse=(worldSlug?:string)=>show({world:worldSlug})
    ;(window as any).__showPlayableBeta=()=>{void requestPlayable()}
    const handler=(event:Event)=>show((event as CustomEvent<GameVerseDetail>).detail)
    const betaHandler=()=>{void requestPlayable()}
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

  const launcher=<div style={{position:'fixed',right:12,bottom:122,zIndex:8995,display:'grid',justifyItems:'end',gap:8}}>
    {gate&&!gate.allowed&&<div role="status" style={{maxWidth:300,border:'1px solid #ffb84f66',borderRadius:12,padding:'10px 12px',background:'#120e16ee',color:'#fff',fontSize:11,boxShadow:'0 8px 28px #0009'}}>
      <strong style={{display:'block',color:'#ffcf7b',marginBottom:4}}>{gate.readiness.toUpperCase()}</strong>
      {gate.reason}
    </div>}
    <button type="button" aria-label="Check and open GameVerse playable beta" disabled={checking} onClick={()=>void requestPlayable()} style={{border:'1px solid #4fe3ff88',borderRadius:999,padding:'10px 14px',background:'linear-gradient(135deg,#071b27,#171129)',color:'#4FE3FF',fontSize:10,fontWeight:950,letterSpacing:1,cursor:checking?'wait':'pointer',boxShadow:'0 8px 28px #0009',opacity:checking?.72:1}}>{checking?'CHECKING…':'🎮 PLAY BETA'}</button>
  </div>

  if(!open)return launcher
  return <>
    {launcher}
    <Suspense fallback={<div style={{position:'fixed',inset:0,zIndex:12000,background:'#04050e'}}/>}>
      <GameVerseHub
        initialWorld={world}
        onClose={()=>setOpen(false)}
        onEnterSports={()=>{setOpen(false);setScreen('sports')}}
        onEnterCity={()=>{setOpen(false);setScreen('city')}}
      />
    </Suspense>
  </>
}
