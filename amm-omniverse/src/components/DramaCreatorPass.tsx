import {useEffect, useRef, useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'

async function passRequest(body:Record<string,unknown>) {
  const token=await getAccessToken()
  if (!token) throw new Error('Sign in to use a creator pass.')
  const response=await fetch('/api/credits/drama-pass',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body)})
  const data=await response.json()
  if (!response.ok) throw new Error(data.error || 'Request failed.')
  return data
}

export default function DramaCreatorPass({scenes=[]}:{scenes?:{dialogue:string;title:string}[]}){
  const [myId,setMyId]=useState('')
  const [owner,setOwner]=useState(false)
  const [account,setAccount]=useState('')
  const [limit,setLimit]=useState(120)
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)
  const [lines,setLines]=useState(['The audition sheet is coming down.','Mara offers Jacobie the final spot.','He signs both names. Who goes first?'])
  const [video,setVideo]=useState('')
  const pending=useRef('')
  const preview=useRef<HTMLCanvasElement>(null)
  useEffect(()=>()=>{if(video)URL.revokeObjectURL(video)},[video])
  async function check(){
    const data=await passRequest({action:'status'})
    setOwner(data.owner)
    setMyId(data.accountId)
    if(data.owner)setAccount(current=>current||data.accountId)
    setMessage(data.pass ? Math.max(0,data.pass.credit_limit-data.pass.used_units)+' approved credits available.' : 'Ask the owner to approve your account.')
  }
  async function record(){
    const canvas=preview.current
    const mime=typeof MediaRecorder!=='undefined' && ['video/mp4','video/webm;codecs=vp8','video/webm'].find(type=>MediaRecorder.isTypeSupported(type))
    const ctx=canvas?.getContext('2d')
    if (!mime || !canvas?.captureStream || !ctx) throw new Error('Video export is unavailable in this browser.')
    const stream=canvas.captureStream(15)
    try {
      const recorder=new MediaRecorder(stream,{mimeType:mime})
      pending.current ||= crypto.randomUUID()
      await passRequest({action:'claim',reference:pending.current})
      const chunks:BlobPart[]=[]
      recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)}
      const stopped=new Promise<void>((resolve,reject)=>{recorder.onstop=()=>resolve();recorder.onerror=()=>reject(new Error('Export interrupted. Retry the same job.'))})
      recorder.start()
      setMessage('Recording your three caption cards. Keep this tab open for 15 seconds.')
      const timer=window.setInterval(()=>{
        const elapsed=performance.now()-start
        if(elapsed>=15000){if(recorder.state==='recording')recorder.stop();return}
        const scene=Math.min(2,Math.floor(elapsed/5000))
        ctx.fillStyle=['#112543','#312046','#193c41'][scene];ctx.fillRect(0,0,360,640)
        ctx.fillStyle='#eac784';ctx.font='18px system-ui';ctx.fillText('HOLO DRAMA   /   '+(scene+1)+' OF 3',20,74)
        ctx.fillStyle='#fff';ctx.font='bold 28px system-ui'
        let line='',y=240
        for(const word of lines[scene].trim().split(/\s+/)){
          if(line && ctx.measureText(line+' '+word).width>315){ctx.fillText(line,20,y,315);y+=40;line=''}
          line+=(line?' ':'')+word
        }
        ctx.fillText(line,20,y,315)
        ctx.fillRect(20,570,320*elapsed/15000,3)
      },65)
      const start=performance.now()
      try{await stopped}finally{clearInterval(timer)}
      const blob=new Blob(chunks,{type:recorder.mimeType})
      if(!blob.size)throw new Error('Empty export. Retry this job.')
      setVideo(URL.createObjectURL(blob));pending.current=''
      setMessage('Your short is ready to play and download.')
    } finally {stream.getTracks().forEach(track=>track.stop())}
  }
  async function run(fn:()=>Promise<void>){setBusy(true);try{await fn()}catch(e){setMessage(e instanceof Error?e.message:'Request failed.')}finally{setBusy(false)}}
  return <details><summary>Creator pass and short-drama export</summary>
    <button disabled={busy} onClick={()=>run(check)}>Check my access</button>
    {myId&&<p>Your creator account ID <code>{myId}</code></p>}
    {owner&&<fieldset><legend>Owner approvals</legend><label>Creator account ID <input value={account} onChange={e=>setAccount(e.target.value)}/></label>
    <label>Lifetime credit cap (0 revokes access) <input type="number" min="0" max="400" value={limit} onChange={e=>setLimit(Number(e.target.value))}/></label>
    <button disabled={busy} onClick={()=>run(async()=>{await passRequest({action:'approve',userId:account.trim(),creditLimit:limit});setMessage('Approval saved. Previous use still counts.')})}>Save approval</button></fieldset>}
    {scenes.length>0 && <button disabled={busy} onClick={()=>{const indexes=[0,Math.floor(scenes.length/2),scenes.length-1];setLines(indexes.map(i=>String(scenes[i].dialogue||scenes[i].title||'').slice(0,90)));setMessage('Opening, middle and final beats imported. Edit each caption before export.')}}>Use my OmniBox outline</button>}
    <p>Write three caption cards for a 15-second vertical teaser. One export uses 40 approved credits.</p>
    {lines.map((line,i)=><label key={i}>Card {i+1} <input maxLength={90} value={line} disabled={busy} onChange={e=>setLines(old=>old.map((v,j)=>i===j?e.target.value:v))}/></label>)}
    <button disabled={busy||lines.some(line=>!line.trim())} onClick={()=>run(record)}>Export with creator pass</button>
    <canvas ref={preview} width={360} height={640} style={{display:busy?'block':'none',maxHeight:320}}/>
    <p role="status">{message}</p>{video&&<><video src={video} controls playsInline style={{maxHeight:360}}/><a href={video} download="my-holodrama-teaser">Download teaser</a></>}
  </details>
}
