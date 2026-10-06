import {useEffect,useMemo,useState} from 'react'
import HoloGPTAssistant from './HoloGPTAssistant'

type StudioState={
  scene:string
  programLive:boolean
  recording:boolean
  chromaKey:boolean
  teleprompter:boolean
  lowerThirds:boolean
  captions:boolean
  guestInputs:number
  destinations:string[]
  rightsCleared:boolean
  operatorRole:string
  programTitle?:string
  formatId?:string
  hostIds?:string[]
  startedAt?:string|null
  scheduledMinutes?:number
}

type Player={
  userId:string
  displayName?:string
  avatarUrl?:string
  live?:boolean
  streamRoom?:string
  creatorMode?:boolean
}

type ScheduledShow={
  id:string
  title:string
  formatId:string
  scene:string
  startsAt:string
  durationMinutes:number
  hostIds:string[]
  status:'scheduled'|'ready'|'live'|'complete'
}

const SHOW_KEY='tryamm.all-american-network.schedule.v1'

const FORMATS=[
  {id:'streetverse-live',label:'StreetVerse LIVE',scene:'gaming',desc:'Live neighborhood missions, creator challenges, business stories and world events.'},
  {id:'creator-spotlight',label:'Creator Spotlight',scene:'interview',desc:'Interview + performance + fan interaction + Reel clips.'},
  {id:'all-american-news',label:'All American News Desk',scene:'news-desk',desc:'Community, business, culture, sports and creator headlines.'},
  {id:'business-showcase',label:'Business Showcase',scene:'shopping',desc:'Founder story, products, QR/Marketplace call-to-action and live shopping.'},
  {id:'musicverse-live',label:'MusicVerse LIVE',scene:'virtual-set',desc:'Artist showcase, radio, performance, PK and audience requests.'},
  {id:'sports-desk',label:'SportsVerse Desk',scene:'sports',desc:'Scores, highlights, interviews, competitions and community sports.'},
  {id:'faith-community',label:'Faith & Community',scene:'faith',desc:'Worship, teaching, testimony, service and community programming.'},
  {id:'reality-aftershow',label:'StreetVerse Aftershow',scene:'interview',desc:'Episode recap, moderated audience questions, creator reactions and next-mission vote.'},
] as const

const MODULES=[
  ['cam-a','CAM A','Phone / webcam / capture card'],
  ['cam-b','CAM B','Second camera or remote mobile'],
  ['cam-c','CAM C','Wide / stage / world camera'],
  ['audio','AUDIO MIXER','Host mic, guest mic, music, FX'],
  ['switcher','VISION SWITCHER','Preview / Program scene switching'],
  ['prompter','TELEPROMPTER','Script, rundown, host cues'],
  ['graphics','GRAPHICS','Lower thirds, logos, scorebugs'],
  ['captions','CAPTIONS','Live captions + translation hooks'],
  ['chroma','VIRTUAL SET','Green screen / background replacement'],
  ['guest','REMOTE GUESTS','Creator / caller / co-host inputs'],
  ['playback','PLAYBACK','Clips, reels, ads, sponsor media'],
  ['record','RECORDER','Program master + clips + replay'],
] as const

const readSchedule=():ScheduledShow[]=>{
  try{const raw=JSON.parse(localStorage.getItem(SHOW_KEY)||'[]');return Array.isArray(raw)?raw:[]}catch{return[]}
}
const saveSchedule=(rows:ScheduledShow[])=>{try{localStorage.setItem(SHOW_KEY,JSON.stringify(rows.slice(-100)))}catch{}}
const fmtTime=(iso:string)=>{try{return new Date(iso).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}catch{return iso}}

