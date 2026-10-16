import {useEffect,useState} from 'react'
import {PK_HOLO_SERVICES,buildPKHoloServicePreview,type PKHoloServiceId} from '../runtime/PKHoloServicesBridge'
import {
 PK_CHOICES,PK_WORLDS,choosePKStoryChapter,createPKStoryDraft,
 pkHoloverseScenePreview,pkMiddleverseProductionBrief,readPKStoryDraft,writePKStoryDraft,
 type PKChoice,type PKStoryDraft,type PKWorld,
} from '../runtime/PKLivingWorldsBridge'

const shell:React.CSSProperties={position:'fixed',inset:0,zIndex:22500,overflowY:'auto',color:'#fff',background:'radial-gradient(circle at 45% 0,#243559,#080c18 68%)',fontFamily:'system-ui,sans-serif'}
const panel:React.CSSProperties={border:'1px solid #3a4966',borderRadius:17,background:'rgba(6,12,25,.87)',padding:16}
const control:React.CSSProperties={border:'1px solid #5b7899',borderRadius:12,background:'#10263b',padding:'12px 15px',color:'#fff',fontSize:14,fontWeight:850,minHeight:48,cursor:'pointer'}
const info:React.CSSProperties={fontSize:12,color:'#b7c8d9',lineHeight:1.65}
const emit=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))

