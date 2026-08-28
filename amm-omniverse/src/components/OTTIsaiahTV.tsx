import { useMemo, useState } from 'react'

type Props = { onClose: () => void }
type Lane = 'All' | 'LIVE Replays' | 'Originals' | 'Showcase' | 'StarVerse' | 'Debate' | 'Games' | 'Podcasts' | 'Music' | 'News' | 'Sports' | 'Faith' | 'Marketplace' | 'Education'
type Network='Isaiah AI TV'|'All American Network TV'|'Servants of Christ TV'
type XRMode='Phone/TV'|'AR'|'Mixed Reality'|'VR'
type Program = {id:string;title:string;lane:Exclude<Lane,'All'>;rating:string;access:'FREE'|'MEMBER'|'PPV';network:Network;description:string;provenance?:string}

type GuideItem={time:string;title:string;network:Network;status:'LIVE'|'NEXT'|'REPLAY'}

const PROGRAMS: Program[] = [
  { id:'showcase', title:'All American Showcase', lane:'Showcase', rating:'TV-PG', access:'FREE', network:'All American Network TV', description:'Creator, music, business and talent showcase events.' },
  { id:'starverse', title:'StarVerse', lane:'StarVerse', rating:'TV-PG', access:'MEMBER', network:'Isaiah AI TV', description:'Anyone Can Be a Star auditions, performances and competition.' },
  { id:'debate', title:'Debate Arena', lane:'Debate', rating:'TV-PG', access:'FREE', network:'All American Network TV', description:'Moderated debates, town halls and transparent scoring.' },
  { id:'hologame', title:'Holo Game Night', lane:'Games', rating:'TV-PG', access:'FREE', network:'Isaiah AI TV', description:'StreetVerse, Quantum Tag and original interactive game programming.' },
  { id:'creator', title:'Creator Showdown', lane:'Originals', rating:'TV-PG', access:'MEMBER', network:'Isaiah AI TV', description:'Original creator competition built for Isaiah AI TV.' },
  { id:'music', title:'El Saturn Sessions', lane:'Music', rating:'TV-PG', access:'FREE', network:'All American Network TV', description:'Original performances, studio sessions and label showcases.' },
  { id:'podcast', title:'TRYAMM Podcast Network', lane:'Podcasts', rating:'TV-PG', access:'FREE', network:'All American Network TV', description:'Video podcasts, audio editions, transcripts and translated versions.' },
  { id:'replay', title:'Tonight on TRYAMM LIVE', lane:'LIVE Replays', rating:'TV-PG', access:'FREE', network:'All American Network TV', description:'Replay lane for completed LIVE, Showcase, Debate and StarVerse rooms.' },
  { id:'news', title:'All American News Desk', lane:'News', rating:'TV-PG', access:'FREE', network:'All American Network TV', description:'Local-to-global news and community reporting with source links, corrections history, synthetic-media labels and editorial controls.', provenance:'Sources required before publish' },
  { id:'sports', title:'All American Sports', lane:'Sports', rating:'TV-G', access:'FREE', network:'All American Network TV', description:'Sports shows, highlights, athlete stories and StreetVerse event tie-ins.' },
  { id:'faith-live', title:'Servants of Christ LIVE', lane:'Faith', rating:'TV-G', access:'FREE', network:'Servants of Christ TV', description:'Worship, teaching, Sabbath/New Moon programming, Bible study and global fellowship.' },
  { id:'faith-study', title:'Set-Apart Study', lane:'Faith', rating:'TV-G', access:'FREE', network:'Servants of Christ TV', description:'Study programs with captions, transcripts, translation and sign-language-ready output.' },
  { id:'faith-community', title:'Servants Community News', lane:'News', rating:'TV-G', access:'FREE', network:'Servants of Christ TV', description:'Community announcements, service information and sourced public-interest updates.', provenance:'Community/source verification required' },
  { id:'market', title:'All American Marketplace LIVE', lane:'Marketplace', rating:'TV-G', access:'FREE', network:'All American Network TV', description:'Verified business showcases, product demos, booking, storefront and creator-commerce programming.' },
  { id:'university', title:'All American University', lane:'Education', rating:'TV-G', access:'FREE', network:'All American Network TV', description:'Workforce, trade, AI, creator and business-development programming.' },
]

