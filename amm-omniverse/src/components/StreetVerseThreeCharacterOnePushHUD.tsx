import {useEffect,useMemo,useState} from 'react'

type CastId='bj-stubbs'|'jacobie-stubbs'|'lateasia-monroe'
type Row={id:CastId;name:string;loaded:boolean;clips:number;source:string;movement:boolean;vehicle:boolean;mission:boolean;reel:boolean}

const EMPTY:Record<CastId,Row>={
 'bj-stubbs':{id:'bj-stubbs',name:'BJ Stubbs',loaded:false,clips:0,source:'',movement:false,vehicle:false,mission:false,reel:false},
 'jacobie-stubbs':{id:'jacobie-stubbs',name:'Jacobie Stubbs',loaded:false,clips:0,source:'',movement:false,vehicle:false,mission:false,reel:false},
 'lateasia-monroe':{id:'lateasia-monroe',name:'LaTeasia Monroe',loaded:false,clips:0,source:'',movement:false,vehicle:false,mission:false,reel:false},
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
   const onRecovered=(e:Event)=>{
     const d=(e as CustomEvent<any>).detail||{}
     if(d.id==='jacobie-stubbs'||d.id==='lateasia-monroe')patch(d.id,{loaded:true,clips:Array.isArray(d.clips)?d.clips.length:Number(d.clipCount||0),source:String(d.source||'recovered')})
   }
   const onBJ=(e:Event)=>{
     const d=(e as CustomEvent<any>).detail||{}
     patch('bj-stubbs',{loaded:true,clips:Number(d.animationCount||0),source:d.localImported?'device-local-owner':'preview'})
   }
   const onMove=()=>patch(current,{movement:true})
   const onVehicle=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};if(d.entered!==false)patch(current,{vehicle:true})}
   const onMission=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};if(d.missionId||d.id)patch(current,{mission:true})}
   const onReel=()=>patch(current,{reel:true})
   addEventListener('tryamm:streetverse-recovered-playable-ready',onRecovered)
   addEventListener('tryamm:streetverse-bj-visible-version',onBJ)
   addEventListener('tryamm:streetverse-player-moved',onMove)
   addEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
   addEventListener('tryamm:streetverse-mission-complete',onMission)
   addEventListener('tryamm:reel-capture-ready',onReel)
   return()=>{removeEventListener('tryamm:streetverse-recovered-playable-ready',onRecovered);removeEventListener('tryamm:streetverse-bj-visible-version',onBJ);removeEventListener('tryamm:streetverse-player-moved',onMove);removeEventListener('tryamm:streetverse-vehicle-controlled',onVehicle);removeEventListener('tryamm:streetverse-mission-complete',onMission);removeEventListener('tryamm:reel-capture-ready',onReel)}
 },[current])
 const all=Object.values(rows)
 const summary={
   rigs:all.filter(r=>r.loaded).length,
   movement:all.filter(r=>r.movement).length,
   vehicle:all.filter(r=>r.vehicle).length,
   mission:all.filter(r=>r.mission).length,
   reel:all.filter(r=>r.reel).length,
 }
 const exportAll=()=>{
   const report={generatedAt:new Date().toISOString(),device:navigator.userAgent,route:location.href,currentCharacter:current,summary,characters:rows,finalVisualLikenessCertified:false,note:'Runtime evidence only. Final visual likeness and target-device acceptance require human review.'}
   const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'})
   const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='StreetVerse_Three_Character_One_Push_Report.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
 }
 return <aside style={{position:'fixed',right:'max(10px,env(safe-area-inset-right))',bottom:'calc(env(safe-area-inset-bottom) + 88px)',zIndex:52001,fontFamily:'system-ui,sans-serif'}}>
   <button type="button" onClick={()=>setOpen(v=>!v)} style={{minHeight:48,padding:'8px 12px',borderRadius:14,border:'2px solid #76e7ff',background:'#071b29ee',color:'#fff',fontWeight:950}}>3-CAST TEST {summary.rigs}/3</button>
   {open&&<div style={{marginTop:7,width:300,maxWidth:'calc(100vw - 20px)',display:'grid',gap:7,padding:10,borderRadius:14,border:'1px solid #37667a',background:'rgba(5,13,20,.97)',color:'#fff'}}>
     <strong>ONE-PUSH THREE-CHARACTER ACCEPTANCE</strong>
     {all.map(r=><div key={r.id} style={{padding:8,borderRadius:10,background:r.id===current?'#153447':'#0c1720',fontSize:11,lineHeight:1.45}}>
       <b>{r.name}</b> • {r.loaded?'RIG ✓':'RIG —'} • {r.clips} clips<br/>
       MOVE {r.movement?'✓':'—'} • VEHICLE {r.vehicle?'✓':'—'} • MISSION {r.mission?'✓':'—'} • REEL {r.reel?'✓':'—'}
     </div>)}
     <div style={{fontSize:11,color:'#b8c6d4'}}>For full 3/3 evidence, test each character once using the CHARACTER switcher. Evidence now survives character-route reloads during this browser session.</div>
     <button type="button" onClick={()=>{try{sessionStorage.removeItem('tryamm.streetverse.three-cast-evidence.v1')}catch{};setRows(EMPTY)}} style={{minHeight:42,borderRadius:10,border:'1px solid #6f7682',background:'#252933',color:'#fff',fontWeight:850}}>RESET 3-CAST SESSION</button>
     <button type="button" onClick={exportAll} style={{minHeight:46,borderRadius:10,border:'1px solid #75e7b0',background:'#123d2a',color:'#fff',fontWeight:900}}>EXPORT COMBINED REPORT</button>
   </div>}
 </aside>
}
