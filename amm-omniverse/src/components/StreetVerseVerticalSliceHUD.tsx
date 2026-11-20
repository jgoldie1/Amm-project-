import {useEffect,useMemo,useRef,useState} from 'react'

type StepId='character'|'move'|'vehicle'|'mission'|'business'|'reel'|'return'
type Step={id:StepId;label:string;done:boolean}
const order:StepId[]=['character','move','vehicle','mission','business','reel','return']
const labels:Record<StepId,string>={
 character:'Character loaded',
 move:'Move in world',
 vehicle:'Enter vehicle',
 mission:'Complete mission',
 business:'Enter / use business',
 reel:'Create HoloReel',
 return:'Return to world',
}

function currentCharacter(){
 const p=new URLSearchParams(location.search),c=p.get('character')||''
 return c.startsWith('jacobie')?'Jacobie Stubbs':c.startsWith('lateasia')?'LaTeasia Monroe':'BJ Stubbs'
}

export default function StreetVerseVerticalSliceHUD(){
 const autoMode=useMemo(()=>new URLSearchParams(location.search).get('autorun')==='1',[])
 const masterSequence=useMemo(()=>{const p=new URLSearchParams(location.search);return p.get('sequence')==='full'&&p.get('master')==='1'},[])
 const [open,setOpen]=useState(()=>new URLSearchParams(location.search).get('accept')==='1')
 const [done,setDone]=useState<Record<StepId,boolean>>({character:false,move:false,vehicle:false,mission:false,business:false,reel:false,return:false})
 const doneRef=useRef(done)
 const bjAnimationClipsRef=useRef(0)
 const [autoRunning,setAutoRunning]=useState(false)
 const [autoStatus,setAutoStatus]=useState('READY • ONE BUTTON RUNS AND EXPORTS THE TEST')
 const [lastReport,setLastReport]=useState<any>(null)
 const autoStartedRef=useRef(false)
 useEffect(()=>{doneRef.current=done},[done])
 useEffect(()=>{try{const raw=localStorage.getItem('tryamm.streetverse.last-auto-report.v1');if(raw)setLastReport(JSON.parse(raw))}catch{}},[])
 const character=useMemo(()=>currentCharacter(),[])
 const mark=(id:StepId)=>setDone(v=>({...v,[id]:true}))
 useEffect(()=>{
   const onCharacter=(e?:Event)=>{
     const d=(e as CustomEvent<any>|undefined)?.detail||{}
     if(character==='BJ Stubbs'){
       if(e&&d.version&&String(d.version)!=='V15')return
       // Accept only verified V15 mount evidence with actual animation clips.
       const clips=Number(d.skeletonAnimationCount??d.animationCount??0)
       if(Number.isFinite(clips)&&clips>0)bjAnimationClipsRef.current=clips
       const root=document.querySelector<HTMLElement>('[data-streetverse-world-root="true"]')
       if(root?.dataset.bjActiveVersion==='V15'&&root.dataset.bjLoadState==='ready'&&bjAnimationClipsRef.current>0)mark('character')
       return
     }
     const expected=character==='Jacobie Stubbs'?'jacobie-stubbs':'lateasia-monroe'
     if(d.mounted===true&&(d.id===expected||d.characterId===expected))mark('character')
   }
   const onMove=()=>mark('move')
   const onVehicle=(e:Event)=>{if((e as CustomEvent<any>).detail?.entered!==false)mark('vehicle')}
   const onMission=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};if(d.missionId||d.id)mark('mission')}
   const onBusiness=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};if(d.storeId||d.orderId||d.purchaseId)mark('business')}
   const onReel=()=>mark('reel')
   const onReturn=()=>mark('return')
   addEventListener('tryamm:streetverse-bj-visible-version',onCharacter)
   addEventListener('tryamm:streetverse-bj-hero-mounted',onCharacter)
   addEventListener('tryamm:streetverse-recovered-playable-mounted',onCharacter)
   const latch=()=>{
     if(character==='BJ Stubbs'){
       const root=document.querySelector<HTMLElement>('[data-streetverse-world-root="true"]')
       if(root?.dataset.bjActiveVersion==='V15'&&root.dataset.bjLoadState==='ready'&&bjAnimationClipsRef.current>0)mark('character')
     }
   }
   latch()
   const latchTimer=window.setInterval(latch,250)
   addEventListener('tryamm:streetverse-player-moved',onMove)
   addEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
   addEventListener('tryamm:streetverse-mission-complete',onMission)
   addEventListener('tryamm:streetverse-store-demo-purchase',onBusiness)
   addEventListener('tryamm:reel-capture-ready',onReel)
   addEventListener('tryamm:streetverse-reel-return',onReturn)
   return()=>{
     removeEventListener('tryamm:streetverse-bj-visible-version',onCharacter)
     removeEventListener('tryamm:streetverse-bj-hero-mounted',onCharacter)
     removeEventListener('tryamm:streetverse-recovered-playable-mounted',onCharacter)
     window.clearInterval(latchTimer)
     removeEventListener('tryamm:streetverse-player-moved',onMove)
     removeEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
     removeEventListener('tryamm:streetverse-mission-complete',onMission)
     removeEventListener('tryamm:streetverse-store-demo-purchase',onBusiness)
     removeEventListener('tryamm:reel-capture-ready',onReel)
     removeEventListener('tryamm:streetverse-reel-return',onReturn)
   }
 },[])
 const steps:Step[]=order.map(id=>({id,label:labels[id],done:done[id]}))
 const count=steps.filter(s=>s.done).length
 const next=steps.find(s=>!s.done)
 useEffect(()=>{
   if(count===steps.length)window.dispatchEvent(new CustomEvent('tryamm:streetverse-vertical-slice-complete',{detail:{passed:true,character,steps}}))
 },[count,character])
 const doNext=()=>{
   if(!next)return
   if(next.id==='character'){
     const p=new URLSearchParams(location.search)
     if(p.get('character')?.startsWith('jacobie')||p.get('character')?.startsWith('lateasia')){
       dispatchEvent(new CustomEvent('tryamm:streetverse-character-retry',{detail:{character:p.get('character'),source:'vertical-slice'}}))
     }else{
       dispatchEvent(new CustomEvent('tryamm:streetverse-bj-v15-preview',{detail:{source:'vertical-slice'}}))
     }
     return
   }
   if(next.id==='move'){
     dispatchEvent(new CustomEvent('tryamm:streetverse-mobile-movement',{detail:{up:true,source:'vertical-slice-one-push'}}))
     window.setTimeout(()=>dispatchEvent(new CustomEvent('tryamm:streetverse-mobile-movement',{detail:{up:false,source:'vertical-slice-one-push'}})),900)
     return
   }
   if(next.id==='vehicle'){
     dispatchEvent(new CustomEvent('tryamm:streetverse-acceptance-enter-vehicle',{detail:{source:'vertical-slice-one-push'}}))
     return
   }
   if(next.id==='mission'){
     dispatchEvent(new CustomEvent('tryamm:streetverse-acceptance-complete-mission',{detail:{source:'vertical-slice-one-push'}}))
     return
   }
   if(next.id==='business'){
     dispatchEvent(new CustomEvent('tryamm:streetverse-acceptance-business-purchase',{detail:{source:'vertical-slice-one-push'}}))
     return
   }
   if(next.id==='reel'){
     dispatchEvent(new CustomEvent('tryamm:streetverse-acceptance-record-reel',{detail:{source:'vertical-slice-one-push'}}))
     return
   }
   if(next.id==='return'){
     dispatchEvent(new CustomEvent('tryamm:streetverse-acceptance-return-to-game',{detail:{source:'vertical-slice-one-push'}}))
     return
   }
 }
 const waitForStep=(id:StepId,timeoutMs=8000)=>new Promise<boolean>(resolve=>{
   if(doneRef.current[id]){resolve(true);return}
   const started=Date.now()
   const timer=window.setInterval(()=>{
     if(doneRef.current[id]){window.clearInterval(timer);resolve(true);return}
     if(Date.now()-started>=timeoutMs){window.clearInterval(timer);resolve(false)}
   },120)
 })
 const triggerStep=(id:StepId,attempt=1)=>{
   if(id==='character'){
     const p=new URLSearchParams(location.search)
     if(p.get('character')?.startsWith('jacobie')||p.get('character')?.startsWith('lateasia'))dispatchEvent(new CustomEvent('tryamm:streetverse-character-retry',{detail:{character:p.get('character'),source:'full-auto-acceptance'}}))
     else dispatchEvent(new CustomEvent('tryamm:streetverse-bj-v15-preview',{detail:{source:'full-auto-acceptance'}}))
     return
   }
   if(id==='move'){
     const dirs=[{up:true},{right:true},{left:true},{down:true}]
     const dir=dirs[(Math.max(1,attempt)-1)%dirs.length]
     let issued=false
     const issueMotion=()=>{
       if(issued)return
       issued=true
       window.removeEventListener('tryamm:streetverse-acceptance-spawn-ready',onSpawn)
       dispatchEvent(new CustomEvent('tryamm:streetverse-mobile-movement',{detail:{...dir,source:'full-auto-acceptance',attempt}}))
       window.setTimeout(()=>dispatchEvent(new CustomEvent('tryamm:streetverse-mobile-movement',{detail:{up:false,down:false,left:false,right:false,source:'full-auto-acceptance',attempt}})),1800)
     }
     const onSpawn=()=>issueMotion()
     window.addEventListener('tryamm:streetverse-acceptance-spawn-ready',onSpawn,{once:true})
     dispatchEvent(new CustomEvent('tryamm:streetverse-acceptance-safe-spawn',{detail:{source:'full-auto-acceptance',character}}))
     // A scene with no spawn acknowledgment still gets a measured movement attempt.
     window.setTimeout(issueMotion,1100)
     return
   }
   if(id==='vehicle'){dispatchEvent(new CustomEvent('tryamm:streetverse-acceptance-enter-vehicle',{detail:{source:'full-auto-acceptance'}}));return}
   if(id==='mission'){dispatchEvent(new CustomEvent('tryamm:streetverse-acceptance-complete-mission',{detail:{source:'full-auto-acceptance'}}));return}
   if(id==='business'){dispatchEvent(new CustomEvent('tryamm:streetverse-acceptance-business-purchase',{detail:{source:'full-auto-acceptance'}}));return}
   if(id==='reel'){dispatchEvent(new CustomEvent('tryamm:streetverse-acceptance-record-reel',{detail:{source:'full-auto-acceptance'}}));return}
   if(id==='return'){dispatchEvent(new CustomEvent('tryamm:streetverse-acceptance-return-to-game',{detail:{source:'full-auto-acceptance'}}));return}
 }
 const persistThreeCastEvidence=(report:any)=>{
   const id=character==='BJ Stubbs'?'bj-stubbs':character==='Jacobie Stubbs'?'jacobie-stubbs':'lateasia-monroe'
   try{
     const saved=JSON.parse(sessionStorage.getItem('tryamm.streetverse.three-cast-evidence.v1')||'{}')||{}
     const byId=Object.fromEntries((report.steps||[]).map((s:any)=>[s.id,Boolean(s.done)]))
     saved[id]={...(saved[id]||{}),id,name:character,loaded:Boolean(byId.character),movement:Boolean(byId.move),vehicle:Boolean(byId.vehicle),mission:Boolean(byId.mission),business:Boolean(byId.business),reel:Boolean(byId.reel),returned:Boolean(byId.return),loopComplete:Boolean(report.passed),source:(saved[id]||{}).source||'vertical-slice-report',clips:character==='BJ Stubbs'?bjAnimationClipsRef.current:Number((saved[id]||{}).clips||0)}
     sessionStorage.setItem('tryamm.streetverse.three-cast-evidence.v1',JSON.stringify(saved))
   }catch{}
 }
 const buildReport=()=>({
   generatedAt:new Date().toISOString(),character,route:location.href,
   steps:order.map(id=>({id,label:labels[id],done:Boolean(doneRef.current[id])})),
   passed:order.every(id=>Boolean(doneRef.current[id]))&&(character!=='BJ Stubbs'||bjAnimationClipsRef.current>0),
   bjAnimationClips:character==='BJ Stubbs'?bjAnimationClipsRef.current:undefined,
   device:navigator.userAgent,
   note:'Auto-run event-backed vertical-slice evidence. Visual likeness and target-device rendering still require human review.'
 })
 const downloadReport=(report:ReturnType<typeof buildReport>,shouldDownload=true)=>{
   try{localStorage.setItem('tryamm.streetverse.last-auto-report.v1',JSON.stringify(report))}catch{}
   setLastReport(report)
   if(!shouldDownload)return
   const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'})
   const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='StreetVerse_ONE_PUSH_Auto_Report.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
 }
 const runFullTest=async()=>{
   if(autoRunning)return
   setAutoRunning(true)
   try{sessionStorage.removeItem('tryamm.streetverse.acceptance-terminal-failure.v1')}catch{}
   setAutoStatus('STARTING FULL TEST…')
   for(const id of order){
     if(doneRef.current[id])continue
     const maxAttempts=id==='character'?2:3
     let ok=false
     for(let attempt=1;attempt<=maxAttempts&&!ok;attempt++){
       setAutoStatus((id==='character'?'LOADING / VERIFYING • '+character.toUpperCase()+' RIG':'RUNNING • '+labels[id].toUpperCase())+' • TRY '+attempt+'/'+maxAttempts)
       triggerStep(id,attempt)
       const timeout=id==='character'?30000:id==='reel'?9000:id==='mission'?8000:6500
       ok=await waitForStep(id,timeout)
       if(!ok&&attempt<maxAttempts)await new Promise(resolve=>window.setTimeout(resolve,700))
     }
     if(!ok){
       const report=buildReport()
       persistThreeCastEvidence(report)
       downloadReport(report,!masterSequence)
       const failure={...report,failedStep:id,failedLabel:labels[id]}
       try{sessionStorage.setItem('tryamm.streetverse.acceptance-terminal-failure.v1',JSON.stringify(failure))}catch{}
       window.dispatchEvent(new CustomEvent('tryamm:streetverse-vertical-slice-failed',{detail:failure}))
       setAutoStatus('STOPPED • '+labels[id].toUpperCase()+' DID NOT VERIFY • REPORT EXPORTED')
       setAutoRunning(false)
       return
     }
   }
   const report=buildReport()
   persistThreeCastEvidence(report)
   if(!report.passed){
     const failure={...report,failedStep:'character',failedLabel:'BJ V15 animation clips not verified'}
     try{sessionStorage.setItem('tryamm.streetverse.acceptance-terminal-failure.v1',JSON.stringify(failure))}catch{}
     window.dispatchEvent(new CustomEvent('tryamm:streetverse-vertical-slice-failed',{detail:failure}))
     downloadReport(report,!masterSequence)
     setAutoStatus('STOPPED • BJ V15 ANIMATIONS NOT VERIFIED')
     setAutoRunning(false)
     return
   }
   try{sessionStorage.removeItem('tryamm.streetverse.acceptance-terminal-failure.v1')}catch{}
   downloadReport(report,!masterSequence)
   setAutoStatus(masterSequence?'PASS • 7/7 COMPLETE • CONTINUING MASTER TEST…':'PASS • 7/7 COMPLETE • REPORT EXPORTED')
   setAutoRunning(false)
 }
 useEffect(()=>{
   const p=new URLSearchParams(location.search)
   if(p.get('autorun')!=='1'||autoStartedRef.current)return
   autoStartedRef.current=true
   const timer=window.setTimeout(()=>void runFullTest(),1200)
   return()=>window.clearTimeout(timer)
 },[])
 const exportReport=()=>downloadReport(buildReport())
 return <aside style={{position:'fixed',left:'50%',transform:'translateX(-50%)',bottom:'calc(env(safe-area-inset-bottom) + 18px)',zIndex:53000,fontFamily:'system-ui,sans-serif'}}>
   {!autoMode&&<button type="button" onClick={()=>setOpen(v=>!v)} style={{minHeight:50,padding:'8px 14px',borderRadius:16,border:'2px solid #ffd66d',background:'#171406ee',color:'#fff',fontWeight:950}}>FIRST LOOP {count}/7</button>}
   {(open||autoMode)&&<div style={{marginBottom:7,width:340,maxWidth:'calc(100vw - 20px)',display:'grid',gap:8,padding:12,borderRadius:16,border:'2px solid #8a7137',background:'rgba(14,12,6,.97)',color:'#fff'}}>
     <strong style={{fontSize:16}}>{character} • {autoMode?'AUTO ACCEPTANCE':'STREETVERSE FIRST COMPLETE LOOP'}</strong>
     <div role="status" aria-live="polite" style={{fontSize:14,fontWeight:950,padding:'10px 12px',borderRadius:10,background:'#101820',color:'#d7f8ff'}}>{autoStatus}</div>
     {steps.map(s=><div key={s.id} style={{fontSize:13,padding:'7px 9px',borderRadius:9,background:s.done?'#153d28':'#222'}}>{s.done?'✓':'○'} {s.label}</div>)}
     {lastReport&&<div style={{padding:'10px 12px',borderRadius:12,border:'1px solid #75e7b0',background:lastReport.passed?'#103e29':'#451c1c',fontWeight:950}}>
       LAST REPORT • {lastReport.passed?'PASS 7/7':'STOPPED '+(lastReport.steps?.filter((s:any)=>s.done).length||0)+'/7'}
     </div>}
     {!autoMode&&<>
       <button type="button" onClick={runFullTest} disabled={autoRunning} aria-label="Run full StreetVerse acceptance test and export report automatically" style={{minHeight:72,borderRadius:16,border:'3px solid #9cffc2',background:autoRunning?'#314b3d':'#0f6b3f',color:'#fff',fontSize:18,fontWeight:1000,padding:'12px 16px',touchAction:'manipulation'}}>{autoRunning?'RUNNING FULL TEST…':'▶ RUN FULL TEST + AUTO EXPORT'}</button>
       {next?<button type="button" onClick={doNext} disabled={autoRunning} style={{minHeight:50,borderRadius:10,border:'1px solid #ffe59a',background:'#5a4410',color:'#fff',fontWeight:900}}>MANUAL NEXT • {next.label.toUpperCase()}</button>:<div style={{fontWeight:950,color:'#b9ffcd'}}>✓ VERTICAL SLICE COMPLETE</div>}
       <button type="button" onClick={exportReport} style={{minHeight:50,borderRadius:10,border:'1px solid #75e7b0',background:'#123d2a',color:'#fff',fontWeight:900}}>EXPORT REPORT AGAIN</button>
     </>}
   </div>}
 </aside>
}
