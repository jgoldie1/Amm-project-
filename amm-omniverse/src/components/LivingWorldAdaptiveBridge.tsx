import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../game/state/useGameStore'
import type { LivingWorldSnapshot } from '../runtime/StreetVerseLivingWorldRuntime'

export default function LivingWorldAdaptiveBridge(){
  const screen=useGameStore(s=>s.screen)
  const missions=useGameStore(s=>s.missions)
  const activeVehicle=useGameStore(s=>s.player.activeVehicle)
  const [snapshot,setSnapshot]=useState<LivingWorldSnapshot|null>(null)
  const lastRef=useRef(0)

  useEffect(()=>{
    const onState=(event:Event)=>setSnapshot((event as CustomEvent<LivingWorldSnapshot>).detail)
    window.addEventListener('tryamm:living-world-state',onState)
    return()=>window.removeEventListener('tryamm:living-world-state',onState)
  },[])

  useEffect(()=>{
    if(screen!=='city')return
    const activeMission=missions.find(m=>m.status==='active')?.id
    const publish=()=>{
      const now=new Date()
      const hour=now.getHours()+now.getMinutes()/60
      window.dispatchEvent(new CustomEvent('tryamm:world-clock',{detail:{hour,source:'streetverse-city'}}))
      window.dispatchEvent(new CustomEvent('tryamm:world-player-signal',{detail:{
        position:{x:0,y:0,z:0},
        activeWorld:'streetverse',
        activeMission,
        uiIntent:activeVehicle?'vehicle':'free-roam',
      }}))
    }
    publish()
    const timer=window.setInterval(()=>{
      const now=performance.now()
      if(now-lastRef.current>=1800){lastRef.current=now;publish()}
    },500)
    return()=>window.clearInterval(timer)
  },[screen,missions,activeVehicle])

  useEffect(()=>{
    if(!snapshot)return
    document.documentElement.dataset.streetverseWorldQuality=snapshot.budget.quality
    document.documentElement.dataset.streetverseWorldPeriod=snapshot.period
    window.dispatchEvent(new CustomEvent('tryamm:world-budget',{detail:snapshot.budget}))
    window.dispatchEvent(new CustomEvent('tryamm:traffic-profile',{detail:snapshot.traffic}))
    window.dispatchEvent(new CustomEvent('tryamm:npc-schedule-state',{detail:{hour:snapshot.hour,npcs:snapshot.npcStates}}))
    window.dispatchEvent(new CustomEvent('tryamm:quantum-beat-world-sync',{detail:{period:snapshot.period,weather:snapshot.weather,quality:snapshot.budget.quality}}))
  },[snapshot])

  return null
}
