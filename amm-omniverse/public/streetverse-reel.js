(()=>{
  const isStreetVerse=()=>location.pathname.startsWith('/streetverse')||location.hash.replace(/^#/,'').startsWith('/streetverse')
  if(!isStreetVerse())return

  let recorder=null
  let chunks=[]
  let active=false
  let timer=null
  let startedAt=0

  const liveBadge=document.createElement('div')
  liveBadge.setAttribute('role','status')
  liveBadge.setAttribute('aria-live','polite')
  liveBadge.textContent='STREETVERSE 0902-1851 • CHECKING WORLD…'
  Object.assign(liveBadge.style,{
    position:'fixed',right:'14px',bottom:'140px',zIndex:'2147483000',padding:'8px 10px',borderRadius:'999px',
    background:'rgba(3,16,24,.96)',border:'1px solid rgba(94,234,255,.82)',color:'#bdf7ff',
    font:'900 10px/1 system-ui,sans-serif',letterSpacing:'.05em',boxShadow:'0 8px 28px rgba(0,0,0,.65)'
  })

  const button=document.createElement('button')
  button.type='button'
  button.setAttribute('aria-label','Start StreetVerse Reel recording')
  button.textContent='● REEL'
  Object.assign(button.style,{
    position:'fixed',right:'14px',bottom:'88px',zIndex:'2147483000',minWidth:'96px',height:'46px',padding:'0 14px',
    borderRadius:'999px',border:'1px solid rgba(255,80,105,.9)',background:'rgba(70,7,19,.94)',color:'#fff',
    font:'900 13px/1 system-ui,sans-serif',letterSpacing:'.08em',boxShadow:'0 0 0 2px rgba(255,80,105,.12)',cursor:'pointer'
  })

  const status=document.createElement('div')
  status.setAttribute('role','status')
  status.setAttribute('aria-live','polite')
  Object.assign(status.style,{
    position:'fixed',right:'14px',bottom:'58px',zIndex:'2147483000',padding:'5px 8px',borderRadius:'8px',
    background:'rgba(3,9,20,.9)',border:'1px solid rgba(79,116,145,.55)',color:'#dcecff',
    font:'700 10px/1.2 system-ui,sans-serif',display:'none'
  })

  const diagnostic=document.createElement('div')
  diagnostic.setAttribute('role','alert')
  Object.assign(diagnostic.style,{
    position:'fixed',left:'12px',right:'12px',top:'72px',zIndex:'2147482999',padding:'14px',borderRadius:'14px',
    background:'rgba(31,8,12,.96)',border:'1px solid rgba(255,104,124,.85)',color:'#fff',
    font:'800 12px/1.45 system-ui,sans-serif',boxShadow:'0 18px 55px rgba(0,0,0,.7)',display:'none'
  })

  function setStatus(text,visible=true){status.textContent=text;status.style.display=visible?'block':'none'}
  function getGameCanvas(){
    const canvases=[...document.querySelectorAll('canvas')]
    return canvases.sort((a,b)=>(b.width*b.height)-(a.width*a.height))[0]||null
  }
  function webglStatus(){
    try{
      const c=document.createElement('canvas')
      const gl=c.getContext('webgl2')||c.getContext('webgl')||c.getContext('experimental-webgl')
      return gl?'WEBGL READY':'WEBGL UNAVAILABLE'
    }catch{return 'WEBGL ERROR'}
  }
  function showDiagnostic(reason){
    const info=`${reason} • ${webglStatus()} • ${navigator.userAgent}`
    diagnostic.innerHTML=`<b>STREETVERSE DID NOT START</b><br>${reason}<br><span style="opacity:.75">${webglStatus()}</span><br><button id="tryamm-streetverse-reload" style="margin-top:10px;min-height:44px;padding:9px 13px;border-radius:10px;border:1px solid #6fe8ff;background:#08202d;color:#fff;font-weight:900">RELOAD STREETVERSE</button>`
    diagnostic.style.display='block'
    liveBadge.textContent='STREETVERSE • RUNTIME ISSUE DETECTED'
    diagnostic.querySelector('#tryamm-streetverse-reload')?.addEventListener('click',()=>location.replace('/streetverse?release=0902-1851'))
    console.warn('[StreetVerse diagnostic]',info)
  }
  function pickMime(){
    if(!window.MediaRecorder)return ''
    const candidates=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm','video/mp4']
    return candidates.find(t=>MediaRecorder.isTypeSupported?.(t))||''
  }
  function download(blob){
    const ext=blob.type.includes('mp4')?'mp4':'webm'
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a')
    a.href=url
    a.download=`streetverse-reel-${new Date().toISOString().replace(/[:.]/g,'-')}.${ext}`
    document.body.appendChild(a);a.click();a.remove()
    setTimeout(()=>URL.revokeObjectURL(url),30000)
  }
  function stop(){
    if(!active)return
    active=false
    clearInterval(timer)
    button.textContent='● REEL'
    button.style.background='rgba(70,7,19,.94)'
    button.setAttribute('aria-label','Start StreetVerse Reel recording')
    liveBadge.textContent='STREETVERSE LIVE • REEL READY'
    if(recorder&&recorder.state!=='inactive')recorder.stop()
  }
  async function start(){
    const canvas=getGameCanvas()
    if(!canvas){setStatus('StreetVerse canvas not ready');showDiagnostic('No game canvas was created');return}
    if(!canvas.captureStream||!window.MediaRecorder){setStatus('Recording is not supported in this browser');return}
    try{
      const stream=canvas.captureStream(30)
      const mime=pickMime()
      recorder=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:6_000_000}:undefined)
      chunks=[]
      recorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)}
      recorder.onerror=()=>{setStatus('Reel recording error');stop()}
      recorder.onstop=()=>{
        stream.getTracks().forEach(t=>t.stop())
        if(!chunks.length){setStatus('No Reel data captured');return}
        const blob=new Blob(chunks,{type:recorder?.mimeType||'video/webm'})
        download(blob)
        setStatus('Reel saved to your device')
        liveBadge.textContent='STREETVERSE LIVE • REEL SAVED'
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-reel-captured',{detail:{size:blob.size,type:blob.type,durationMs:Date.now()-startedAt}}))
        setTimeout(()=>{setStatus('',false);liveBadge.textContent='STREETVERSE LIVE • REEL READY'},3500)
      }
      recorder.start(1000)
      active=true;startedAt=Date.now()
      button.textContent='■ STOP'
      button.style.background='rgba(188,18,47,.96)'
      button.setAttribute('aria-label','Stop StreetVerse Reel recording')
      liveBadge.textContent='● RECORDING STREETVERSE'
      setStatus('Recording 00:00')
      timer=setInterval(()=>{
        const s=Math.floor((Date.now()-startedAt)/1000)
        const mm=String(Math.floor(s/60)).padStart(2,'0'),ss=String(s%60).padStart(2,'0')
        setStatus(`Recording ${mm}:${ss}`)
      },1000)
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-reel-started',{detail:{startedAt}}))
    }catch(err){console.warn('[StreetVerse Reel]',err);setStatus('Could not start Reel recording')}
  }

  button.addEventListener('click',()=>active?stop():start())
  window.addEventListener('tryamm:streetverse-exit',stop)
  document.body.append(liveBadge,button,status,diagnostic)

  const verify=()=>{
    const canvas=getGameCanvas()
    if(canvas){
      liveBadge.textContent=`STREETVERSE LIVE • CANVAS ${canvas.width}×${canvas.height} • REEL READY`
      diagnostic.style.display='none'
    }else showDiagnostic('StreetVerse loaded, but the 3D canvas did not materialize')
  }
  window.setTimeout(verify,5000)
})()
