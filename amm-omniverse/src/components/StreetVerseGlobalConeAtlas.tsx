import {useMemo,useState} from 'react'
import {STREETVERSE_GLOBAL_CITIES,type StreetVerseCity} from '../data/StreetVerseGlobalRegistry'

/** Public approximate city centers for a low-cost globe preview; not exact geolocation, active surveillance or 3D city assets. */
const APPROX_CITY_CENTERS:Record<string,{lat:number;lon:number}>={
 chicago:{lat:41.88,lon:-87.63},lagos:{lat:6.45,lon:3.39},abuja:{lat:9.08,lon:7.49},
 'new-york':{lat:40.71,lon:-74.01},'los-angeles':{lat:34.05,lon:-118.24},
 accra:{lat:5.56,lon:-.20},nairobi:{lat:-1.29,lon:36.82},
 johannesburg:{lat:-26.20,lon:28.04},'cape-town':{lat:-33.92,lon:18.42},
 'addis-ababa':{lat:9.02,lon:38.75},toronto:{lat:43.65,lon:-79.38},
 kingston:{lat:17.97,lon:-76.79},'mexico-city':{lat:19.43,lon:-99.13},
 'sao-paulo':{lat:-23.55,lon:-46.63},london:{lat:51.51,lon:-.13},
 paris:{lat:48.86,lon:2.35},dubai:{lat:25.20,lon:55.27},
 mumbai:{lat:19.08,lon:72.88},tokyo:{lat:35.68,lon:139.69},
 seoul:{lat:37.57,lon:126.98},singapore:{lat:1.35,lon:103.82},
 sydney:{lat:-33.87,lon:151.21}
}
const radians=(degrees:number)=>degrees*Math.PI/180
export function projectStreetVerseCityOnGlobe(id:string,centerLon:number){
 const position=APPROX_CITY_CENTERS[id]
 if(!position)return null
 const phi=radians(position.lat),lambda=radians(position.lon-centerLon)
 const distance=Math.cos(phi)*Math.cos(lambda)
 return{x:180+112*Math.cos(phi)*Math.sin(lambda),y:132-112*Math.sin(phi),visible:distance>=0}
}
const tag=(city:StreetVerseCity)=>city.status==='live-alpha'?'3D CITY • ALPHA':city.status==='building'?'BUILDING • PREVIEW':'PLANNED • PREVIEW'
type Props={open:boolean;onClose:()=>void;onChicago:()=>void}
export default function StreetVerseGlobalConeAtlas({open,onClose,onChicago}:Props){
 const [selectedId,setSelectedId]=useState('chicago')
 const [centerLon,setCenterLon]=useState(6)
 const [filter,setFilter]=useState<'all'|'building'|'planned'|'live-alpha'>('all')
 const selected=STREETVERSE_GLOBAL_CITIES.find(city=>city.id===selectedId)||STREETVERSE_GLOBAL_CITIES[0]
 const showing=useMemo(()=>STREETVERSE_GLOBAL_CITIES.filter(city=>filter==='all'||city.status===filter),[filter])
 if(!open)return null
 const selectCity=(city:StreetVerseCity)=>{setSelectedId(city.id);setCenterLon(APPROX_CITY_CENTERS[city.id]?.lon||0)}
 return <div data-streetverse-global-cone="true" aria-label="StreetVerse Global Quantum Cone atlas" style={{position:'fixed',inset:0,zIndex:54000,background:'#05131e',color:'#fff',fontFamily:'system-ui',overflowY:'auto',overscrollBehavior:'contain',touchAction:'pan-y'}}>
  <div style={{maxWidth:680,margin:'0 auto',padding:'max(10px,env(safe-area-inset-top)) 12px max(24px,env(safe-area-inset-bottom))'}}>
   <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
    <div><strong style={{display:'block',fontSize:16}}>🌍 STREETVERSE GLOBAL</strong><small style={{fontSize:11,color:'#a6e8ff'}}>QUANTUM CONE • PLANET VIEW</small></div>
    <button data-global-return="true" onClick={onClose} aria-label="Return to BJ in Chicago" style={{minHeight:48,minWidth:96,borderRadius:13,border:'1px solid #8dfac0',background:'#13382c',color:'#fff',fontWeight:900}}>↙ BJ</button>
   </header>
   <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:9}}>
    <button onClick={()=>setCenterLon(v=>v-35)} aria-label="Rotate globe west" style={{minWidth:48,minHeight:48,border:'1px solid #6a9caf',borderRadius:13,color:'#fff',background:'#183844',fontSize:22}}>‹</button>
    <svg role="img" aria-label="Rotatable globe with approximate registered StreetVerse city markers" viewBox="0 0 360 266" style={{height:'min(35vh,240px)',width:'min(65vw,325px)',minHeight:152}}>
     <defs><radialGradient id="sv-globe-gradient" cx="31%" cy="27%" r="78%"><stop offset="0%" stopColor="#367c95"/><stop offset="58%" stopColor="#18445c"/><stop offset="100%" stopColor="#061825"/></radialGradient><clipPath id="sv-globe-circle"><circle cx="180" cy="132" r="112"/></clipPath></defs>
     <circle cx="180" cy="132" r="119" fill="#14506a" opacity=".3"/>
     <circle cx="180" cy="132" r="112" fill="url(#sv-globe-gradient)" stroke="#72c8ed" strokeWidth="1.8"/>
     <g clipPath="url(#sv-globe-circle)" fill="none" stroke="#9ed6e1" strokeWidth=".9" opacity=".25">
      {[-60,-30,0,30,60].map(lat=><ellipse key={'lat'+lat} cx="180" cy={132-112*Math.sin(radians(lat))} rx={112*Math.cos(radians(lat))} ry={16*Math.cos(radians(lat))}/>)}
      {[-70,-35,0,35,70].map(lon=><ellipse key={'lon'+lon} cx="180" cy="132" rx={Math.max(4,112*Math.cos(radians(lon)))} ry="112"/>)}
     </g>
     {STREETVERSE_GLOBAL_CITIES.map(city=>{const p=projectStreetVerseCityOnGlobe(city.id,centerLon);if(!p?.visible)return null;return <g key={city.id}><circle cx={p.x} cy={p.y} r={city.id===selected.id?6:3.6} fill={city.id==='chicago'?'#8fffc1':city.status==='building'?'#85d5ff':'#f5ce77'} stroke="#09202b" strokeWidth="1.5"/>{city.id===selected.id&&<circle cx={p.x} cy={p.y} r="10" fill="none" stroke="#fff" strokeWidth="1"/>}</g>})}
     <text x="180" y="259" textAnchor="middle" fontSize="10" fill="#b3e6ff">WORLD REGISTRY • CITY STATUS, NOT SATELLITE IMAGERY</text>
    </svg>
    <button onClick={()=>setCenterLon(v=>v+35)} aria-label="Rotate globe east" style={{minWidth:48,minHeight:48,border:'1px solid #6a9caf',borderRadius:13,color:'#fff',background:'#183844',fontSize:22}}>›</button>
   </div>
   <section aria-label="Selected StreetVerse global city" style={{border:'1px solid #517e91',background:'#102a37',borderRadius:14,padding:12}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',gap:8}}>
     <div><strong style={{fontSize:15}}>{selected.name}, {selected.country}</strong><small style={{display:'block',color:'#c3dce7'}}>{selected.region}</small></div>
     <span style={{fontSize:10,fontWeight:900,color:selected.status==='live-alpha'?'#a1ffd1':'#ffdf94'}}>{tag(selected)}</span>
    </div>
    <p style={{fontSize:11,margin:'8px 0',color:'#d0e8f0'}}>{selected.features.slice(0,5).join(' • ')}</p>
    {selected.id==='chicago'
     ? <button onClick={onChicago} data-global-enter-chicago="true" style={{width:'100%',minHeight:50,borderRadius:11,background:'#164b36',border:'1px solid #8cf5bb',color:'#fff',fontWeight:900}}>↘ FLY INTO CHICAGO 3D</button>
     : <div role="status" data-global-preview-only={selected.id} style={{background:'#332c1b',border:'1px solid #90794d',borderRadius:10,padding:10,fontSize:11}}>Preview only. {selected.name} does not have a certified playable 3D district yet. A city manifest and verified assets are required before BJ can land.</div>}
   </section>
   <div style={{display:'flex',gap:7,marginTop:12,alignItems:'center',justifyContent:'space-between'}}>
    <strong style={{fontSize:12}}>SELECT A CITY ({showing.length})</strong>
    <select aria-label="Filter global cities by build status" value={filter} onChange={e=>setFilter(e.target.value as typeof filter)} style={{minHeight:46,borderRadius:10,border:'1px solid #80c6dc',background:'#102938',color:'#fff',fontWeight:800}}>
     <option value="all">All cities</option><option value="live-alpha">Playable alpha</option><option value="building">Building</option><option value="planned">Planned</option>
    </select>
   </div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:7,marginTop:8}}>
    {showing.map(city=><button data-global-city={city.id} key={city.id} onClick={()=>selectCity(city)} aria-pressed={city.id===selected.id} style={{minHeight:52,border:'1px solid '+(city.id===selected.id?'#94ffd3':'#3c677c'),borderRadius:11,textAlign:'left',padding:'8px 9px',color:'#fff',background:city.id===selected.id?'#205447':'#142a39',touchAction:'manipulation'}}>
     <strong style={{fontSize:11,display:'block'}}>{city.name}</strong><small style={{fontSize:9,display:'block',opacity:.83}}>{city.country} • {city.status.replace('-',' ')}</small>
    </button>)}
   </div>
   <p style={{fontSize:10,color:'#a2bbca',marginTop:12}}>Locations are approximate public city centers, not GPS directions. Statuses come from the project registry. No satellite tiles, paid map requests, or automatic AI generation.</p>
  </div>
 </div>
}
