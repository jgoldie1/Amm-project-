import {useEffect,useMemo,useState} from 'react'
import WorldFoundryProductionFinishPanel from './WorldFoundryProductionFinishPanel'
import type {TimeMachineWorldFoundryPlan} from '../runtime/TimeMachineWorldFoundryRuntime'
import BibleWorldCertificationPanel from './BibleWorldCertificationPanel'
import BibleWorldPromotionPanel from './BibleWorldPromotionPanel'
import BibleWorldProductionEvidencePanel from './BibleWorldProductionEvidencePanel'

type Preset={id:string;label:string;era:string;objective:string;assets:Array<{label:string;kind:'environment'|'building'|'prop'|'character'|'vehicle';purpose:string;evidence:'source-backed'|'mixed'|'conceptual';qualityTier:'premium'|'hero'}>}

const PRESETS:Preset[]=[
 {id:'judea-study',label:'First-Century Judea Study World',era:'First-century Judea',objective:'Build a walkable, source-labeled study environment with architecture, daily-life props, educational NPC roles and a return portal.',assets:[
  {label:'Judea study environment',kind:'environment',purpose:'terrain, roads, ecology and spatial context',evidence:'source-backed',qualityTier:'premium'},
  {label:'period architecture set',kind:'building',purpose:'walkable educational structures with uncertainty labels',evidence:'mixed',qualityTier:'premium'},
  {label:'daily-life study props',kind:'prop',purpose:'study objects and mission anchors',evidence:'mixed',qualityTier:'premium'},
  {label:'educational historical cast',kind:'character',purpose:'source-labeled educational roles; no unsupported likeness claims',evidence:'conceptual',qualityTier:'premium'},
 ]},
 {id:'galilee-study',label:'Sea of Galilee Fishing World',era:'First-century Galilee',objective:'Build shoreline, fishing vessel, daily-life props, study anchors and an immersive fishing lesson.',assets:[
  {label:'Sea of Galilee shoreline',kind:'environment',purpose:'shoreline, terrain, water context and study route',evidence:'source-backed',qualityTier:'premium'},
  {label:'Galilee fishing vessel',kind:'vehicle',purpose:'educational reconstructed boat gameplay',evidence:'source-backed',qualityTier:'hero'},
  {label:'fishing tools and study props',kind:'prop',purpose:'interactive fishing and lesson objects',evidence:'mixed',qualityTier:'premium'},
  {label:'Galilee educational cast',kind:'character',purpose:'fishing-life and learning roles',evidence:'conceptual',qualityTier:'premium'},
 ]},
 {id:'hebrew-school',label:'Kingdom Hebrew School Living Lesson',era:'living kingdom',objective:'Build a complete Hebrew/Paleo-script lesson world connected to the playable Kingdom, HoloBook and Holo Lab.',assets:[
  {label:'Hebrew School learning environment',kind:'environment',purpose:'walkable learning space and portal context',evidence:'conceptual',qualityTier:'premium'},
  {label:'Hebrew School classroom/interior set',kind:'building',purpose:'learning rooms, study stations and accessible movement',evidence:'conceptual',qualityTier:'premium'},
  {label:'Aleph-Bet holographic study props',kind:'prop',purpose:'letters, roots, vocabulary and passage-study interactions',evidence:'source-backed',qualityTier:'premium'},
  {label:'Hebrew teacher and student roles',kind:'character',purpose:'educational NPC roles using source-labeled lesson material',evidence:'conceptual',qualityTier:'premium'},
 ]},
]