const GUIDE:GuideItem[]=[
  {time:'NOW',title:'All American News Desk',network:'All American Network TV',status:'LIVE'},
  {time:'+30m',title:'All American Marketplace LIVE',network:'All American Network TV',status:'NEXT'},
  {time:'+60m',title:'Servants of Christ LIVE',network:'Servants of Christ TV',status:'NEXT'},
  {time:'+90m',title:'StarVerse Showcase',network:'Isaiah AI TV',status:'NEXT'},
]

const LANES: Lane[] = ['All','LIVE Replays','Originals','Showcase','StarVerse','Debate','Games','Podcasts','Music','News','Sports','Faith','Marketplace','Education']
const NETWORKS:Network[]=['Isaiah AI TV','All American Network TV','Servants of Christ TV']
const XR_MODES:XRMode[]=['Phone/TV','AR','Mixed Reality','VR']

export default function OTTIsaiahTV({ onClose }: Props) {
  const [lane, setLane] = useState<Lane>('All')
  const [network,setNetwork]=useState<Network>('All American Network TV')
  const [selected, setSelected] = useState<Program | null>(null)
  const [captions, setCaptions] = useState(true)
  const [audioDescription, setAudioDescription] = useState(false)
  const [translation, setTranslation] = useState('Original')
  const [xrMode,setXRMode]=useState<XRMode>('Phone/TV')
  const programs = useMemo(() => PROGRAMS.filter(p=>(network===p.network)&&(lane==='All'||p.lane===lane)), [lane,network])

  function dispatch(action: string, detail: Record<string, unknown> = {}) {window.dispatchEvent(new CustomEvent('tryamm:ott-action', { detail: { action, network, xrMode, ...detail } }))}
  function openXR(mode:XRMode){setXRMode(mode);dispatch('open-xr',{mode});window.dispatchEvent(new CustomEvent('tryamm:xr-launch',{detail:{mode,source:'network-tv',network}}))}

  return <div role="dialog" aria-modal="true" aria-label="TRYAMM TV Core" style={{position:'fixed',inset:0,zIndex:12100,background:'linear-gradient(180deg,#03040b,#080d1b 48%,#02030a)',color:'#fff',overflowY:'auto',fontFamily:'system-ui,sans-serif'}}>
    <header style={{position:'sticky',top:0,zIndex:2,display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,padding:'16px 20px',background:'#050713ee',backdropFilter:'blur(14px)',borderBottom:'1px solid #25314d'}}>
      <div><div style={{fontSize:11,letterSpacing:2,color:'#8cecff'}}>TRYAMM FREE TV / OMNI BOX / NETWORK CORE</div><h1 style={{margin:'3px 0'}}>{network}</h1><div style={{opacity:.68,fontSize:13}}>LIVE → TV → news → podcast → Reel → StreetVerse → marketplace → AR/MR/VR → archive</div></div>
      <button onClick={onClose} aria-label="Close TV" style={{width:48,height:48,borderRadius:14,border:'1px solid #53617b',background:'#11182a',color:'#fff',fontSize:28}}>×</button>
    </header>

    <main style={{maxWidth:1100,margin:'0 auto',padding:20,display:'grid',gap:18}}>
      <section style={{display:'flex',gap:8,overflowX:'auto'}}>{NETWORKS.map(n=><button key={n} onClick={()=>{setNetwork(n);setLane('All')}} style={{...chip,borderColor:network===n?'#e8b944':'#34405b',color:network===n?'#ffe49b':'#d8dcea'}}>{n}</button>)}</section>

      <section style={{padding:18,border:'1px solid #26496a',borderRadius:20,background:'radial-gradient(circle at 80% 20%,#153b58,#08111f 55%)'}}>
        <div style={{fontSize:12,color:'#7effb5',fontWeight:900}}>FREE TV + FAST FOUNDATION</div><h2 style={{fontSize:'clamp(26px,5vw,52px)',margin:'8px 0'}}>One event. Every screen.</h2>
        <p style={{maxWidth:800,opacity:.78,lineHeight:1.6}}>A TRYAMM event can become a live program, replay, news package, podcast, Holo Clip/Reel, StreetVerse mission, marketplace activation and future AR/MR/VR experience. Provider, rights, news provenance and payment gates remain enforced before production publishing or money movement is marked live.</p>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}><button onClick={()=>{dispatch('open-live');(window as any).__showTryAMMLive?.()}} style={primary}>● OPEN LIVE STUDIO</button><button onClick={()=>dispatch('request-publish-workflow')} style={secondary}>CREATE TV RELEASE</button><button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'network-tv',network}}))} style={secondary}>MAKE REEL</button><button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-event-open',{detail:{source:'network-tv',network}}))} style={secondary}>SEND TO STREETVERSE</button></div>
      </section>

      <section style={{padding:16,border:'1px solid #27344f',borderRadius:18,background:'#080d18'}}><div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}><div><div style={{fontSize:11,color:'#8cecff',fontWeight:900}}>CHANNEL GUIDE</div><h3 style={{margin:'4px 0'}}>Free network schedule</h3></div><span style={{fontSize:11,color:'#7effb5'}}>FREE VIEWING CORE</span></div><div style={{display:'grid',gap:8,marginTop:10}}>{GUIDE.map(g=><button key={`${g.time}-${g.title}`} onClick={()=>{setNetwork(g.network);setLane('All')}} style={{display:'grid',gridTemplateColumns:'70px 1fr auto',gap:10,alignItems:'center',padding:12,border:'1px solid #26354e',borderRadius:12,background:'#0c1322',color:'#fff',textAlign:'left'}}><b style={{color:'#8cecff'}}>{g.time}</b><span><strong>{g.title}</strong><small style={{display:'block',opacity:.6}}>{g.network}</small></span><span style={{fontSize:10,color:g.status==='LIVE'?'#7effb5':'#e8b944'}}>{g.status}</span></button>)}</div></section>

      <section style={{padding:16,border:'1px solid #39426b',borderRadius:18,background:'#0a0d1b'}}><div style={{fontSize:11,color:'#c7a7ff',fontWeight:900}}>AR / VR / MIXED REALITY</div><h3 style={{margin:'5px 0 10px'}}>Same network event, progressive immersive clients</h3><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{XR_MODES.map(m=><button key={m} onClick={()=>openXR(m)} style={{...chip,borderColor:xrMode===m?'#bd8cff':'#34405b',color:xrMode===m?'#e6d7ff':'#d8dcea'}}>{m}</button>)}</div><p style={{opacity:.68,lineHeight:1.55,fontSize:13}}>Phone/TV is the baseline. AR, MR and VR launch through the shared XR event contract and remain device-test/provider gated. StreetVerse, Quantum Tag, Holo Labs, StarVerse and Quantum Time can reuse this same event identity.</p></section>

      <nav aria-label="TV categories" style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4}}>{LANES.map(item => <button key={item} onClick={()=>setLane(item)} style={{...chip,borderColor:lane===item?'#4fe3ff':'#34405b',color:lane===item?'#8ff5ff':'#d8dcea'}}>{item}</button>)}</nav>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>{programs.map(p => <button key={p.id} onClick={()=>setSelected(p)} style={{textAlign:'left',padding:0,border:'1px solid #293650',borderRadius:18,overflow:'hidden',background:'#0a1020',color:'#fff',cursor:'pointer'}}><div style={{aspectRatio:'16/9',display:'grid',placeItems:'center',background:'radial-gradient(circle,#173f59,#10162b 60%,#080b14)',fontSize:42}}>◉</div><div style={{padding:14}}><div style={{fontSize:10,color:'#e8b944'}}>{p.network}</div><div style={{fontSize:11,color:'#7eeaff'}}>{p.lane} · {p.access}</div><strong style={{display:'block',fontSize:17,margin:'4px 0'}}>{p.title}</strong><div style={{fontSize:12,opacity:.62}}>{p.rating}</div>{p.provenance&&<div style={{fontSize:10,color:'#ffbf75',marginTop:6}}>SOURCE GATE: {p.provenance}</div>}</div></button>)}</section>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10,padding:16,border:'1px solid #27344f',borderRadius:18,background:'#080d18'}}><label style={control}><input type="checkbox" checked={captions} onChange={e=>setCaptions(e.target.checked)}/> Captions / transcripts</label><label style={control}><input type="checkbox" checked={audioDescription} onChange={e=>setAudioDescription(e.target.checked)}/> Audio description</label><label style={{...control,display:'grid'}}><span>Audio / subtitle language</span><select value={translation} onChange={e=>setTranslation(e.target.value)} style={{marginTop:6,padding:9,borderRadius:10,background:'#111a2b',color:'#fff',border:'1px solid #40506d'}}><option>Original</option><option>English</option><option>Spanish</option><option>French</option><option>Arabic</option><option>Hebrew</option><option>Amharic</option><option>Swahili</option><option>Japanese</option><option>Chinese</option><option>Korean</option><option>Auto / HoloLingo</option></select></label></section>

      <section style={{padding:14,border:'1px dashed #6a5d35',borderRadius:14,color:'#d9c995',fontSize:12,lineHeight:1.6}}><strong>$11.25/year founder pricing marker preserved.</strong> It is intentionally not assigned to a paid tier until the exact product mapping is confirmed. Free TV remains free where designated.</section>
    </main>

    {selected && <div style={{position:'fixed',inset:0,zIndex:3,display:'grid',placeItems:'end center',background:'#0009'}} onClick={()=>setSelected(null)}><section onClick={e=>e.stopPropagation()} style={{width:'min(760px,100%)',padding:22,borderRadius:'22px 22px 0 0',background:'#0b1222',border:'1px solid #344866'}}><div style={{fontSize:12,color:'#7eeaff'}}>{selected.network} · {selected.lane} · {selected.access} · {selected.rating}</div><h2>{selected.title}</h2><p style={{opacity:.72,lineHeight:1.6}}>{selected.description}</p><div style={{display:'flex',gap:10,flexWrap:'wrap'}}><button onClick={()=>dispatch('play',{programId:selected.id,captions,audioDescription,translation})} style={primary}>▶ PLAY / PREVIEW</button><button onClick={()=>dispatch('add-watchlist',{programId:selected.id})} style={secondary}>＋ WATCHLIST</button><button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'tv',programId:selected.id}}))} style={secondary}>MAKE HOLO CLIP</button><button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:event-genesis-open',{detail:{source:'tv',programId:selected.id,network:selected.network}}))} style={secondary}>EVENT GENESIS</button><button onClick={()=>setSelected(null)} style={secondary}>CLOSE</button></div></section></div>}
  </div>
}
const primary: React.CSSProperties = {minHeight:46,padding:'0 16px',borderRadius:12,border:'1px solid #4fe3ff',background:'#0c3a49',color:'#fff',fontWeight:900,cursor:'pointer'}
const secondary: React.CSSProperties = {minHeight:46,padding:'0 16px',borderRadius:12,border:'1px solid #46536d',background:'#111827',color:'#fff',fontWeight:800,cursor:'pointer'}
const chip: React.CSSProperties = {whiteSpace:'nowrap',padding:'9px 13px',borderRadius:999,border:'1px solid',background:'#0b1020',fontWeight:800,cursor:'pointer'}
const control: React.CSSProperties = {display:'flex',gap:10,alignItems:'center',padding:12,border:'1px solid #2d3a55',borderRadius:12,background:'#0b1120'}
