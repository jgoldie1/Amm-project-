import {useEffect,useMemo,useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'
import {buildHoloGPTPrintContext,buildPrintOperationalSelfModel,PRINT_AGI_BOUNDARY,PRINT_AI_ROLES,recommendSwarmShape} from '../runtime/PrintSwarmIntelligence'

async function authJson(url:string){
  const token=await getAccessToken()
  if(!token)throw new Error('Sign in to load Print Network intelligence.')
  const r=await fetch(url,{headers:{authorization:`Bearer ${token}`},cache:'no-store'})
  const d=await r.json().catch(()=>({}))
  if(!r.ok)throw new Error(d.message||d.error||`API ${r.status}`)
  return d
}

const card:React.CSSProperties={padding:10,border:'1px solid #2d5360',borderRadius:12,background:'#07131a'}
const btn:React.CSSProperties={minHeight:44,borderRadius:11,border:'1px solid #5be7ff77',background:'#0b2630',color:'#dffaff',fontWeight:900,fontSize:10,padding:'8px 10px',touchAction:'manipulation'}

export default function PrintAICommandPanel(){
  const [network,setNetwork]=useState<any>(null)
  const [swarm,setSwarm]=useState<any>(null)
  const [message,setMessage]=useState('')
  const [quantity,setQuantity]=useState(100)
  const [busy,setBusy]=useState(false)

  const refresh=async()=>{
    setBusy(true)
    try{
      const [n,s]=await Promise.all([authJson('/api/print-network'),authJson('/api/print-network/swarm')])
      setNetwork(n);setSwarm(s);setMessage('')
    }catch(error){setMessage(error instanceof Error?error.message:String(error))}
    finally{setBusy(false)}
  }
  useEffect(()=>{void refresh()},[])

  const selfModel=useMemo(()=>buildPrintOperationalSelfModel({
    activeJobs:network?.active,
    availableJobs:network?.available,
    swarmOffers:swarm?.offers,
    swarmBatches:swarm?.batches,
    operator:network?.operator,
    earnings:network?.earnings,
  }),[network,swarm])

  const certifiedAvailable=Number(network?.available?.length||0)+Number(swarm?.offers?.length||0)
  const plan=useMemo(()=>recommendSwarmShape({quantity,certifiedAvailableOperators:Math.max(2,certifiedAvailable||2),targetPerOperator:10,priority:'resilience'}),[quantity,certifiedAvailable])

  const askHoloGPT=()=>{
    const context=buildHoloGPTPrintContext(selfModel)
    window.dispatchEvent(new CustomEvent('tryamm:hologpt-study-context',{detail:{prompt:`${context}\n\nHelp me manage this print network. Tell me the actual bottleneck, what Stubbs AI should plan, what Lyons Tech should verify, and what evidence Guardian still needs.`}}))
  }

  return <section aria-label="Print AI Command" style={{marginTop:12,padding:12,border:'1px solid #326779',borderRadius:16,background:'#061219dd'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}>
      <div><b style={{fontSize:12,color:'#8eeeff'}}>STUBBS AI + LYONS TECH + HOLOGPT • PRINT COMMAND</b><div style={{fontSize:10,color:'#9fb7c0',lineHeight:1.45,marginTop:4}}>Multi-agent production intelligence with an operational self-model. This is self-monitoring, not a claim of literal AGI consciousness or self-awareness.</div></div>
      <span style={{fontSize:9,padding:'4px 8px',border:'1px solid #4f8190',borderRadius:999,color:selfModel.health==='GREEN'?'#a7ffd0':'#ffd79b'}}>SELF-MODEL {selfModel.health}</span>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:7,marginTop:10}}>
      {Object.values(PRINT_AI_ROLES).map(role=><div key={role.name} style={card}><b style={{fontSize:10,color:'#c8f7ff'}}>{role.name}</b><div style={{fontSize:9,lineHeight:1.45,color:'#9eb2ba',marginTop:4}}>{role.job}</div></div>)}
    </div>

    <div style={{...card,marginTop:9}}>
      <div style={{fontSize:9,color:'#75dfee',fontWeight:900}}>OPERATIONAL SELF-MODEL</div>
      <div style={{fontSize:9,lineHeight:1.55,color:'#aec0c7',marginTop:4}}>Active jobs {selfModel.counters.activeJobs} • available {selfModel.counters.availableJobs} • swarms {selfModel.counters.swarmBatches} • offers {selfModel.counters.swarmOffers} • QA pending {selfModel.counters.qaPending}</div>
      {selfModel.uncertainties.length>0&&<div style={{fontSize:9,color:'#ffd7a3',lineHeight:1.45,marginTop:4}}>Uncertainty: {selfModel.uncertainties.join(' • ')}</div>}
    </div>

    <div style={{...card,marginTop:9}}>
      <div style={{display:'flex',gap:8,alignItems:'end',flexWrap:'wrap'}}>
        <label style={{fontSize:9,color:'#a8bbc4'}}>ORDER QUANTITY
          <input type="number" min={1} max={100000} value={quantity} onChange={e=>setQuantity(Math.max(1,Math.min(100000,Number(e.target.value)||1)))} style={{display:'block',marginTop:4,minHeight:42,width:130,borderRadius:9,border:'1px solid #315464',background:'#061018',color:'#fff',padding:'0 8px'}}/>
        </label>
        <div style={{fontSize:9,color:'#afc3ca',lineHeight:1.45,flex:1}}>Suggested swarm: {plan.useSwarm?`${plan.operatorsNeeded} operators × about ${plan.shardQuantity} units`:'single operator'} • {plan.reason}</div>
      </div>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:9}}>
      <button onClick={()=>void refresh()} disabled={busy} style={btn}>{busy?'REFRESHING…':'REFRESH PRINT SELF-MODEL'}</button>
      <button onClick={askHoloGPT} style={btn}>ASK HOLOGPT ABOUT PRODUCTION</button>
    </div>
    <div style={{fontSize:8,color:'#6f8992',lineHeight:1.45,marginTop:7}}>{PRINT_AGI_BOUNDARY.rule} {PRINT_AGI_BOUNDARY.physicalBoundary}</div>
    {message&&<div aria-live="polite" style={{fontSize:9,color:'#ffbfad',marginTop:7}}>{message}</div>}
  </section>
}
