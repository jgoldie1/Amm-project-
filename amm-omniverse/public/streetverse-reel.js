(()=>{
  const isStreetVerse=()=>location.pathname.startsWith('/streetverse')
  if(!isStreetVerse())return

  let recorder=null
  let chunks=[]
  let active=false
  let timer=null
  let startedAt=0

  const button=document.createElement('button')
  button.type='button'
  button.setAttribute('aria-label','Start StreetVerse Reel recording')
  button.textContent='● REC'
  Object.assign(button.style,{
    position:'fixed',right:'14px',bottom:'88px',zIndex:'20050',minWidth:'82px',height:'46px',padding:'0 14px',
    borderRadius:'999px',border:'1px solid rgba(255,80,105,.9)',background:'rgba(70,7,19,.92)',color:'#fff',
    font:'900 13px/1 system-ui,sans-serif',letterSpacing:'.08em',boxShadow:'0 0 0 2px rgba(255,80,105,.12)',cursor:'pointer'
  })

  const status=document.createElement('div')
  status.setAttribute('role','status')
  status.setAttribute('aria-live','polite')
  Object.assign(status.style,{
    position:'fixed',right:'14px',bottom:'58px',zIndex:'20050',padding:'5px 8px',borderRadius:'8px',
    background:'rgba(3,9,20,.86)',border:'1px solid rgba(79,116,145,.55)',color:'#dcecff',
    font:'700 10px/1.2 system-ui,sans-serif',display:'none'
  })

  function setStatus(text,visible=true){status.textContent=text;status.style.display=visible?'block':'none'}
  function getGameCanvas(){
    const canvases=[...document.querySelectorAll('canvas')]
    return canvases.sort((a,b)=>(b.width*b.height)-(a.width*a.height))[0]||null
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
    button.textContent='● REC'
    button.style.background='rgba(70,7,19,.92)'
    button.setAttribute('aria-label','Start StreetVerse Reel recording')
    if(recorder&&recorder.state!=='inactive')recorder.stop()
  }
  async function start(){
    const canvas=getGameCanvas()
    if(!canvas){setStatus('StreetVerse canvas not ready');return}
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
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-reel-captured',{detail:{size:blob.size,type:blob.type,durationMs:Date.now()-startedAt}}))
        setTimeout(()=>setStatus('',false),3500)
      }
      recorder.start(1000)
      active=true;startedAt=Date.now()
      button.textContent='■ STOP'
      button.style.background='rgba(188,18,47,.96)'
      button.setAttribute('aria-label','Stop StreetVerse Reel recording')
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
  document.body.append(button,status)
})()
