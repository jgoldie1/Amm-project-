import {useEffect,useMemo,useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'

type CatalogItem={assetId:string;filename:string;generationType:string;height:number;ageLane:string;role:string}
type Job={id:string;asset_id:string;filename:string;stage:string;progress:number;provider_generation_task_id?:string;provider_rig_task_id?:string;public_url?:string;walking_public_url?:string;running_public_url?:string;error_message?:string;created_at?:string}
type FactoryHealth={ok:boolean;providerConfigured:boolean;supabaseAdminConfigured:boolean;durableJobStoreReady:boolean;backgroundWorkerSecretConfigured:boolean;readyAssets:number;activeJobs:number;recoveryRequiredJobs:number;blockers:string[]}

const btn:React.CSSProperties={minHeight:44,borderRadius:12,border:'1px solid #3a647a',background:'#091823',color:'#fff',fontWeight:900,fontSize:10,padding:'9px 11px',touchAction:'manipulation'}
const statusColor=(stage:string)=>stage==='ready'?'#8effb7':stage==='failed'?'#ff9a9a':'#8edcff'

async function authFetch(url:string,options:RequestInit={}){
  const token=await getAccessToken()
  if(!token)throw new Error('Sign in to use the founder asset factory.')
  const response=await fetch(url,{...options,headers:{'content-type':'application/json',authorization:`Bearer ${token}`,...(options.headers||{})},cache:'no-store'})
  const payload=await response.json().catch(()=>({}))
  if(!response.ok)throw new Error(payload?.message||payload?.error||`Request failed (${response.status})`)
  return payload
}

export default function MeshyFactoryControlPanel(){
  const [catalog,setCatalog]=useState<CatalogItem[]>([])
  const [jobs,setJobs]=useState<Job[]>([])
  const [referenceUrl,setReferenceUrl]=useState('')
  const [busy,setBusy]=useState('')
  const [error,setError]=useState('')
  const [auto,setAuto]=useState(true)
  const [health,setHealth]=useState<FactoryHealth|null>(null)

  const refresh=async()=>{
    try{
      const [data,healthData]=await Promise.all([authFetch('/api/meshy/factory'),authFetch('/api/meshy/factory-health')])
      setCatalog(Array.isArray(data.catalog)?data.catalog:[])
      setJobs(Array.isArray(data.jobs)?data.jobs:[])
      setHealth(healthData as FactoryHealth)
      setError('')
    }catch(e){setError(e instanceof Error?e.message:String(e))}
  }

  useEffect(()=>{void refresh()},[])
  useEffect(()=>{
    if(!auto)return
    const timer=setInterval(()=>{void (async()=>{
      const active=jobs.filter(j=>['generating','rigging','publishing'].includes(j.stage))
      for(const job of active){
        try{await authFetch('/api/meshy/factory',{method:'POST',body:JSON.stringify({action:'tick',jobId:job.id})})}catch{}
      }
      if(active.length)await refresh()
    })()},5000)
    return()=>clearInterval(timer)
  },[auto,jobs.map(j=>`${j.id}:${j.stage}:${j.progress}`).join('|')])

  const start=async(assetId:string)=>{
    setBusy(assetId);setError('')
    try{
      const imageUrl=assetId==='sv-bj-stubbs-v6'?referenceUrl.trim():undefined
      await authFetch('/api/meshy/factory',{method:'POST',body:JSON.stringify({action:'start',assetId,imageUrl,cityScope:'global'})})
      await refresh()
    }catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setBusy('')}
  }

  const waveIds=useMemo(()=>['sv-black-man-youngadult-01','sv-black-woman-youngadult-01','sv-black-man-adult-01','sv-black-woman-adult-01'],[])
  const startWave=async()=>{
    setBusy('wave');setError('')
    try{
      for(const assetId of waveIds)await authFetch('/api/meshy/factory',{method:'POST',body:JSON.stringify({action:'start',assetId,cityScope:'global'})})
      await refresh()
    }catch(e){setError(e instanceof Error?e.message:String(e))}
    finally{setBusy('')}
  }

  const runExecutiveSprint=()=>{
    window.dispatchEvent(new CustomEvent('tryamm:asset-executive-sprint'))
    setError('')
  }

  return <main aria-label="StreetVerse Meshy Asset Factory" style={{minHeight:'100dvh',background:'linear-gradient(#02070c,#07111b)',color:'#fff',fontFamily:'system-ui,sans-serif',padding:'max(16px,env(safe-area-inset-top)) 12px max(30px,env(safe-area-inset-bottom))'}}>
    <div style={{maxWidth:1050,margin:'0 auto'}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap',alignItems:'flex-start'}}>
        <div><div style={{fontSize:10,letterSpacing:3,fontWeight:950,color:'#65e8ff'}}>FOUNDER • AI CEO • DISTINGUISHED ENGINEERING</div><h1 style={{margin:'5px 0',fontSize:'clamp(24px,7vw,42px)'}}>StreetVerse Meshy Rig Factory</h1><p style={{maxWidth:760,color:'#a8bdca',fontSize:12,lineHeight:1.5}}>This is the missing execution surface: real Meshy task → real GLB → humanoid rig → walk/run outputs → validated durable TRYAMM storage → automatic StreetVerse runtime discovery. Provider tasks may consume Meshy credits.</p></div>
        <div style={{display:'flex',gap:6}}><a href="/streetverse" style={{...btn,textDecoration:'none',display:'grid',placeItems:'center'}}>PLAY STREETVERSE</a><button onClick={()=>void refresh()} style={btn}>REFRESH</button></div>
      </header>

      <section style={{marginTop:12,padding:12,border:'1px solid #294456',borderRadius:16,background:'#06121bdd'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center',flexWrap:'wrap'}}><div><b style={{fontSize:12}}>EXECUTIVE CHAIN</b><div style={{fontSize:10,color:'#9fb4c2',marginTop:4}}>AI CEO prioritizes the actual blocker → Distinguished Engineer owns end-to-end convergence → Asset Engineer operates provider tasks → Release Guardian requires evidence.</div></div><button onClick={runExecutiveSprint} style={btn}>RUN CEO + ENGINEERING SPRINT</button></div>
      </section>

      <section style={{marginTop:12,padding:12,border:`1px solid ${health?.ok?'#2f6c4a':'#704b35'}`,borderRadius:16,background:health?.ok?'#07170fdd':'#1a1008dd'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}><div><b style={{fontSize:12}}>FACTORY READINESS: {health?.ok?'READY':'CHECKING / BLOCKED'}</b><div style={{fontSize:9,color:'#a8bdca',marginTop:4}}>Meshy key: {health?.providerConfigured?'YES':'NO'} • durable jobs: {health?.durableJobStoreReady?'YES':'NO'} • background worker: {health?.backgroundWorkerSecretConfigured?'YES':'NO'} • ready assets: {health?.readyAssets??0} • active: {health?.activeJobs??0} • recovery: {health?.recoveryRequiredJobs??0}</div></div></div>
        {Boolean(health?.blockers?.length)&&<div style={{display:'grid',gap:4,marginTop:7}}>{health!.blockers.map(blocker=><div key={blocker} style={{fontSize:9,color:'#ffc69c'}}>• {blocker}</div>)}</div>}
      </section>

      <section style={{marginTop:12,padding:12,border:'1px solid #294456',borderRadius:16,background:'#06121bdd'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center',flexWrap:'wrap'}}><div><b style={{fontSize:12}}>CIRCLE PARK FIRST WAVE</b><div style={{fontSize:10,color:'#9fb4c2',marginTop:4}}>Four reusable rigged resident bases. These become part of the global character pack and can be reused across cities with city-specific wardrobe/style layers.</div></div><button disabled={Boolean(busy)} onClick={()=>void startWave()} style={btn}>{busy==='wave'?'STARTING…':'START 4 NPC RIGS'}</button></div>
      </section>

      <section style={{marginTop:12,padding:12,border:'1px solid #6a4e2a',borderRadius:16,background:'#171006dd'}}>
        <b style={{fontSize:12,color:'#ffd58a'}}>BJ V6 HERO</b>
        <div style={{fontSize:10,color:'#cdbda1',lineHeight:1.45,marginTop:5}}>BJ must use an approved reference-image URL. The factory will not fabricate the likeness from text.</div>
        <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}><input aria-label="Approved BJ reference image URL" value={referenceUrl} onChange={e=>setReferenceUrl(e.target.value)} placeholder="https://… approved reference image" style={{flex:'1 1 260px',minHeight:44,borderRadius:11,border:'1px solid #826a47',background:'#0e0b07',color:'#fff',padding:'0 10px'}}/><button disabled={Boolean(busy)||!referenceUrl.trim()} onClick={()=>void start('sv-bj-stubbs-v6')} style={btn}>{busy==='sv-bj-stubbs-v6'?'STARTING…':'START BJ V6'}</button></div>
      </section>

      {error&&<div role="alert" style={{marginTop:10,padding:10,borderRadius:12,border:'1px solid #8b3d3d',background:'#2a0d0d',color:'#ffb3b3',fontSize:11}}>{error}</div>}

      <section style={{marginTop:15}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}><div><b>LIVE FACTORY JOBS</b><div style={{fontSize:9,color:'#8ea6b7',marginTop:3}}>Queued → generating → rigging → publishing → ready</div></div><label style={{fontSize:10,color:'#b8c9d4'}}><input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)}/> AUTO ADVANCE</label></div>
        <div style={{display:'grid',gap:8,marginTop:8}}>
          {jobs.length===0?<div style={{padding:12,border:'1px solid #294456',borderRadius:14,color:'#91a7b7',fontSize:11}}>No real factory jobs yet. Starting a job is the point where Meshy actually begins doing provider work.</div>:jobs.map(job=><article key={job.id} style={{padding:11,border:'1px solid #294456',borderRadius:14,background:'#07131d'}}>
            <div style={{display:'flex',justifyContent:'space-between',gap:8}}><div><b style={{fontSize:11}}>{job.filename}</b><div style={{fontSize:9,color:'#879dac',marginTop:2}}>{job.asset_id}</div></div><div style={{fontSize:10,fontWeight:950,color:statusColor(job.stage)}}>{job.stage.toUpperCase()} • {job.progress||0}%</div></div>
            <div style={{height:6,borderRadius:999,background:'#172631',overflow:'hidden',marginTop:8}}><div style={{height:'100%',width:`${Math.max(0,Math.min(100,job.progress||0))}%`,background:'currentColor'}}/></div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:5,marginTop:8,fontSize:9,color:'#9fb4c2'}}>
              <div>GEN TASK: {job.provider_generation_task_id||'—'}</div><div>RIG TASK: {job.provider_rig_task_id||'—'}</div>
            </div>
            {job.public_url&&<a href={job.public_url} style={{display:'inline-block',marginTop:8,color:'#8effb7',fontSize:10,fontWeight:900}}>OPEN PUBLISHED GLB</a>}
            {job.error_message&&<div style={{marginTop:7,color:'#ff9d9d',fontSize:9}}>{job.error_message}</div>}
            {['generating','rigging','publishing'].includes(job.stage)&&<button onClick={async()=>{setBusy(job.id);try{await authFetch('/api/meshy/factory',{method:'POST',body:JSON.stringify({action:'tick',jobId:job.id})});await refresh()}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy('')}}} style={{...btn,marginTop:8}}>{busy===job.id?'CHECKING…':'ADVANCE NOW'}</button>}
          </article>)}
        </div>
      </section>

      <section style={{marginTop:16}}>
        <b style={{fontSize:12}}>FULL CHARACTER QUEUE</b>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:8,marginTop:8}}>
          {catalog.filter(item=>item.assetId!=='sv-bj-stubbs-v6').map(item=><article key={item.assetId} style={{padding:10,border:'1px solid #223b4c',borderRadius:13,background:'#061019'}}><b style={{fontSize:10}}>{item.filename}</b><div style={{fontSize:9,color:'#8da4b4',marginTop:4}}>{item.ageLane} • {item.role}</div><button disabled={Boolean(busy)} onClick={()=>void start(item.assetId)} style={{...btn,marginTop:7,width:'100%'}}>{busy===item.assetId?'STARTING…':'GENERATE + RIG'}</button></article>)}
        </div>
      </section>
    </div>
  </main>
}
