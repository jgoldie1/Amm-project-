import {useEffect,useMemo,useState} from 'react'
import {TRYAMM_NETWORK_CHANNELS,TRYAMM_DISTRIBUTION_MATRIX,TRYAMM_NEWS_DESKS,type BroadcastOSState,type TryammNetworkChannel} from '../runtime/TryammBroadcastOSRuntime'

type Feed=BroadcastOSState['activeFeeds'][number]

const EQUIPMENT=[
 ['CAM A','Host camera / phone / webcam'],['CAM B','Guest / second angle'],['CAM C','Wide / stage / StreetVerse world camera'],
 ['AUDIO MIXER','Host mic • guest mic • music • FX'],['VISION SWITCHER','Preview / Program scene switching'],['TELEPROMPTER','Scripts, rundown and host cues'],
 ['GRAPHICS','Lower thirds • logos • scorebugs • tickers'],['CAPTIONS','Live captions • transcripts • translation hooks'],['VIRTUAL SET','Green screen / background replacement'],
 ['REMOTE GUESTS','Callers, creators, co-hosts and panels'],['PLAYBACK','Reels, clips, sponsor media and packages'],['REPLAY','Sports/boxing instant replay and highlight queue'],
 ['RECORDER','Program master, clips, VOD and archive'],['LIGHTING','Key/fill/back light presets and virtual lighting'],['INTERCOM','Producer, host, camera and moderator cues'],['STREAM ROUTER','TRYAMM LIVE • network • replay • external package'],
] as const

const SHOWS=[
 {id:'streetverse-reality',title:'StreetVerse Chicago: Living City',channel:'tryamm-reality',format:'Reality / docu-series',source:'StreetVerse'},
 {id:'who-star',title:'Who Wants to Be a Star?',channel:'isaiah-ai-tv',format:'Talent competition',source:'StarVerse'},
 {id:'aan-talk',title:'All American Tonight',channel:'tryamm-talk',format:'Talk / interview',source:'All American Network'},
 {id:'boxing-night',title:'SportsVerse Fight Night',channel:'sportsverse-live',format:'Boxing / sports event',source:'SportsVerse'},
 {id:'faith-live',title:'Servants of Christ LIVE',channel:'servants-of-christ-network',format:'Worship / teaching',source:'FaithVerse'},
 {id:'music-showcase',title:'MusicVerse Live Sessions',channel:'musicverse-tv',format:'Music / artist showcase',source:'MusicVerse'},
 {id:'local-news',title:'StreetVerse Local',channel:'streetverse-local-tv',format:'Local news / community',source:'StreetVerse'},
] as const