export default function AllAmericanNetworkControlRoom(){
  const [studio,setStudio]=useState<StudioState>({
    scene:'news-desk',programLive:false,recording:false,chromaKey:true,teleprompter:true,lowerThirds:true,captions:true,
    guestInputs:0,destinations:['recording'],rightsCleared:false,operatorRole:'producer',
  })
  const [players,setPlayers]=useState<Player[]>([])
  const [online,setOnline]=useState(0)
  const [formatId,setFormatId]=useState('streetverse-live')
  const format=useMemo(()=>FORMATS.find(x=>x.id===formatId)||FORMATS[0],[formatId])
  const [title,setTitle]=useState('StreetVerse Chicago LIVE')
  const [duration,setDuration]=useState(60)
  const [hostIds,setHostIds]=useState<string[]>([])
  const [schedule,setSchedule]=useState<ScheduledShow[]>(()=>readSchedule())
  const [moduleReady,setModuleReady]=useState<Record<string,boolean>>(()=>Object.fromEntries(MODULES.map(([id])=>[id,true])))
  const [notice,setNotice]=useState('Build the show, invite creators, preview, clear rights, then Take Live.')

  useEffect(()=>{
    const onStudio=(e:Event)=>setStudio((e as CustomEvent<any>).detail?.state||studio)
    const onPresence=(e:Event)=>{const d=(e as CustomEvent<{players?:Player[];online?:number}>).detail||{};setPlayers(Array.isArray(d.players)?d.players:[]);setOnline(Number(d.online||0))}
    const onBlocked=()=>setNotice('TAKE LIVE is blocked until rights are cleared.')
    addEventListener('tryamm:broadcast-studio-state',onStudio)
    addEventListener('tryamm:streetverse-multiplayer-presence',onPresence)
    addEventListener('tryamm:broadcast-blocked',onBlocked)
    dispatchEvent(new Event('tryamm:broadcast-studio-request'))
    return()=>{removeEventListener('tryamm:broadcast-studio-state',onStudio);removeEventListener('tryamm:streetverse-multiplayer-presence',onPresence);removeEventListener('tryamm:broadcast-blocked',onBlocked)}
  },[])

  const update=(patch:Partial<StudioState>)=>dispatchEvent(new CustomEvent('tryamm:broadcast-studio-update',{detail:patch}))
  const toggleHost=(id:string)=>setHostIds(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])
  const invite=(player:Player)=>{
    dispatchEvent(new CustomEvent('tryamm:streetverse-player-action-send',{detail:{toUserId:player.userId,action:'broadcast-invite',showTitle:title,network:'all-american-network'}}))
    setNotice('Invite sent to '+String(player.displayName||'creator')+'.')
  }

  const scheduleShow=()=>{
    const row:ScheduledShow={
      id:'aan-show-'+Date.now(),title:title.trim()||format.label,formatId:format.id,scene:format.scene,
      startsAt:new Date(Date.now()+30*60000).toISOString(),durationMinutes:duration,hostIds:[...hostIds],status:'scheduled',
    }
    const next=[...schedule,row];setSchedule(next);saveSchedule(next)
    dispatchEvent(new CustomEvent('tryamm:network-show-scheduled',{detail:row}))
    setNotice('Show scheduled and added to the All American Network rundown.')
  }

  const takeLive=()=>{
    update({scene:format.scene,programTitle:title.trim()||format.label,formatId:format.id,hostIds:[...hostIds],scheduledMinutes:duration})
    dispatchEvent(new CustomEvent('tryamm:broadcast-scene-select',{detail:{scene:format.scene}}))
    dispatchEvent(new Event('tryamm:broadcast-go-live'))
    setNotice('Take Live requested. Rights/provider gates still control whether the program can actually go live.')
  }

  const stop=()=>{dispatchEvent(new Event('tryamm:broadcast-stop'));setNotice('Program stopped. Clip the best moments to Reels or save the master to OmniBox.')}

  const aiProducer=()=>{
    const hostNames=creators.filter(p=>hostIds.includes(p.userId)).map(p=>p.displayName||p.userId)
    const prompt=[
      'You are HoloGPT acting as the AI producer inside the All American Network Studio Control Room, powered by Stubbs AI.',
      'Create a broadcast-ready production plan for this show.',
      'Title: '+(title||format.label)+'.',
      'Format: '+format.label+'.',
      'Duration: '+duration+' minutes.',
      'Scene: '+studio.scene+'.',
      'Hosts/guests: '+(hostNames.length?hostNames.join(', '):'not assigned yet')+'.',
      'Provide: cold open, timed rundown, teleprompter intro, segment cues, guest questions, lower-thirds, camera/switch suggestions, audience interaction, ad/sponsor break placeholders, 5 clip-to-Reel moments, accessibility/caption notes, and closing CTA.',
      'Do not invent licensed media rights or claim an external distribution provider is connected.'
    ].join(' ')
    dispatchEvent(new CustomEvent('tryamm:hologpt-study-context',{detail:{prompt,source:'all-american-network-ai-producer'}}))
    setNotice('HoloGPT AI Producer opened with this show context.')
  }

  const clip=()=>dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{source:'all-american-network-studio',title,formatId:format.id,programLive:studio.programLive}}))
  const saveMaster=()=>dispatchEvent(new CustomEvent('tryamm:omnibox-save-request',{detail:{origin:'all-american-network',kind:'broadcast-master',title,formatId:format.id,scene:studio.scene}}))

  const creators=[...players].sort((a,b)=>Number(Boolean(b.live))-Number(Boolean(a.live))||Number(Boolean(b.creatorMode))-Number(Boolean(a.creatorMode)))

  return <main style={page}>
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
      <div><div style={eyebrow}>ALL AMERICAN NETWORK • MASTER CONTROL</div><h1 style={{margin:'4px 0'}}>Broadcast Studio + TV Control Room</h1><div style={{...muted,color:'#aeefff',fontWeight:900}}>Powered by Stubbs AI + HoloGPT</div><div style={muted}>StreetVerse creators → studio → LIVE → TV/FAST/OTT-ready programming → Reels/Replay → creator earnings.</div></div>
      <div style={{display:'flex',gap:6}}><a href="/network" style={linkBtn}>NETWORK</a><a href="/free-tv" style={linkBtn}>TV GUIDE</a></div>
    </header>

    <section style={monitorGrid}>
      <div><div style={monitorLabel}>PREVIEW</div><div style={previewMonitor}><div><b>{title||format.label}</b><div style={{fontSize:11,opacity:.7,marginTop:6}}>Virtual {studio.scene.replaceAll('-',' ')} set • {hostIds.length||0} hosts • {studio.guestInputs||0} guests</div></div></div></div>
      <div><div style={monitorLabel}>PROGRAM</div><div style={{...programMonitor,borderColor:studio.programLive?'#ff365f':'#70592b'}}><div><b>{studio.programLive?'● LIVE • '+(studio.programTitle||title):'OFF AIR'}</b><div style={{fontSize:11,opacity:.7,marginTop:6}}>{studio.recording?'● RECORDING':'Recording ready'} • captions {studio.captions?'ON':'OFF'}</div></div></div></div>
    </section>

    <section style={grid2}>
      <article style={panel}>
        <div style={sectionTitle}>SHOW BUILDER</div>
        <label style={label}>PROGRAM TITLE<input value={title} onChange={e=>setTitle(e.target.value)} style={input}/></label>
        <label style={label}>FORMAT<select value={formatId} onChange={e=>{const id=e.target.value;setFormatId(id);const f=FORMATS.find(x=>x.id===id);if(f)update({scene:f.scene})}} style={input}>{FORMATS.map(f=><option key={f.id} value={f.id}>{f.label}</option>)}</select></label>
        <p style={{...muted,marginTop:7}}>{format.desc}</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
          <label style={label}>DURATION<select value={duration} onChange={e=>setDuration(Number(e.target.value))} style={input}><option value={30}>30 min</option><option value={60}>60 min</option><option value={90}>90 min</option><option value={120}>120 min</option></select></label>
          <label style={label}>SCENE<select value={studio.scene} onChange={e=>dispatchEvent(new CustomEvent('tryamm:broadcast-scene-select',{detail:{scene:e.target.value}}))} style={input}>{['news-desk','interview','podcast','sports','faith','shopping','gaming','virtual-set'].map(x=><option key={x} value={x}>{x.replaceAll('-',' ')}</option>)}</select></label>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginTop:8}}>
          <button onClick={scheduleShow} style={button}>SCHEDULE SHOW</button><button onClick={aiProducer} style={{...button,borderColor:'#9b75ff',background:'#171029'}}>◈ HOLOGPT AI PRODUCER</button>
          <button onClick={()=>update({rightsCleared:!studio.rightsCleared})} style={{...button,borderColor:studio.rightsCleared?'#68ffa0':'#8a5d39',color:studio.rightsCleared?'#78ffaf':'#ffd5a1'}}>RIGHTS {studio.rightsCleared?'CLEARED':'NOT CLEARED'}</button>
          <button onClick={()=>dispatchEvent(new CustomEvent('tryamm:broadcast-record',{detail:{enabled:!studio.recording}}))} style={button}>{studio.recording?'STOP RECORD':'● RECORD'}</button>
          <button onClick={studio.programLive?stop:takeLive} style={{...button,background:studio.programLive?'#491420':'#0d3b2c',borderColor:studio.programLive?'#ff516e':'#58df98'}}>{studio.programLive?'STOP PROGRAM':'TAKE LIVE'}</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginTop:7}}>
          <button onClick={clip} style={button}>CLIP TO REELS</button><button onClick={saveMaster} style={button}>SAVE TO OMNIBOX</button>
        </div>
      </article>

      <article style={panel}>
        <div style={sectionTitle}>WHO'S ONLINE • {online||1}</div>
        <p style={muted}>Invite StreetVerse creators directly into interviews, panels, PKs, business spotlights or live neighborhood shows.</p>
        <div style={{display:'grid',gap:6,maxHeight:360,overflowY:'auto'}}>
          {creators.length===0&&<div style={empty}>No other signed-in StreetVerse creators are visible in presence yet.</div>}
          {creators.map(p=><div key={p.userId} style={creatorRow}>
            <div style={avatar}>{String(p.displayName||'SV').slice(0,2).toUpperCase()}</div>
            <div style={{minWidth:0,flex:1}}><b style={{fontSize:11}}>{p.displayName||'StreetVerse Creator'}</b><div style={{fontSize:8,color:p.live?'#ff718d':'#8ba5b2'}}>{p.live?'● LIVE NOW':p.creatorMode?'CREATOR MODE':'ONLINE'}</div></div>
            <button onClick={()=>toggleHost(p.userId)} style={{...mini,borderColor:hostIds.includes(p.userId)?'#70f2ff':'#395666'}}>{hostIds.includes(p.userId)?'HOST ✓':'HOST'}</button>
            <button onClick={()=>invite(p)} style={mini}>INVITE</button>
          </div>)}
        </div>
        <button onClick={()=>window.location.href='/streetverse'} style={{...button,width:'100%',marginTop:8}}>OPEN STREETVERSE WHO'S ONLINE</button>
      </article>
    </section>

    <section style={panel}>
      <div style={sectionTitle}>PRODUCTION EQUIPMENT / SOFTWARE MODULES</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:7,marginTop:8}}>
        {MODULES.map(([id,name,desc])=><button key={id} onClick={()=>setModuleReady(v=>({...v,[id]:!v[id]}))} style={{...moduleCard,borderColor:moduleReady[id]?'#3bd79a66':'#7a394f',opacity:moduleReady[id]?1:.55}}>
          <b>{name}</b><span style={{display:'block',fontSize:9,color:'#91a8b4',marginTop:4}}>{desc}</span><span style={{display:'block',fontSize:8,marginTop:7,color:moduleReady[id]?'#73f5ad':'#ff8198'}}>{moduleReady[id]?'READY':'OFF'}</span>
        </button>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:7,marginTop:9}}>
        {([['chromaKey','GREEN SCREEN'],['teleprompter','TELEPROMPTER'],['lowerThirds','LOWER THIRDS'],['captions','CAPTIONS']] as const).map(([k,label])=><button key={k} onClick={()=>update({[k]:!studio[k]} as Partial<StudioState>)} style={{...button,color:studio[k]?'#7affad':'#8da0aa'}}>{label} {studio[k]?'ON':'OFF'}</button>)}
      </div>
    </section>

    <section style={grid2}>
      <article style={panel}><div style={sectionTitle}>DISTRIBUTION</div>{['tryamm-live','all-american-network','omnibox','recording','servants-of-christ-network'].map(d=><label key={d} style={{display:'flex',gap:8,marginTop:9,fontSize:11}}><input type="checkbox" checked={studio.destinations.includes(d)} onChange={()=>update({destinations:studio.destinations.includes(d)?studio.destinations.filter(x=>x!==d):[...studio.destinations,d]})}/>{d.replaceAll('-',' ')}</label>)}<p style={muted}>External FAST/CTV/OTT distribution remains provider and rights gated; this control room prepares the same master program for those outlets.</p></article>
      <article style={panel}><div style={sectionTitle}>UPCOMING RUNDOWN</div><div style={{display:'grid',gap:6,marginTop:8}}>{schedule.length===0&&<div style={empty}>No shows scheduled yet.</div>}{schedule.slice(-8).reverse().map(s=><div key={s.id} style={rundownRow}><div><b>{s.title}</b><div style={{fontSize:8,color:'#91a8b4'}}>{fmtTime(s.startsAt)} • {s.durationMinutes} min • {s.formatId.replaceAll('-',' ')}</div></div><span style={{fontSize:8,color:'#ffd36e'}}>{s.status.toUpperCase()}</span></div>)}</div></article>
    </section>

    <div aria-live="polite" style={noticeBox}>{notice}</div>
    <HoloGPTAssistant showLauncher={false}/>
  </main>
}

