const $ = id => document.getElementById(id)
const source = $('source'), result = $('result'), canvas = $('art')
const ctx = canvas.getContext('2d')
let clip, soundtrack, resultURL, outputFile, active, sampleLoad
const guide = message => { $('guide').textContent = message }
const mp4Type = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4;codecs=avc1,mp4a.40.2','video/mp4'].find(type => window.MediaRecorder?.isTypeSupported(type))
const supported = Boolean(mp4Type && canvas.captureStream && (window.AudioContext || window.webkitAudioContext))
function slate(){
  ctx.fillStyle='#231e28';ctx.fillRect(0,0,720,1280)
  ctx.fillStyle='#eaba86';ctx.font='bold 46px system-ui';ctx.fillText('HoloDrama',50,640)
}
function resetOutput(){
  result.pause();result.removeAttribute('src');result.load()
  if(resultURL)URL.revokeObjectURL(resultURL)
  outputFile=null;resultURL=null
  $('save').removeAttribute('href');$('save').hidden=true;$('share').hidden=true
  result.hidden=true;canvas.hidden=false;slate()
}
function ready(){
  $('files').textContent=[clip?.name,soundtrack?.name].filter(Boolean).join(' · ')
  $('preview').disabled=!supported||!clip||!soundtrack||Boolean(active)
  if(!supported)guide('This browser cannot make an MP4 here. Open this page in current Safari or Chrome to export.')
  else guide(!clip?'Choose a phone clip or use Jacobie’s sample.':!soundtrack?'Add your audio to replace the original sound.':'Build your preview. Keep the studio open while it plays through.')
}
function edit(){resetOutput();ready()}
for(const [id,set] of [['clip',f=>clip=f],['sound',f=>soundtrack=f]]){
  $(id).onchange=()=>{sampleLoad?.abort();set($(id).files[0]);edit()}
}
$('template').onchange=edit;$('title').oninput=edit
$('sample').onclick=async()=>{
  sampleLoad?.abort()
  const job=new AbortController();sampleLoad=job
  $('sample').disabled=true;$('preview').disabled=true
  try{
    const assets=await Promise.all(['jacobie.mp4','mix.m4a'].map(async name=>{
      const res=await fetch(name,{signal:job.signal})
      if(!res.ok)throw Error('Could not load the sample. Try again or choose files.')
      return new File([await res.blob()],name)
    }))
    if(job.signal.aborted)return
    ;[clip,soundtrack]=assets;$('clip').value='';$('sound').value='';edit()
  }catch(e){if(!job.signal.aborted){ready();guide(e.message)}}finally{$('sample').disabled=false}
}
function paint(time,duration){
  const w=720,h=1280,scale=Math.max(w/source.videoWidth,h/source.videoHeight)
  const sw=source.videoWidth*scale,sh=source.videoHeight*scale
  ctx.drawImage(source,(w-sw)/2,(h-sh)/2,sw,sh)
  const drama=$('template').value==='drama', title=$('title').value.trim()
  if(!title||(drama?time>2.4:time<duration-2.4))return
  const y=drama?160:1030
  ctx.fillStyle='rgba(15,12,20,.84)';ctx.fillRect(24,y,672,118)
  ctx.fillStyle='#f2bd83';ctx.fillRect(24,y,6,118);ctx.font='bold 20px system-ui'
  ctx.fillText(drama?'HOLODRAMA':'BUSINESS SPOTLIGHT',48,y+37)
  ctx.fillStyle='white';ctx.font='bold 38px system-ui';ctx.fillText(title,48,y+89,620)
}
$('preview').onclick=async()=>{
  if(active||!clip||!soundtrack)return
  resetOutput();const job=new AbortController();active=job
  $('settings').disabled=true;$('cancel').hidden=false;$('preview').disabled=true
  guide('Preparing your footage and audio…')
  const url=URL.createObjectURL(clip)
  let ac,stream,rec,raf,watchdog
  try{
    ac=new (window.AudioContext||window.webkitAudioContext)()
    const resumed=ac.resume()
    source.muted=true;source.src=url;source.load()
    const primed=source.play()
    const [, ,buffer]=await Promise.all([resumed,primed,soundtrack.arrayBuffer().then(data=>ac.decodeAudioData(data))])
    job.signal.throwIfAborted?.()
    if(job.signal.aborted)throw Error('Preview cancelled.')
    source.pause()
    if(source.currentTime>0)await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{source.onseeked=null;reject(Error('Could not rewind the clip.'))},5000)
      source.onseeked=()=>{clearTimeout(timer);source.onseeked=null;resolve()};source.currentTime=0
    })
    const duration=Math.min(30,source.duration)
    if(!Number.isFinite(duration)||duration<=0||!source.videoWidth)throw Error('This clip could not be decoded. Try an MP4 phone clip.')
    if(job.signal.aborted)throw Error('Preview cancelled.')
    const mix=ac.createMediaStreamDestination(),music=ac.createBufferSource()
    music.buffer=buffer;music.connect(mix)
    paint(0,duration);stream=canvas.captureStream(30)
    stream.addTrack(mix.stream.getAudioTracks()[0])
    rec=new MediaRecorder(stream,{mimeType:mp4Type,videoBitsPerSecond:2500000})
    const chunks=[]
    const finished=new Promise((resolve,reject)=>{
      rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)}
      rec.onstop=resolve;rec.onerror=()=>reject(Error('Recording failed. Retry with a shorter clip.'))
    })
    const stop=()=>{if(rec.state!=='inactive')rec.stop()}
    job.signal.addEventListener('abort',stop,{once:true});source.onended=stop
    source.onerror=()=>job.abort()
    rec.start();music.start();await source.play()
    let last=-1
    function frame(){
      if(job.signal.aborted||rec.state==='inactive')return
      paint(source.currentTime,duration)
      const sec=Math.floor(source.currentTime)
      if(sec!==last){guide('Preparing preview · '+sec+' / '+Math.ceil(duration)+' seconds');last=sec}
      if(source.currentTime>=duration)stop();else raf=requestAnimationFrame(frame)
    }
    frame();watchdog=setTimeout(()=>job.abort(),(duration+10)*1000)
    await finished
    if(job.signal.aborted)throw Error('Preview interrupted. Keep the studio open and try again.')
    if(!chunks.length)throw Error('Empty recording. Please retry.')
    const blob=new Blob(chunks,{type:'video/mp4'})
    resultURL=URL.createObjectURL(blob)
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>finish(false),8000)
      const finish=ok=>{clearTimeout(timer);result.onloadeddata=null;result.onerror=null;ok?resolve():reject(Error('This device could not play the export.'))}
      result.onloadeddata=()=>finish(true);result.onerror=()=>finish(false);result.preload='auto';result.src=resultURL;result.load()
    })
    if(job.signal.aborted)throw Error('Preview cancelled.')
    outputFile=new File([blob],'TRYAMM-Reel.mp4',{type:'video/mp4'})
    canvas.hidden=true;result.hidden=false;$('save').href=resultURL;$('save').hidden=false
    $('share').hidden=!navigator.canShare?.({files:[outputFile]})
    guide('Press Play to review the finished cut, then Export MP4. The export saves this exact preview.')
  }catch(e){resetOutput();guide(job.signal.aborted?'Preview cancelled. Tap Build preview to retry.':e.message||'Could not prepare this clip.')}
  finally{
    clearTimeout(watchdog);cancelAnimationFrame(raf)
    if(rec&&rec.state!=='inactive')rec.stop()
    stream?.getTracks().forEach(t=>t.stop());if(ac)void ac.close().catch(()=>{})
    source.onended=null;source.onerror=null;source.pause();source.removeAttribute('src');source.load();URL.revokeObjectURL(url)
    active=null;$('settings').disabled=false;$('cancel').hidden=true;$('preview').disabled=false
  }
}
$('share').onclick=async()=>{try{await navigator.share({files:[outputFile],title:'TRYAMM Reel'})}catch(e){if(e.name!=='AbortError')guide('Use Export MP4 to save this video.')}}
$('save').onclick=()=>guide('Open the saved MP4 in Files or Downloads. On iPhone, Share offers Save Video when available.')
$('cancel').onclick=()=>active?.abort()
document.addEventListener('visibilitychange',()=>{if(document.hidden)active?.abort()})
slate();ready()
