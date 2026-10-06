export type HostShiftPlan={
  creatorId:string
  weeklyTargetHours:number
  days:Array<{day:number;start:string;end:string;enabled:boolean}>
  breakEveryMinutes:number
  agencyId?:string
}

export type HostShiftState={
  active:boolean
  startedAt:string|null
  elapsedMinutes:number
  weeklyMinutes:number
  weeklyTargetHours:number
  breakDue:boolean
  nextBreakInMinutes:number
  currentVerse:string
  currentRoom:string|null
}

const KEY='tryamm.creator-host-shift.v1'
const WEEK_KEY=()=>{const d=new Date();const jan=new Date(d.getFullYear(),0,1);const week=Math.ceil((((d.getTime()-jan.getTime())/86400000)+jan.getDay()+1)/7);return `${d.getFullYear()}-W${String(week).padStart(2,'0')}`}

function readSaved(){
  try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}
}

function writeSaved(value:unknown){
  try{localStorage.setItem(KEY,JSON.stringify(value))}catch{}
}

function minutesSince(iso:string|null){
  if(!iso)return 0
  const t=Date.parse(iso)
  if(!Number.isFinite(t))return 0
  return Math.max(0,Math.floor((Date.now()-t)/60000))
}

export function installCreatorHostShiftRuntime(){
  if(typeof window==='undefined')return()=>{}
  const saved=readSaved()||{}
  let weekKey=String(saved.weekKey||WEEK_KEY())
  let weeklyMinutes=weekKey===WEEK_KEY()?Math.max(0,Number(saved.weeklyMinutes)||0):0
  let active=Boolean(saved.active)
  let startedAt=active?String(saved.startedAt||new Date().toISOString()):null
  let weeklyTargetHours=Math.max(1,Math.min(60,Number(saved.weeklyTargetHours)||20))
  let breakEveryMinutes=Math.max(45,Math.min(180,Number(saved.breakEveryMinutes)||90))
  let currentVerse=String(location.pathname||'/')
  let currentRoom:string|null=null

  const snapshot=():HostShiftState=>{
    const elapsed=active?minutesSince(startedAt):0
    const breakCycle=elapsed%breakEveryMinutes
    return {
      active,
      startedAt,
      elapsedMinutes:elapsed,
      weeklyMinutes:weeklyMinutes+elapsed,
      weeklyTargetHours,
      breakDue:active&&elapsed>0&&breakCycle===0,
      nextBreakInMinutes:active?Math.max(0,breakEveryMinutes-breakCycle):breakEveryMinutes,
      currentVerse,
      currentRoom,
    }
  }

  const persist=()=>{
    const s=snapshot()
    writeSaved({weekKey:WEEK_KEY(),weeklyMinutes:active?weeklyMinutes: s.weeklyMinutes,active,startedAt,weeklyTargetHours,breakEveryMinutes})
  }

  const emit=(reason:string)=>window.dispatchEvent(new CustomEvent('tryamm:creator-host-shift-state',{detail:{...snapshot(),reason}}))

  const start=(detail:Record<string,unknown>={})=>{
    if(active)return
    if(weekKey!==WEEK_KEY()){weekKey=WEEK_KEY();weeklyMinutes=0}
    active=true
    startedAt=new Date().toISOString()
    currentVerse=String(detail.verse||location.pathname||'/')
    currentRoom=detail.room?String(detail.room):null
    persist();emit('start')
  }

  const stop=(reason='stop')=>{
    if(!active){emit(reason);return}
    weeklyMinutes+=minutesSince(startedAt)
    active=false
    startedAt=null
    currentRoom=null
    persist();emit(reason)
  }

  const onStart=(event:Event)=>start((event as CustomEvent<Record<string,unknown>>).detail||{})
  const onStop=()=>stop('stop')
  const onLive=(event:Event)=>{const d=(event as CustomEvent<Record<string,unknown>>).detail||{};currentRoom=d.roomName?String(d.roomName):currentRoom;currentVerse=location.pathname;start({room:currentRoom||'',verse:currentVerse});emit('live-session')}
  const onLiveEnd=()=>stop('live-session-end')
  const onTarget=(event:Event)=>{const h=Number((event as CustomEvent<{hours?:number}>).detail?.hours);if(Number.isFinite(h)){weeklyTargetHours=Math.max(1,Math.min(60,h));persist();emit('target')}}
  const onBreak=(event:Event)=>{const m=Number((event as CustomEvent<{minutes?:number}>).detail?.minutes);if(Number.isFinite(m)){breakEveryMinutes=Math.max(45,Math.min(180,m));persist();emit('break-cadence')}}

  addEventListener('tryamm:creator-host-shift-start',onStart)
  addEventListener('tryamm:creator-host-shift-stop',onStop)
  addEventListener('tryamm:live-session',onLive)
  addEventListener('tryamm:live-session-end',onLiveEnd)
  addEventListener('tryamm:creator-host-weekly-target',onTarget)
  addEventListener('tryamm:creator-host-break-cadence',onBreak)

  const timer=window.setInterval(()=>{
    if(!active)return
    emit('tick')
    const s=snapshot()
    if(s.breakDue)window.dispatchEvent(new CustomEvent('tryamm:creator-host-break-due',{detail:{minutesLive:s.elapsedMinutes,breakEveryMinutes}}))
  },60000)

  emit('startup')
  return()=>{
    window.clearInterval(timer)
    removeEventListener('tryamm:creator-host-shift-start',onStart)
    removeEventListener('tryamm:creator-host-shift-stop',onStop)
    removeEventListener('tryamm:live-session',onLive)
    removeEventListener('tryamm:live-session-end',onLiveEnd)
    removeEventListener('tryamm:creator-host-weekly-target',onTarget)
    removeEventListener('tryamm:creator-host-break-cadence',onBreak)
  }
}