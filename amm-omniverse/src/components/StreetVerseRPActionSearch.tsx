import {lazy,Suspense,useEffect,useMemo,useState} from 'react'
const StreetVerseCC0MotionGallery=lazy(()=>import('./StreetVerseCC0MotionGallery'))
const SoulAscensionDanceLine=lazy(()=>import('./SoulAscensionDanceLine'))
import {searchStreetVerseRPActions,type RPActionPurpose,type RPActionEntry} from '../data/streetVerseRPActionCatalog'

const PURPOSES:Array<RPActionPurpose|'all'>=['all','greet','celebrate','perform','react','comfort','romance','argue','work','train','serve','pray','pose','record']

export default function StreetVerseRPActionSearch({compact=false}:{compact?:boolean}){
 const [query,setQuery]=useState('')
 const [purpose,setPurpose]=useState<RPActionPurpose|'all'>('all')
 const [open,setOpen]=useState(false)
 const [page,setPage]=useState(0)
 const [previewAction,setPreviewAction]=useState<RPActionEntry|null>(null)
 const [cc0GalleryOpen,setCc0GalleryOpen]=useState(false)
 const [soulAscensionOpen,setSoulAscensionOpen]=useState(false)
 const [playbackStatus,setPlaybackStatus]=useState('Select PLAY to animate BJ in 3D; missing clips will be reported.')
 const [favorites,setFavorites]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem('tryamm.rp-action-favorites.v1')||'[]')}catch{return[]}})
 useEffect(()=>{
  const onResult=(event:Event)=>{
   const d=(event as CustomEvent<{actionId?:string;played?:boolean;mode?:string;clipName?:string;reason?:string}>).detail||{}
   if(!d.actionId)return
   setPlaybackStatus(d.played
    ?`BJ PLAYED • ${d.actionId.replaceAll('-',' ').toUpperCase()} • ${d.mode==='clip'?'GLB '+(d.clipName||'CLIP'):'BONE-DRIVEN GESTURE'}`
    :`BJ ACTION UNAVAILABLE • ${d.actionId.replaceAll('-',' ').toUpperCase()} • ${d.reason||'no compatible animation'}`)
  }
  window.addEventListener('tryamm:streetverse-rp-action-result',onResult)
  return()=>window.removeEventListener('tryamm:streetverse-rp-action-result',onResult)
 },[])
 const allResults=useMemo(()=>searchStreetVerseRPActions(query,purpose),[query,purpose])
 const pageSize=compact?8:16
 const pages=Math.max(1,Math.ceil(allResults.length/pageSize))
 const visiblePage=Math.min(page,pages-1)
 const results=allResults.slice(visiblePage*pageSize,(visiblePage+1)*pageSize)
 const send=(name:string,action:RPActionEntry,extra:Record<string,unknown>={})=>{
  if(name==='tryamm:streetverse-rp-action-play')setPlaybackStatus(`REQUESTED • ${action.label} • checking BJ's active 3D rig…`)
  window.dispatchEvent(new CustomEvent(name,{detail:{actionId:action.id,label:action.label,animationClip:action.animationClip,gifQuery:action.gifQuery,loopable:action.loopable,syncable:action.syncable,purpose:action.purposes,source:'rp-action-search',...extra}}))
 }
 const toggleFavorite=(action:RPActionEntry)=>{
  const next=favorites.includes(action.id)?favorites.filter(x=>x!==action.id):[...favorites,action.id]
  setFavorites(next);try{localStorage.setItem('tryamm.rp-action-favorites.v1',JSON.stringify(next))}catch{}
 }
 return <section aria-label="StreetVerse RP action search" style={{marginTop:7}}>
  <button type="button" aria-label="Open 50 CC0 GLB gesture motion previews" onClick={()=>setCc0GalleryOpen(true)} style={{width:'100%',minHeight:44,borderRadius:11,border:'1px solid #7deaff77',background:'#12314b',color:'#e6f8ff',fontWeight:900,fontSize:11,marginBottom:7}}>🎞 50 CC0 GLB MOTIONS • PREVIEW MANNEQUIN</button>
  {cc0GalleryOpen&&<Suspense fallback={<div role="status">Opening source motion gallery…</div>}><StreetVerseCC0MotionGallery onClose={()=>setCc0GalleryOpen(false)}/></Suspense>}
  <button type="button" aria-label="Open Soul Ascension 1980s to present dance line" onClick={()=>setSoulAscensionOpen(true)} style={{width:'100%',minHeight:44,borderRadius:11,border:'1px solid #eab5ff77',background:'#3a164e',color:'#fff5ff',fontWeight:900,fontSize:11,marginBottom:7}}>🪩 SOUL ASCENSION • 1980s–PRESENT • DANCE LINE</button>
  {soulAscensionOpen&&<Suspense fallback={<div role="status">Opening Soul Ascension dance line…</div>}><SoulAscensionDanceLine onClose={()=>setSoulAscensionOpen(false)}/></Suspense>}
  <button onClick={()=>setOpen(v=>!v)} style={{width:'100%',minHeight:38,borderRadius:11,border:'1px solid #f9a8d477',background:'#1a1021',color:'#fff',fontWeight:950,fontSize:10}}>🎭 RP SEARCH • ANIMATION / GIF / PURPOSE</button>
  {open&&<div style={{marginTop:7,padding:8,borderRadius:14,background:'#070c16ee',border:'1px solid #f9a8d455'}}>
   <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:6}}>
    <input aria-label="Search RP actions" value={query} onChange={e=>{setQuery(e.target.value);setPage(0)}} placeholder="dance, wave, mechanic, prayer, victory…" style={input}/>
    <select aria-label="Filter RP actions by purpose" value={purpose} onChange={e=>{setPurpose(e.target.value as RPActionPurpose|'all');setPage(0)}} style={input}>{PURPOSES.map(p=><option key={p} value={p}>{p.toUpperCase()}</option>)}</select>
   </div>
   <div style={{marginTop:6,fontSize:8,color:'#9fb1c0'}}>Searches the animation name, tags and PURPOSE. GIF is discovery; only verified GLB or bone-driven motion counts as PLAYED.</div>
   <div role="status" aria-label="BJ RP playback result" style={{marginTop:6,fontSize:10,color:'#c4f7ff',padding:8,border:'1px solid #93c5fd55',borderRadius:9}}>{playbackStatus}</div>
   <div style={{display:'grid',gridTemplateColumns:compact?'repeat(2,minmax(0,1fr))':'repeat(auto-fit,minmax(185px,1fr))',gap:6,marginTop:8,maxHeight:compact?250:360,overflowY:'auto'}}>
    {results.map(action=><article key={action.id} style={{padding:8,borderRadius:11,border:'1px solid #334155',background:'#0c1420'}}>
      <div style={{fontSize:10,fontWeight:950}}>{action.label}</div>
      <div style={{fontSize:8,color:'#93a9b8',marginTop:3}}>{action.category.toUpperCase()} • {action.purposes.join(' • ')}</div>
      <div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:7}}>
       <button onClick={()=>{setPreviewAction(action);send('tryamm:streetverse-rp-action-preview',action,{previewKind:'gif-query'})}} style={mini}>GIF PREVIEW</button>
       <button onClick={()=>send('tryamm:streetverse-rp-action-play',action,{loop:false})} style={mini}>PLAY</button>
       {action.loopable&&<button onClick={()=>send('tryamm:streetverse-rp-action-play',action,{loop:true})} style={mini}>LOOP</button>}
       <button onClick={()=>toggleFavorite(action)} style={mini}>{favorites.includes(action.id)?'★':'☆'} FAVORITE</button>
       <button onClick={()=>send('tryamm:streetverse-rp-wheel-add',action)} style={mini}>+ WHEEL</button>
       {action.syncable&&<button onClick={()=>send('tryamm:streetverse-rp-sync-request',action)} style={mini}>TOGETHER</button>}
       {action.liveFriendly&&<button onClick={()=>send('tryamm:streetverse-live-mission-request',action,{rpAction:true})} style={mini}>LIVE</button>}
       {action.reelFriendly&&<button onClick={()=>send('tryamm:open-reel-creator',action,{rpAction:true})} style={mini}>REEL</button>}
      </div>
     </article>)}
   </div>
   {allResults.length>pageSize&&<nav aria-label="RP gesture search pages" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,marginTop:8}}>
     <button aria-label="Previous RP gesture page" disabled={visiblePage===0} onClick={()=>setPage(p=>Math.max(0,p-1))} style={mini}>‹ PREVIOUS</button>
     <span style={{fontSize:10,fontWeight:800,color:'#b4d7e9'}}>{allResults.length} RP ACTIONS • PAGE {visiblePage+1}/{pages}</span>
     <button aria-label="Next RP gesture page" disabled={visiblePage>=pages-1} onClick={()=>setPage(p=>Math.min(pages-1,p+1))} style={mini}>NEXT ›</button>
    </nav>}
   {previewAction&&<div role="status" aria-label="RP GIF preview source" style={{padding:9,marginTop:9,borderRadius:12,border:'1px solid #9d6bff77',background:'#160d23'}}>
     <b style={{fontSize:11}}>🖼 GIF DISCOVERY • {previewAction.label}</b>
     <div style={{fontSize:10,marginTop:5,color:'#c5b8dc'}}>The animation request is sent to StreetVerse. External GIF media remains provider-gated and is not yet an installed gameplay animation.</div>
     <a href={'https://giphy.com/search/'+encodeURIComponent(previewAction.gifQuery.trim().replace(/\s+/g,'-'))} target="_blank" rel="noopener noreferrer" style={{display:'inline-block',marginTop:8,minHeight:44,padding:'12px',borderRadius:10,border:'1px solid #ccadff',background:'#301a4c',color:'#fff',fontSize:11,fontWeight:900,textDecoration:'none'}}>VIEW GIF SEARCH ↗</a>
     <button onClick={()=>setPreviewAction(null)} aria-label="Close RP GIF search preview" style={{...mini,marginLeft:8,minHeight:44}}>CLOSE</button>
   </div>}
   {!allResults.length&&<div style={{padding:14,textAlign:'center',fontSize:10,color:'#b8c3cf'}}>No RP action matches yet. The search term can be used as a future animation/GIF provider query without pretending an asset already exists.</div>}
  </div>}
 </section>
}
const input:React.CSSProperties={minHeight:38,borderRadius:9,border:'1px solid #35465a',background:'#050b13',color:'#fff',padding:'0 9px',fontSize:10}
const mini:React.CSSProperties={minHeight:28,borderRadius:7,border:'1px solid #f9a8d455',background:'#17101d',color:'#fff',fontSize:7,fontWeight:900,padding:'0 7px'}
