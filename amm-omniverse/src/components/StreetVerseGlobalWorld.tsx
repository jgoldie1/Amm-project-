import {useEffect,useMemo,useState} from 'react'
import {STREETVERSE_GLOBAL_CITIES,getStreetVerseCity} from '../data/StreetVerseGlobalRegistry'
import {compileGlobalWorld,GLOBAL_WORLD_COMPILER} from '../data/GlobalWorldCompiler'
import {getGlobalCityRuntimeEvidence,getGlobalCitySystemsEvidence} from '../runtime/GlobalCityVerseRuntime'
import {loadPublishedMeshyManifest,type PublishedMeshyAsset} from '../runtime/StreetVerseMeshyAssetManifest'
import UniversalMissionDirector from './UniversalMissionDirector'
import {getGlobalCityCharacterCast,type GlobalCharacterProfile} from '../data/StreetVerseGlobalCharacterRegistry'

export default function StreetVerseGlobalWorld({onClose,onEnterChicago}:{onClose:()=>void;onEnterChicago?:()=>void}){
 const params=typeof window!=='undefined'?new URLSearchParams(window.location.search):new URLSearchParams()
 const city=useMemo(()=>getStreetVerseCity(params.get('city')||'chicago'),[])
 const plan=useMemo(()=>compileGlobalWorld(city.id),[city.id])
 const runtime=useMemo(()=>getGlobalCityRuntimeEvidence(city.id),[city.id])
 const systems=useMemo(()=>getGlobalCitySystemsEvidence(city.id),[city.id])
 const [rigPack,setRigPack]=useState<PublishedMeshyAsset[]>([])
 const cast=useMemo(()=>getGlobalCityCharacterCast(city.id),[city.id])
 const [selectedCharacter,setSelectedCharacter]=useState<GlobalCharacterProfile>(()=>getGlobalCityCharacterCast(city.id)[0])
 useEffect(()=>{let active=true;void loadPublishedMeshyManifest(city.id).then(items=>{if(active)setRigPack(items)});return()=>{active=false}},[city.id])
 useEffect(()=>{const next=getGlobalCityCharacterCast(city.id);setSelectedCharacter(next[0]);window.dispatchEvent(new CustomEvent('tryamm:global-city-select',{detail:{city:city.name,country:city.country,region:city.region,cityId:city.id}}))},[city.id,city.name,city.country,city.region])
 const chooseCharacter=(character:GlobalCharacterProfile)=>{
  setSelectedCharacter(character)
  try{
   const updatedAt=new Date().toISOString()
   localStorage.setItem('tryamm.streetverse.global.character.v1',JSON.stringify({characterId:character.id,cityId:character.cityId,visualSlot:character.visualSlot,updatedAt}))
   localStorage.setItem('tryamm.streetverse.playable-character.v1',JSON.stringify({character:{id:character.id,label:character.displayName.toUpperCase(),index:900,role:character.roleLabel,missionLane:character.missionLane,presentation:'pending',assetId:character.visualSlot,visualStatus:'fallback'},updatedAt}))
  }catch{}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-global-character-select',{detail:character}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-select',{detail:{id:character.id,label:character.displayName.toUpperCase(),role:character.roleLabel,missionLane:character.missionLane,assetId:character.visualSlot,source:'streetverse-global'}}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-asset-select',{detail:{characterId:character.id,label:character.displayName,assetId:character.visualSlot,visualStatus:'fallback',source:'streetverse-global'}}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-selected',{detail:{characterId:character.id,missionLane:character.missionLane,mission:{id:'streetverse-global-living-city',title:'StreetVerse Global: Living City Story',rewardXP:560}}}))
  window.dispatchEvent(new CustomEvent('tryamm:universal-mission-open',{detail:{missionId:'streetverse-global-living-city'}}))
 }
 const openCity=(id:string)=>{
  if(id==='chicago'&&onEnterChicago){onEnterChicago();return}
  const url=new URL(window.location.href)
  url.searchParams.set('city',id)
  url.searchParams.set('global','1')
  window.location.assign(url.toString())
 }
 return <><UniversalMissionDirector defaultWorld="streetverse-global"/><main role="dialog" aria-modal="true" aria-label="StreetVerse Global" style={{position:'fixed',inset:0,zIndex:15950,overflow:'auto',background:'radial-gradient(circle at top,#0b2340,#03050a 48%)',color:'#fff',padding:'14px 14px 32px',fontFamily:'Inter,system-ui,sans-serif'}}>
  <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}>
   <div><div style={{fontSize:10,fontWeight:900,letterSpacing:2,color:'#58e8ff'}}>STREETVERSE GLOBAL</div><h1 style={{margin:'3px 0',fontSize:26}}>One Passport. Many Cities.</h1></div>
   <button onClick={onClose} aria-label="Close StreetVerse Global" style={closeBtn}>×</button>
  </header>
  <section style={{marginTop:12,padding:14,border:'1px solid #284b68',borderRadius:16,background:'#07111ddd'}}>
   <div style={{fontSize:11,color:'#9bc8e8'}}>CURRENT CITY</div>
   <h2 style={{margin:'4px 0'}}>{city.name}, {city.country}</h2>
   <div style={{fontSize:12,opacity:.8}}>Status: {city.status}. Shared TRYAMM Passport, media, commerce, Radio/News, Holo Ads and ledger follow the user between eligible cities.</div>
   <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:9}}>
    <span style={runtimeChip}>Runtime: {runtime.profileSource.toUpperCase()}</span>
    <span style={runtimeChip}>Environment: {systems.environment.ready?'READY':'BUILDING'}</span>
    <span style={runtimeChip}>Mobility: {systems.mobility.ready?'READY':'BUILDING'}</span>
    <span style={runtimeChip}>Accessibility: {systems.accessibility.ready?'READY':'BUILDING'}</span>
    <span style={runtimeChip}>Rigged characters: {rigPack.length} READY</span>
   </div>
   <div style={{fontSize:10,opacity:.65,marginTop:7}}>Runtime evidence is shown separately from release certification; a city is not labeled production-ready from registry/runtime data alone.</div>
   <div style={{fontSize:10,color:'#a7e7ff',marginTop:6}}>Character assets use one global certified rig pack first, then optional city-specific additions. Chicago, Lagos, Abuja and later cities do not need separate copies of the same base humans.</div>
  </section>
  <section style={{marginTop:14,padding:12,border:'1px solid #4a3d74',borderRadius:14,background:'#100b20'}}>
   <b style={{color:'#c7a8ff'}}>GLOBAL WORLD COMPILER</b>
   <div style={{fontSize:11,lineHeight:1.5,marginTop:5}}>Mode: {GLOBAL_WORLD_COMPILER.mode} • {plan.modules.length} shared build stages • {plan.sharedSystems.length} shared platform systems. City-specific work stays in manifests instead of forking separate games.</div>
   <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:8}}>{plan.modules.map(m=><span key={m.stage} style={{fontSize:9,padding:'4px 7px',border:'1px solid #443864',borderRadius:999}}>{m.stage.toUpperCase()}</span>)}</div>
  </section>
  <h2 style={{fontSize:17,marginTop:18}}>CITY GRID</h2>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
   {STREETVERSE_GLOBAL_CITIES.map(c=><article key={c.id} style={{border:c.id===city.id?'1px solid #58e8ff':'1px solid #27384c',borderRadius:14,padding:12,background:'#08111b'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:8}}><b>{c.name}</b><span style={{fontSize:10,opacity:.7}}>{c.status.toUpperCase()}</span></div>
    <div style={{fontSize:11,opacity:.65,marginTop:3}}>{c.region} • {c.country}</div>
    <div style={{fontSize:11,lineHeight:1.45,marginTop:8}}>{c.features.join(' • ')}</div>
    <button onClick={()=>openCity(c.id)} style={actionBtn}>{c.id==='chicago'?'ENTER CHICAGO':c.status==='building'?'OPEN BUILD':'VIEW CITY PLAN'}</button>
   </article>)}
  </div>
  <section style={{marginTop:16,padding:12,border:'1px solid #4e4065',borderRadius:14,background:'#0f0b18'}}>
   <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center',flexWrap:'wrap'}}>
    <div><b style={{color:'#d7b8ff'}}>CITY CHARACTER CAST</b><div style={{fontSize:10,opacity:.65,marginTop:3}}>Fictional city guides and role characters use the shared global rig pack. Generic rigs are not likeness claims.</div></div>
    <span style={runtimeChip}>{cast.length} CITY ROLES</span>
   </div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:8,marginTop:10}}>
    {cast.map(character=><button key={character.id} onClick={()=>chooseCharacter(character)} style={{...actionBtn,textAlign:'left',marginTop:0,borderColor:selectedCharacter.id===character.id?'#d7b8ff':'#3f718d',background:selectedCharacter.id===character.id?'#24173b':'#10283a'}}>
      <b>{character.displayName}</b><br/>
      <span style={{fontSize:9,opacity:.78}}>{character.roleLabel}</span><br/>
      <span style={{fontSize:8,opacity:.58}}>{character.languages.join(' • ')}</span>
    </button>)}
   </div>
   <div style={{marginTop:10,padding:10,border:'1px solid #423553',borderRadius:12,background:'#090711'}}>
    <div style={{fontSize:9,color:'#c6a5ff',fontWeight:900}}>SELECTED CHARACTER</div>
    <div style={{fontSize:12,fontWeight:900,marginTop:3}}>{selectedCharacter.displayName} • {selectedCharacter.roleLabel}</div>
    <div style={{fontSize:10,opacity:.7,marginTop:4}}>Mission lane: {selectedCharacter.missionLane} • Rig slot: {selectedCharacter.visualSlot}</div>
    <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:8}}>
     <button onClick={()=>chooseCharacter(selectedCharacter)} style={{...actionBtn,width:'auto',marginTop:0}}>PLAY / USE CHARACTER</button>
     {selectedCharacter.afterDarkEligible&&<button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:universal-mission-open',{detail:{missionId:'streetverse-global-after-dark'}}))} style={{...actionBtn,width:'auto',marginTop:0,borderColor:'#8c62a2',background:'#21102d'}}>AFTER DARK MISSION</button>}
    </div>
   </div>
  </section>
  <section style={{marginTop:16,padding:12,border:'1px solid #32503d',borderRadius:14,background:'#07140e'}}>
   <b style={{color:'#79ffad'}}>GLOBAL ECONOMY BRIDGE</b>
   <div style={{fontSize:12,lineHeight:1.5,marginTop:5}}>StreetVerse city → local business/mission → Radio/News/Holo LIVE → QR/Business Passport → Marketplace/Holo Ads → verified payment → internal ledger → Replay/Reels/TRYAMM TV.</div>
  </section>
 </main></>
}
const closeBtn:React.CSSProperties={width:44,height:44,borderRadius:13,border:'1px solid #3a4d60',background:'#0c1420',color:'#fff',fontSize:24}
const actionBtn:React.CSSProperties={width:'100%',marginTop:10,border:'1px solid #3f718d',borderRadius:10,padding:'10px 8px',background:'#10283a',color:'#fff',fontSize:10,fontWeight:900}

const runtimeChip:React.CSSProperties={fontSize:9,padding:'4px 7px',border:'1px solid #31526b',borderRadius:999,background:'#091a28'}