export default function PKLivingWorldsArena({onClose}:{onClose:()=>void}){
 const [draft,setDraft]=useState<PKStoryDraft>(()=>readPKStoryDraft()||createPKStoryDraft())
 const [notice,setNotice]=useState('Local rehearsal only. No online vote totals, rewards or live broadcast are claimed.')
 const chapter=draft.chapters[draft.chapters.length-1]
 const completed=draft.chapters.length>=3
 useEffect(()=>{writePKStoryDraft(draft)},[draft])
 const selectWorld=(world:PKWorld)=>{setDraft(createPKStoryDraft(world));setNotice('New local rehearsal. Previous choices will be replaced on this device.')}
 const choose=(choice:PKChoice)=>{
  if(completed)return
  const next=choosePKStoryChapter(draft,choice)
  setDraft(next)
  setNotice('Story branch preview updated. Cross-device votes require an authenticated server tally.')
 }
 const gotoHoloverse=()=>{
  emit('tryamm:holoverse-pk-scene-preview',pkHoloverseScenePreview(draft))
  onClose()
  const show=(window as Window&{__showHoloverse?:()=>void}).__showHoloverse
  if(typeof show==='function')show()
  else emit('tryamm:holo-carousel-open',{source:'pk-story'})
 }
 const gotoMiddleverse=()=>{
  emit('tryamm:middleverse-pk-production-brief',pkMiddleverseProductionBrief(draft))
  onClose()
  const show=(window as Window&{__showMiddleverseWorkstation?:()=>void}).__showMiddleverseWorkstation
  if(typeof show==='function')show()
  else emit('tryamm:middleverse-open',{source:'pk-story'})
 }
 const openSafePK=()=>{
  onClose()
  emit('tryamm:holo-social-open',{mode:'pk',source:'pk-living-worlds'})
 }
 const openHoloService=(id:PKHoloServiceId)=>{
  const service=PK_HOLO_SERVICES.find(x=>x.id===id)
  if(!service)return
  emit('tryamm:pk-holo-service-preview',buildPKHoloServicePreview(draft,id))
  // Never dispatch real provider, payment, delivery, drone or employment actions.
  onClose()
  if(id==='menu'||id==='delivery'){
   const show=(window as Window&{__showHoloDelivery?:()=>void}).__showHoloDelivery
   if(typeof show==='function'){show();return}
   emit('tryamm:holo-delivery-open',{source:'pk-story',demo:true});return
  }
  if(service.route==='/'){
   const show=(window as Window&{__showHoloServices?:()=>void}).__showHoloServices
   if(typeof show==='function'){show();return}
   emit('tryamm:open-holo-services',{source:'pk-story',serviceId:id,previewOnly:true});return
  }
  window.location.assign(service.route)
 }
 const clipDraft=()=>{
  emit('tryamm:media-studio-open',{source:'pk-living-worlds',title:'PK Living Worlds — '+(chapter?.title||draft.name),caption:'Story arena concept preview • not recorded footage',target:'reel'})
  onClose()
 }
 return <div role="dialog" aria-modal="true" aria-label="PK Living Worlds Story Arena" style={shell}>
  <main style={{maxWidth:1040,margin:'0 auto',padding:'18px 16px 85px'}}>
   <header style={{display:'flex',alignItems:'center',gap:12,justifyContent:'space-between'}}>
    <div><div style={{fontSize:11,color:'#86e9fa',fontWeight:950,letterSpacing:2}}>TRYAMM • PK 3.0 • CROSS-VERSE</div>
     <h1 style={{margin:'5px 0',fontSize:'clamp(27px,6vw,45px)'}}>PK Living Worlds</h1>
     <p style={{...info,margin:'6px 0'}}>One story • Holoverse stage • Middleverse production • creator LIVE</p>
    </div>
    <button style={control} aria-label="Close PK Living Worlds" onClick={onClose}>✕</button>
   </header>
   <p role="status" aria-live="polite" style={{...info,border:'1px solid #6e788e',background:'#111f30',padding:12,borderRadius:12}}>
    PREVIEW ONLY — free story decisions are simulated on this device. No external gift ingestion, online leaderboard, paid reward, job assignment, or world-state mutation. {notice}
   </p>
   <section aria-label="Choose the world" style={{...panel,marginTop:15}}>
    <h2 style={{fontSize:18,margin:'0 0 10px'}}>1. Choose the world</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:8}}>
    {PK_WORLDS.map(world=><button key={world.id} onClick={()=>selectWorld(world.id)} aria-pressed={draft.world===world.id} style={{...control,textAlign:'left',borderColor:draft.world===world.id?'#79f5e7':'#5b7899',background:draft.world===world.id?'#193d45':'#10263b'}}>
     <strong>{world.label}</strong><span style={{display:'block',...info,marginTop:6}}>{world.subtitle}</span>
    </button>)}
    </div>
   </section>
   <section aria-label="PK story stage preview" style={{...panel,marginTop:14}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,flexWrap:'wrap'}}>
     <h2 style={{fontSize:18,margin:0}}>2. The living stage</h2><span style={{fontSize:11,color:'#ffd983'}}>CHAPTER {draft.chapters.length} OF 3</span>
    </div>
    <div style={{background:'radial-gradient(ellipse at center,#24485c 0,#131f36 48%,#070913 90%)',borderRadius:16,border:'1px solid #43778b',minHeight:190,marginTop:12,padding:16,display:'grid',alignItems:'center'}}>
     <div style={{textAlign:'center'}}>
      <div style={{fontSize:11,color:'#7af4ec',letterSpacing:2}}>STORY STAGE CONCEPT • NOT LIVE VIDEO</div>
      <h3 style={{fontSize:'clamp(20px,5vw,30px)',margin:'12px 0'}}>{chapter?.title||draft.name}</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:6,alignItems:'center'}}>
       <div style={{padding:10,border:'1px solid #59e5fa88',borderRadius:12,background:'#062737'}}>CHICAGO</div>
       <div style={{fontSize:14,color:'#ffe188',fontWeight:950}}>VS</div>
       <div style={{padding:10,border:'1px solid #edac7388',borderRadius:12,background:'#392016'}}>LAGOS</div>
      </div>
      <p style={{...info,marginBottom:0}}>{chapter?.consequence||'Choose a mission below to create the next scene of the episode.'}</p>
     </div>
    </div>
    <h3 style={{fontSize:15}}>3. What should happen next?</h3>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:8}}>
     {PK_CHOICES.map(choice=><button key={choice.id} disabled={completed} onClick={()=>choose(choice.id)} style={{...control,textAlign:'left',opacity:completed?.55:1}}>
       <strong>{choice.label}</strong><span style={{display:'block',...info,marginTop:4}}>{choice.description}</span>
     </button>)}
    </div>
    {completed&&<p style={{color:'#82f9ce',fontSize:13}}>Three preview scenes complete. Use the handoffs below or start a new episode.</p>}
    {draft.chapters.length>0&&<ol style={{fontSize:12,color:'#d3e5ed',lineHeight:1.8,paddingLeft:22}}>
     {draft.chapters.map(c=><li key={c.chapter}>{c.title}</li>)}
    </ol>}
   </section>
   <section aria-label="Holo Services mission previews" style={{...panel,marginTop:14}}>
    <h2 style={{fontSize:18,margin:'0 0 8px'}}>4. Holo Services inside the battle</h2>
    <p style={info}>Tap a service to create a noncash episode mission preview and open its existing TRYAMM screen. Real-world transport, ordering and drone operations remain gated.</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:8}}>
     {PK_HOLO_SERVICES.map(service=><button key={service.id} onClick={()=>openHoloService(service.id)} style={{...control,textAlign:'left',display:'grid',gap:5}}>
      <span><strong>{service.icon} {service.label}</strong> <span style={{fontSize:10,color:'#ffd989'}}>{service.status}</span></span>
      <span style={info}>{service.quest}</span>
     </button>)}
    </div>
   </section>
   <section aria-label="Cross-verse handoffs" style={{...panel,marginTop:14}}>
    <h2 style={{fontSize:18,margin:'0 0 12px'}}>5. Carry the story into TRYAMM</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:9}}>
     <button style={control} onClick={gotoHoloverse}>🌐 Preview in Holoverse</button>
     <button style={control} onClick={gotoMiddleverse}>💼 Middleverse production brief</button>
     <button style={control} onClick={openSafePK}>🎥 Open LIVE / PK safety gate</button>
     <button style={control} onClick={clipDraft}>🎞 Prepare Reel draft</button>
    </div>
    <p style={info}>Middleverse receives a nonpayable production brief for editing, moderation and accessibility planning. Holoverse receives a visual stage concept. LIVE opens its existing age/permission gate. No request publishes media, books a worker, pays a creator, changes a persistent world or starts streaming automatically.</p>
    <button style={{...control,background:'#251e25'}} onClick={()=>selectWorld(draft.world)}>Start a new local episode</button>
   </section>
  </main>
 </div>
}
