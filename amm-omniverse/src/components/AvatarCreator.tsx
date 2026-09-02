import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../game/state/useGameStore'
import {
  SPECIES_CATALOG, detectFaceFromImage, sampleFaceColors,
  generateAvatarTexture, type AvatarSpecies, type FaceData, type FaceLandmarks
} from '../game/avatar/AvatarSystem'
import {
  canProcessAvatarBiometrics,
  completeEphemeralAvatarVideoProcessing,
  createBiometricAvatarConsent,
  requestAvatarBiometricDeletion,
  requestPrivacySafeAvatarCapture,
  type AvatarCaptureView,
  type BiometricAvatarConsent,
} from '../runtime/BiometricAvatarPrivacyRuntime'

type Step='species'|'face'|'preview'
type FaceMode='skip'|'camera'|'video'|'upload'
type MeasuredView={source:'camera'|'video'|'photo';index:number;landmarks:FaceLandmarks|null;skin:string;hair:string}

const CATEGORY_COLORS={human:'#00ccff',beast:'#ff6600',mythic:'#8800ff',divine:'#ffd700'}

export default function AvatarCreator({onDone}:{onDone:()=>void}){
  const store=useGameStore()
  const [step,setStep]=useState<Step>('species')
  const [selectedSpecies,setSelectedSpecies]=useState<AvatarSpecies>('human_male')
  const [catFilter,setCatFilter]=useState<'all'|'human'|'beast'|'mythic'|'divine'>('all')
  const [faceMode,setFaceMode]=useState<FaceMode>('skip')
  const [photos,setPhotos]=useState<string[]>([])
  const [faceData,setFaceData]=useState<FaceData|null>(null)
  const [scanning,setScanning]=useState(false)
  const [scanMsg,setScanMsg]=useState('')
  const [previewCanvas,setPreviewCanvas]=useState<HTMLCanvasElement|null>(null)
  const [privacyAccepted,setPrivacyAccepted]=useState(false)
  const [adultOrGuardianAuthorized,setAdultOrGuardianAuthorized]=useState(false)
  const [saveRawPhotos,setSaveRawPhotos]=useState(false)
  const [consent,setConsent]=useState<BiometricAvatarConsent|null>(null)
  const [measuredViews,setMeasuredViews]=useState<MeasuredView[]>([])
  const videoRef=useRef<HTMLVideoElement>(null)
  const photoInputRef=useRef<HTMLInputElement>(null)
  const videoInputRef=useRef<HTMLInputElement>(null)
  const streamRef=useRef<MediaStream|null>(null)
  const sessionUrlsRef=useRef<string[]>([])

  const species=SPECIES_CATALOG.find(s=>s.id===selectedSpecies)!
  const filtered=catFilter==='all'?SPECIES_CATALOG:SPECIES_CATALOG.filter(s=>s.category===catFilter)
  const C='#00ccff'

  const revokeSessionUrls=()=>{
    for(const url of sessionUrlsRef.current){try{URL.revokeObjectURL(url)}catch{}}
    sessionUrlsRef.current=[]
  }

  const stopCamera=()=>{
    streamRef.current?.getTracks().forEach(t=>t.stop())
    streamRef.current=null
    if(videoRef.current)videoRef.current.srcObject=null
  }

  const buildConsent=(views:AvatarCaptureView[])=>{
    if(!privacyAccepted||!adultOrGuardianAuthorized){store.setNotif('🔒 Accept avatar privacy consent before using camera, video, or photos.');return null}
    const next=createBiometricAvatarConsent({purpose:'avatar-mesh-fit',views,adultOrGuardianAuthorized:true,saveRawPhotos})
    const gate=canProcessAvatarBiometrics(next)
    if(!gate.ok){store.setNotif(`🔒 ${gate.reason}`);return null}
    setConsent(next)
    return next
  }

  const authorizeCapture=(views:AvatarCaptureView[])=>{
    const containsVideo=views.includes('camera-live')||views.includes('video-clip')
    const active=consent&&privacyAccepted&&adultOrGuardianAuthorized
      ?{...consent,views,rawPhotoRetention:containsVideo?'session-only' as const:saveRawPhotos?'user-save-explicit' as const:'session-only' as const}
      :buildConsent(views)
    if(!active)return null
    const gate=requestPrivacySafeAvatarCapture({purpose:'avatar-mesh-fit',views,consent:active})
    if(!gate.ok){store.setNotif(`🔒 ${gate.reason}`);return null}
    setConsent(active)
    return active
  }

  const emitMeasurements=(views:MeasuredView[])=>{
    if(typeof window==='undefined')return
    window.dispatchEvent(new CustomEvent('tryamm:avatar-multiview-measurements',{detail:{
      purpose:'avatar-mesh-fit',localOnly:true,noIdentityTemplate:true,
      views:views.map(v=>({source:v.source,index:v.index,faceBox:v.landmarks?.faceBox??null,jaw:v.landmarks?{left:v.landmarks.jawLeft,right:v.landmarks.jawRight}:null})),
      createdAt:new Date().toISOString(),
    }}))
  }

  const setDerivedFace=(img:HTMLImageElement,landmarks:FaceLandmarks|null,skin:string,hair:string,sourceLabel:string)=>{
    const texture=makeDerivedFaceTexture(img,landmarks,skin,hair)
    const fd:FaceData={
      photoUrls:[],primaryUrl:null,skinColor:skin,hairColor:hair,faceShape:'oval',
      gender:selectedSpecies==='human_female'?'female':'male',landmarks,textureCanvas:texture,
    }
    setFaceData(fd)
    setPreviewCanvas(texture)
    setScanMsg(`✅ ${sourceLabel} fitted locally • raw video/frame deleted`)
  }

  const startCamera=async()=>{
    if(!authorizeCapture(['camera-live']))return
    setFaceMode('camera')
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false})
      streamRef.current=stream
      if(videoRef.current)videoRef.current.srcObject=stream
    }catch{store.setNotif('❌ Camera unavailable. Use VIDEO CLIP or PHOTOS.');setFaceMode('video')}
  }

  const captureCameraFrame=async()=>{
    if(!videoRef.current||!authorizeCapture(['camera-live']))return
    setScanning(true);setScanMsg('Benny is fitting your avatar from this frame...')
    try{
      const canvas=document.createElement('canvas')
      canvas.width=videoRef.current.videoWidth||640;canvas.height=videoRef.current.videoHeight||480
      canvas.getContext('2d')!.drawImage(videoRef.current,0,0,canvas.width,canvas.height)
      const blob=await canvasToBlob(canvas)
      const url=URL.createObjectURL(blob)
      const img=await loadImage(url)
      const landmarks=await detectFaceFromImage(img)
      const colors=sampleFaceColors(img,landmarks)
      const view:MeasuredView={source:'camera',index:0,landmarks,skin:colors.skin,hair:colors.hair}
      setMeasuredViews([view]);emitMeasurements([view])
      setDerivedFace(img,landmarks,colors.skin,colors.hair,'Live camera')
      URL.revokeObjectURL(url)
    }finally{
      stopCamera();completeEphemeralAvatarVideoProcessing('camera-live');setScanning(false)
    }
  }

  const handleVideoClip=async(file:File)=>{
    if(!file.type.startsWith('video/')){store.setNotif('❌ Choose a video clip.');return}
    if(!authorizeCapture(['video-clip']))return
    setScanning(true);setScanMsg('Sampling front + turn angles locally...')
    const videoUrl=URL.createObjectURL(file)
    const frameUrls:string[]=[]
    try{
      const video=document.createElement('video')
      video.src=videoUrl;video.muted=true;video.playsInline=true;video.preload='metadata'
      await waitEvent(video,'loadedmetadata')
      const duration=Number.isFinite(video.duration)&&video.duration>0?video.duration:1
      const times=[duration*.18,duration*.50,duration*.82]
      const views:MeasuredView[]=[]
      let best:{img:HTMLImageElement;landmarks:FaceLandmarks|null;skin:string;hair:string}|null=null
      for(let i=0;i<times.length;i++){
        await seekVideo(video,times[i])
        const canvas=document.createElement('canvas')
        canvas.width=video.videoWidth||640;canvas.height=video.videoHeight||480
        canvas.getContext('2d')!.drawImage(video,0,0,canvas.width,canvas.height)
        const blob=await canvasToBlob(canvas)
        const frameUrl=URL.createObjectURL(blob);frameUrls.push(frameUrl)
        const img=await loadImage(frameUrl)
        const landmarks=await detectFaceFromImage(img)
        const colors=sampleFaceColors(img,landmarks)
        views.push({source:'video',index:i,landmarks,skin:colors.skin,hair:colors.hair})
        if(!best||(landmarks&&!best.landmarks))best={img,landmarks,skin:colors.skin,hair:colors.hair}
      }
      setMeasuredViews(views);emitMeasurements(views)
      if(best)setDerivedFace(best.img,best.landmarks,best.skin,best.hair,'Video clip')
      setScanMsg(`✅ Video analyzed locally: ${views.length} temporary angles • clip + frames deleted`)
    }catch{store.setNotif('❌ Could not analyze that video. Try a short MP4/MOV clip or photos.')}
    finally{
      frameUrls.forEach(u=>URL.revokeObjectURL(u));URL.revokeObjectURL(videoUrl)
      completeEphemeralAvatarVideoProcessing('video-clip');setScanning(false)
      if(videoInputRef.current)videoInputRef.current.value=''
    }
  }

  const handlePhotos=async(files:FileList)=>{
    const picked=Array.from(files).filter(f=>f.type.startsWith('image/')).slice(0,3)
    if(!picked.length){store.setNotif('❌ Choose JPG, PNG, or WEBP photos.');return}
    const views:AvatarCaptureView[]=['front-photo']
    if(picked.length>1)views.push('left-photo')
    if(picked.length>2)views.push('right-photo')
    if(!authorizeCapture(views))return
    setScanning(true);setScanMsg('Reading front + optional side photos locally...')
    try{
      revokeSessionUrls()
      const urls:string[]=[]
      const measured:MeasuredView[]=[]
      let front:{img:HTMLImageElement;landmarks:FaceLandmarks|null;skin:string;hair:string}|null=null
      for(let i=0;i<picked.length;i++){
        const url=saveRawPhotos?await fileToDataUrl(picked[i]):URL.createObjectURL(picked[i])
        if(!saveRawPhotos)sessionUrlsRef.current.push(url)
        urls.push(url)
        const img=await loadImage(url)
        const landmarks=await detectFaceFromImage(img)
        const colors=sampleFaceColors(img,landmarks)
        measured.push({source:'photo',index:i,landmarks,skin:colors.skin,hair:colors.hair})
        if(i===0)front={img,landmarks,skin:colors.skin,hair:colors.hair}
      }
      setPhotos(urls);setMeasuredViews(measured);emitMeasurements(measured)
      if(front){
        const texture=makeDerivedFaceTexture(front.img,front.landmarks,front.skin,front.hair)
        setFaceData({photoUrls:saveRawPhotos?urls:[],primaryUrl:saveRawPhotos?urls[0]:null,skinColor:front.skin,hairColor:front.hair,faceShape:'oval',gender:selectedSpecies==='human_female'?'female':'male',landmarks:front.landmarks,textureCanvas:texture})
        setPreviewCanvas(texture)
      }
      setScanMsg(`✅ ${picked.length} photo angle${picked.length>1?'s':''} fitted locally${picked.length>1?' • side geometry added':''}`)
    }finally{setScanning(false);if(photoInputRef.current)photoInputRef.current.value=''}
  }

  const discardCaptures=()=>{
    stopCamera();revokeSessionUrls();setPhotos([]);setFaceData(null);setMeasuredViews([]);setPreviewCanvas(null);setConsent(null)
    requestAvatarBiometricDeletion('raw-captures');store.setNotif('🗑️ Raw avatar captures discarded.')
  }

  useEffect(()=>{
    if(step==='preview'&&!previewCanvas){
      setPreviewCanvas(faceData?.textureCanvas??generateAvatarTexture({species:selectedSpecies,faceData,name:store.player.name,role:store.player.avatar}))
    }
  },[step,previewCanvas,faceData,selectedSpecies,store.player.name,store.player.avatar])

  useEffect(()=>()=>{stopCamera();revokeSessionUrls()},[])

  const confirm=()=>{
    store.setPlayer({avatar:selectedSpecies as any});store.earnXp(100)
    if(consent?.rawPhotoRetention==='session-only'){revokeSessionUrls();requestAvatarBiometricDeletion('raw-captures')}
    store.setNotif(`✅ ${species.label} avatar ready for StreetVerse!`);onDone()
  }

  return <div style={{width:'100%',height:'100%',background:'#020212',color:'#fff',fontFamily:'monospace',display:'flex',flexDirection:'column',overflow:'hidden'}}>
    <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 20px',borderBottom:'1px solid #00ffcc22'}}>
      <button onClick={onDone} style={btn('#00ffcc')}>← BACK</button>
      <b style={{color:'#00ffcc',letterSpacing:3}}>🧬 AVATAR CREATOR</b>
      <span style={{marginLeft:'auto',color:'#666',fontSize:11}}>STEP {step==='species'?1:step==='face'?2:3} / 3</span>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'16px 20px'}}>
      {step==='species'&&<div>
        <p style={muted}>Choose your StreetVerse avatar base. Your video/photos refine appearance; they do not identify you.</p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>{(['all','human','beast','mythic','divine'] as const).map(c=><button key={c} onClick={()=>setCatFilter(c)} style={btn(catFilter===c?C:'#666')}>{c.toUpperCase()}</button>)}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(145px,1fr))',gap:9}}>{filtered.map(s=>{const cc=CATEGORY_COLORS[s.category];const sel=s.id===selectedSpecies;return <div key={s.id} onClick={()=>setSelectedSpecies(s.id)} style={{padding:12,borderRadius:8,cursor:'pointer',background:sel?`${cc}18`:'#060619',border:`2px solid ${sel?cc:'#1a1a3e'}`,textAlign:'center'}}><div style={{fontSize:28}}>{s.emoji}</div><b style={{color:sel?cc:'#ccc',fontSize:12}}>{s.label}</b><div style={{color:'#666',fontSize:9,marginTop:4}}>{s.bonus}</div></div>})}</div>
        <button onClick={()=>setStep('face')} style={{...btn(C),width:'100%',marginTop:14,padding:12,fontWeight:900}}>NEXT: CREATE MY FACE →</button>
      </div>}

      {step==='face'&&<div>
        <div style={{padding:14,border:'1px solid #00ccff55',borderRadius:10,background:'linear-gradient(135deg,rgba(0,204,255,.10),rgba(120,0,255,.08))',marginBottom:12}}>
          <b style={{color:'#9eeeff'}}>♀ BENNY • AVATAR GUIDE</b>
          <div style={{fontSize:12,lineHeight:1.5,marginTop:6}}>Best option: a short clip while you slowly turn front → left → right. You can still add side pictures afterward. One front photo works too. Back-of-head remains optional.</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:6,marginTop:9}}>{['VIDEO TURN = BEST','FRONT = GOOD','+ SIDE PICS = BETTER','BACK = OPTIONAL'].map(x=><div key={x} style={{fontSize:10,textAlign:'center',padding:7,border:'1px solid #00ccff33',borderRadius:6,color:'#9eeeff'}}>{x}</div>)}</div>
        </div>

        <div style={{padding:14,border:'1px solid #ffb00055',borderRadius:10,background:'#07111a',marginBottom:12}}>
          <b>🔒 VIDEO / FACE CONSENT</b>
          <p style={{...muted,lineHeight:1.5}}>I choose to use camera, video, or photos only to build my avatar. Video and live-camera frames are processed locally and deleted after fitting. No video recording is kept, no raw video is uploaded, no identity matching, fingerprints, emotion/protected-trait inference, biometric ads, sale, or general-model training.</p>
          <label style={check}><input type="checkbox" checked={privacyAccepted} onChange={e=>{setPrivacyAccepted(e.target.checked);setConsent(null)}}/> I consent to avatar-only face/geometry processing.</label>
          <label style={check}><input type="checkbox" checked={adultOrGuardianAuthorized} onChange={e=>{setAdultOrGuardianAuthorized(e.target.checked);setConsent(null)}}/> I am an adult or have legally authorized guardian approval.</label>
          <label style={{...check,color:'#9aa'}}><input type="checkbox" checked={saveRawPhotos} onChange={e=>{setSaveRawPhotos(e.target.checked);setConsent(null)}}/> Optional: save uploaded still photos. This never applies to video/live-camera frames.</label>
          <div style={{color:'#5fe5b0',fontSize:10,marginTop:8}}>LOCAL FIT • VIDEO DELETES AFTER PROCESSING • NO ID MATCH • NO FINGERPRINT</div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(125px,1fr))',gap:8,marginBottom:14}}>{[
          {id:'camera' as const,label:'📷 LIVE CAMERA',desc:'Capture one frame'},
          {id:'video' as const,label:'🎥 VIDEO CLIP',desc:'Front → left → right'},
          {id:'upload' as const,label:'🖼 PHOTOS',desc:'Front + optional sides'},
          {id:'skip' as const,label:'⏭ SKIP',desc:'Use default face'},
        ].map(m=><button key={m.id} onClick={()=>{setFaceMode(m.id);if(m.id==='camera')startCamera();else{stopCamera();if(m.id==='video'&&privacyAccepted&&adultOrGuardianAuthorized)videoInputRef.current?.click();if(m.id==='upload'&&privacyAccepted&&adultOrGuardianAuthorized)photoInputRef.current?.click()}}} style={{...btn(faceMode===m.id?C:'#555'),padding:11}}><b>{m.label}</b><div style={{fontSize:9,marginTop:3}}>{m.desc}</div></button>)}</div>

        <input ref={videoInputRef} type="file" accept="video/mp4,video/quicktime,video/webm,video/*" style={{display:'none'}} onChange={e=>{const f=e.target.files?.[0];if(f)handleVideoClip(f)}}/>
        <input ref={photoInputRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>{if(e.target.files?.length)handlePhotos(e.target.files)}}/>

        {faceMode==='camera'&&<div style={{marginBottom:12}}><div style={{position:'relative'}}><video ref={videoRef} autoPlay playsInline muted style={{width:'100%',maxHeight:300,background:'#000',borderRadius:9,border:'1px solid #00ccff55'}}/><div style={{position:'absolute',inset:'12px 22%',border:'2px solid #00ccffaa',borderRadius:'45%',pointerEvents:'none'}}/></div><button disabled={scanning} onClick={captureCameraFrame} style={{...btn('#00cc44'),width:'100%',marginTop:7,padding:10}}>📸 FIT FROM THIS FRAME</button></div>}
        {faceMode==='video'&&<div style={panel}><b>🎥 SHORT TURN VIDEO</b><p style={muted}>Use a short clip with your face visible. Slowly look forward, turn left, then right. TRYAMM samples a few local frames, keeps only derived avatar measurements/texture, then deletes the clip and temporary frames.</p><button onClick={()=>privacyAccepted&&adultOrGuardianAuthorized?videoInputRef.current?.click():store.setNotif('🔒 Accept consent first.')} style={{...btn(C),width:'100%'}}>CHOOSE VIDEO CLIP</button></div>}
        {faceMode==='upload'&&<div style={panel}><b>🖼 FRONT + SIDE PHOTOS</b><p style={muted}>Photo 1 = front. Photo 2 = optional side. Photo 3 = optional other side. You can add these even after a video scan.</p><button onClick={()=>privacyAccepted&&adultOrGuardianAuthorized?photoInputRef.current?.click():store.setNotif('🔒 Accept consent first.')} style={{...btn(C),width:'100%'}}>CHOOSE 1-3 PHOTOS</button></div>}
        {faceMode==='skip'&&<div style={panel}>Default face selected. No face/video processing is required.</div>}

        {scanning&&<div style={{...panel,color:C}}>⏳ {scanMsg||'Fitting avatar locally...'}</div>}
        {!scanning&&scanMsg&&<div style={{...panel,color:'#5fe5b0'}}>{scanMsg}</div>}
        {measuredViews.length>0&&<div style={{...panel,fontSize:11}}>Geometry sources: <b style={{color:C}}>{measuredViews.length}</b> angle{measuredViews.length>1?'s':''} analyzed • {measuredViews.filter(v=>v.landmarks).length} with face landmarks. Side angles refine the future rig/mesh fit.</div>}
        {photos.length>0&&<div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'10px 0'}}>{photos.map((u,i)=><div key={u} style={{textAlign:'center'}}><img src={u} alt={`avatar angle ${i+1}`} style={{width:72,height:72,objectFit:'cover',borderRadius:7,border:`2px solid ${i===0?C:'#333'}`}}/><div style={{fontSize:8,color:'#888'}}>{i===0?'FRONT':`SIDE ${i}`}</div></div>)}</div>}
        {(faceData||photos.length>0||measuredViews.length>0)&&<button onClick={discardCaptures} style={{...btn('#ff6677'),width:'100%',marginTop:8}}>🗑️ DELETE / DISCARD RAW CAPTURES</button>}

        <div style={{display:'flex',gap:9,marginTop:12}}><button onClick={()=>setStep('species')} style={btn('#666')}>← BACK</button><button onClick={()=>{stopCamera();setStep('preview')}} style={{...btn(C),flex:1,fontWeight:900}}>PREVIEW AVATAR →</button></div>
      </div>}

      {step==='preview'&&<div style={{textAlign:'center'}}>
        <p style={muted}>This derived avatar preview can remain while raw video/camera frames are deleted.</p>
        {previewCanvas&&<div style={{display:'flex',justifyContent:'center',margin:'18px 0'}}><canvas ref={el=>{if(el){el.width=220;el.height=220;el.getContext('2d')!.drawImage(previewCanvas,0,0,previewCanvas.width,previewCanvas.height,0,0,220,220)}}} style={{width:220,height:220,borderRadius:'50%',border:`3px solid ${CATEGORY_COLORS[species.category]}`,boxShadow:`0 0 25px ${CATEGORY_COLORS[species.category]}55`}}/></div>}
        <h2 style={{marginBottom:4}}>{store.player.name}</h2><div style={{color:CATEGORY_COLORS[species.category]}}>{species.emoji} {species.label}</div>
        <div style={{color:'#5fe5b0',fontSize:11,margin:'8px 0 18px'}}>RAW VIDEO/FRAME RETENTION: NONE AFTER FIT • DERIVED AVATAR USER-DELETABLE</div>
        <div style={{display:'flex',gap:9}}><button onClick={()=>setStep('face')} style={btn('#666')}>← BACK</button><button onClick={confirm} style={{...btn(CATEGORY_COLORS[species.category]),flex:1,fontWeight:900}}>✅ CONFIRM AVATAR</button></div>
      </div>}
    </div>
  </div>
}

