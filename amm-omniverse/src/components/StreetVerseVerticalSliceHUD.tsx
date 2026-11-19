import {useEffect,useMemo,useState} from 'react'

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
 const character=useMemo(()=>currentCharacter(),[])
 const mark=(id:StepId)=>setDone(v=>({...v,[id]:true}))
 useEffect(()=>{
   const onCharacter=()=>mark('character')
   const onMove=()=>mark('move')
   const onVehicle=(e:Event)=>{if((e as CustomEvent<any>).detail?.entered!==false)mark('vehicle')}
   const onMission=()=>mark('mission')
   const onBusiness=()=>mark('business')
   const onReel=()=>mark('reel')
   const onReturn=()=>mark('return')
   addEventListener('tryamm:streetverse-bj-visible-version',onCharacter)
   addEventListener('tryamm:streetverse-recovered-playable-ready',onCharacter)
   addEventListener('tryamm:streetverse-player-moved',onMove)
   addEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
   addEventListener('tryamm:streetverse-mission-complete',onMission)
   addEventListener('tryamm:streetverse-open-shopping',onBusiness)
   addEventListener('tryamm:streetverse-store-demo-purchase',onBusiness)
   addEventListener('tryamm:reel-capture-ready',onReel)
   addEventListener('tryamm:streetverse-reel-return',onReturn)
   return()=>{
     removeEventListener('tryamm:streetverse-bj-visible-version',onCharacter)
     removeEventListener('tryamm:streetverse-recovered-playable-ready',onCharacter)
     removeEventListener('tryamm:streetverse-player-moved',onMove)
     removeEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
     removeEventListener('tryamm:streetverse-mission-complete',onMission)
     removeEventListener('tryamm:streetverse-open-shopping',onBusiness)
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
     if(p.get('character')?.startsWith('jacobie')||p.get('character')?.startsWith('lateasia')) location.reload()
     else dispatchEvent(new CustomEvent('tryamm:streetverse-bj-v15-preview',{detail:{source:'vertical-slice'}}))
     return
   }
   if(next.id==='move'){dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'Use the joystick to move your character.'}}));return}
   if(next.id==='vehicle'){dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{entered:true,source:'vertical-slice'}}));return}
   if(next.id==='mission'){dispatchEvent(new CustomEvent('tryamm:streetverse-first-journey-start',{detail:{source:'vertical-slice'}}));return}
   if(next.id==='business'){
     const button=document.querySelector<HTMLButtonElement>('#sv-store-open')||document.querySelector<HTMLButtonElement>('[aria-expanded][aria-label*="SHOPPING"]')
     if(button)button.click()
     else dispatchEvent(new CustomEvent('tryamm:streetverse-open-shopping',{detail:{storeId:'creator',source:'vertical-slice'}}))
     return
   }
   if(next.id==='reel'){
     const button=document.querySelector<HTMLButtonElement>('[aria-label="Start StreetVerse Reel recording"]')
     if(button)button.click()
     else dispatchEvent(new CustomEvent('tryamm:reel-capture-toggle',{detail:{source:'vertical-slice'}}))
     return
   }
   if(next.id==='return'){
     dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'Tap BACK TO GAME on the Reel-ready screen to finish the loop.'}}))
     return
   }
 }
 const exportReport=()=>{
   const report={generatedAt:new Date().toISOString(),character,route:location.href,steps,passed:count===steps.length,device:navigator.userAgent,note:'Event-backed vertical-slice evidence; visual likeness and target-device acceptance still require human review.'}
   const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'})
   const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='StreetVerse_Vertical_Slice_Report.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
 }
 return <aside style={{position:'fixed',left:'50%',transform:'translateX(-50%)',bottom:'calc(env(safe-area-inset-bottom) + 18px)',zIndex:53000,fontFamily:'system-ui,sans-serif'}}>
   <button type="button" onClick={()=>setOpen(v=>!v)} style={{minHeight:50,padding:'8px 14px',borderRadius:16,border:'2px solid #ffd66d',background:'#171406ee',color:'#fff',fontWeight:950}}>FIRST LOOP {count}/7</button>
   {open&&<div style={{marginBottom:7,width:320,maxWidth:'calc(100vw - 20px)',display:'grid',gap:7,padding:10,borderRadius:14,border:'1px solid #8a7137',background:'rgba(14,12,6,.97)',color:'#fff'}}>
     <strong>{character} • STREETVERSE FIRST COMPLETE LOOP</strong>
     {steps.map(s=><div key={s.id} style={{fontSize:12,padding:'5px 7px',borderRadius:8,background:s.done?'#153d28':'#222'}}>{s.done?'✓':'○'} {s.label}</div>)}
     {next?<button type="button" onClick={doNext} style={{minHeight:48,borderRadius:10,border:'1px solid #ffe59a',background:'#5a4410',color:'#fff',fontWeight:900}}>NEXT • {next.label.toUpperCase()}</button>:<div style={{fontWeight:950,color:'#b9ffcd'}}>✓ VERTICAL SLICE COMPLETE</div>}
     <button type="button" onClick={exportReport} style={{minHeight:44,borderRadius:10,border:'1px solid #75e7b0',background:'#123d2a',color:'#fff',fontWeight:900}}>EXPORT FIRST-LOOP REPORT</button>
   </div>}
 </aside>
}
