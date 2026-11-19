import {useState} from 'react'

type Check={name:string;ok:boolean;detail:string}

export default function LiveOnePushTest(){
  const [running,setRunning]=useState(false)
  const [checks,setChecks]=useState<Check[]>([])
  const [error,setError]=useState('')

  const run=async()=>{
    setRunning(true);setError('');setChecks([])
    const out:Check[]=[]
    try{
      out.push({name:'Secure browser',ok:window.isSecureContext,detail:window.isSecureContext?'Secure HTTPS connection detected':'HTTPS secure context required'})
      out.push({name:'Camera / microphone API',ok:!!navigator.mediaDevices?.getUserMedia,detail:navigator.mediaDevices?.getUserMedia?'Browser can request camera and microphone':'Camera/microphone API unavailable'})
      const video=document.createElement('video')
      out.push({name:'Video playback',ok:'canPlayType' in video,detail:'Browser video element available'})
      out.push({name:'MediaRecorder',ok:typeof MediaRecorder!=='undefined',detail:typeof MediaRecorder!=='undefined'?'Recording API available':'Recording API unavailable'})
      let gl=false
      try{const c=document.createElement('canvas');gl=!!(c.getContext('webgl2')||c.getContext('webgl'))}catch{}
      out.push({name:'WebGL',ok:gl,detail:gl?'3D rendering context created':'3D rendering unavailable'})

      const response=await fetch('/api/live/status',{cache:'no-store'})
      if(!response.ok) throw new Error('LIVE status returned HTTP '+response.status)
      const body=await response.json()
      out.push({name:'LIVEKIT_URL',ok:body?.checks?.LIVEKIT_URL===true,detail:body?.checks?.LIVEKIT_URL===true?'Configured':'Missing'})
      out.push({name:'LIVEKIT_API_KEY',ok:body?.checks?.LIVEKIT_API_KEY===true,detail:body?.checks?.LIVEKIT_API_KEY===true?'Configured':'Missing'})
      out.push({name:'LIVEKIT_API_SECRET',ok:body?.checks?.LIVEKIT_API_SECRET===true,detail:body?.checks?.LIVEKIT_API_SECRET===true?'Configured':'Missing'})
      out.push({name:'Private LIVE readiness',ok:body?.readyForPrivateTest===true,detail:String(body?.activation?.state||'Unknown state')})
      setChecks(out)
    }catch(e){
      setError(e instanceof Error?e.message:'Test failed')
    }finally{
      setRunning(false)
    }
  }

  const passed=checks.length>0&&checks.every(x=>x.ok)
  const exportReport=()=>{
    const payload={
      schema:'tryamm.one-push-live-test.v2',
      exportedAt:new Date().toISOString(),
      url:window.location.href,
      userAgent:navigator.userAgent,
      viewport:{width:window.innerWidth,height:window.innerHeight},
      passed,
      checks,
      error:error||null,
      nextManualTests:[
        'Chromebook/iPhone host',
        'second-device viewer',
        'camera and microphone',
        'host-to-viewer audio/video',
        'viewer cannot publish',
        'reconnect after background/interruption',
        'private OBS ingest',
        'recording/egress',
        'recording playback'
      ]
    }
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})
    const href=URL.createObjectURL(blob)
    const a=document.createElement('a')
    a.href=href
    a.download='TRYAMM_ONE_PUSH_LIVE_TEST_REPORT.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(()=>URL.revokeObjectURL(href),1000)
  }
  return <main style={{minHeight:'100dvh',background:'#050b12',color:'#fff',fontFamily:'system-ui,sans-serif',padding:'24px 16px',display:'grid',alignContent:'start',gap:18}}>
    <section style={{width:'min(760px,100%)',margin:'0 auto',display:'grid',gap:16}}>
      <button onClick={()=>{window.location.href='/'}} style={{justifySelf:'start',minHeight:48,padding:'10px 16px',borderRadius:12,border:'1px solid #789',background:'#152433',color:'#fff',fontWeight:800}}>← HOME</button>
      <h1 style={{margin:0,fontSize:'clamp(30px,7vw,58px)',lineHeight:1}}>TRYAMM LIVE TEST</h1>
      <p style={{margin:0,fontSize:18}}>Press one button. This checks the Chromebook/browser and your secure LiveKit server setup.</p>
      <button onClick={()=>void run()} disabled={running} style={{minHeight:100,fontSize:'clamp(24px,6vw,40px)',fontWeight:950,borderRadius:22,border:'3px solid #fff',background:running?'#444':'#0b6',color:'#fff',boxShadow:'0 8px 28px #0008',touchAction:'manipulation'}}>
        {running?'TESTING…':'▶ ONE PUSH LIVE TEST'}
      </button>
      {error&&<div role="alert" style={{padding:16,borderRadius:14,background:'#5b1111',fontWeight:800}}>✕ {error}</div>}
      {checks.length>0&&<section style={{display:'grid',gap:10}}>
        <div style={{padding:16,borderRadius:14,background:passed?'#103d27':'#4c3510',fontSize:22,fontWeight:900}}>
          {passed?'✓ PRIVATE LIVE TEST READY':'○ CHECK RESULTS BELOW'}
        </div>
        {checks.map(x=><div key={x.name} style={{padding:14,borderRadius:12,background:'#101b28',border:'1px solid #31475c'}}>
          <div style={{fontSize:18,fontWeight:900}}>{x.ok?'✓':'✕'} {x.name}</div>
          <div style={{opacity:.88}}>{x.detail}</div>
        </div>)}
        <button onClick={exportReport} style={{minHeight:78,fontSize:'clamp(20px,5vw,30px)',fontWeight:950,borderRadius:18,border:'3px solid #fff',background:'#1f5fa8',color:'#fff',touchAction:'manipulation'}}>⬇ EXPORT TEST REPORT</button>
        <div style={{padding:14,borderRadius:12,background:'#101b28',border:'1px solid #31475c'}}>
          <b>Next manual test</b>
          <div>Chromebook host + second-device viewer. Camera, microphone, audio/video, viewer permissions, reconnect, OBS ingest, recording, and playback still require real-device testing.</div>
        </div>
      </section>}
    </section>
  </main>
}