const muted={color:'#8993a4',fontSize:12} as const
const check={display:'flex',gap:8,alignItems:'flex-start',fontSize:11,marginBottom:7,cursor:'pointer'} as const
const panel={padding:12,border:'1px solid #1d2a3a',borderRadius:8,background:'#060619',marginBottom:10} as const
function btn(color:string){return {background:`${color}15`,border:`1px solid ${color}88`,color,borderRadius:7,padding:'7px 11px',cursor:'pointer',fontFamily:'monospace'} as const}

function fileToDataUrl(file:File):Promise<string>{return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(r.error);r.readAsDataURL(file)})}
function loadImage(url:string):Promise<HTMLImageElement>{return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=url})}
function canvasToBlob(canvas:HTMLCanvasElement):Promise<Blob>{return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('frame encode failed')),'image/jpeg',.86))}
function waitEvent(target:HTMLMediaElement,event:string):Promise<void>{return new Promise((resolve,reject)=>{const ok=()=>{cleanup();resolve()};const bad=()=>{cleanup();reject(new Error(`media ${event} failed`))};const cleanup=()=>{target.removeEventListener(event,ok);target.removeEventListener('error',bad)};target.addEventListener(event,ok,{once:true});target.addEventListener('error',bad,{once:true})})}
async function seekVideo(video:HTMLVideoElement,time:number){if(Math.abs(video.currentTime-time)<.03)return;video.currentTime=Math.min(Math.max(time,0),Math.max((video.duration||time)-.02,0));await waitEvent(video,'seeked')}
function makeDerivedFaceTexture(img:HTMLImageElement,landmarks:FaceLandmarks|null,skin:string,hair:string){
  const c=document.createElement('canvas');c.width=256;c.height=256;const x=c.getContext('2d')!
  x.fillStyle=skin;x.fillRect(0,0,256,256)
  const box=landmarks?.faceBox
  x.save();x.beginPath();x.ellipse(128,132,94,112,0,0,Math.PI*2);x.clip()
  if(box)x.drawImage(img,Math.max(0,box.x-box.w*.18),Math.max(0,box.y-box.h*.20),box.w*1.36,box.h*1.42,28,18,200,220)
  else x.drawImage(img,0,0,img.naturalWidth||img.width,img.naturalHeight||img.height,18,18,220,220)
  x.restore();x.fillStyle=hair;x.globalAlpha=.12;x.fillRect(0,0,256,42);x.globalAlpha=1
  return c
}
