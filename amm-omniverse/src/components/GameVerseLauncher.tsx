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
    const show=(detail?:GameVerseDetail)=>{setWorld(detail?.world);setOpen(true)}
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
  if(!open)return null
  return <Suspense fallback={<div style={{position:'fixed',inset:0,zIndex:12000,background:'#04050e'}}/>}>
    <GameVerseHub
      initialWorld={world}
      onClose={()=>setOpen(false)}
      onPlayBeta={()=>{setOpen(false);setPlayBeta(true)}}
      onEnterSports={()=>{setOpen(false);setScreen('sports')}}
      onEnterCity={()=>{setOpen(false);setScreen('city')}}
    />
  </Suspense>
}