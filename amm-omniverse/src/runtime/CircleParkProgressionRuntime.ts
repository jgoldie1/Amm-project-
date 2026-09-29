const KEY='tryamm.streetverse.circle-park.progress.v1'
const CHICAGO_XP=1000
const SOCIAL_BONUS_XP=300

export type CircleParkProgress={
  xp:number
  starterHomeClaimed:boolean
  friendVouches:number
  chicagoUnlocked:boolean
  completedMissionIds:string[]
}

const DEFAULT:CircleParkProgress={xp:0,starterHomeClaimed:false,friendVouches:0,chicagoUnlocked:false,completedMissionIds:[]}
let installed=false

function read():CircleParkProgress{
  try{return {...DEFAULT,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {...DEFAULT}}
}
function save(state:CircleParkProgress){
  try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}
  window.dispatchEvent(new CustomEvent('tryamm:circle-park-progress',{detail:state}))
}
function unlockIfReady(state:CircleParkProgress){
  // Core launch rule: Chicago can be reached solo. Human vouches accelerate
  // progression but can never be the only exit from Circle Park.
  if(!state.chicagoUnlocked&&state.starterHomeClaimed&&state.xp>=CHICAGO_XP){
    state.chicagoUnlocked=true
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-chicago-unlocked',{detail:{source:'circle-park',xp:state.xp}}))
    window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text:'StreetVerse Chicago unlocked.'}}))
  }
  return state
}
function onMissionComplete(event:Event){
  const detail=(event as CustomEvent).detail||{}
  const id=detail?.mission?.id as string|undefined
  const reward=Math.max(0,Number(detail?.rewardXP||detail?.mission?.rewardXP||0))
  if(!id)return
  const state=read()
  if(!state.completedMissionIds.includes(id)){
    state.completedMissionIds.push(id)
    state.xp+=reward
  }
  if(id==='circle-park-home'||id==='circle-park-arrival'){
    // Launch fallback: every player receives a personal instanced starter-home
    // entitlement. Scarce/premium housing may exist later, but cannot block play.
    state.starterHomeClaimed=true
  }
  save(unlockIfReady(state))
}
function onFriendVouch(){
  const state=read()
  if(state.friendVouches>=3)return
  state.friendVouches+=1
  if(state.friendVouches===3)state.xp+=SOCIAL_BONUS_XP
  save(unlockIfReady(state))
}

export function installCircleParkProgressionRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  window.addEventListener('tryamm:streetverse-mission-complete',onMissionComplete as EventListener)
  window.addEventListener('tryamm:circle-park-friend-vouch',onFriendVouch as EventListener)
  queueMicrotask(()=>save(unlockIfReady(read())))
}
