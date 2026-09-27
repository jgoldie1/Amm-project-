import {useMemo,useState} from 'react'

type Channel={id:string;name:string;category:string;now:string;next:string;live:boolean}

const CHANNELS:Channel[]=[
 {id:'soc',name:'Servants of Christ Network',category:'FaithVerse',now:'Worship & Teaching',next:'Scripture Study',live:true},
 {id:'aan',name:'All American Network',category:'Showcase • Creators • Business • Culture',now:'All American Showcase LIVE',next:'Anyone Can Be a Star • Creator Spotlight',live:true},
 {id:'isaiah',name:'Isaiah AI TV',category:'StarVerse • Talent',now:'Anyone Can Be a Star',next:'StarVerse Showcase',live:true},
 {id:'street',name:'StreetVerse TV',category:'Local',now:'Chicago LIVE',next:'Community Business',live:true},
 {id:'news',name:'TRYAMM Global News',category:'News',now:'World Update',next:'Weather Around the World',live:true},
 {id:'music',name:'MusicVerse',category:'Music',now:'Holo Music LIVE',next:'Artist PK',live:true},
 {id:'sports',name:'SportsVerse',category:'Sports',now:'SportsVerse LIVE',next:'Holo Arena',live:true},
 {id:'theater',name:'Holo Theater',category:'Movies',now:'Featured Premiere',next:'Creator Cinema',live:false},
]

export default function TryammTvHome({onClose}:{onClose:()=>void}){
 const [selected,setSelected]=useState(CHANNELS[0].id)
 const channel=useMemo(()=>CHANNELS.find(x=>x.id===selected)??CHANNELS[0],[selected])
 return <main style={{minHeight:'100dvh',background:'#050812',color:'#fff',padding:'14px',fontFamily:'system-ui'}}>
  <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
   <div><div style={{fontSize:12,opacity:.7}}>HOLO FON • TV</div><h1 style={{fontSize:22,margin:'2px 0'}}>TRYAMM TV</h1></div>
   <button onClick={onClose} aria-label="Close TRYAMM TV">✕</button>
  </header>
  <section style={{border:'1px solid #39f3d0',borderRadius:16,padding:14,margin:'10px 0 14px'}}>
   <div style={{fontSize:12,opacity:.75}}>{channel.category} • {channel.live?'LIVE':'ON DEMAND'}</div>
   <h2 style={{margin:'6px 0'}}>{channel.name}</h2>
   <div><b>NOW</b> {channel.now}</div><div style={{opacity:.75,marginTop:4}}><b>NEXT</b> {channel.next}</div>
   <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
    <button onClick={()=>{const open=(window as any).__showTryAMMLive;if(typeof open==='function')open()}} title="Open TRYAMM Holo LIVE player">WATCH {channel.live?'LIVE':'NOW'}</button>
    <button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:replay-open',{detail:{channelId:channel.id}}))} title="Open this channel in the TRYAMM replay catalog">REPLAY / VOD</button>
   </div>
  </section>
  <h2 style={{fontSize:16}}>LIVE GUIDE</h2>
  <div style={{display:'grid',gap:8}}>
   {CHANNELS.map(x=><button key={x.id} onClick={()=>setSelected(x.id)} style={{textAlign:'left',padding:12,borderRadius:12,border:x.id===selected?'1px solid #39f3d0':'1px solid #27304a',background:'#0b1120',color:'#fff'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:8}}><b>{x.name}</b><span>{x.live?'● LIVE':'VOD'}</span></div>
    <div style={{fontSize:13,opacity:.78,marginTop:4}}>NOW: {x.now}</div>
    <div style={{fontSize:12,opacity:.58}}>NEXT: {x.next}</div>
   </button>)}
  </div>
  <p style={{fontSize:12,opacity:.6,marginTop:16}}>Internet-first cable-style guide. External FAST/CTV/OTT distribution requires certified provider integrations and content rights.</p>
 </main>
}
