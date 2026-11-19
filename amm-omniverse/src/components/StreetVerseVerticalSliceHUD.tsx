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
 const [open,setOpen]=useState(()=>new URLSearchParams(location.search).get('accept')==='1')
 const [done,setDone]=useState<Record<StepId,boolean>>({character:false,move:false,vehicle:false,mission:false,business:false,reel:false,return:false})
 const doneRef=useRef(done)
 const [autoRunning,setAutoRunning]=useState(false)
 const [autoStatus,setAutoStatus]=useState('READY • ONE BUTTON RUNS AND EXPORTS THE TEST')
 useEffect(()=>{doneRef.current=done},[done])
 const character=useMemo(()=>currentCharacter(),[])
 const mark=(id:StepId)=>setDone(v=>({...v,[id]:true}))
 useEffect(()=>{
   const onCharacter=(e?:Event)=>{
     if(character==='BJ Stubbs'){
       const d=(e as CustomEvent<any>|undefined)?.detail||{}
       if(e&&d.version&&String(d.version)!=='V15')return
     }
     mark('character')
   }
   const onMove=()=>mark('move')
   const onVehicle=(e:Event)=>{if((e as CustomEvent<any>).detail?.entered!==false)mark('vehicle')}
   const onMission=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};if(d.missionId||d.id)mark('mission')}
   const onBusiness=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};if(d.storeId||d.orderId||d.purchaseId)mark('business')}
   const onReel=()=>mark('reel')
   const onReturn=()=>mark('return')
   addEventListener('tryamm:streetverse-bj-visible-version',onCharacter)
   addEventListener('tryamm:streetverse-bj-hero-mounted',onCharacter)
   addEventListener('tryamm:streetverse-recovered-playable-ready',onCharacter)
   const latch=()=>{
     if(character==='BJ Stubbs'){
       const root=document.querySelector<HTMLElement>('[data-streetverse-world-root="true"]')
       if(root?.dataset.bjActiveVersion==='V15'&&root.dataset.bjLoadState==='ready')mark('character')
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
     removeEventListener('tryamm:streetverse-recovered-playable-ready',onCharacter)
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
 const triggerStep=(id:StepId)=>{
   if(id==='character'){
     const p=new URLSearchParams(location.search)
     if(p.get('character')?.startsWith('jacobie')||p.get('character')?.startsWith('lateasia'))dispatchEvent(new CustomEvent('tryamm:streetverse-character-retry',{detail:{character:p.get('character'),source:'full-auto-acceptance'}}))
     else dispatchEvent(new CustomEvent('tryamm:streetverse-bj-v15-preview',{detail:{source:'full-auto-acceptance'}}))
     return
   }
   if(id==='move'){
     dispatchEvent(new CustomEvent('tryamm:streetverse-mobile-movement',{detail:{up:true,source:'full-auto-acceptance'}}))
     window.setTimeout(()=>dispatchEvent(new CustomEvent('tryamm:streetverse-mobile-movement',{detail:{up:false,source:'full-auto-acceptance'}})),900)
     return
   }
   if(id==='vehicle'){dispatchEvent(new CustomEvent('tryamm:streetverse-acceptance-enter-vehicle',{detail:{source:'full-auto-acceptance'}}));return}
   if(id==='mission'){dispatchEvent(new CustomEvent('tryamm:streetverse-acceptance-complete-mission',{detail:{source:'full-auto-acceptance'}}));return}
   if(id==='business'){dispatchEvent(new CustomEvent('tryamm:streetverse-acceptance-business-purchase',{detail:{source:'full-auto-acceptance'}}));return}
   if(id==='reel'){dispatchEvent(new CustomEvent('tryamm:streetverse-acceptance-record-reel',{detail:{source:'full-auto-acceptance'}}));return}
   if(id==='return'){dispatchEvent(new CustomEvent('tryamm:streetverse-acceptance-return-to-game',{detail:{source:'full-auto-acceptance'}}));return}
 }
 const buildReport=()=>({
   generatedAt:new Date().toISOString(),character,route:location.href,
   steps:order.map(id=>({id,label:labels[id],done:Boolean(doneRef.current[id])})),
   passed:order.every(id=>Boolean(doneRef.current[id])),
   device:navigator.userAgent,
   note:'Auto-run event-backed vertical-slice evidence. Visual likeness and target-device rendering still require human review.'
 })
 const downloadReport=(report:ReturnType<typeof buildReport>)=>{
   const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'})
   const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='StreetVerse_ONE_PUSH_Auto_Report.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
 }
 const runFullTest=async()=>{
   if(autoRunning)return
   setAutoRunning(true)
   setAutoStatus('STARTING FULL TEST…')
   for(const id of order){
     if(doneRef.current[id])continue
     setAutoStatus('RUNNING • '+labels[id].toUpperCase())
     triggerStep(id)
     const timeout=id==='reel'?12000:id==='mission'?10000:8000
     const ok=await waitForStep(id,timeout)
     if(!ok){
       const report=buildReport()
       downloadReport(report)
       setAutoStatus('STOPPED • '+labels[id].toUpperCase()+' DID NOT VERIFY • REPORT EXPORTED')
       setAutoRunning(false)
       return
     }
   }
   const report=buildReport()
   downloadReport(report)
   setAutoStatus('PASS • 7/7 COMPLETE • REPORT EXPORTED')
   setAutoRunning(false)
 }
 const exportReport=()=>downloadReport(buildReport())
 return <aside style={{position:'fixed',left:'50%',transform:'translateX(-50%)',bottom:'calc(env(safe-area-inset-bottom) + 18px)',zIndex:53000,fontFamily:'system-ui,sans-serif'}}>
   <button type="button" onClick={()=>setOpen(v=>!v)} style={{minHeight:50,padding:'8px 14px',borderRadius:16,border:'2px solid #ffd66d',background:'#171406ee',color:'#fff',fontWeight:950}}>FIRST LOOP {count}/7</button>
   {open&&<div style={{marginBottom:7,width:320,maxWidth:'calc(100vw - 20px)',display:'grid',gap:7,padding:10,borderRadius:14,border:'1px solid #8a7137',background:'rgba(14,12,6,.97)',color:'#fff'}}>
     <strong>{character} • STREETVERSE FIRST COMPLETE LOOP</strong>
     {steps.map(s=><div key={s.id} style={{fontSize:12,padding:'5px 7px',borderRadius:8,background:s.done?'#153d28':'#222'}}>{s.done?'✓':'○'} {s.label}</div>)}
     <button type="button" onClick={runFullTest} disabled={autoRunning} aria-label="Run full StreetVerse acceptance test and export report automatically" style={{minHeight:72,borderRadius:16,border:'3px solid #9cffc2',background:autoRunning?'#314b3d':'#0f6b3f',color:'#fff',fontSize:18,fontWeight:1000,padding:'12px 16px',touchAction:'manipulation'}}>{autoRunning?'RUNNING FULL TEST…':'▶ RUN FULL TEST + AUTO EXPORT'}</button>
     <div role="status" aria-live="polite" style={{fontSize:13,fontWeight:900,padding:'8px 10px',borderRadius:10,background:'#101820',color:'#d7f8ff'}}>{autoStatus}</div>
     {next?<button type="button" onClick={doNext} disabled={autoRunning} style={{minHeight:50,borderRadius:10,border:'1px solid #ffe59a',background:'#5a4410',color:'#fff',fontWeight:900}}>MANUAL NEXT • {next.label.toUpperCase()}</button>:<div style={{fontWeight:950,color:'#b9ffcd'}}>✓ VERTICAL SLICE COMPLETE</div>}
     <button type="button" onClick={exportReport} style={{minHeight:50,borderRadius:10,border:'1px solid #75e7b0',background:'#123d2a',color:'#fff',fontWeight:900}}>EXPORT REPORT AGAIN</button>
   </div>}
 </aside>
}
