import {useEffect,useState} from 'react'
import type {CreatorVerseRoom,CreatorVerseBrandStatus,CreatorVerseScope} from '../runtime/CreatorVerseRoomRuntime'

export default function CreatorVerseRoomCenter(){
  const [rooms,setRooms]=useState<CreatorVerseRoom[]>([])
  const [name,setName]=useState('My CreatorVerse')
  const [owner,setOwner]=useState('Creator')
  const [theme,setTheme]=useState('Original creator-owned live world')
  const [region,setRegion]=useState('Chicago')
  const [brandStatus,setBrandStatus]=useState<CreatorVerseBrandStatus>('owned')
  const [scope,setScope]=useState<CreatorVerseScope>('city')
  const [crowd,setCrowd]=useState(true)
  const [note,setNote]=useState('Create a creator-owned Verse, publish it, then go LIVE or fly into it.')

  useEffect(()=>{
    const onState=(event:Event)=>setRooms((event as CustomEvent<{rooms?:CreatorVerseRoom[]}>).detail?.rooms||[])
    const onError=(event:Event)=>setNote(String((event as CustomEvent<{message?:string}>).detail?.message||'CreatorVerse action failed.'))
    addEventListener('tryamm:creatorverse-state',onState)
    addEventListener('tryamm:creatorverse-error',onError)
    dispatchEvent(new CustomEvent('tryamm:creatorverse-request-state'))
    return()=>{removeEventListener('tryamm:creatorverse-state',onState);removeEventListener('tryamm:creatorverse-error',onError)}
  },[])

  const create=()=>{
    dispatchEvent(new CustomEvent('tryamm:creatorverse-create',{detail:{
      displayName:name,ownerLabel:owner,theme,regionLabel:region,brandStatus,scope,
      sourceWorld:'streetverse',maxParticipants:15000,
      crowdBuild:{enabled:crowd,allowedJobs:['world-state-sync','telemetry-aggregate','media-thumbnail','light-ai'],serverVerificationRequired:true,phonesHeavyBuildAllowed:false},
    }}))
    setNote('CreatorVerse draft created. Publish requires owned/licensed branding.')
  }

  const act=(id:string,type:'publish'|'enter'|'live'|'crowd')=>{
    const eventName=type==='publish'?'tryamm:creatorverse-publish':type==='enter'?'tryamm:creatorverse-enter-request':type==='live'?'tryamm:creatorverse-go-live':'tryamm:creatorverse-crowd-build-request'
    dispatchEvent(new CustomEvent(eventName,{detail:{id}}))
    setNote(type==='publish'?'Publishing CreatorVerse…':type==='enter'?'Holographic fly-in requested…':type==='live'?'LIVE room requested…':'Crowd Build plan requested…')
  }

  return <main style={page}>
    <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
      <div><div style={{fontSize:10,letterSpacing:3,color:'#7beeff',fontWeight:950}}>CROSSVERSE CREATOR WORLDS</div><h1 style={{margin:'4px 0'}}>CREATORVERSE ROOMS</h1><p style={{maxWidth:760,color:'#a8bbc6',fontSize:11,lineHeight:1.55}}>Creator-owned modded worlds that combine LIVE, PK, missions, commerce, Mod Pass, regional StreetVerse slices and optional Crowd Build.</p></div>
      <button onClick={()=>window.location.href='/'} style={button}>CLOSE</button>
    </header>

    <section style={card}>
      <h2 style={{marginTop:0}}>Create a Verse</h2>
      <div style={form}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Verse name" style={field}/>
        <input value={owner} onChange={e=>setOwner(e.target.value)} placeholder="Creator/owner" style={field}/>
        <input value={region} onChange={e=>setRegion(e.target.value)} placeholder="Region/city" style={field}/>
        <select value={brandStatus} onChange={e=>setBrandStatus(e.target.value as CreatorVerseBrandStatus)} style={field}><option value="owned">Brand owned</option><option value="licensed">Brand licensed</option><option value="pending">Rights pending</option></select>
        <select value={scope} onChange={e=>setScope(e.target.value as CreatorVerseScope)} style={field}><option value="private">Private</option><option value="neighborhood">Neighborhood</option><option value="city">City</option><option value="regional">Regional</option><option value="global">Global</option></select>
      </div>
      <textarea value={theme} onChange={e=>setTheme(e.target.value)} rows={3} style={{...field,width:'100%',boxSizing:'border-box',marginTop:8}}/>
      <label style={{display:'flex',gap:8,alignItems:'center',marginTop:8,fontSize:11}}><input type="checkbox" checked={crowd} onChange={e=>setCrowd(e.target.checked)}/> Enable Crowd Build planning for opted-in devices</label>
      <button onClick={create} style={{...button,width:'100%',marginTop:10,borderColor:'#7beeff'}}>CREATE CREATORVERSE</button>
      <div style={notice}>{note}</div>
    </section>

    <section style={{display:'grid',gap:9,marginTop:12}}>
      {rooms.length===0&&<div style={card}>No CreatorVerse rooms yet.</div>}
      {rooms.map(room=><article key={room.id} style={card}>
        <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'start'}}>
          <div><div style={{fontSize:9,color:'#7beeff'}}>{room.regionLabel.toUpperCase()} • {room.scope.toUpperCase()}</div><h3 style={{margin:'4px 0'}}>{room.displayName}</h3><div style={{fontSize:10,color:'#a7bac6'}}>Owner: {room.ownerLabel} • Brand: {room.brandStatus} • Capacity: {room.maxParticipants.toLocaleString()}</div></div>
          <span style={{fontSize:9,fontWeight:950,color:room.published?'#7dffb2':'#ffd171'}}>{room.published?'PUBLISHED':'DRAFT'}</span>
        </div>
        <p style={{fontSize:11,color:'#c4d4dc',lineHeight:1.5}}>{room.theme}</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:6}}>
          <button disabled={room.published} onClick={()=>act(room.id,'publish')} style={button}>PUBLISH</button>
          <button disabled={!room.published} onClick={()=>act(room.id,'enter')} style={button}>HOLO FLY IN</button>
          <button disabled={!room.published} onClick={()=>act(room.id,'live')} style={button}>🔴 GO LIVE</button>
          <button disabled={!room.crowdBuild.enabled} onClick={()=>act(room.id,'crowd')} style={button}>⚡ CROWD BUILD</button>
        </div>
        <div style={{marginTop:8,fontSize:9,color:'#8499a5'}}>Phone Crowd Build = opt-in bounded work only. Heavy world generation stays on workstation/business/cloud nodes; results require server validation.</div>
      </article>)}
    </section>
  </main>
}

const page:React.CSSProperties={minHeight:'100dvh',padding:'max(14px,env(safe-area-inset-top)) 14px 44px',background:'radial-gradient(circle at 50% 0,#0b3850,#040812 52%,#010204)',color:'#fff',fontFamily:'system-ui'}
const card:React.CSSProperties={padding:14,borderRadius:16,border:'1px solid #315265',background:'linear-gradient(145deg,#071521ee,#0d0a18ee)',boxShadow:'0 12px 36px #0008'}
const form:React.CSSProperties={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:7}
const field:React.CSSProperties={minHeight:42,padding:'8px 10px',borderRadius:10,border:'1px solid #315265',background:'#03101a',color:'#fff'}
const button:React.CSSProperties={minHeight:42,padding:'8px 10px',borderRadius:10,border:'1px solid #47697c',background:'#0a2030',color:'#fff',fontWeight:950,touchAction:'manipulation'}
const notice:React.CSSProperties={marginTop:8,padding:8,borderRadius:10,background:'#081823',border:'1px solid #244655',fontSize:10,color:'#9bc8d8'}
