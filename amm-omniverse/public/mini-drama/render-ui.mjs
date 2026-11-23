import {timeline} from './cut.mjs'
import {original} from './story.mjs'

async function lengthOf(file,kind) {
  const el=document.createElement(kind),url=URL.createObjectURL(file)
  try{return await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(Error('Could not read '+file.name)),12000)
    el.onloadedmetadata=()=>{clearTimeout(timeout);Number.isFinite(el.duration)&&el.duration>0?resolve(el.duration):reject(Error('Unknown length: '+file.name))}
    el.onerror=()=>{clearTimeout(timeout);reject(Error('This browser could not open '+file.name))}
    el.preload='metadata';el.src=url
  })}finally{el.removeAttribute('src');el.load();URL.revokeObjectURL(url)}
}
async function captionImage(shot,w,h) {
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h
  const ctx=canvas.getContext('2d'),size=Math.round(Math.min(w,h)*.047)
  ctx.font='600 '+size+'px sans-serif'
  const words=(shot.line.trim()?(shot.speaker.trim()?shot.speaker.trim()+': ':'')+shot.line.trim():'').split(/\s+/).filter(Boolean)
  const rows=[];let line=''
  for(const word of words){
    if(ctx.measureText(word).width>w*.86)throw Error('Shorten the long word in '+shot.scene)
    if(line && ctx.measureText(line+' '+word).width>w*.86){rows.push(line);line=''}
    line+=(line?' ':'')+word
  }
  if(line)rows.push(line)
  if(rows.length>5)throw Error('Use a shorter caption for '+shot.scene)
  const step=size*1.32,base=h*.9
  if(rows.length){ctx.fillStyle='rgba(8,14,20,.85)';ctx.fillRect(w*.035,base-step*rows.length,w*.93,step*(rows.length+.35))}
  ctx.fillStyle='white';ctx.textAlign='center'
  rows.forEach((row,i)=>ctx.fillText(row,w/2,base-step*(rows.length-i-1)-step*.18))
  return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Caption drawing failed.')),'image/png'))
}
export function installRenderDesk(shots,title,status) {
  const by=id=>document.getElementById(id)
  const mediaInputs=[],starts=[]
  document.querySelectorAll('#shots fieldset').forEach(group=>{
    const add=(name,type)=>{const label=document.createElement('label');label.textContent=name;const input=document.createElement('input');input.type=type;label.append(input);group.append(label);return input}
    const media=add('Replacement footage (optional)','file');media.accept='video/*';mediaInputs.push(media)
    const start=add('Trim from start of this shot (seconds)','number');start.min=0;start.step='0.01';start.value='0';starts.push(start)
  })
  let worker,rendering=false,job=0
  const urls=new Map()
  const finish=()=>{worker?.terminate();worker=null;rendering=false;by('render').disabled=false;by('cancel').disabled=true}
  const session=async()=>{
    let pilotOffset=0
    const plan=[]
    for(const [i,s] of shots.entries()){
      const media=mediaInputs[i].files[0],offset=Number(starts[i].value)
      const length=media?await lengthOf(media,'video'):original[i].seconds
      if(!Number.isFinite(offset)||offset<0||!Number.isInteger(s.seconds)||s.seconds<1||offset+s.seconds>length+.025)
        throw Error('Shot '+(i+1)+': adjust its duration or trim, or select longer footage.')
      plan.push({...s,start:(media?0:pilotOffset)+offset,available:length-offset,filename:media?.name||'pilot.mp4',media,illustration:!media})
      pilotOffset+=original[i].seconds
    }
    return plan
  }
  by('otio').onclick=async()=>{try{
    const plan=await session(),mix=by('mix').files[0],data=timeline(title.value,plan,mix?.name,mix?await lengthOf(mix,'audio'):undefined)
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}))
    const a=document.createElement('a');a.download='episode.otio';a.href=url;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)
    status.textContent='Timeline downloaded. Keep the original media beside it for relinking.'
  }catch(e){status.textContent=e.message}}
  by('cancel').onclick=()=>{job++;finish();status.textContent='Render cancelled.'}
  by('render').onclick=async()=>{
    if(rendering)return
    const current=++job
    rendering=true;by('render').disabled=true;by('cancel').disabled=false
    try{
      const plan=await session(),mix=by('mix').files[0],format=by('aspect').value
      const [width,height]=format==='vertical'?[720,1280]:[1280,720]
      for(const shot of plan)shot.caption=await captionImage(shot,width,height)
      if(current!==job)return
      status.textContent='Loading the FFmpeg engine. Keep this tab open.'
      worker=new Worker('./render-worker.js')
      worker.onerror=()=>{finish();status.textContent='Could not start the render engine. Check connectivity or try shorter clips.'}
      worker.onmessage=({data})=>{
        if(data.error){finish();status.textContent=data.error;return}
        if(data.status){status.textContent=data.status;return}
        if(data.out){
          const out=by(format);if(urls.has(format))URL.revokeObjectURL(urls.get(format))
          const url=URL.createObjectURL(new Blob([data.out],{type:'video/mp4'}));urls.set(format,url)
          out.href=url;out.hidden=false;out.download=(title.value.trim().replace(/[^\w-]+/g,'-')||'episode')+'-'+format+'.mp4'
          status.textContent='Finished. Download your '+format+' MP4.';finish()
        }
      }
      worker.postMessage({width,height,shots:plan,mix})
    }catch(e){if(current===job){finish();status.textContent=e.message}}
  }
}
