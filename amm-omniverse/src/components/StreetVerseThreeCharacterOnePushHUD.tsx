import {useEffect,useMemo,useState} from 'react'

type CastId='bj-stubbs'|'jacobie-stubbs'|'lateasia-monroe'
type Row={id:CastId;name:string;loaded:boolean;clips:number;source:string;movement:boolean;vehicle:boolean;mission:boolean;business:boolean;reel:boolean;returned:boolean;loopComplete:boolean}

const EMPTY:Record<CastId,Row>={
 'bj-stubbs':{id:'bj-stubbs',name:'BJ Stubbs',loaded:false,clips:0,source:'',movement:false,vehicle:false,mission:false,business:false,reel:false,returned:false,loopComplete:false},
 'jacobie-stubbs':{id:'jacobie-stubbs',name:'Jacobie Stubbs',loaded:false,clips:0,source:'',movement:false,vehicle:false,mission:false,business:false,reel:false,returned:false,loopComplete:false},
 'lateasia-monroe':{id:'lateasia-monroe',name:'LaTeasia Monroe',loaded:false,clips:0,source:'',movement:false,vehicle:false,mission:false,business:false,reel:false,returned:false,loopComplete:false},
}

function activeId():CastId{
 const p=new URLSearchParams(location.search)
 const c=p.get('character')||''
 return c.startsWith('jacobie')?'jacobie-stubbs':c.startsWith('lateasia')?'lateasia-monroe':'bj-stubbs'
}

