import {useEffect,useRef,useState,type CSSProperties} from 'react'
import {HOLOCAD_GLB_MAX_BYTES,inspectHoloCADGLB,type HoloCADGLBInspection} from '../game/holocad/holocadGLBInspector'
import {hashStreetVerseGLBLocally,lookupArchivedStreetVerseGLB,type StreetVerseArchivedGLB} from '../game/holocad/streetVerseOriginalGLBArchive'
import type {HoloCADSubject} from '../game/holocad/livingSystemsPresets'
import {createHoloCADResearchResult,publishHoloCADResearchResult} from '../game/holocad/holocadResearchBridge'

const button:CSSProperties={
 minHeight:44,padding:'9px 11px',borderRadius:10,
 background:'#243044',border:'1px solid #89a3ce88',
 font:'800 11px system-ui',color:'#eaf2ff',touchAction:'manipulation'
}
const stat=(name:string,value:string|number)=>({name,value})

export default function HoloCADGLBAssetInspector({onClose,subject}:{onClose:()=>void;subject:HoloCADSubject}){
 const [filename,setFilename]=useState('')
 const [report,setReport]=useState<HoloCADGLBInspection|null>(null)
 const [archivedOriginal,setArchivedOriginal]=useState<StreetVerseArchivedGLB|null>(null)
 const [archiveStatus,setArchiveStatus]=useState('Original asset identity not checked.')
 const [status,setStatus]=useState('Select a .glb file from this device; inspection stays local.')
 const requestId=useRef(0)
 useEffect(()=>()=>{requestId.current++},[])
 const onPick=async(file:File|undefined)=>{
  requestId.current++
  const request=requestId.current
  setReport(null)
  setArchivedOriginal(null)
  setArchiveStatus('Original asset identity not checked.')
  setFilename(file?.name||'')
  if(!file)return
  if(!/\.glb$/i.test(file.name)){
   setStatus('Select a binary .glb file. Extract ZIP archives first.')
   return
  }
  if(file.size>HOLOCAD_GLB_MAX_BYTES||file.size<20){
   setStatus('File must be at least 20 bytes and no larger than 24 MiB for local inspection.')
   return
  }
  try{
   setStatus('Inspecting GLB binary header and metadata locally…')
   const buffer=await file.arrayBuffer()
   const result=inspectHoloCADGLB(buffer)
   let sha256:string|null=null
   try{sha256=await hashStreetVerseGLBLocally(buffer)}
   catch{ /* Metadata inspection remains possible without secure WebCrypto. */ }
   if(request!==requestId.current)return
   const matching=sha256?lookupArchivedStreetVerseGLB(buffer.byteLength,sha256):null
   setArchivedOriginal(matching)
   setArchiveStatus(matching
    ?'SHA-256 MATCH: this local file is byte-identical to an archived StreetVerse NPC GLB.'
    :sha256
     ?'No SHA-256 match among 12 archived NPC GLBs. This may be another model; inspect provenance separately.'
     :'SHA-256 comparison unavailable in this browser. Run the inspector on a secure HTTPS or localhost origin.')
   setReport(result)
   publishHoloCADResearchResult(createHoloCADResearchResult({kind:'glb-metadata',subject,experiment:'glb-v2-inspection',summary:'Checked '+result.meshes+' mesh(es), '+result.skins+' skin(s), '+result.animations+' clip(s); no upload.'}))
   setStatus('Local metadata inspection complete. No asset uploaded or installed in StreetVerse.')
  }catch(e){
   if(request!==requestId.current)return
   setStatus('GLB inspection rejected: '+(e instanceof Error?e.message:'invalid file'))
  }
 }
 const rows=report?[
  stat('Container','Binary glTF 2.0'),
  stat('File size',(report.bytes/1024/1024).toFixed(2)+' MiB'),
  stat('Meshes',report.meshes),
  stat('Nodes',report.nodes),
  stat('Skins / rigs',report.skins),
  stat('Animation clips',report.animations),
  stat('Materials',report.materials),
  stat('Scenes',report.scenes),
  stat('External resource links',report.externalResources)
 ]:[]
 return <section aria-label="HoloCAD local GLB asset inspector" style={{
  padding:12,marginTop:11,borderRadius:13,
  border:'1px solid #6597db99',background:'#111a33',color:'#f0f5ff'
 }}>
  <header style={{display:'flex',justifyContent:'space-between',alignItems:'start',gap:8}}>
   <div>
    <div style={{fontSize:10,letterSpacing:1.4,fontWeight:900,color:'#94b4f0'}}>HOLOCAD • ASSET STAGING</div>
    <strong style={{fontSize:16,display:'block',marginTop:5}}>📦 ORIGINAL GLB INSPECTOR</strong>
   </div>
   <button style={button} type="button" onClick={onClose} aria-label="Close HoloCAD GLB Inspector">CLOSE ×</button>
  </header>
  <p style={{fontSize:11,lineHeight:1.5}}>
   Check an existing GLB model or animation for its mesh, skeleton and clip inventory before importing it.
   This does not render, retarget, publish, transfer, modify or license the source model.
  </p>
  <label htmlFor="holocad-glb-file" style={{display:'block',fontSize:11,fontWeight:900,marginBottom:5}}>CHOOSE A LOCAL .GLB FILE (MAX 24 MiB)</label>
  <input id="holocad-glb-file" aria-label="Select GLB asset to inspect offline"
   type="file" accept=".glb,model/gltf-binary"
   onChange={event=>{void onPick(event.currentTarget.files?.[0])}}
   style={{display:'block',minHeight:48,width:'100%',maxWidth:'100%',fontSize:12,color:'#f1f5ff'}} />
  {filename&&<div style={{fontSize:11,color:'#bacfee',marginTop:8,overflowWrap:'anywhere'}}>File: {filename}</div>}
  <div role="status" style={{padding:9,marginTop:8,borderRadius:9,background:'#182b44',fontSize:11}}>{status}</div>
  {report&&<div role="status" aria-label="StreetVerse original GLB archive identity"
    style={{marginTop:9,padding:10,border:'1px solid #698ca8',background:'#152b42',borderRadius:10,fontSize:11,lineHeight:1.5}}>
    <strong>ORIGINAL STREETVERSE ARCHIVE • SHA-256 INTEGRITY</strong>
    <div style={{marginTop:4}}>{archiveStatus}</div>
    {archivedOriginal&&<div style={{marginTop:5,color:'#b9eff0'}}>
      Archived identity: {archivedOriginal.name}. This proves file identity against the saved manifest,
      not animation retargeting, artist rights or production readiness.
    </div>}
   </div>}
  {report&&<div aria-label="GLB asset staging metadata" style={{marginTop:10}}>
   <div style={{fontSize:12,fontWeight:900}}>{report.safeForOfflineStaging?'LOCAL METADATA VALIDATED':'EXTERNAL LINKS REQUIRE REVIEW'}</div>
   {rows.map(row=><div key={row.name} style={{
    display:'flex',justifyContent:'space-between',gap:10,
    padding:'7px 0',borderBottom:'1px solid #304461',fontSize:11
   }}><span>{row.name}</span><strong>{row.value}</strong></div>)}
   <div style={{fontSize:11,fontWeight:850,marginTop:11}}>CLIP NAMES (FIRST 30)</div>
   <div style={{maxHeight:180,overflowY:'auto',fontSize:11,lineHeight:1.8}}>
    {report.clips.slice(0,30).map((clip,i)=><div key={i}>
     {i+1}. {clip.name} • {clip.channels} animation channel(s)
    </div>)}
    {!report.clips.length&&<div>No animation clips declared.</div>}
    {report.clips.length>30&&<div>+ {report.clips.length-30} more clips not shown</div>}
   </div>
   {report.notes.map((note,i)=><p key={i} style={{fontSize:10,color:'#bed2ec',lineHeight:1.45}}>{note}</p>)}
  </div>}
  <p style={{fontSize:10,lineHeight:1.5,color:'#a9c1dc'}}>
   Your file stays in this browser tab. SHA-256 is computed locally against an archived checksum manifest.
   No cloud upload, server calls, object URLs, automatic asset imports,
   WebXR rendering or filesystem changes. Unzip your approved animation archives first and choose
   the internal GLB file. Actual GLB animation, rigging and license review require separate validation.
  </p>
 </section>
}