const page:React.CSSProperties={minHeight:'100dvh',background:'radial-gradient(circle at 50% 0,#102f3d,#050812 46%,#010205)',color:'#fff',padding:'16px 14px 50px',fontFamily:'system-ui'}
const eyebrow:React.CSSProperties={fontSize:9,letterSpacing:2.8,color:'#62e8ff',fontWeight:950}
const muted:React.CSSProperties={fontSize:10,color:'#91a8b4',lineHeight:1.5}
const monitorGrid:React.CSSProperties={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:10,marginTop:14}
const monitorLabel:React.CSSProperties={fontSize:8,color:'#8ca3af',letterSpacing:1.8,marginBottom:4}
const previewMonitor:React.CSSProperties={aspectRatio:'16/9',border:'2px solid #55dff066',borderRadius:14,display:'grid',placeItems:'center',padding:16,background:'linear-gradient(135deg,#15384a,#321735)',textAlign:'center'}
const programMonitor:React.CSSProperties={aspectRatio:'16/9',border:'2px solid #70592b',borderRadius:14,display:'grid',placeItems:'center',padding:16,background:'#020407',textAlign:'center'}
const grid2:React.CSSProperties={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:10,marginTop:10}
const panel:React.CSSProperties={border:'1px solid #244657',borderRadius:16,padding:12,background:'#07111aec'}
const sectionTitle:React.CSSProperties={fontSize:9,letterSpacing:1.7,color:'#66eaff',fontWeight:950}
const label:React.CSSProperties={display:'grid',gap:4,fontSize:8,color:'#8fa7b3',fontWeight:900,marginTop:8}
const input:React.CSSProperties={width:'100%',boxSizing:'border-box',minHeight:40,padding:'8px 9px',borderRadius:9,border:'1px solid #31586d',background:'#030b11',color:'#fff'}
const button:React.CSSProperties={minHeight:42,padding:'8px 10px',borderRadius:10,border:'1px solid #3b6579',background:'#0a1b25',color:'#fff',fontSize:9,fontWeight:950,touchAction:'manipulation'}
const linkBtn:React.CSSProperties={...button,textDecoration:'none',display:'grid',placeItems:'center'}
const moduleCard:React.CSSProperties={minHeight:84,padding:10,borderRadius:12,border:'1px solid #3bd79a66',background:'#08151d',color:'#fff',textAlign:'left'}
const creatorRow:React.CSSProperties={display:'flex',gap:7,alignItems:'center',padding:7,borderRadius:11,border:'1px solid #203f4e',background:'#06131b'}
const avatar:React.CSSProperties={width:34,height:34,flex:'0 0 34px',borderRadius:'50%',display:'grid',placeItems:'center',border:'1px solid #56e9ff66',background:'#102937',fontSize:10,fontWeight:1000}
const mini:React.CSSProperties={minHeight:30,padding:'4px 6px',borderRadius:8,border:'1px solid #395666',background:'#0a202b',color:'#fff',fontSize:7,fontWeight:950}
const empty:React.CSSProperties={padding:9,borderRadius:10,border:'1px solid #294454',background:'#07151e',fontSize:9,color:'#91a9b5'}
const rundownRow:React.CSSProperties={display:'flex',justifyContent:'space-between',gap:8,padding:8,borderRadius:10,border:'1px solid #233f4e',background:'#06131b',fontSize:10}
const noticeBox:React.CSSProperties={marginTop:10,padding:10,borderRadius:12,border:'1px solid #6d562c',background:'#1d1708',color:'#ffd990',fontSize:10}
