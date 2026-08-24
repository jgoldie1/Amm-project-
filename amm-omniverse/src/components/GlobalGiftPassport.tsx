import {useMemo,useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'

const API=(import.meta as any).env?.VITE_API_URL??''

type Region='GLOBAL'|'AFRICA'|'CARIBBEAN'|'LATIN'|'EUROPE'|'EAST-ASIA'|'SOUTH-ASIA'|'MENA'|'INDIGENOUS'|'PACIFIC'|'NORTH-AMERICA'
type Gift={id:string;label:string;icon:string;region:Region;effect:string;credits:number;musicCue:string}
const G=(id:string,label:string,icon:string,region:Region,effect:string,credits:number,musicCue:string):Gift=>({id,label,icon,region,effect,credits,musicCue})

const GIFTS:Gift[]=[
  G('world-unity','World Unity','🌍','GLOBAL','Continents form a glowing globe around the creator',100,'unity'),
  G('peace-orbit','Peace Orbit','🕊️','GLOBAL','White doves and cyan/gold orbit rings fill the room',75,'peace'),
  G('global-love','Global Love','💞','GLOBAL','Multicolor heart ribbons circle the LIVE stage',100,'love'),
  G('all-nations','All Nations','🌐','GLOBAL','Flag-light ribbons from around the world form one holographic crown',250,'nations'),
  G('africa-rise','Africa Rise','🌍','AFRICA','Gold Africa silhouette rises through rhythmic light pillars',250,'africa'),
  G('afrobeats-wave','Afrobeats Wave','🥁','AFRICA','Percussion-reactive neon wave and dance-floor pulse',300,'afrobeats'),
  G('caribbean-sun','Caribbean Sun','🌴','CARIBBEAN','Tropical holographic sun, ocean shimmer and carnival confetti',250,'caribbean'),
  G('carnival-wave','Carnival Wave','🎭','CARIBBEAN','Feather-light color trails sweep the room',350,'carnival'),
  G('latin-fiesta','Latin Fiesta','💃','LATIN','Festival lights, rose petals and rhythm-reactive floor',250,'latin'),
  G('latin-stars','Latin Stars','✨','LATIN','Gold stars and ribbon trails form a celebration arch',300,'latinstars'),
  G('euro-crown','European Lights','🏰','EUROPE','Castle-light skyline and aurora ribbons surround stage',300,'europe'),
  G('euro-festival','Festival Square','🎡','EUROPE','Holographic city-square celebration opens around the host',350,'festival'),
  G('east-asia-lantern','Lantern Sky','🏮','EAST-ASIA','Floating lanterns rise into a moonlit holographic sky',250,'lantern'),
  G('east-asia-dragon','Dragon Light','🐉','EAST-ASIA','Stylized light-dragon circles the room without national stereotyping',500,'dragon'),
  G('south-asia-lights','Festival of Lights','🪔','SOUTH-ASIA','Warm lamps, geometric light patterns and gold particle trails',250,'lights'),
  G('south-asia-dance','Rhythm Palace','🎶','SOUTH-ASIA','Colorful rhythm-reactive palace arches appear around the stage',400,'rhythm'),
  G('mena-stars','Desert Stars','🌙','MENA','Moon, stars and geometric light canopy sweep across room',250,'mena'),
  G('mena-gate','Golden Gate','🕌','MENA','Architectural light-gate opens into a warm gold horizon',400,'gate'),
  G('first-nations-sky','First Nations Sky','🪶','INDIGENOUS','Respectful nature-sky panorama with stars, mountains and aurora',250,'firstnations'),
  G('earth-keeper','Earth Keeper','🌿','INDIGENOUS','Leaves, water and earth-light orbit the creator',300,'earth'),
  G('pacific-wave','Pacific Wave','🌊','PACIFIC','Ocean swell, island stars and blue-gold wave ribbons',250,'pacific'),
  G('island-flower','Island Flower','🌺','PACIFIC','Flower-light petals and ocean sparkles fill the stage',300,'flower'),
  G('canada-north','Northern Lights','🇨🇦','NORTH-AMERICA','Aurora canopy and maple-light burst',250,'canada'),
  G('mexico-celebration','Mexico Celebration','🇲🇽','NORTH-AMERICA','Green-white-red light ribbons and festival sparkles',250,'mexico'),
  G('usa-unity','USA Unity','🇺🇸','NORTH-AMERICA','Red-white-blue holographic sweep with creator spotlight',250,'usa'),
]

export default function GlobalGiftPassport({recipientId='live-host'}:{recipientId?:string}){
  const [region,setRegion]=useState<Region|'ALL'>('GLOBAL')
  const [selected,setSelected]=useState(GIFTS[0])
  const [mode,setMode]=useState<'screen'|'ar'|'vr'>('screen')
  const [message,setMessage]=useState('Choose a universal, country, region or heritage celebration. Gifts are never assigned by skin color.')
  const [busy,setBusy]=useState(false)
  const visible=useMemo(()=>region==='ALL'?GIFTS:GIFTS.filter(g=>g.region===region),[region])
  async function send(){
    setBusy(true)
    try{
      const token=await getAccessToken();if(!token)throw new Error('Sign in before sending a gift.')
      const r=await fetch(`${API}/api/gifts/intent`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({giftType:selected.id,recipientId,amountMinor:selected.credits,spatialMode:mode,musicCue:selected.musicCue})})
      const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data?.error||`Gift request failed (${r.status})`)
      window.dispatchEvent(new CustomEvent('tryamm:holo-gift',{detail:{...data.intent,effect:selected.effect,region:selected.region,collection:'GLOBAL PASSPORT'}}))
      setMessage(`${selected.label} fired in ${mode.toUpperCase()} mode. Visual celebration is immediate; any real-value settlement remains verification-gated.`)
    }catch(e){setMessage(e instanceof Error?e.message:'Gift failed.')}finally{setBusy(false)}
  }
  const regions:(Region|'ALL')[]=['GLOBAL','AFRICA','CARIBBEAN','LATIN','EUROPE','EAST-ASIA','SOUTH-ASIA','MENA','INDIGENOUS','PACIFIC','NORTH-AMERICA','ALL']
  return <section style={{border:'1px solid #3a425c',borderRadius:20,background:'linear-gradient(155deg,#08111be8,#090b17e8)',padding:14,color:'#fff'}}>
    <div style={{fontSize:10,letterSpacing:2.5,color:'#4fe3ff',fontWeight:950}}>GLOBAL GIFT PASSPORT • ALL NATIONS</div>
    <div style={{fontSize:10,color:'#9fb0bd',marginTop:5}}>Universal gifts for everyone + opt-in regional/country celebration packs.</div>
    <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:10}}>{regions.map(r=><button key={r} onClick={()=>setRegion(r)} style={{padding:'6px 9px',borderRadius:999,border:`1px solid ${region===r?'#4fe3ff':'#2c3947'}`,background:region===r?'#0b2a37':'#071018',color:'#fff',fontSize:9,fontWeight:900,cursor:'pointer'}}>{r}</button>)}</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:7,marginTop:10,maxHeight:340,overflowY:'auto'}}>{visible.map(g=><button key={g.id} onClick={()=>setSelected(g)} style={{padding:10,borderRadius:12,border:`1px solid ${selected.id===g.id?'#4fe3ff':'#26394b'}`,background:selected.id===g.id?'#0c2837':'#080d14',color:'#fff',cursor:'pointer',textAlign:'left'}}><div style={{fontSize:25}}>{g.icon}</div><div style={{fontSize:10,fontWeight:900}}>{g.label}</div><div style={{fontSize:8,color:'#8fa2af',marginTop:3}}>{g.effect}</div><div style={{fontSize:8,color:'#e8b944',marginTop:4}}>{g.region} • {g.credits} credits</div></button>)}</div>
    <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:10}}>{(['screen','ar','vr'] as const).map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:'8px 11px',borderRadius:10,border:`1px solid ${mode===m?'#4fe3ff':'#2d4050'}`,background:mode===m?'#0c2b39':'#081019',color:'#fff',fontWeight:900,cursor:'pointer'}}>{m.toUpperCase()}</button>)}</div>
    <button disabled={busy} onClick={send} style={{width:'100%',marginTop:10,padding:12,borderRadius:12,border:'1px solid #4fe3ff88',background:'linear-gradient(135deg,#0c3343,#27203a)',color:'#fff',fontWeight:950,cursor:'pointer'}}>{busy?'SENDING…':`SEND ${selected.icon} ${selected.label} • ${selected.credits} CREDITS`}</button>
    <div style={{fontSize:10,lineHeight:1.5,color:'#a7b6c2',marginTop:9}}>{message}</div>
  </section>
}
