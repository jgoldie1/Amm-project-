import { useEffect, useMemo, useState } from 'react'

type DramaScene={
  id:string
  title:string
  caption:string
  audioNote:string
  productTag:string
  durationSeconds:number
}

type DramaProject={
  id:string
  title:string
  scenes:DramaScene[]
  updatedAt:string
}

const STORAGE_KEY='tryamm.holo-drama.project.v1'

function sceneId(){return `scene-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}
function blankScene(index:number):DramaScene{return{id:sceneId(),title:`Scene ${index}`,caption:'',audioNote:'',productTag:'',durationSeconds:8}}
function initialProject():DramaProject{
  try{
    const saved=localStorage.getItem(STORAGE_KEY)
    if(saved){const parsed=JSON.parse(saved) as DramaProject;if(parsed?.id&&Array.isArray(parsed.scenes))return parsed}
  }catch{}
  return{id:'holo-drama-first-project',title:'My Holo Drama',scenes:[blankScene(1)],updatedAt:new Date().toISOString()}
}

export default function HoloDramaLauncher(){
  const [open,setOpen]=useState(false)
  const [project,setProject]=useState<DramaProject>(()=>initialProject())
  const [selectedId,setSelectedId]=useState(()=>project.scenes[0]?.id||'')
  const [message,setMessage]=useState('Build a multi-scene story, then hand a scene to TRYAMM Reel Creator for capture/upload, effects, render and publish.')
  const selected=useMemo(()=>project.scenes.find(scene=>scene.id===selectedId)||project.scenes[0],[project.scenes,selectedId])
  const totalDuration=useMemo(()=>project.scenes.reduce((sum,scene)=>sum+Math.max(1,scene.durationSeconds||0),0),[project.scenes])

  useEffect(()=>{const openDrama=()=>setOpen(true);(window as any).__showHoloDrama=()=>setOpen(true);window.addEventListener('tryamm:holo-drama-open',openDrama);return()=>{window.removeEventListener('tryamm:holo-drama-open',openDrama);delete (window as any).__showHoloDrama}},[])
  useEffect(()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify({...project,updatedAt:new Date().toISOString()}))},[project])

  function updateScene(patch:Partial<DramaScene>){if(!selected)return;setProject(current=>({...current,scenes:current.scenes.map(scene=>scene.id===selected.id?{...scene,...patch}:scene)}))}
  function addScene(){const next=blankScene(project.scenes.length+1);setProject(current=>({...current,scenes:[...current.scenes,next]}));setSelectedId(next.id);setMessage('Scene added. Add the caption, audio direction and optional product/ad tag.')}
  function removeScene(){if(!selected||project.scenes.length===1){setMessage('A Holo Drama project must keep at least one scene.');return}const index=project.scenes.findIndex(scene=>scene.id===selected.id);const remaining=project.scenes.filter(scene=>scene.id!==selected.id);setProject(current=>({...current,scenes:remaining}));setSelectedId(remaining[Math.max(0,index-1)]?.id||remaining[0]?.id||'')}
  function moveScene(direction:-1|1){if(!selected)return;const index=project.scenes.findIndex(scene=>scene.id===selected.id),target=index+direction;if(index<0||target<0||target>=project.scenes.length)return;const scenes=[...project.scenes];[scenes[index],scenes[target]]=[scenes[target],scenes[index]];setProject(current=>({...current,scenes}))}
  function openInReel(){if(!selected)return;window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'holo-drama',title:`${project.title} — ${selected.title}`,caption:selected.caption||`${selected.title} • Made in Holo Drama`}}));setMessage('Scene handed to Reel Creator. Capture or upload the scene media there, then edit, render, save or publish.')}

  if(!open)return <button onClick={()=>setOpen(true)} style={{position:'fixed',right:18,bottom:210,zIndex:1100,border:'1px solid #8de7ff',borderRadius:999,padding:'10px 14px',background:'rgba(2,10,20,.92)',color:'#fff',fontWeight:800,boxShadow:'0 0 22px rgba(75,211,255,.28)'}}>HOLO DRAMA</button>

  return <div style={{position:'fixed',inset:0,zIndex:1300,background:'rgba(0,0,0,.82)',display:'grid',placeItems:'center',padding:16}}>
    <section style={{width:'min(980px,96vw)',maxHeight:'92vh',overflow:'auto',border:'1px solid rgba(116,226,255,.5)',borderRadius:22,background:'linear-gradient(160deg,#061421,#110b1d 58%,#05070c)',color:'#fff',boxShadow:'0 22px 80px rgba(0,0,0,.65)',padding:20}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
        <div><strong style={{fontSize:24}}>Holo Drama</strong><div style={{opacity:.72,fontSize:13}}>Multi-scene foundation • local project draft • {project.scenes.length} scenes • ~{totalDuration}s</div></div>
        <button onClick={()=>setOpen(false)} style={{border:0,borderRadius:10,padding:'9px 12px',background:'#222a36',color:'#fff'}}>CLOSE</button>
      </div>

      <label style={{display:'block',marginTop:16,fontSize:12,opacity:.72}}>PROJECT TITLE</label>
      <input value={project.title} onChange={event=>setProject(current=>({...current,title:event.target.value}))} style={{width:'100%',boxSizing:'border-box',marginTop:5,padding:11,borderRadius:10,border:'1px solid #33475c',background:'#07101a',color:'#fff'}} />

      <div style={{display:'grid',gridTemplateColumns:'minmax(190px,260px) 1fr',gap:14,marginTop:16}}>
        <aside style={{border:'1px solid #243548',borderRadius:14,padding:10,background:'rgba(5,13,22,.8)'}}>
          <button onClick={addScene} style={{width:'100%',padding:10,border:0,borderRadius:10,background:'#0ca6cf',color:'#001219',fontWeight:900}}>+ ADD SCENE</button>
          <div style={{display:'grid',gap:7,marginTop:10}}>{project.scenes.map((scene,index)=><button key={scene.id} onClick={()=>setSelectedId(scene.id)} style={{textAlign:'left',padding:10,borderRadius:10,border:selected?.id===scene.id?'1px solid #7ce7ff':'1px solid #243548',background:selected?.id===scene.id?'rgba(30,151,190,.2)':'#08111b',color:'#fff'}}><strong>{index+1}. {scene.title||'Untitled scene'}</strong><div style={{fontSize:11,opacity:.65}}>{Math.max(1,scene.durationSeconds||0)}s {scene.productTag?`• ${scene.productTag}`:''}</div></button>)}</div>
        </aside>

        <main style={{border:'1px solid #243548',borderRadius:14,padding:14,background:'rgba(5,13,22,.72)'}}>
          {selected&&<>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
              <button onClick={()=>moveScene(-1)} style={smallButton}>MOVE UP</button><button onClick={()=>moveScene(1)} style={smallButton}>MOVE DOWN</button><button onClick={removeScene} style={{...smallButton,background:'#3b1820'}}>DELETE</button>
            </div>
            <Field label="SCENE TITLE"><input value={selected.title} onChange={event=>updateScene({title:event.target.value})} style={inputStyle}/></Field>
            <Field label="CAPTION / DIALOGUE"><textarea value={selected.caption} onChange={event=>updateScene({caption:event.target.value})} rows={4} style={inputStyle}/></Field>
            <Field label="AUDIO / MUSIC DIRECTION"><input value={selected.audioNote} onChange={event=>updateScene({audioNote:event.target.value})} placeholder="Voiceover, ambience, licensed/original music note…" style={inputStyle}/></Field>
            <Field label="PRODUCT / AD TAG"><input value={selected.productTag} onChange={event=>updateScene({productTag:event.target.value})} placeholder="Optional SKU, product name or approved sponsor tag" style={inputStyle}/></Field>
            <Field label="TARGET DURATION (SECONDS)"><input type="number" min={1} max={300} value={selected.durationSeconds} onChange={event=>updateScene({durationSeconds:Math.max(1,Number(event.target.value)||1)})} style={inputStyle}/></Field>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}><button onClick={openInReel} style={{padding:'11px 16px',border:0,borderRadius:11,background:'#e7bf55',color:'#160d03',fontWeight:900}}>SEND SCENE TO REEL CREATOR</button><button onClick={()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify({...project,updatedAt:new Date().toISOString()}));setMessage('Holo Drama project saved on this device.')}} style={smallButton}>SAVE PROJECT</button></div>
          </>}
        </main>
      </div>
      <p style={{margin:'14px 0 0',padding:10,borderRadius:10,background:'rgba(255,255,255,.05)',fontSize:13,lineHeight:1.45}}>{message}</p>
      <p style={{margin:'8px 0 0',fontSize:11,opacity:.6}}>Foundation scope: project → ordered scenes → dialogue/captions → audio direction → product/ad tag → Reel Creator handoff. This does not claim automatic multi-scene video rendering yet.</p>
    </section>
  </div>
}

const inputStyle:React.CSSProperties={width:'100%',boxSizing:'border-box',padding:10,borderRadius:9,border:'1px solid #314357',background:'#07101a',color:'#fff',font:'inherit'}
const smallButton:React.CSSProperties={padding:'8px 10px',border:'1px solid #33475c',borderRadius:9,background:'#111d2a',color:'#fff',fontWeight:700}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label style={{display:'block',marginTop:10,fontSize:12,color:'#b8d6e8'}}>{label}<div style={{marginTop:5}}>{children}</div></label>}