export default function TryammBroadcastNetworkCenter(){
 const [state,setState]=useState<BroadcastOSState>({activeFeeds:[],scheduled:0,lastUpdated:new Date().toISOString()})
 const [selected,setSelected]=useState<TryammNetworkChannel>(TRYAMM_NETWORK_CHANNELS[0])
 const [tab,setTab]=useState<'channels'|'studio'|'shows'|'news'|'distribution'|'feeds'>('channels')
 const feeds=useMemo(()=>state.activeFeeds.filter(f=>f.channelId===selected.id||selected.id==='all-american-network'),[state,selected])

 useEffect(()=>{
  const onState=(event:Event)=>{
   const d=(event as CustomEvent<BroadcastOSState>).detail
   if(d)setState({activeFeeds:d.activeFeeds||[],scheduled:Number(d.scheduled||0),lastUpdated:String(d.lastUpdated||new Date().toISOString())})
  }
  addEventListener('tryamm:broadcast-os-state',onState)
  dispatchEvent(new CustomEvent('tryamm:broadcast-os-request'))
  return()=>removeEventListener('tryamm:broadcast-os-state',onState)
 },[])

 const openStudio=(channel:TryammNetworkChannel=selected)=>{try{localStorage.setItem('tryamm.broadcast.selected-channel',channel.id)}catch{};window.location.href='/network/studio?channel='+encodeURIComponent(channel.id)}
 const goLive=(channel:TryammNetworkChannel=selected)=>{window.location.href='/live?role=host&channel='+encodeURIComponent(channel.id)+'&from=broadcast-os'}
 const schedule=(show:typeof SHOWS[number])=>{dispatchEvent(new CustomEvent('tryamm:broadcast-program-scheduled',{detail:{...show,scheduledAt:new Date().toISOString(),source:'broadcast-os'}}));setState(s=>({...s,scheduled:s.scheduled+1}))}

 return <main style={page}>
  <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
   <div><div style={{fontSize:10,letterSpacing:3,color:'#76ecff',fontWeight:950}}>TRYAMM BROADCAST NETWORK • NETWORK OF NETWORKS</div><h1 style={{margin:'5px 0',fontSize:'clamp(34px,7vw,70px)'}}>BROADCAST OS</h1><p style={{margin:0,maxWidth:860,color:'#a9bdc8',lineHeight:1.55}}>StreetVerse field TV, All American Network, Isaiah AI TV, StarVerse, Servants of Christ, SportsVerse, reality, talk, MusicVerse and OmniNews share one studio, program guide, replay and distribution control plane.</p></div>
   <div style={{display:'flex',gap:7,flexWrap:'wrap'}}><button onClick={()=>window.location.href='/network'} style={button}>NETWORK HOME</button><button onClick={()=>openStudio()} style={{...button,borderColor:'#74efff'}}>OPEN STUDIO</button><button onClick={()=>goLive()} style={{...button,borderColor:'#ff4f6f'}}>🔴 GO LIVE</button></div>
  </header>

  <nav style={{display:'flex',gap:6,overflowX:'auto',marginTop:14,paddingBottom:4}}>{(['channels','studio','shows','news','distribution','feeds'] as const).map(x=><button key={x} onClick={()=>setTab(x)} style={{...chip,borderColor:tab===x?'#6cecff':'#294453'}}>{x.toUpperCase()}</button>)}</nav>

  {tab==='channels'&&<section style={grid}>{TRYAMM_NETWORK_CHANNELS.map(channel=><button key={channel.id} onClick={()=>setSelected(channel)} style={{...card,textAlign:'left',borderColor:selected.id===channel.id?'#75eaff':'#263f50'}}><div style={{fontSize:8,color:'#7ceeff',fontWeight:950}}>{channel.lane.toUpperCase()}</div><h2 style={{fontSize:17,margin:'6px 0'}}>{channel.name}</h2><p style={copy}>{channel.description}</p><div style={{fontSize:9,color:'#93aab6'}}>{channel.formats.join(' • ')}</div><div style={{display:'flex',gap:5,marginTop:10}}><span style={badge}>LIVE</span><span style={badge}>VOD</span></div></button>)}</section>}

  {tab==='studio'&&<section><article style={{...card,borderColor:'#5de9ff77'}}><div style={{fontSize:9,color:'#6cecff',fontWeight:950}}>CURRENT NETWORK</div><h2>{selected.name}</h2><p style={copy}>One virtual/physical production room can take phone cameras, webcams, StreetVerse world cameras, remote guests, graphics, scorebugs, captions, virtual sets, replay and program routing.</p><div style={{display:'flex',gap:7,flexWrap:'wrap'}}><button onClick={()=>openStudio()} style={button}>OPEN CONTROL ROOM</button><button onClick={()=>goLive()} style={button}>GO LIVE</button></div></article><div style={grid}>{EQUIPMENT.map(([name,desc])=><article key={name} style={card}><b>{name}</b><p style={copy}>{desc}</p></article>)}</div></section>}

  {tab==='shows'&&<section style={grid}>{SHOWS.map(show=><article key={show.id} style={card}><div style={{fontSize:8,color:'#d4b7ff',fontWeight:950}}>{show.source.toUpperCase()}</div><h2 style={{fontSize:17,margin:'6px 0'}}>{show.title}</h2><div style={{fontSize:10,color:'#9db1bd'}}>{show.format}</div><div style={{display:'flex',gap:6,marginTop:10}}><button onClick={()=>schedule(show)} style={button}>SCHEDULE</button><button onClick={()=>{const ch=TRYAMM_NETWORK_CHANNELS.find(x=>x.id===show.channel);if(ch)openStudio(ch)}} style={button}>PRODUCE</button></div></article>)}</section>}

  {tab==='news'&&<section><article style={{...card,borderColor:'#5ce5ff66'}}><div style={{fontSize:9,color:'#6cecff',fontWeight:950}}>OMNINEWS / TRYAMM NEWSROOM</div><h2>Local → National → International → Global</h2><p style={copy}>The newsroom keeps source attribution, timestamps, corrections, sponsor/editorial separation and political neutrality controls. Weather and operational alerts stay provider/source-labeled rather than being invented.</p></article><div style={grid}>{TRYAMM_NEWS_DESKS.map(d=><article key={d.id} style={card}><div style={{fontSize:8,color:'#73ecff',fontWeight:950}}>{String(d.scope).toUpperCase()}</div><h2 style={{fontSize:16,margin:'6px 0'}}>{d.name}</h2><div style={{fontSize:9,color:'#8fa7b3'}}>LIVE {d.live?'YES':'NO'} • REPLAY {d.replay?'YES':'NO'} • EDITORIAL INDEPENDENCE</div></article>)}</div></section>}

  {tab==='distribution'&&<section style={grid}>{TRYAMM_DISTRIBUTION_MATRIX.map(item=><article key={item.id} style={{...card,borderColor:item.status==='ready'?'#63e59a66':item.status==='package-ready'?'#67dfff66':'#f2c35a55'}}><div style={{fontSize:8,fontWeight:950,color:item.status==='ready'?'#83ffb0':item.status==='package-ready'?'#82edff':'#ffd270'}}>{item.status.toUpperCase()}</div><h2 style={{fontSize:16,margin:'6px 0'}}>{item.label}</h2><p style={copy}>{item.note}</p></article>)}</section>}

  {tab==='feeds'&&<section><article style={card}><h2 style={{marginTop:0}}>{selected.name} • ACTIVE / RECENT FEEDS</h2><div style={{fontSize:10,color:'#93a9b5'}}>Scheduled programs: {state.scheduled} • Recent feed records: {state.activeFeeds.length}</div></article><div style={grid}>{feeds.length?feeds.map((feed:Feed)=><article key={feed.id} style={card}><div style={{fontSize:8,color:feed.live?'#ff5b73':'#6cecff',fontWeight:950}}>{feed.live?'LIVE':'RECORDED'} • {feed.kind.toUpperCase()}</div><h2 style={{fontSize:16,margin:'6px 0'}}>{feed.title}</h2><p style={copy}>{feed.source}{feed.communityArea?' • Community Area '+feed.communityArea:''}</p>{feed.route&&<button onClick={()=>window.location.href=feed.route!} style={button}>OPEN SOURCE</button>}</article>):<article style={card}><p style={copy}>No feed has entered this channel yet. StreetVerse missions, LIVE sessions, Reels, StarVerse showcases and SportsVerse events will populate this rail automatically.</p></article>}</div></section>}
 </main>
}

const page:React.CSSProperties={minHeight:'100vh',padding:'max(16px,env(safe-area-inset-top)) 14px 70px',background:'radial-gradient(circle at 50% 0,#103b4d,#070b13 46%,#020305)',color:'#fff',fontFamily:'system-ui'}
const grid:React.CSSProperties={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:9,marginTop:12}
const card:React.CSSProperties={padding:14,border:'1px solid #263f50',borderRadius:16,background:'linear-gradient(145deg,#08141e,#0b0d15)',color:'#fff'}
const copy:React.CSSProperties={fontSize:11,lineHeight:1.55,color:'#a9bdc8'}
const button:React.CSSProperties={minHeight:42,padding:'8px 11px',borderRadius:10,border:'1px solid #466a7d',background:'#0b1f2b',color:'#fff',fontWeight:950,touchAction:'manipulation'}
const chip:React.CSSProperties={minHeight:38,padding:'7px 11px',borderRadius:999,border:'1px solid #294453',background:'#07151f',color:'#fff',fontSize:9,fontWeight:950,whiteSpace:'nowrap'}
const badge:React.CSSProperties={padding:'3px 6px',borderRadius:999,border:'1px solid #48758a',fontSize:7,color:'#aeefff'}