import {useEffect} from 'react'

type Snapshot={version:1;activeMission?:string|null;completed:string[];lastMission?:string|null;xp?:number;level?:number;missionsCompleted?:number;district?:string|null;transit?:Record<string,unknown>;worldEvents:string[];updatedAt:string}
const KEY='tryamm.streetverse.gameplay-state.v1'
const load=():Snapshot=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v?.version===1)return v}catch{}return{version:1,activeMission:null,completed:[],lastMission:null,worldEvents:[],updatedAt:new Date().toISOString()}}
const persist=(s:Snapshot,emit=true)=>{const next={...s,updatedAt:new Date().toISOString()};try{localStorage.setItem(KEY,JSON.stringify(next))}catch{}if(emit)window.dispatchEvent(new CustomEvent('tryamm:streetverse-gameplay-state',{detail:next}));return next}
export default function StreetVerseGameplayStateCoordinator(){useEffect(()=>{let state=load(),lastTransitPersist=0,pendingTransit:Record<string,unknown>|null=null;window.dispatchEvent(new CustomEvent('tryamm:streetverse-gameplay-state-restored',{detail:state}))
 const save=(next:Snapshot)=>{state=persist(next);return state}
 const flushTransit=(force=false)=>{if(!pendingTransit)return;const now=Date.now();if(!force&&now-lastTransitPersist<1000)return;state=persist({...state,transit:{...(state.transit||{}),...pendingTransit}},false);lastTransitPersist=now;pendingTransit=null}
 const onStart=(e:Event)=>{const d=(e as CustomEvent).detail||{};save({...state,activeMission:String(d.missionId||d.id||d.label||'mission')})}
 const onComplete=(e:Event)=>{const d=(e as CustomEvent).detail||{},id=String(d.missionId||d.id||d.label||'mission');save({...state,activeMission:null,lastMission:id,completed:Array.from(new Set([...state.completed,id]))})}
 const onLoaded=(e:Event)=>{const d=(e as CustomEvent).detail||{};save({...state,xp:Number(d.xp||0),level:Number(d.level||1),missionsCompleted:Number(d.missionsCompleted||0),lastMission:d.lastMissionId||state.lastMission})}
 const onSynced=(e:Event)=>{const d=(e as CustomEvent).detail||{};save({...state,xp:Number(d.xp||state.xp||0),level:Number(d.level||state.level||1),missionsCompleted:Number(d.missionsCompleted||state.missionsCompleted||0),lastMission:d.missionId||state.lastMission})}
 const onTransit=(e:Event)=>{pendingTransit={(pendingTransit||{}),...(e as CustomEvent).detail};flushTransit(false)}
 const onWorld=(e:Event)=>{const d=(e as CustomEvent).detail||{},id=String(d.id||d.eventId||d.label||'world-event');save({...state,worldEvents:Array.from(new Set([...state.worldEvents,id])).slice(-20)})}
 const onSpawn=(e:Event)=>{const d=(e as CustomEvent).detail||{};save({...state,district:d?.mapped?.label||d?.label||state.district||null})}
 const onVisibility=()=>{if(document.visibilityState==='hidden')flushTransit(true)}
 const onExit=()=>flushTransit(true)
 addEventListener('tryamm:streetverse-mission-start',onStart);addEventListener('tryamm:streetverse-mission-complete',onComplete);addEventListener('tryamm:streetverse-progress-loaded',onLoaded);addEventListener('tryamm:streetverse-progress-synced',onSynced);addEventListener('tryamm:l-train-state',onTransit);addEventListener('tryamm:streetverse-world-event',onWorld);addEventListener('tryamm:streetverse-geo-spawn-ready',onSpawn);addEventListener('tryamm:streetverse-exit',onExit);document.addEventListener('visibilitychange',onVisibility)
 return()=>{flushTransit(true);removeEventListener('tryamm:streetverse-mission-start',onStart);removeEventListener('tryamm:streetverse-mission-complete',onComplete);removeEventListener('tryamm:streetverse-progress-loaded',onLoaded);removeEventListener('tryamm:streetverse-progress-synced',onSynced);removeEventListener('tryamm:l-train-state',onTransit);removeEventListener('tryamm:streetverse-world-event',onWorld);removeEventListener('tryamm:streetverse-geo-spawn-ready',onSpawn);removeEventListener('tryamm:streetverse-exit',onExit);document.removeEventListener('visibilitychange',onVisibility)}},[]);return null}
