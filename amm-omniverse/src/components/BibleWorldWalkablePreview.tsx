import {useEffect,useState} from 'react'
import type {BibleWorldScenePackage} from '../runtime/BibleWorldSceneBinderRuntime'

export default function BibleWorldWalkablePreview(){
 const [pkg,setPkg]=useState<BibleWorldScenePackage|null>(null)
 const [selected,setSelected]=useState<string|null>(null)
 useEffect(()=>{
  const on=(event:Event)=>{const d=(event as CustomEvent<BibleWorldScenePackage>).detail;if(d?.schema==='tryamm.metaverse-bible.scene-package.v1')setPkg(d)}
  window.addEventListener('tryamm:bible-world-scene-package-ready',on as EventListener)
  window.dispatchEvent(new CustomEvent('tryamm:bible-world-scene-package-request'))
  try{const v=JSON.parse(localStorage.getItem('tryamm.metaverse-bible.scene-package.v1')||'null');if(v?.schema==='tryamm.metaverse-bible.scene-package.v1')setPkg(v)}catch{}
  return()=>window.removeEventListener('tryamm:bible-world-scene-package-ready',on as EventListener)
 },[])
 if(!pkg)return <section style={panel}><div style={eyebrow}>HOLO LAB • WALKABLE BIBLE WORLD</div><p style={copy}>No bound Bible-world scene package yet. Build a world from the Metaverse Bible Construction Console first.</p></section>
 const p=pkg.placements.find(x=>x.id===selected)||pkg.placements[0]
 return <section style={panel}>
  <div style={eyebrow}>HOLO LAB • WALKABLE BIBLE WORLD PACKAGE</div><h3 style={{margin:'6px 0'}}>{pkg.title}</h3><div style={{fontSize:9,color:'#d8c678'}}>{pkg.era} • {pkg.truthLabel}</div>
  <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:7}}><span style={pill}>ASSETS {pkg.placements.length}</span><span style={pill}>REAL ARTIFACTS {pkg.providerArtifacts}</span><span style={pill}>PLACEHOLDERS {pkg.missingArtifacts.length}</span><span style={pill}>PREVIEW ONLY</span></div>
  <div style={{position:'relative',height:260,marginTop:10,borderRadius:14,border:'1px solid #315165',background:'radial-gradient(circle,#102637,#061019 68%)',overflow:'hidden'}}>
   <div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',width:38,height:38,borderRadius:'50%',border:'2px solid #e8c85f',display:'grid',placeItems:'center',fontSize:16}}>✡</div>
   {pkg.placements.map(x=>{const left=50+x.x/42*45,top=50+x.z/42*45;return <button key={x.id} onClick={()=>setSelected(x.id)} title={x.label} style={{position:'absolute',left:`${Math.max(4,Math.min(92,left))}%`,top:`${Math.max(4,Math.min(90,top))}%`,transform:'translate(-50%,-50%)',width:28,height:28,borderRadius:'50%',border:`1px solid ${x.placeholder?'#e8b944':'#62e3ff'}`,background:x.placeholder?'#33260d':'#07304a',color:'#fff',fontSize:10}}>{x.kind==='building'?'▦':x.kind==='character'?'●':x.kind==='vehicle'?'◆':'✦'}</button>})}
  </div>
  {p&&<div style={{...card,marginTop:9}}><div style={eyebrow}>{p.kind.toUpperCase()} • {p.placeholder?'HOLOGRAM PLACEHOLDER':'PROVIDER ARTIFACT'}</div><b>{p.label}</b><div style={copy}>{p.artifactUrl?'Artifact receipt is attached to this placement.':'No production artifact URL yet. This placement remains a labeled Holo Lab placeholder.'}</div><div style={{display:'flex',gap:5,flexWrap:'wrap',marginTop:6}}><span style={pill}>COLLISION TARGET {p.collisionTarget?'YES':'NO'}</span><span style={pill}>NAV TARGET {p.navigationTarget?'YES':'NO'}</span></div></div>}
  <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:9}}><a href='/kingdom' style={link}>HEBREW SCHOOL</a><a href='/metaverse-bible' style={link}>METAVERSE BIBLE</a><a href='/time-machine-foundry' style={link}>WORLD FOUNDRY</a></div>
 </section>
}
const panel:React.CSSProperties={padding:14,border:'1px solid #4fe3ff55',borderRadius:16,background:'#06111bdd',color:'#fff'}
const card:React.CSSProperties={padding:10,border:'1px solid #2e485b',borderRadius:11,background:'#071622'}
const eyebrow:React.CSSProperties={fontSize:8,letterSpacing:1.5,color:'#6fe6ff',fontWeight:950}
const copy:React.CSSProperties={fontSize:9,color:'#aebec8',lineHeight:1.5,marginTop:4}
const pill:React.CSSProperties={padding:'5px 7px',borderRadius:999,border:'1px solid #35566a',fontSize:8,color:'#cde8f3'}
const link:React.CSSProperties={display:'inline-flex',alignItems:'center',minHeight:36,padding:'0 9px',border:'1px solid #4e6877',borderRadius:999,color:'#fff',fontSize:8,fontWeight:900,textDecoration:'none'}