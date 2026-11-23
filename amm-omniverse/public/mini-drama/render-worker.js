// Pinned single-thread build. Verify both downloads before loading executable code.
const upstream='https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.'
async function verified(extension,expected) {
  const response=await fetch(upstream+extension,{credentials:'omit'})
  if(!response.ok)throw Error('FFmpeg download failed. Check your connection and retry.')
  const bytes=await response.arrayBuffer()
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('')
  if(digest!==expected)throw Error('FFmpeg download did not match the pinned version.')
  return bytes
}
self.onmessage=async({data})=>{
 try{
  const {segmentArgs,finishArgs}=await import('./cut.mjs')
  const [js,wasm]=await Promise.all([verified('js','b266ab5b952555881dd6310663986994a182acb2b7ff25cf10a25f7a37ac2b21'),verified('wasm','9f57947a5bd530d8f00c5b3f2cb2a3492faa7e5d823315342d6a8656d0a6b7b7')])
  const script=URL.createObjectURL(new Blob([js],{type:'application/javascript'}))
  importScripts(script)
  const ff=await self.createFFmpegCore({wasmBinary:new Uint8Array(wasm)})
  URL.revokeObjectURL(script)
  let logs=''
  ff.setLogger(({message})=>{logs=(logs+'\n'+message).slice(-12000)})
  const execute=(args,probe=false)=>{
    logs='';ff.exec('-y',...args);const ret=ff.ret;ff.reset()
    if(ret!==0&&!probe)throw Error(logs.split('\n').filter(Boolean).slice(-4).join(' ').slice(-500)||'Media render failed.')
  }
  const write=async(path,file)=>ff.FS.writeFile(path,new Uint8Array(await file.arrayBuffer()))
  if(data.shots.some(s=>s.illustration)){
    const response=await fetch('pilot.mp4')
    if(!response.ok)throw Error('Pilot illustrations could not be loaded.')
    await write('pilot',await response.blob())
  }
  if(data.mix)await write('mix',data.mix)
  const parts=[]
  for(const [i,shot] of data.shots.entries()){
    self.postMessage({status:'Rendering shot '+(i+1)+' of '+data.shots.length})
    const input=shot.illustration?'pilot':'source'
    if(!shot.illustration)await write(input,shot.media)
    execute(['-i',input],true)
    const hasAudio=/Stream #.*Audio:/.test(logs)
    await write('caption.png',shot.caption)
    const part='shot'+i+'.mkv'
    execute(segmentArgs({...data,input,shot,hasAudio,caption:'caption.png',part}))
    parts.push(part)
    if(!shot.illustration)ff.FS.unlink(input)
    ff.FS.unlink('caption.png')
  }
  ff.FS.writeFile('parts.txt',parts.map(p=>"file '"+p+"'").join('\n'))
  execute(finishArgs(Boolean(data.mix),data.shots.reduce((n,s)=>n+s.seconds,0)))
  const out=ff.FS.readFile('output.mp4')
  self.postMessage({out},[out.buffer])
 }catch(e){self.postMessage({error:e.message||String(e)})}
}
