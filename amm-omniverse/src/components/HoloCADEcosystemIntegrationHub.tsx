import {useMemo,useState,type CSSProperties} from 'react'
import {
 TRYAMM_ECOSYSTEM_REPOS,TRYAMM_INTEGRATION_RELEASE_GATES,
 type TRYAMMConnectionState
} from '../game/holocad/tryammEcosystemRegistry'
import type {HoloCADResearchResult} from '../game/holocad/holocadResearchBridge'

const action:CSSProperties={
 minHeight:44,padding:'9px 12px',border:'1px solid #7995d277',
 background:'#172c40',color:'#e7f4ff',borderRadius:10,
 fontSize:11,fontWeight:850,touchAction:'manipulation'
}
const STATES:readonly (TRYAMMConnectionState|'all')[]=[
 'all','local','pending-api','pending-ui','manual','security-review','isolate','none'
]

export default function HoloCADEcosystemIntegrationHub({
 records,onClear,onClose
}:{records:readonly HoloCADResearchResult[];onClear:()=>void;onClose:()=>void}){
 const [filter,setFilter]=useState<TRYAMMConnectionState|'all'>('all')
 const [showRepositories,setShowRepositories]=useState(false)
 const shown=useMemo(()=>TRYAMM_ECOSYSTEM_REPOS.filter(
  r=>filter==='all'||r.connection===filter
 ),[filter])
 const exportAudit=()=>{
  const report={
   format:'tryamm-local-integration-handoff-v1',
   generatedAt:new Date().toISOString(),
   productionUntouched:true,
   authoritativePayments:false,
   externalApiConnected:false,
   labRecords:records,
   repositories:TRYAMM_ECOSYSTEM_REPOS,
   verificationScope:'Browser-only HoloCAD lab outputs; repository inventory from a point-in-time GitHub metadata audit.',
   note:'This JSON does not establish third-party authorization, live deployment, security clearance or production integration.'
  }
  const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'})
  const uri=URL.createObjectURL(blob)
  const anchor=document.createElement('a')
  anchor.href=uri;anchor.download='TRYAMM_Integration_Handoff_Development.json'
  document.body.appendChild(anchor);anchor.click();anchor.remove()
  window.setTimeout(()=>URL.revokeObjectURL(uri),1000)
 }
 return <section aria-label="TRYAMM ecosystem integration readiness and research timeline"
  style={{border:'1px solid #7ab9ed',borderRadius:14,background:'#091d30',
    marginTop:10,padding:12,color:'#edf9ff',fontFamily:'system-ui'}}>
  <header style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'start'}}>
   <div>
    <div style={{fontSize:10,fontWeight:900,letterSpacing:1.3,color:'#96d8ff'}}>TRYAMM • ECOSYSTEM CONNECTOR LAB</div>
    <div style={{fontSize:16,fontWeight:950,marginTop:5}}>🧩 DEVELOPMENT INTEGRATION HUB</div>
   </div>
   <button type="button" onClick={onClose} style={action}>CLOSE ×</button>
  </header>
  <p style={{fontSize:11,color:'#c9deeb',lineHeight:1.5}}>
   HoloCAD Quantum, Physics and GLB inspectors now communicate through a local,
   bounded research event contract. They do not talk to Stripe, Supabase, live robots,
   medical services, autonomous agents, remote quantum hardware or the game rewards ledger.
  </p>
  <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:10}}>
   <span style={{padding:8,border:'1px solid #5d9fa9',borderRadius:8,fontSize:11}}>
    {records.length} research result(s) this session
   </span>
   <span style={{padding:8,border:'1px solid #5d9fa9',borderRadius:8,fontSize:11}}>
    {TRYAMM_ECOSYSTEM_REPOS.length} audited repositories
   </span>
  </div>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <button type="button" style={action} onClick={exportAudit}>EXPORT DEVELOPMENT HANDOFF</button>
   <button type="button" style={action} onClick={onClear} disabled={!records.length}>CLEAR LOCAL RUNS</button>
   <button type="button" style={action} aria-pressed={showRepositories}
    onClick={()=>setShowRepositories(x=>!x)}>
    {showRepositories?'HIDE REPO INVENTORY':'SHOW REPO INVENTORY'}
   </button>
  </div>
  <div style={{marginTop:11,fontWeight:900,fontSize:12}}>VERIFIED LOCAL EXPERIMENT EVENTS</div>
  <div role="status" style={{fontSize:11,color:'#b8d1df',lineHeight:1.4,margin:'6px 0'}}>
   {records.length?'These records are simulation or metadata results only.':'No local research events yet. Run a quantum or physics lesson, or inspect a GLB file.'}
  </div>
  {records.slice(0,10).map((r,i)=><div key={r.recordedAtMs+'-'+r.kind+'-'+i}
   style={{fontSize:11,padding:'8px 0',borderTop:'1px solid #284e65'}}>
   <strong>{r.kind.replaceAll('-',' ').toUpperCase()} • {r.subject.replaceAll('-',' ')}</strong>
   <div style={{color:'#c6ddea',marginTop:4}}>{r.summary}</div>
   <div style={{fontSize:10,color:'#98bacb',marginTop:2}}>
    {new Date(r.recordedAtMs).toLocaleTimeString()} • {r.authority} • rewards not eligible
   </div>
  </div>)}
  {showRepositories&&<section aria-label="GitHub ecosystem repository inventory"
   style={{marginTop:14,paddingTop:10,borderTop:'1px solid #56849a'}}>
   <strong style={{fontSize:12}}>REPOSITORY CONNECTION AUDIT</strong>
   <p style={{fontSize:10,lineHeight:1.45,color:'#afcfe3'}}>Source-code presence is not proof of running servers or linked accounts. No repository is connected through this table.</p>
   <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:10}}>
    {STATES.map(state=><button key={state} type="button" style={{...action,
     background:filter===state?'#2c5e7c':'#172c40',fontSize:10}}
     aria-pressed={filter===state} onClick={()=>setFilter(state)}>{state.toUpperCase()}</button>)}
   </div>
   <div style={{maxHeight:290,overflowY:'auto'}}>
    {shown.map(r=><div key={r.name} style={{padding:'9px 0',borderTop:'1px solid #305069'}}>
     <div style={{display:'flex',justifyContent:'space-between',gap:8}}>
      <a href={r.url} target="_blank" rel="noopener noreferrer"
       style={{color:'#8bdeff',fontWeight:850,fontSize:12,overflowWrap:'anywhere'}}>{r.name}</a>
      <span style={{fontSize:10,color:'#cddce8',textAlign:'right'}}>{r.connection}</span>
     </div>
     <div style={{fontSize:10,lineHeight:1.45,color:'#b0cce0',marginTop:4}}>{r.notes}</div>
    </div>)}
   </div>
  </section>}
  <p style={{fontSize:10,color:'#abcbd9',lineHeight:1.5}}>
   Separate pull requests {TRYAMM_INTEGRATION_RELEASE_GATES.separateUnmergedPRs.join(', ')}
   must undergo compatibility review and release checks before merging. No real-money,
   hardware, customer-data or production-deployment integration is implied here.
  </p>
 </section>
}
