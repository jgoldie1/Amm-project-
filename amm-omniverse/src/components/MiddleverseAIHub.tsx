import {useEffect,useMemo,useState} from 'react'
import {getTryammReadiness} from '../services/middlewear'
import {detectTryammEdgeCapabilities} from '../runtime/TryammPocketEdgeRuntime'
import {pocketEdgeEnabled,runPocketEdgeCycle,setPocketEdgeEnabled} from '../runtime/TryammPocketEdgeWorker'
import {getPocketEdgeEarnings} from '../services/edgeNode'
import TryammPrivateRelayCenter from './TryammPrivateRelayCenter'
import {readEdgeGridPreferences,writeEdgeGridPreferences,type EdgeGridPreferences} from '../runtime/TryammEdgeGridPreferences'

const cyan='#4FE3FF'
const gold='#E8B944'

type Props={onClose:()=>void}
type Destination={
  icon:string
  title:string
  description:string
  action?:()=>void
  status:'READY'|'RECONNECTING'
}

function openGlobal(name:string){
  const fn=(window as any)[name]
  if(typeof fn==='function'){fn();return true}
  return false
}
function money(cents:unknown){
  return typeof cents==='number'?('$'+(cents/100).toFixed(2)):'—'
}

export default function MiddleverseAIHub({onClose}:Props){
  const [notice,setNotice]=useState('Middleverse AI is your context and routing layer across TRYAMM.')
  const [resilience,setResilience]=useState<'READY'|'DEGRADED'|'CHECKING'>('CHECKING')
  const [edgeEnabled,setEdgeEnabledState]=useState(()=>pocketEdgeEnabled())
  const [edgeCap,setEdgeCap]=useState<any>(null)
  const [edgeNotice,setEdgeNotice]=useState('Detecting local edge capability…')
  const [edgeEarnings,setEdgeEarnings]=useState<any>(null)
  const [relayOpen,setRelayOpen]=useState(false)
  const [gridPrefs,setGridPrefs]=useState<EdgeGridPreferences>(()=>readEdgeGridPreferences())

  useEffect(()=>{
    let active=true
    getTryammReadiness().then(x=>{if(active)setResilience(x.ok?'READY':'DEGRADED')}).catch(()=>{if(active)setResilience('DEGRADED')})
    detectTryammEdgeCapabilities().then(x=>{
      if(active){
        setEdgeCap(x)
        setEdgeNotice(`${x.nodeClass.toUpperCase()} • ${x.safeWork.length} SAFE WORK TYPES`)
      }
    }).catch(()=>{if(active)setEdgeNotice('LOCAL EDGE CAPABILITY UNAVAILABLE')})
    getPocketEdgeEarnings().then((x:any)=>{if(active)setEdgeEarnings(x?.summary||null)}).catch(()=>{})
    return()=>{active=false}
  },[])

  const destinations=useMemo<Destination[]>(()=>[
    {icon:'✦',title:'Benny Stubbs AI',description:'Open the AI guide for navigation, help and creation.',action:()=>openGlobal('__showBennie'),status:'READY'},
    {icon:'●',title:'LIVE / PK / Debate',description:'Move into live creation, collaboration, debate and commerce.',action:()=>openGlobal('__showTryAMMLive'),status:'READY'},
    {icon:'🌐',title:'Holoverse',description:'Enter the immersive spatial layer connecting TRYAMM experiences.',action:()=>openGlobal('__showHoloverse'),status:'READY'},
    {icon:'◈',title:'My World',description:'Open the personal immersive world workspace.',action:()=>openGlobal('__showImmersiveWorlds'),status:'READY'},
    {icon:'🎓',title:'All American Universities',description:'Route into learning, career and workforce pathways.',action:()=>{localStorage.setItem('tryamm_school_network_target','aau');openGlobal('__showSchoolNetwork')},status:'READY'},
    {icon:'📡',title:'Holo FON',description:'Open TRYAMM Connect and device/connectivity services.',action:()=>openGlobal('__showHoloFon'),status:'READY'},
    {icon:'🛡️',title:'Private Relay / VPN',description:'Open the security tunnel readiness center. VPN traffic never creates Edge earnings.',action:()=>setRelayOpen(true),status:'READY'},
    {icon:'🧪',title:'Holo Lab / Construct',description:'Open the creation and experiment gateway.',action:()=>openGlobal('__showHoloLab'),status:'READY'},
    {icon:'📦',title:'Global Supply Chain',description:'Supplier-to-order-to-delivery, logistics and freight orchestration gateway.',action:()=>openGlobal('__showLogisticsFreight'),status:'READY'},
    {icon:'🌍',title:'Africa Gateway',description:'Africa business, creator, education, commerce and supply-chain gateway.',status:'RECONNECTING'},
    {icon:'▦',title:'Universal Scan',description:'QR / Business Passport gateway for physical-to-digital routing.',status:'RECONNECTING'},
  ],[])

  function launch(item:Destination){
    if(!item.action){
      setNotice(`${item.title} is preserved in the Core Shell plan and is being reconnected to its existing implementation.`)
      return
    }
    item.action()
    setNotice(`Opening ${item.title}…`)
  }

  async function toggleEdge(){
    const next=!edgeEnabled
    setPocketEdgeEnabled(next)
    setEdgeEnabledState(next)
    if(!next){setEdgeNotice('Pocket Edge disabled by user');return}
    setEdgeNotice('Starting protected edge cycle…')
    try{
      const result:any=await runPocketEdgeCycle()
      setEdgeNotice(`EDGE ${String(result.state||'online').toUpperCase()} • ${Number(result.completed||0)} JOBS COMPLETED`)
      const earnings:any=await getPocketEdgeEarnings().catch(()=>null)
      if(earnings?.summary)setEdgeEarnings(earnings.summary)
    }catch(error:any){
      setEdgeNotice(error?.message||'Edge registration unavailable')
    }
  }

  return <div role="dialog" aria-modal="true" aria-label="Middleverse AI" style={{position:'fixed',inset:0,zIndex:10120,overflowY:'auto',background:'radial-gradient(circle at 50% 0%,#142b45 0,#060916 42%,#02030a 100%)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:980,margin:'0 auto',padding:'18px 16px 110px'}}>
      <header style={{position:'sticky',top:0,zIndex:2,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'12px 14px',border:'1px solid #28455d',borderRadius:18,background:'rgba(5,10,20,.92)',backdropFilter:'blur(18px)'}}>
        <div><div style={{fontSize:9,letterSpacing:3,color:gold,fontWeight:950}}>TRYAMM ORCHESTRATION LAYER</div><div style={{fontSize:24,fontWeight:1000,marginTop:2}}>MIDDLEVERSE AI</div></div>
        <button onClick={onClose} aria-label="Close Middleverse AI" style={{width:44,height:44,borderRadius:'50%',border:'1px solid #46637a',background:'#0c1420',color:'#fff',fontSize:20,cursor:'pointer'}}>×</button>
      </header>

      <section style={{marginTop:18,padding:'clamp(22px,5vw,42px)',border:'1px solid #24465e',borderRadius:28,background:'linear-gradient(145deg,rgba(10,28,47,.94),rgba(7,7,17,.94))',boxShadow:'0 28px 90px #0008'}}>
        <div style={{display:'flex',alignItems:'center',gap:13}}>
          <div style={{width:58,height:58,borderRadius:18,display:'grid',placeItems:'center',border:`1px solid ${cyan}88`,background:'#071d27',fontSize:28}}>∞</div>
          <div>
            <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
              <div style={{fontSize:11,color:cyan,fontWeight:950,letterSpacing:2}}>ONE INTENT → RIGHT TRYAMM SYSTEM</div>
              <span style={{fontSize:8,fontWeight:950,letterSpacing:1,padding:'4px 7px',borderRadius:999,border:'1px solid #4fe3ff55',color:resilience==='READY'?'#8fffc1':resilience==='DEGRADED'?'#ffe49b':'#b7c3d0'}}>RESILIENT ROUTING • {resilience}</span>
            </div>
            <h1 style={{margin:'4px 0 0',fontSize:'clamp(30px,7vw,54px)',lineHeight:.95}}>Your context follows you.</h1>
          </div>
        </div>
        <p style={{maxWidth:760,color:'#b9c7d5',fontSize:15,lineHeight:1.65,margin:'20px 0 0'}}>Middleverse AI connects Benny, worlds, LIVE, learning, work, business, commerce, accessibility and future gateways. MiddleWear isolates provider/world failures, applies risk and identity gates, and keeps healthy destinations available when one path degrades.</p>
        <div aria-live="polite" style={{marginTop:18,padding:'12px 14px',borderRadius:14,border:`1px solid ${gold}44`,background:'#171208',color:'#ead79f',fontSize:12,lineHeight:1.5}}>{notice}</div>
      </section>

      <section style={{marginTop:18,padding:16,border:'1px solid #24465e',borderRadius:20,background:'#07111d'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:14,alignItems:'center',flexWrap:'wrap'}}>
          <div>
            <div style={{fontSize:9,color:gold,fontWeight:950,letterSpacing:2}}>POCKET EDGE NODE</div>
            <div style={{fontSize:18,fontWeight:950,marginTop:4}}>Phone-size edge compute • {edgeEnabled?'ON':'OFF'}</div>
            <div style={{fontSize:11,color:'#9eafc0',marginTop:5}}>{edgeNotice}</div>
          </div>
          <button onClick={toggleEdge} style={{minHeight:44,padding:'10px 15px',borderRadius:12,border:'1px solid #4fe3ff66',background:edgeEnabled?'#0b3024':'#0c1420',color:edgeEnabled?'#8fffc1':'#fff',fontWeight:950,cursor:'pointer'}}>{edgeEnabled?'DISABLE EDGE NODE':'ENABLE EDGE NODE'}</button>
        </div>

        {edgeCap&&<div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12,fontSize:9,color:'#b9c7d5'}}>
          <span>CPU {edgeCap.hardwareConcurrency}</span><span>•</span>
          <span>WEBGPU {edgeCap.webGPU?'YES':'NO'}</span><span>•</span>
          <span>WEBCODECS {edgeCap.webCodecs?'YES':'NO'}</span><span>•</span>
          <span>PARALLEL {edgeCap.maxParallel}</span><span>•</span>
          <span>{edgeCap.safeWork.join(' · ')||'cache/sync only'}</span>
        </div>}

        <div style={{fontSize:9,color:'#71869f',marginTop:10}}>OPT-IN • BATTERY-AWARE • NO BACKGROUND MINING • PERSONAL EDGE AND PAID GRID ARE SEPARATE • HEAVY WORK FALLS BACK TO WORKSTATION / AI CAFE / BUSINESS / CLOUD</div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:8,marginTop:12}}>
          <button onClick={()=>{const next=writeEdgeGridPreferences({paidGridOptIn:!gridPrefs.paidGridOptIn});setGridPrefs(next)}} style={{minHeight:44,padding:'10px 12px',borderRadius:12,border:'1px solid #725f2e',background:gridPrefs.paidGridOptIn?'#2a2410':'#0b1420',color:gridPrefs.paidGridOptIn?'#ffe49b':'#fff',fontWeight:950,cursor:'pointer'}}>EARN WITH GRID • {gridPrefs.paidGridOptIn?'ON':'OFF'}</button>
          <button onClick={()=>{const next=writeEdgeGridPreferences({chargingOnlyForPaidWork:!gridPrefs.chargingOnlyForPaidWork});setGridPrefs(next)}} style={{minHeight:44,padding:'10px 12px',borderRadius:12,border:'1px solid #31495c',background:'#0b1420',color:'#fff',fontWeight:900,cursor:'pointer'}}>CHARGING ONLY • {gridPrefs.chargingOnlyForPaidWork?'ON':'OFF'}</button>
          <button onClick={()=>{const next=writeEdgeGridPreferences({wifiOnlyForPaidWork:!gridPrefs.wifiOnlyForPaidWork});setGridPrefs(next)}} style={{minHeight:44,padding:'10px 12px',borderRadius:12,border:'1px solid #31495c',background:'#0b1420',color:'#fff',fontWeight:900,cursor:'pointer'}}>WI-FI ONLY • {gridPrefs.wifiOnlyForPaidWork?'ON':'OFF'}</button>
        </div>
        <div style={{fontSize:9,color:'#8da0b4',marginTop:8}}>Paid Grid defaults OFF. Charging-only and Wi-Fi-only default ON. If the device cannot verify Wi-Fi state, paid work fails closed until the user changes that setting.</div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:8,marginTop:12}}>
          {([
            ['PENDING',edgeEarnings?.pendingCents],
            ['PAYABLE',edgeEarnings?.payableCents],
            ['PROCESSING',edgeEarnings?.processingCents],
            ['PAID',edgeEarnings?.paidCents],
          ] as const).map(([label,cents])=><div key={label} style={{padding:'9px 10px',border:'1px solid #1e3549',borderRadius:12,background:'#09131e'}}>
            <div style={{fontSize:8,color:'#7f93a8',fontWeight:950}}>{label}</div>
            <div style={{fontSize:15,fontWeight:950,marginTop:3}}>{money(cents)}</div>
          </div>)}
        </div>
        <div style={{fontSize:9,color:'#8da0b4',marginTop:8}}>Only funded, independently verified customer work can become payable. Personal cache/sync jobs do not generate earnings.</div>
      </section>

      <section style={{marginTop:18,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:11}}>
        {destinations.map(item=><button key={item.title} onClick={()=>launch(item)} style={{minHeight:160,textAlign:'left',padding:18,border:'1px solid #1e3549',borderRadius:20,background:'linear-gradient(155deg,#0b1420,#070912)',color:'#fff',cursor:'pointer'}}>
          <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><span style={{fontSize:26}}>{item.icon}</span><span style={{fontSize:8,fontWeight:950,letterSpacing:1,color:item.status==='READY'?'#8fffc1':'#ffe49b'}}>{item.status}</span></div>
          <div style={{fontSize:18,fontWeight:950,marginTop:14}}>{item.title}</div>
          <div style={{fontSize:11,color:'#9eafc0',lineHeight:1.5,marginTop:7}}>{item.description}</div>
          <div style={{fontSize:9,color:cyan,fontWeight:950,marginTop:12}}>{item.status==='READY'?'OPEN →':'PRESERVED • RECONNECT →'}</div>
        </button>)}
      </section>
    </div>
    {relayOpen&&<TryammPrivateRelayCenter onClose={()=>setRelayOpen(false)}/>}
  </div>
}