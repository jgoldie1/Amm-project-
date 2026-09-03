(()=>{
  const isStreetVerse=()=>location.pathname.startsWith('/streetverse')||location.hash.replace(/^#/,'').startsWith('/streetverse')
  if(!isStreetVerse())return
  let recorder=null,chunks=[],active=false,timer=null,startedAt=0,activeStream=null,stopping=false
  const liveBadge=document.createElement('div'),button=document.createElement('button'),status=document.createElement('div'),diagnostic=document.createElement('div')
  liveBadge.setAttribute('role','status');liveBadge.setAttribute('aria-live','polite');liveBadge.textContent='STREETVERSE • CHECKING WORLD…'
  Object.assign(liveBadge.style,{position:'fixed',right:'14px',bottom:'140px',zIndex:'2147483000',padding:'8px 10px',borderRadius:'999px',background:'rgba(3,16,24,.96)',border:'1px solid rgba(94,234,255,.82)',color:'#bdf7ff',font:'900 10px/1 system-ui,sans-serif',letterSpacing:'.05em',boxShadow:'0 8px 28px rgba(0,0,0,.65)'})
  button.type='button';button.setAttribute('aria-label','Start StreetVerse Reel recording');button.textContent='● REEL'
  Object.assign(button.style,{position:'fixed',right:'14px',bottom:'88px',zIndex:'2147483000',minWidth:'108px',height:'50px',padding:'0 16px',borderRadius:'999px',border:'1px solid rgba(255,80,105,.9)',background:'rgba(70,7,19,.94)',color:'#fff',font:'900 13px/1 system-ui,sans-serif',letterSpacing:'.08em',boxShadow:'0 0 0 2px rgba(255,80,105,.12)',cursor:'pointer',touchAction:'manipulation'})
  status.setAttribute('role','status');status.setAttribute('aria-live','polite');Object.assign(status.style,{position:'fixed',right:'14px',bottom:'58px',zIndex:'2147483000',padding:'6px 9px',borderRadius:'8px',background:'rgba(3,9,20,.9)',border:'1px solid rgba(79,116,145,.55)',color:'#dcecff',font:'700 10px/1.25 system-ui,sans-serif',display:'none',maxWidth:'280px'})
  diagnostic.setAttribute('role','alert');Object.assign(diagnostic.style,{position:'fixed',left:'12px',right:'12px',top:'72px',zIndex:'2147482999',padding:'14px',borderRadius:'14px',background:'rgba(31,8,12,.96)',border:'1px solid rgba(255,104,124,.85)',color:'#fff',font:'800 12px/1.45 system-ui,sans-serif',boxShadow:'0 18px 55px rgba(0,0,0,.7)',display:'none'})
  const setStatus=(text,visible=true)=>{status.textContent=text;status.style.display=visible?'block':'none'}
  const getGameCanvas=()=>[...document.querySelectorAll('canvas')].sort((a,b)=>(b.width*b.height)-(a.width*a.height))[0]||null
  const webglStatus=()=>{try{const c=document.createElement('canvas'),gl=c.getContext('webgl2')||c.getContext('webgl')||c.getContext('experimental-webgl');return gl?'WEBGL READY':'WEBGL UNAVAILABLE'}catch{return'WEBGL ERROR'}}
  function showDiagnostic(reason){diagnostic.innerHTML=`<b>STREETVERSE DID NOT START</b><br>${reason}<br><span style="opacity:.75">${webglStatus()}</span><br><button id="tryamm-streetverse-reload" style="margin-top:10px;min-height:44px;padding:9px 13px;border-radius:10px;border:1px solid #6fe8ff;background:#08202d;color:#fff;font-weight:900">RELOAD STREETVERSE</button>`;diagnostic.style.display='block';liveBadge.textContent='STREETVERSE • RUNTIME ISSUE DETECTED';diagnostic.querySelector('#tryamm-streetverse-reload')?.addEventListener('click',()=>location.replace('/streetverse?release=0903-final'))}
  const pickMime=()=>{if(!window.MediaRecorder)return'';return['video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(t=>MediaRecorder.isTypeSupported?.(t))||''}
  function mobileFallback(reason='captureStream-or-MediaRecorder-unavailable'){
    liveBadge.textContent='STREETVERSE LIVE • MOBILE REEL MODE'
    setStatus('Direct game recording is unavailable in this browser. Opening Reel Composer. On iPhone, use Control Center Screen Recording, then import the clip.')
    window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'streetverse-mobile-fallback',title:'StreetVerse Highlight',caption:'Captured in StreetVerse • #TRYAMM #StreetVerse'}}))
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-reel-fallback',{detail:{reason}}))
  }
  function download(blob){const ext=blob.type.includes('mp4')?'mp4':'webm',url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`streetverse-reel-${new Date().toISOString().replace(/[:.]/g,'-')}.${ext}`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),45000)}
  function resetUi(text='STREETVERSE LIVE • REEL READY'){clearInterval(timer);timer=null;button.textContent='● REEL';button.style.background='rgba(70,7,19,.94)';button.setAttribute('aria-label','Start StreetVerse Reel recording');liveBadge.textContent=text;active=false;stopping=false}
  function stop(reason='manual'){
    if(!active||stopping)return
    stopping=true;clearInterval(timer);timer=null;setStatus('Finishing Reel…');button.disabled=true
    try{if(recorder&&recorder.state==='recording')recorder.requestData?.()}catch{}
    setTimeout(()=>{try{if(recorder&&recorder.state!=='inactive')recorder.stop();else resetUi()}catch{resetUi()}},120)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-reel-stopping',{detail:{reason,durationMs:Date.now()-startedAt}}))
  }
  async function start(){
    const canvas=getGameCanvas();if(!canvas){setStatus('StreetVerse canvas not ready');showDiagnostic('No game canvas was created');return}
    if(!canvas.captureStream||!window.MediaRecorder){mobileFallback();return}
    try{
      const mobile=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent),fps=mobile?20:30,stream=canvas.captureStream(fps),mime=pickMime(),bps=mobile?2_800_000:5_500_000
      if(!stream.getVideoTracks().length){stream.getTracks().forEach(t=>t.stop());mobileFallback('canvas-stream-has-no-video-track');return}
      activeStream=stream;recorder=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:bps}:undefined);chunks=[];button.disabled=false
      recorder.ondataavailable=e=>{if(e.data&&e.data.size>0)chunks.push(e.data)}
      recorder.onerror=e=>{console.warn('[StreetVerse Reel recorder]',e);setStatus('Reel recording error');try{activeStream?.getTracks().forEach(t=>t.stop())}catch{}resetUi('STREETVERSE LIVE • REEL ERROR')}
      recorder.onstop=()=>{try{activeStream?.getTracks().forEach(t=>t.stop())}catch{};activeStream=null;button.disabled=false;const durationMs=Date.now()-startedAt;if(!chunks.length){setStatus('No Reel data captured. Opening fallback recorder.');resetUi('STREETVERSE LIVE • MOBILE REEL MODE');mobileFallback('empty-recorder-output');return}const blob=new Blob(chunks,{type:recorder?.mimeType||mime||'video/webm'});if(blob.size<1024){setStatus('Reel file was empty. Opening fallback recorder.');resetUi('STREETVERSE LIVE • MOBILE REEL MODE');mobileFallback('tiny-recorder-output');return}download(blob);setStatus('Reel saved to your device');resetUi('STREETVERSE LIVE • REEL SAVED');window.dispatchEvent(new CustomEvent('tryamm:streetverse-reel-captured',{detail:{size:blob.size,type:blob.type,durationMs}}));setTimeout(()=>{setStatus('',false);liveBadge.textContent='STREETVERSE LIVE • REEL READY'},3500)}
      recorder.start(750);active=true;stopping=false;startedAt=Date.now();button.textContent='■ STOP';button.style.background='rgba(188,18,47,.96)';button.setAttribute('aria-label','Stop StreetVerse Reel recording');liveBadge.textContent='● RECORDING STREETVERSE';setStatus('Recording 00:00');timer=setInterval(()=>{const s=Math.floor((Date.now()-startedAt)/1000),mm=String(Math.floor(s/60)).padStart(2,'0'),ss=String(s%60).padStart(2,'0');setStatus(`Recording ${mm}:${ss}`);if(s>=180)stop('max-duration')},1000);window.dispatchEvent(new CustomEvent('tryamm:streetverse-reel-started',{detail:{startedAt,fps,mime:recorder.mimeType||mime}}))
    }catch(err){console.warn('[StreetVerse Reel]',err);try{activeStream?.getTracks().forEach(t=>t.stop())}catch{};activeStream=null;resetUi('STREETVERSE LIVE • MOBILE REEL MODE');mobileFallback('recorder-start-failed')}
  }
  button.addEventListener('click',()=>active?stop('button'):start())
  window.addEventListener('tryamm:streetverse-exit',()=>stop('streetverse-exit'))
  window.addEventListener('pagehide',()=>stop('pagehide'))
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&active){setStatus('StreetVerse moved to background • finishing Reel…');stop('backgrounded')}})
  document.body.append(liveBadge,button,status,diagnostic)
  window.setTimeout(()=>{const canvas=getGameCanvas();if(canvas){liveBadge.textContent=`STREETVERSE LIVE • CANVAS ${canvas.width}×${canvas.height} • REEL READY`;diagnostic.style.display='none';window.dispatchEvent(new CustomEvent('tryamm:streetverse-reel-ready',{detail:{canvasWidth:canvas.width,canvasHeight:canvas.height,captureStream:!!canvas.captureStream,mediaRecorder:!!window.MediaRecorder,mime:pickMime()}}))}else showDiagnostic('StreetVerse loaded, but the 3D canvas did not materialize')},5000)
})()
