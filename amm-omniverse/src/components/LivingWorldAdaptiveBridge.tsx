import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../game/state/useGameStore'
import type { LivingWorldSnapshot } from '../runtime/StreetVerseLivingWorldRuntime'
import { installHoloForgeRuntime } from '../runtime/HoloForgeAssetRuntime'

installHoloForgeRuntime()

function createWorldSessionId(){
  if(typeof crypto!=='undefined'&&'randomUUID' in crypto)return `streetverse-${crypto.randomUUID()}`
  return `streetverse-${Date.now()}-${Math.random().toString(36).slice(2,10)}`
}

export default function LivingWorldAdaptiveBridge(){
  const screen=useGameStore(s=>s.screen)
  const missions=useGameStore(s=>s.missions)
  const activeVehicle=useGameStore(s=>s.player.activeVehicle)
  const [snapshot,setSnapshot]=useState<LivingWorldSnapshot|null>(null)
  const lastRef=useRef(0)
  const previousScreen=useRef(screen)
  const worldSessionId=useRef(createWorldSessionId())

  useEffect(()=>{
    const onState=(event:Event)=>setSnapshot((event as CustomEvent<LivingWorldSnapshot>).detail)
    window.addEventListener('tryamm:living-world-state',onState)
    return()=>window.removeEventListener('tryamm:living-world-state',onState)
  },[])

  useEffect(()=>{
    const previous=previousScreen.current
    if(screen==='city'&&previous!=='city'){
      worldSessionId.current=createWorldSessionId()
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-enter',{detail:{from:previous,to:screen,at:Date.now(),worldSessionId:worldSessionId.current}}))
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-session-start',{detail:{worldSessionId:worldSessionId.current,startedAt:Date.now(),source:'streetverse-city'}}))
    }
    if(screen!=='city'&&previous==='city')window.dispatchEvent(new CustomEvent('tryamm:streetverse-leave',{detail:{from:previous,to:screen,at:Date.now(),worldSessionId:worldSessionId.current}}))
    previousScreen.current=screen
  },[screen])

  useEffect(()=>{
    if(screen!=='city')return
    const activeMission=missions.find(m=>m.status==='active')?.id
    const publish=()=>{
      const now=new Date()
      const hour=now.getHours()+now.getMinutes()/60
      const context={worldSessionId:worldSessionId.current,activeWorld:'streetverse' as const,activeMission,activeVehicle:activeVehicle||null,uiIntent:activeVehicle?'vehicle':'free-roam',position:{x:0,y:0,z:0},hour,at:Date.now()}
      window.dispatchEvent(new CustomEvent('tryamm:world-clock',{detail:{hour,source:'streetverse-city',worldSessionId:worldSessionId.current}}))
      window.dispatchEvent(new CustomEvent('tryamm:world-player-signal',{detail:context}))
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-gameplay-context',{detail:context}))
    }
    publish()
    const timer=window.setInterval(()=>{const now=performance.now();if(now-lastRef.current>=1800){lastRef.current=now;publish()}},500)
    return()=>window.clearInterval(timer)
  },[screen,missions,activeVehicle])

  useEffect(()=>{
    if(screen!=='city')return
    const onReelRequest=(event:Event)=>{
      const source=(event as CustomEvent<{source?:string}>).detail?.source
      if(source&&source!=='streetverse')return
      const activeMission=missions.find(m=>m.status==='active')?.id
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-reel-context',{detail:{worldSessionId:worldSessionId.current,missionId:activeMission||null,vehicleId:activeVehicle||null,world:'streetverse',capturedAt:Date.now()}}))
    }
    window.addEventListener('tryamm:media-studio-open',onReelRequest)
    return()=>window.removeEventListener('tryamm:media-studio-open',onReelRequest)
  },[screen,missions,activeVehicle])

  useEffect(()=>{
    if(!snapshot)return
    document.documentElement.dataset.streetverseWorldQuality=snapshot.budget.quality
    document.documentElement.dataset.streetverseWorldPeriod=snapshot.period
    window.dispatchEvent(new CustomEvent('tryamm:world-budget',{detail:{...snapshot.budget,worldSessionId:worldSessionId.current}}))
    window.dispatchEvent(new CustomEvent('tryamm:traffic-profile',{detail:{...snapshot.traffic,worldSessionId:worldSessionId.current}}))
    window.dispatchEvent(new CustomEvent('tryamm:npc-schedule-state',{detail:{hour:snapshot.hour,npcs:snapshot.npcStates,worldSessionId:worldSessionId.current}}))
    window.dispatchEvent(new CustomEvent('tryamm:quantum-beat-world-sync',{detail:{period:snapshot.period,weather:snapshot.weather,quality:snapshot.budget.quality,worldSessionId:worldSessionId.current}}))
  },[snapshot])

  return null
}
