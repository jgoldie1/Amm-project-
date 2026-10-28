import {useMemo,useState} from 'react'
import {CROSSVERSE_CITIES} from '../data/CrossVerseFlyInCities'
import {STREETVERSE_STOREFRONTS} from '../data/StreetVerseStorefrontCatalog'
export default function CrossVerseFlyInDirectory(){
 const [search,setSearch]=useState('')
 const [cityId,setCityId]=useState('chicago')
 const cities=useMemo(()=>CROSSVERSE_CITIES.filter(c=>(c.name+' '+c.region+' '+c.country).toLowerCase().includes(search.toLowerCase())),[search])
 const city=CROSSVERSE_CITIES.find(c=>c.id===cityId)??CROSSVERSE_CITIES[0]
 const businesses=STREETVERSE_STOREFRONTS.filter(b=>city.businessIds.includes(b.id))
 return <section id="crossverse-fly-in" aria-label="CrossVerse fly-in destinations" data-no-realm-swipe="true" style={{marginTop:24,padding:18,borderRadius:18,border:'1px solid #68b6bd',background:'#091b2e',color:'#fff'}}>
 <div style={{fontSize:11,letterSpacing:2,color:'#94e3ed',fontWeight:900}}>CROSSVERSE · FLY-IN CITY DIRECTORY</div>
 <h2 style={{fontSize:27,margin:'8px 0'}}>Choose your world destination</h2>
 <p style={{fontSize:13,color:'#c4d4df'}}>Browse U.S. city hubs and planned global expansion. City selection changes this directory preview, not your active game scene or avatar location.</p>
 <label style={{fontSize:12}}>Search city or country<input style={{display:'block',width:'100%',boxSizing:'border-box',minHeight:48,borderRadius:11,background:'#112a3b',color:'#fff',border:'1px solid #74a6b9',padding:11,fontSize:16,marginTop:6}} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Chicago, Tampa, Mexico…"/></label>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,160px),1fr))',gap:8,marginTop:14}}>{cities.map(c=><button key={c.id} onClick={()=>setCityId(c.id)} aria-pressed={cityId===c.id} style={{minHeight:57,textAlign:'left',padding:10,borderRadius:11,background:cityId===c.id?'#16556a':'#102a41',border:'1px solid #66a5b5',color:'#fff',fontWeight:800}}>{c.name}<span style={{display:'block',fontSize:10,fontWeight:400,color:'#c0d5de'}}>{c.region} · {c.scope}</span></button>)}</div>
 <div style={{marginTop:14,padding:15,border:'1px solid #5a8296',borderRadius:13}}>
  <strong style={{fontSize:20}}>{city.name} · {city.country}</strong>
  <p style={{fontSize:13,color:'#cadce4'}}>Arrival concept: {city.arrival}</p>
  <div style={{fontSize:12,color:'#e8c581'}}>{city.scope==='pilot'?'Pilot catalog':'Future destination'} · No functional in-game flight or teleportation verified</div>
  <h3 style={{fontSize:15,margin:'14px 0 8px'}}>Business and creator destinations</h3>
  {businesses.length?<ul>{businesses.map(b=><li key={b.id} style={{margin:'7px 0'}}>{b.name} — preview only</li>)}</ul>:<p style={{fontSize:12,color:'#b8c9d8'}}>No approved storefronts assigned yet. This is a staged destination, not an empty physical location.</p>}
  <div style={{display:'flex',flexWrap:'wrap',gap:8}}><a href="#streetverse-business-showrooms" style={{minHeight:44,padding:'12px 14px',borderRadius:10,background:'#185474',color:'#fff',textDecoration:'none'}}>View business showroom</a><a href="/streetverse" style={{minHeight:44,padding:'12px 14px',borderRadius:10,background:'#185474',color:'#fff',textDecoration:'none'}}>Open StreetVerse preview</a></div>
 </div>
 <p style={{fontSize:11,color:'#acc3cf'}}>No airfare, real flights, world-streaming routes, bookings or marketplace payments are provided. Global cities must be added with approved content and verified scene routes.</p>
 </section>
}