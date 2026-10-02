import {useMemo,useState} from 'react'
import {
  analyzeMeshyPrintableScene,
  canPrepareMeshyPrint,
  exportMeshyPrintFile,
  loadMeshyPrintableGlb,
  makeMeshyPrintManifest,
  MESHY_3D_PRINT_PIPELINE,
  type MeshyPrintProfile,
  type MeshyPrintableAnalysis,
} from '../runtime/Meshy3DPrintPipeline'

type ReadyMeshyJob={
  id:string
  asset_id:string
  filename:string
  stage:string
  public_url?:string
}

const btn:React.CSSProperties={minHeight:44,borderRadius:12,border:'1px solid #5d7d8f',background:'#0a1a24',color:'#fff',fontWeight:900,fontSize:10,padding:'9px 11px',touchAction:'manipulation'}

function saveBlob(blob:Blob,filename:string){
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a')
  a.href=url;a.download=filename
  document.body.appendChild(a);a.click();a.remove()
  setTimeout(()=>URL.revokeObjectURL(url),1000)
}

export default function Meshy3DPrintLab({jobs}:{jobs:ReadyMeshyJob[]}){
  const ready=useMemo(()=>jobs.filter(job=>job.stage==='ready'&&job.public_url),[jobs])
  const [jobId,setJobId]=useState('')
  const [targetHeight,setTargetHeight]=useState(120)
  const [profile,setProfile]=useState<MeshyPrintProfile>('figurine')
  const [rights,setRights]=useState(false)
  const [analysis,setAnalysis]=useState<MeshyPrintableAnalysis|null>(null)
  const [busy,setBusy]=useState('')
  const [message,setMessage]=useState('')

  const selected=ready.find(job=>job.id===jobId)||ready[0]

  const analyze=async()=>{
    if(!selected?.public_url)return
    setBusy('analyze');setMessage('')
    try{
      const scene=await loadMeshyPrintableGlb(selected.public_url)
      const result=analyzeMeshyPrintableScene(scene)
      setAnalysis(result)
      setMessage(result.nonEmpty?`Mesh analyzed: ${result.meshCount} mesh(es), ${result.triangleCount.toLocaleString()} triangles.`:'This model is not ready for print export.')
    }catch(error){setMessage(error instanceof Error?error.message:String(error))}
    finally{setBusy('')}
  }

  const exportFile=async(format:'stl-binary'|'obj')=>{
    if(!selected?.public_url)return
    setBusy(format);setMessage('')
    try{
      const scene=await loadMeshyPrintableGlb(selected.public_url)
      const current=analysis||analyzeMeshyPrintableScene(scene)
      setAnalysis(current)
      const gate=canPrepareMeshyPrint({analysis:current,rightsAcknowledged:rights})
      if(!gate.allowed)throw new Error(`Print prep blocked: ${gate.reasons.join(', ')}`)
      const blob=await exportMeshyPrintFile(scene,format,targetHeight)
      const stem=(selected.filename||selected.asset_id||'meshy-model').replace(/\.glb$/i,'').replace(/[^a-zA-Z0-9._-]/g,'-')
      saveBlob(blob,`${stem}.${format==='obj'?'obj':'stl'}`)
      const manifest=makeMeshyPrintManifest({
        sourceAssetId:selected.asset_id,
        sourceUrl:selected.public_url,
        outputFormat:format,
        profile,
        targetHeightMm:targetHeight,
        analysis:current,
        rightsAcknowledged:rights,
      })
      saveBlob(new Blob([JSON.stringify(manifest,null,2)],{type:'application/json'}),`${stem}.print-manifest.json`)
      setMessage(`${format==='obj'?'OBJ':'STL'} prepared. Use a real slicer and the printer manufacturer's machine/material profile before physical printing.`)
    }catch(error){setMessage(error instanceof Error?error.message:String(error))}
    finally{setBusy('')}
  }

  return <section aria-label="Meshy 3D Print Prep" style={{marginTop:12,padding:12,border:'1px solid #426d63',borderRadius:16,background:'#071713dd'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'flex-start',flexWrap:'wrap'}}>
      <div><b style={{fontSize:12,color:'#9dffd4'}}>MESHY → 3D PRINT PREP</b><div style={{fontSize:10,color:'#a8c9bd',lineHeight:1.5,marginTop:4}}>Published Meshy GLB → geometry check → scale/orient → binary STL or OBJ + print manifest. This prepares files for a slicer; it does not generate G-code or send physical machine commands.</div></div>
      <span style={{fontSize:9,padding:'4px 8px',border:'1px solid #3d6a5a',borderRadius:999,color:'#9dffd4'}}>{ready.length} READY MESHY ASSET(S)</span>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:7,marginTop:10}}>
      <label style={{fontSize:9,color:'#b5cfc6'}}>SOURCE MODEL
        <select value={selected?.id||''} onChange={e=>{setJobId(e.target.value);setAnalysis(null);setMessage('')}} style={{width:'100%',minHeight:44,borderRadius:10,border:'1px solid #426d63',background:'#06110e',color:'#fff',padding:'0 8px',marginTop:4}}>
          {ready.length===0?<option value="">No published Meshy GLB yet</option>:ready.map(job=><option key={job.id} value={job.id}>{job.filename||job.asset_id}</option>)}
        </select>
      </label>
      <label style={{fontSize:9,color:'#b5cfc6'}}>TARGET HEIGHT (MM)
        <input type="number" min={5} max={2000} value={targetHeight} onChange={e=>setTargetHeight(Math.max(5,Math.min(2000,Number(e.target.value)||120)))} style={{width:'100%',minHeight:44,boxSizing:'border-box',borderRadius:10,border:'1px solid #426d63',background:'#06110e',color:'#fff',padding:'0 8px',marginTop:4}}/>
      </label>
      <label style={{fontSize:9,color:'#b5cfc6'}}>PRINT PROFILE
        <select value={profile} onChange={e=>setProfile(e.target.value as MeshyPrintProfile)} style={{width:'100%',minHeight:44,borderRadius:10,border:'1px solid #426d63',background:'#06110e',color:'#fff',padding:'0 8px',marginTop:4}}>
          <option value="figurine">Figurine / character</option>
          <option value="prototype">Prototype</option>
          <option value="prop">Prop</option>
          <option value="architecture">Architecture model</option>
          <option value="mechanical-reference">Mechanical reference</option>
        </select>
      </label>
    </div>

    <label style={{display:'flex',gap:8,alignItems:'flex-start',marginTop:9,fontSize:9,color:'#bfd4cc',lineHeight:1.4}}>
      <input type="checkbox" checked={rights} onChange={e=>setRights(e.target.checked)}/>
      <span>I confirm I have the rights/permission needed to create this physical copy. Commercial production still requires the applicable asset, likeness, trademark and license review.</span>
    </label>

    {analysis&&<div style={{marginTop:9,padding:9,border:'1px solid #294a40',borderRadius:12,background:'#05100c',fontSize:9,lineHeight:1.5,color:'#b4c8c0'}}>
      Meshes: {analysis.meshCount} • Skinned: {analysis.skinnedMeshCount} • Vertices: {analysis.vertexCount.toLocaleString()} • Triangles: {analysis.triangleCount.toLocaleString()}<br/>
      Source bounds: {analysis.width.toFixed(3)} × {analysis.height.toFixed(3)} × {analysis.depth.toFixed(3)} scene units
      {analysis.warnings.length>0&&<div style={{color:'#ffd29b',marginTop:3}}>Warnings: {analysis.warnings.join(' • ')}</div>}
    </div>}

    <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:6,marginTop:9}}>
      <button disabled={!selected?.public_url||Boolean(busy)} onClick={()=>void analyze()} style={btn}>{busy==='analyze'?'CHECKING…':'ANALYZE'}</button>
      <button disabled={!selected?.public_url||Boolean(busy)||!rights} onClick={()=>void exportFile('stl-binary')} style={btn}>{busy==='stl-binary'?'PREPARING…':'EXPORT STL'}</button>
      <button disabled={!selected?.public_url||Boolean(busy)||!rights} onClick={()=>void exportFile('obj')} style={btn}>{busy==='obj'?'PREPARING…':'EXPORT OBJ'}</button>
    </div>
    {message&&<div aria-live="polite" style={{fontSize:9,color:message.includes('blocked')?'#ffb1a9':'#9dffd4',marginTop:7}}>{message}</div>}
    <div style={{fontSize:8,color:'#769188',marginTop:7}}>{MESHY_3D_PRINT_PIPELINE.topologyNote}</div>
  </section>
}
