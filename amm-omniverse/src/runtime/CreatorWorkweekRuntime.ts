export type CreatorWorkweekState={
  weekKey:string
  liveMinutes:number
  liveSessions:number
  reelsPublished:number
  missionsCompleted:number
  scheduledShows:number
  breaksTaken:number
  currentSessionStartedAt:string|null
  currentSessionMinutes:number
  targetHours:number
  discoveryScore:number
  status:'OFF'|'LIVE'|'BREAK_DUE'|'WEEK_COMPLETE'
}

const KEY='tryamm.creator-workweek.v1'
const weekKey=()=>{
  const d=new Date()
  const first=new Date(d.getFullYear(),0,1)
  const day=Math.floor((d.getTime()-first.getTime())/86400000)
  const week=Math.ceil((day+first.getDay()+1)/7)
  return d.getFullYear()+'-W'+String(week).padStart(2,'0')
}
const initial=():CreatorWorkweekState=>({
  weekKey:weekKey(),liveMinutes:0,liveSessions:0,reelsPublished:0,missionsCompleted:0,scheduledShows:0,breaksTaken:0,
  currentSessionStartedAt:null,currentSessionMinutes:0,targetHours:20,discoveryScore:0,status:'OFF'
})
function read(){
  try{
    const raw=JSON.parse(localStorage.getItem(KEY)||'null')
    const base=initial()
    if(!raw||raw.weekKey!==base.weekKey)return base
    return {...base,...raw,targetHours:Math.max(5,Math.min(40,Number(raw.targetHours||20)))}
  }catch{return initial()}
}
function save(s:CreatorWorkweekState){try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}}
function score(s:CreatorWorkweekState){
  const healthyLive=Math.min(s.liveMinutes,30*60)
  const target=Math.max(1,s.targetHours*60)
  const consistency=Math.min(1,healthyLive/target)
  const content=Math.min(1,(s.reelsPublished*8+s.missionsCompleted*4+s.scheduledShows*6)/60)
  const breaks=s.liveMinutes>0?Math.min(1,s.breaksTaken/Math.max(1,Math.floor(s.liveMinutes/90))):1
  s.discoveryScore=Math.round(Math.min(100,(consistency*.55+content*.3+breaks*.15)*100))
  if(s.liveMinutes>=40*60)s.status='WEEK_COMPLETE'
  return s
}
function emit(s:CreatorWorkweekState,reason:string){
  window.dispatchEvent(new CustomEvent('tryamm:creator-workweek-state',{detail:{...s,reason,professionalSchedule:true,weeklyCapHours:40,discoveryDoesNotIncreaseAfterHours:30}}))
}

export function installCreatorWorkweekRuntime(){
  if(typeof window==='undefined')return()=>{}
  let state=score(read())
  let timer=0

  const tick=()=>{
    if(!state.currentSessionStartedAt)return
    const elapsed=Math.max(0,Math.floor((Date.now()-new Date(state.currentSessionStartedAt).getTime())/60000))
    state.currentSessionMinutes=elapsed
    if(elapsed>0&&elapsed%90===0){
      state.status='BREAK_DUE'
      window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'Creator break recommended • stretch, hydrate, reset, then continue if you want.'}}))
    }
    emit(state,'tick')
  }

  const startSession=(detail:Record<string,unknown>={})=>{
    if(state.currentSessionStartedAt)return
    if(state.liveMinutes>=40*60){state.status='WEEK_COMPLETE';emit(state,'weekly-cap');return}
    state.currentSessionStartedAt=new Date().toISOString()
    state.currentSessionMinutes=0
    state.liveSessions+=1
    state.status='LIVE'
    if(detail.scheduled===true)state.scheduledShows+=1
    save(score(state));emit(state,'live-start')
    timer=window.setInterval(tick,60000)
  }

  const endSession=()=>{
    if(!state.currentSessionStartedAt)return
    const mins=Math.max(1,Math.floor((Date.now()-new Date(state.currentSessionStartedAt).getTime())/60000))
    state.liveMinutes=Math.min(40*60,state.liveMinutes+mins)
    state.currentSessionStartedAt=null
    state.currentSessionMinutes=0
    state.status=state.liveMinutes>=40*60?'WEEK_COMPLETE':'OFF'
    window.clearInterval(timer);timer=0
    save(score(state));emit(state,'live-end')
    window.dispatchEvent(new CustomEvent('tryamm:creator-repurpose-prompt',{detail:{
      source:'creator-workweek',
      suggestions:['clip-best-moment','publish-reel','save-omnibox','attach-products','schedule-next-show'],
      sessionMinutes:mins
    }}))
  }

  const onLive=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const ended=d.ended===true||d.live===false||String(d.status||'').toLowerCase()==='ended'
    if(ended)endSession();else startSession(d)
  }
  const onReel=()=>{state.reelsPublished+=1;save(score(state));emit(state,'reel')}
  const onMission=()=>{state.missionsCompleted+=1;save(score(state));emit(state,'mission')}
  const onBreak=()=>{state.breaksTaken+=1;if(state.status==='BREAK_DUE')state.status='LIVE';save(score(state));emit(state,'break')}
  const onTarget=(event:Event)=>{const h=Number((event as CustomEvent<{hours?:number}>).detail?.hours||20);state.targetHours=Math.max(5,Math.min(40,h));save(score(state));emit(state,'target')}
  const onRequest=()=>emit(state,'request')

  addEventListener('tryamm:live-session',onLive)
  addEventListener('tryamm:live-session-end',onLive)
  addEventListener('tryamm:reel-published',onReel)
  addEventListener('tryamm:streetverse-mission-complete',onMission)
  addEventListener('tryamm:creator-workweek-break-taken',onBreak)
  addEventListener('tryamm:creator-workweek-target',onTarget)
  addEventListener('tryamm:creator-workweek-request',onRequest)
  emit(state,'startup')

  return()=>{
    window.clearInterval(timer)
    removeEventListener('tryamm:live-session',onLive)
    removeEventListener('tryamm:live-session-end',onLive)
    removeEventListener('tryamm:reel-published',onReel)
    removeEventListener('tryamm:streetverse-mission-complete',onMission)
    removeEventListener('tryamm:creator-workweek-break-taken',onBreak)
    removeEventListener('tryamm:creator-workweek-target',onTarget)
    removeEventListener('tryamm:creator-workweek-request',onRequest)
  }
}
