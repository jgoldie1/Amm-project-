import {useMemo,useState} from 'react'
import {searchStreetVerseRPActions,type RPActionPurpose,type RPActionEntry} from '../data/streetVerseRPActionCatalog'

const PURPOSES:Array<RPActionPurpose|'all'>=['all','greet','celebrate','perform','react','comfort','romance','argue','work','train','serve','pray','pose','record']

export default function StreetVerseRPActionSearch({compact=false}:{compact?:boolean}){
 const [query,setQuery]=useState('')
 const [purpose,setPurpose]=useState<RPActionPurpose|'all'>('all')
 const [open,setOpen]=useState(false)
 const [favorites,setFavorites]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem('tryamm.rp-action-favorites.v1')||'[]')}catch{return[]}})
 const results=useMemo(()=>searchStreetVerseRPActions(query,purpose).slice(0,compact?8:16),[query,purpose,compact])
 const send=(name:string,action:RPActionEntry,extra:Record<string,unknown>={})=>{
  window.dispatchEvent(new CustomEvent(name,{detail:{actionId:action.id,label:action.label,animationClip:action.animationClip,gifQuery:action.gifQuery,loopable:action.loopable,syncable:action.syncable,purpose:action.purposes,source:'rp-action-search',...extra}}))
 }
 const toggleFavorite=(action:RPActionEntry)=>{
  const next=favorites.includes(action.id)?favorites.filter(x=>x!==action.id):[...favorites,action.id]
  setFavorites(next);try{localStorage.setItem('tryamm.rp-action-favorites.v1',JSON.stringify(next))}catch{}
 }
 return <section aria-label="StreetVerse RP action search" style={{marginTop:7}}>
  <button onClick={()=>setOpen(v=>!v)} style={{width:'100%',minHeight:38,borderRadius:11,border:'1px solid #f9a8d477',background:'#1a1021',color:'#fff',fontWeight:950,fontSize:10}}>🎭 RP SEARCH • ANIMATION / GIF / PURPOSE</button>
  {open&&<div style={{marginTop:7,padding:8,borderRadius:14,background:'#070c16ee',border:'1px solid #f9a8d455'}}>
   <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:6}}>
    <input aria-label="Search RP actions" value={query} onChange={e=>setQuery(e.target.value)} placeholder="dance, wave, mechanic, prayer, victory…" style={input}/>
    <select aria-label="Filter RP actions by purpose" value={purpose} onChange={e=>setPurpose(e.target.value as RPActionPurpose|'all')} style={input}>{PURPOSES.map(p=><option key={p} value={p}>{p.toUpperCase()}</option>)}</select>
   </div>
   <div style={{marginTop:6,fontSize:8,color:'#9fb1c0'}}>Searches the animation name, tags and the PURPOSE of the RP action. GIF is a preview/discovery lane; the game animation remains the authoritative action.</div>
   <div style={{display:'grid',gridTemplateColumns:compact?'repeat(2,minmax(0,1fr))':'repeat(auto-fit,minmax(185px,1fr))',gap:6,marginTop:8,maxHeight:compact?250:360,overflowY:'auto'}}>
    {results.map(action=><article key={action.id} style={{padding:8,borderRadius:11,border:'1px solid #334155',background:'#0c1420'}}>
      <div style={{fontSize:10,fontWeight:950}}>{action.label}</div>
      <div style={{fontSize:8,color:'#93a9b8',marginTop:3}}>{action.category.toUpperCase()} • {action.purposes.join(' • ')}</div>
      <div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:7}}>
       <button onClick={()=>send('tryamm:streetverse-rp-action-preview',action,{previewKind:'gif-query'})} style={mini}>GIF PREVIEW</button>
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
   {!results.length&&<div style={{padding:14,textAlign:'center',fontSize:10,color:'#b8c3cf'}}>No RP action matches yet. The search term can be used as a future animation/GIF provider query without pretending an asset already exists.</div>}
  </div>}
 </section>
}
const input:React.CSSProperties={minHeight:38,borderRadius:9,border:'1px solid #35465a',background:'#050b13',color:'#fff',padding:'0 9px',fontSize:10}
const mini:React.CSSProperties={minHeight:28,borderRadius:7,border:'1px solid #f9a8d455',background:'#17101d',color:'#fff',fontSize:7,fontWeight:900,padding:'0 7px'}
