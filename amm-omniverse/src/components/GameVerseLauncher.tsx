import { lazy, Suspense, useEffect, useState } from 'react'
import { useGameStore } from '../game/state/useGameStore'

const GameVerseHub=lazy(()=>import('./GameVerseHub'))

type GameVerseDetail={world?:string}

export default function GameVerseLauncher(){
  const setScreen=useGameStore(s=>s.setScreen)
  const [open,setOpen]=useState(false)
  const [world,setWorld]=useState<string|undefined>()

  useEffect(()=>{
    const show=(detail?:GameVerseDetail)=>{setWorld(detail?.world);setOpen(true)}
    ;(window as any).__showGameVerse=(worldSlug?:string)=>show({world:worldSlug})
    const handler=(event:Event)=>show((event as CustomEvent<GameVerseDetail>).detail)
    window.addEventListener('tryamm:gameverse-open',handler)
    return()=>{
      window.removeEventListener('tryamm:gameverse-open',handler)
      delete (window as any).__showGameVerse
    }
  },[])

  if(!open)return null
  return <Suspense fallback={<div style={{position:'fixed',inset:0,zIndex:12000,background:'#04050e'}}/>}>
    <GameVerseHub
      initialWorld={world}
      onClose={()=>setOpen(false)}
      onEnterSports={()=>{setOpen(false);setScreen('sports')}}
      onEnterCity={()=>{setOpen(false);setScreen('city')}}
    />
  </Suspense>
}
