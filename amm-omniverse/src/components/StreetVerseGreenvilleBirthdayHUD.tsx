import {useMemo,useState} from 'react'
import {GREENVILLE_CAMPUS_ZONES} from '../runtime/StreetVerseGreenvilleCampusBirthdayRuntime'

const STAGES=[
 {id:'GV01',title:'ARRIVE AT GREENVILLE',objective:'Begin Jacobie’s birthday CampusVerse chapter at the campus welcome zone.'},
 {id:'GV02',title:'MOVE INTO RESIDENCE HALL',objective:'Visit Jacobie’s housing checkpoint and enter the CampusVerse residence hall.'},
 {id:'GV03',title:'SCHOOL + STUDENT UNION',objective:'Check in at Academic Hall and the Student Union for the school-life mission.'},
 {id:'GV04',title:'ATHLETICS + SPORTS',objective:'Reach the athletics field, complete the sports checkpoint, and visit the bleachers.'},
 {id:'GV05',title:'BIRTHDAY PARTY',objective:'Go to Jacobie’s birthday pavilion with balloons, cake, and party stage.'},
 {id:'GV06',title:'BIRTHDAY HOLOREEL',objective:'Record Jacobie’s birthday HoloReel on the campus stage and finish the chapter.'},
] as const

export default function StreetVerseGreenvilleBirthdayHUD(){
 const [index,setIndex]=useState(0)
 const [open,setOpen]=useState(true)
 const stage=STAGES[index]||null
 const complete=()=>{
   if(!stage)return
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:{missionId:stage.id,title:stage.title,world:'greenville',characterId:'jacobie-stubbs',source:'greenville-birthday'}}))
   if(stage.id==='GV06')window.dispatchEvent(new CustomEvent('tryamm:streetverse-reel-open',{detail:{source:'jacobie-greenville-birthday',characterId:'jacobie-stubbs',world:'greenville'}}))
   setIndex(i=>Math.min(STAGES.length,i+1))
 }
 const progress=useMemo(()=>Math.round((Math.min(index,STAGES.length)/STAGES.length)*100),[index])
 return <aside data-greenville-birthday="true" style={{position:'fixed',left:'max(10px,env(safe-area-inset-left))',top:'calc(env(safe-area-inset-top) + 62px)',zIndex:48000,width:open?290:'auto',maxWidth:'calc(100vw - 20px)',border:'1px solid #f1c85b',borderRadius:16,background:'rgba(13,22,35,.96)',color:'#fff',boxShadow:'0 16px 48px #000a',fontFamily:'system-ui,sans-serif'}}>
   <button type="button" onClick={()=>setOpen(v=>!v)} style={{width:'100%',minHeight:50,padding:'9px 12px',border:0,borderRadius:16,background:'linear-gradient(135deg,#173e68,#5e2b84)',color:'#fff',fontWeight:950,textAlign:'left'}}>🎂 JACOBIE • GREENVILLE {progress}%</button>
   {open&&<div style={{display:'grid',gap:9,padding:12}}>
     <div style={{fontSize:11,fontWeight:900,color:'#ffe89d'}}>GREENVILLE UNIVERSITY • CAMPUSVERSE</div>
     {stage?<><strong style={{fontSize:16}}>{stage.title}</strong><span style={{fontSize:12,lineHeight:1.4,color:'#cbd5e8'}}>{stage.objective}</span>
       <button type="button" onClick={()=>{
         window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail:{missionId:stage.id,title:stage.title,objective:stage.objective,world:'greenville',characterId:'jacobie-stubbs',source:'greenville-birthday'}}))
         const zone=GREENVILLE_CAMPUS_ZONES.find(z=>z.id===stage.id)
         window.dispatchEvent(new CustomEvent('tryamm:city-navigation-target',{detail:{type:'mission',missionId:stage.id,label:stage.title,world:'greenville',x:zone?.x,z:zone?.z}}))
       }} style={{minHeight:48,borderRadius:12,border:'1px solid #7fd8ff',background:'#0f3553',color:'#fff',fontWeight:900}}>START / FOCUS</button>
       <button type="button" onClick={complete} style={{minHeight:48,borderRadius:12,border:'1px solid #a9ffc6',background:'#18583a',color:'#fff',fontWeight:900}}>✓ COMPLETE CHECKPOINT</button>
     </>:<><strong>🎉 BIRTHDAY CHAPTER COMPLETE</strong><span style={{fontSize:12,color:'#cbd5e8'}}>Jacobie’s Greenville CampusVerse chapter is complete. Continue to HoloReel, Chicago, or another Verse.</span>
       <button type="button" onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-reel-open',{detail:{source:'jacobie-greenville-birthday-complete',characterId:'jacobie-stubbs'}}))} style={{minHeight:48,borderRadius:12,border:'1px solid #ffb6e8',background:'#512144',color:'#fff',fontWeight:900}}>🎬 OPEN HOLOREEL</button></>}
     <small style={{color:'#8293ad'}}>Residence Hall • Academic Hall • Student Union • Athletics • Birthday Pavilion • HoloReel Stage</small>
   </div>}
 </aside>
}