export default function MetaverseBibleConstructionConsole(){
 const [active,setActive]=useState<TimeMachineWorldFoundryPlan|null>(null)
 const [status,setStatus]=useState('Choose a Bible world. The system creates a preview plan first; production publishing stays review-gated.')
 useEffect(()=>{
  const on=(e:Event)=>{const d=(e as CustomEvent<{activePlan?:TimeMachineWorldFoundryPlan}>).detail;if(d?.activePlan)setActive(d.activePlan)}
  window.addEventListener('tryamm:time-machine-world-foundry-state',on as EventListener)
  window.dispatchEvent(new CustomEvent('tryamm:time-machine-world-foundry-request-state'))
  return()=>window.removeEventListener('tryamm:time-machine-world-foundry-state',on as EventListener)
 },[])
 const build=(p:Preset)=>{
  window.dispatchEvent(new CustomEvent('tryamm:time-machine-world-foundry-request',{detail:{
   id:'metaverse-bible-'+p.id,title:p.label,era:p.era,mode:'RECONSTRUCTION',evidenceLevel:'mixed',source:'metaverse-bible-construction-console',
   description:'Metaverse Bible source-grounded educational reconstruction with clearly labeled generated dialogue and uncertainty.',
   objective:p.objective,requestedAssets:p.assets,autoPreview:true,
  }}))
  setStatus('BUILD QUEUED: World Builder → Genie in the Bottle ×4 → Mind Over Matter → HoloForge/Holo Gen → Holo Lab preview → QA/review.')
 }
 const ready=useMemo(()=>active?.assets.filter(a=>a.state==='preview-ready').length||0,[active])
 return <section aria-label='Metaverse Bible Construction Console' style={panel}>
  <div style={eyebrow}>🧞 METAVERSE BIBLE • CONSTRUCTION CONSOLE</div>
  <h2 style={{margin:'7px 0'}}>Build the lesson world, not just the page</h2>
  <p style={copy}>This console uses the technology already built across TRYAMM. It does not claim literal time travel. Historical material stays source-labeled; gaps become labeled reconstruction; generated dialogue remains educational simulation.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:8,marginTop:10}}>{PRESETS.map(p=><article key={p.id} style={card}><div style={eyebrow}>RECONSTRUCTION</div><h3 style={{margin:'5px 0'}}>{p.label}</h3><div style={{fontSize:9,color:'#e4c96f'}}>{p.era}</div><p style={copy}>{p.objective}</p><button onClick={()=>build(p)} style={button}>BUILD HOLOGRAM WORLD</button></article>)}</div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:6,marginTop:10}}>{['SOURCE / ARCHIVE','WORLD BUILDER / CAD','GENIE ×4','MIND OVER MATTER','HOLOFORGE / HOLO GEN','HOLO LAB PREVIEW','COLLISION / NAV / LOD','HUMAN REVIEW'].map(x=><div key={x} style={step}>{x}</div>)}</div>
  {active&&<div style={{...card,marginTop:10,borderColor:'#6f5b2c'}}><div style={eyebrow}>ACTIVE PREVIEW</div><b>{active.title}</b><div style={{fontSize:9,color:'#aab9c5',marginTop:4}}>{active.truthLabel}</div><div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:7}}><span style={pill}>ASSETS {active.assets.length}</span><span style={pill}>PREVIEW READY {ready}</span><span style={pill}>PRODUCTION MUTATION NO</span><span style={pill}>HUMAN REVIEW REQUIRED</span></div></div>}
  <div style={{marginTop:10}}><WorldFoundryProductionFinishPanel compact/></div>
  <div style={{marginTop:10}}><BibleWorldCertificationPanel/></div>
  <div style={{marginTop:10}}><BibleWorldProductionEvidencePanel/></div>
  <div style={{marginTop:10}}><BibleWorldPromotionPanel/></div>
  <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:10}}><a href='/time-machine-foundry' style={link}>OPEN FULL WORLD FOUNDRY</a><a href='/holo-lab' style={link}>OPEN HOLO LAB</a><a href='/kingdom' style={link}>RETURN TO HEBREW SCHOOL</a></div>
  <div role='status' style={{fontSize:9,color:'#d9cfb3',marginTop:8}}>{status}</div>
 </section>
}
const panel:React.CSSProperties={marginTop:18,padding:16,border:'1px solid #4fe3ff66',borderRadius:18,background:'linear-gradient(145deg,#071621,#100d08)',color:'#fff'}
const card:React.CSSProperties={padding:11,border:'1px solid #354b58',borderRadius:13,background:'#071019'}
const eyebrow:React.CSSProperties={fontSize:8,letterSpacing:1.6,color:'#6fe6ff',fontWeight:950}
const copy:React.CSSProperties={fontSize:10,color:'#c5c9c4',lineHeight:1.55}
const step:React.CSSProperties={padding:8,borderRadius:9,border:'1px solid #2e4656',background:'#08131c',fontSize:8,fontWeight:900}
const button:React.CSSProperties={width:'100%',minHeight:40,borderRadius:9,border:'1px solid #e5c56a88',background:'#2b210d',color:'#fff',fontWeight:950}
const pill:React.CSSProperties={padding:'5px 8px',border:'1px solid #405968',borderRadius:999,fontSize:8,color:'#d8e8ee'}
const link:React.CSSProperties={display:'inline-flex',alignItems:'center',minHeight:38,padding:'0 10px',border:'1px solid #496779',borderRadius:999,background:'#081924',color:'#fff',fontSize:8,fontWeight:900,textDecoration:'none'}