export default function StreetVerseThreeCharacterOnePushHUD(){
 const [open,setOpen]=useState(()=>new URLSearchParams(location.search).get('accept')==='1')
 const [rows,setRows]=useState<Record<CastId,Row>>(()=>{
   try{
     const saved=JSON.parse(sessionStorage.getItem('tryamm.streetverse.three-cast-evidence.v1')||'null')
     return saved?{...EMPTY,...saved}:EMPTY
   }catch{return EMPTY}
 })
 const current=useMemo(()=>activeId(),[])
 useEffect(()=>{try{sessionStorage.setItem('tryamm.streetverse.three-cast-evidence.v1',JSON.stringify(rows))}catch{}},[rows])
 useEffect(()=>{
   const patch=(id:CastId,data:Partial<Row>)=>setRows(v=>({...v,[id]:{...v[id],...data}}))
   const latchCurrent=()=>{
     const root=document.querySelector<HTMLElement>('[data-streetverse-world-root="true"]')
     if(current==='bj-stubbs'&&root?.dataset.bjActiveVersion==='V15'&&root.dataset.bjLoadState==='ready'){
       patch('bj-stubbs',{loaded:true,source:'mounted-v15'})
     }
   }
   const onRecoveredMounted=(e:Event)=>{
     const d=(e as CustomEvent<any>).detail||{}
     if(d.mounted!==true)return
     if(d.id==='jacobie-stubbs'||d.id==='lateasia-monroe')patch(d.id,{loaded:true,clips:Array.isArray(d.clips)?d.clips.length:Number(d.clipCount||0),source:String(d.source||'mounted-recovered')})
   }
   const onBJ=(e:Event)=>{
     const d=(e as CustomEvent<any>).detail||{}
     patch('bj-stubbs',{loaded:true,clips:Number(d.animationCount||0),source:d.localImported?'device-local-owner':'preview'})
   }
   const onMove=()=>patch(current,{movement:true})
   const onVehicle=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};if(d.entered!==false)patch(current,{vehicle:true})}
   const onMission=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};if(d.missionId||d.id)patch(current,{mission:true})}
   const onBusiness=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};if(d.storeId||d.orderId||d.purchaseId)patch(current,{business:true})}
   const onReel=()=>patch(current,{reel:true})
   const onReturn=()=>patch(current,{returned:true})
   const onLoopComplete=(e:Event)=>{
     const d=(e as CustomEvent<any>).detail||{}
     const expectedName=current==='bj-stubbs'?'BJ Stubbs':current==='jacobie-stubbs'?'Jacobie Stubbs':'LaTeasia Monroe'
     const allDone=Array.isArray(d.steps)&&d.steps.length===7&&d.steps.every((s:any)=>s?.done===true)
     if(d.passed===true&&d.character===expectedName&&allDone)patch(current,{loaded:true,movement:true,vehicle:true,mission:true,business:true,reel:true,returned:true,loopComplete:true,source:rows[current]?.source||'vertical-slice-complete'})
   }
   addEventListener('tryamm:streetverse-recovered-playable-mounted',onRecoveredMounted)
   addEventListener('tryamm:streetverse-bj-visible-version',onBJ)
   addEventListener('tryamm:streetverse-bj-hero-mounted',onBJ)
   latchCurrent()
   const latchTimer=window.setInterval(latchCurrent,250)
   addEventListener('tryamm:streetverse-player-moved',onMove)
   addEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
   addEventListener('tryamm:streetverse-mission-complete',onMission)
   addEventListener('tryamm:streetverse-store-demo-purchase',onBusiness)
   addEventListener('tryamm:reel-capture-ready',onReel)
   addEventListener('tryamm:streetverse-reel-return',onReturn)
   addEventListener('tryamm:streetverse-vertical-slice-complete',onLoopComplete)
   return()=>{removeEventListener('tryamm:streetverse-recovered-playable-mounted',onRecoveredMounted);removeEventListener('tryamm:streetverse-bj-visible-version',onBJ);removeEventListener('tryamm:streetverse-bj-hero-mounted',onBJ);window.clearInterval(latchTimer);removeEventListener('tryamm:streetverse-player-moved',onMove);removeEventListener('tryamm:streetverse-vehicle-controlled',onVehicle);removeEventListener('tryamm:streetverse-mission-complete',onMission);removeEventListener('tryamm:streetverse-store-demo-purchase',onBusiness);removeEventListener('tryamm:reel-capture-ready',onReel);removeEventListener('tryamm:streetverse-reel-return',onReturn);removeEventListener('tryamm:streetverse-vertical-slice-complete',onLoopComplete)}
 },[current])
 const all=Object.values(rows)
 const summary={
   rigs:all.filter(r=>r.loaded).length,
   movement:all.filter(r=>r.movement).length,
   vehicle:all.filter(r=>r.vehicle).length,
   mission:all.filter(r=>r.mission).length,
   business:all.filter(r=>r.business).length,
   reel:all.filter(r=>r.reel).length,
   returned:all.filter(r=>r.returned).length,
   completeLoops:all.filter(r=>r.loopComplete).length,
 }
 const allThreeComplete=summary.completeLoops===3
 const exportAll=()=>{
   if(!allThreeComplete)return
   let freshRows=rows
   try{const saved=JSON.parse(sessionStorage.getItem('tryamm.streetverse.three-cast-evidence.v1')||'null');if(saved)freshRows={...EMPTY,...saved}}catch{}
   const freshAll=Object.values(freshRows)
   const freshSummary={rigs:freshAll.filter(r=>r.loaded).length,movement:freshAll.filter(r=>r.movement).length,vehicle:freshAll.filter(r=>r.vehicle).length,mission:freshAll.filter(r=>r.mission).length,business:freshAll.filter(r=>r.business).length,reel:freshAll.filter(r=>r.reel).length,returned:freshAll.filter(r=>r.returned).length,completeLoops:freshAll.filter(r=>r.loopComplete).length}
   const report={generatedAt:new Date().toISOString(),device:navigator.userAgent,route:location.href,currentCharacter:current,summary:freshSummary,characters:freshRows,finalVisualLikenessCertified:false,note:'Runtime evidence only. Final visual likeness and target-device acceptance require human review.'}
   const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'})
   const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='StreetVerse_Three_Character_One_Push_Report.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
 }
 return <aside style={{position:'fixed',right:'max(10px,env(safe-area-inset-right))',bottom:'calc(env(safe-area-inset-bottom) + 88px)',zIndex:52001,fontFamily:'system-ui,sans-serif'}}>
   <button type="button" onClick={()=>setOpen(v=>!v)} style={{minHeight:48,padding:'8px 12px',borderRadius:14,border:'2px solid #76e7ff',background:'#071b29ee',color:'#fff',fontWeight:950}}>3-CAST TEST {summary.rigs}/3</button>
   {open&&<div style={{marginTop:7,width:300,maxWidth:'calc(100vw - 20px)',display:'grid',gap:7,padding:10,borderRadius:14,border:'1px solid #37667a',background:'rgba(5,13,20,.97)',color:'#fff'}}>
     <strong>ONE-PUSH THREE-CHARACTER ACCEPTANCE</strong>
     {all.map(r=><div key={r.id} style={{padding:8,borderRadius:10,background:r.id===current?'#153447':'#0c1720',fontSize:11,lineHeight:1.45}}>
       <b>{r.name}</b> • {r.loaded?'RIG ✓':'RIG —'} • {r.clips} clips<br/>
       MOVE {r.movement?'✓':'—'} • VEHICLE {r.vehicle?'✓':'—'} • MISSION {r.mission?'✓':'—'}<br/>
       BUSINESS {r.business?'✓':'—'} • REEL {r.reel?'✓':'—'} • RETURN {r.returned?'✓':'—'}<br/>
       LOOP {r.loopComplete?'7/7 ✓':'—'}
     </div>)}
     <div style={{fontSize:11,color:'#b8c6d4'}}>For full 3/3 evidence, test each character once using the CHARACTER switcher. Evidence now survives character-route reloads during this browser session.</div>
     <button type="button" onClick={()=>{try{sessionStorage.removeItem('tryamm.streetverse.three-cast-evidence.v1')}catch{};setRows(EMPTY)}} style={{minHeight:42,borderRadius:10,border:'1px solid #6f7682',background:'#252933',color:'#fff',fontWeight:850}}>RESET 3-CAST SESSION</button>
     <button type="button" onClick={exportAll} disabled={!allThreeComplete} style={{minHeight:58,borderRadius:10,border:'2px solid '+(allThreeComplete?'#75e7b0':'#66717d'),background:allThreeComplete?'#123d2a':'#27313b',color:'#fff',fontWeight:900,opacity:allThreeComplete?1:.6}}>{allThreeComplete?'⬇ DOWNLOAD 3-CHARACTER FINAL REPORT':'🔒 REPORT LOCKED • FINISH BJ → JACOBIE → LATEASIA'}</button>
   </div>}
 </aside>
}
