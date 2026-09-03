import {useEffect,useRef,useState} from 'react'

type DialogueDetail={missionId?:string;speaker?:string;text?:string;objective?:string;step?:number}
type DialogueState={speaker:string;text:string;objective:string;missionId:string;step:number}|null

export default function StreetVerseDialogueHUD(){
 const [dialogue,setDialogue]=useState<DialogueState>(null)
 const [visible,setVisible]=useState(false)
 const timer=useRef<number|undefined>(undefined)
 useEffect(()=>{
  const onDialogue=(event:Event)=>{
   const d=(event as CustomEvent<DialogueDetail>).detail||{}
   if(!d.text)return
   if(timer.current)window.clearTimeout(timer.current)
   setDialogue({speaker:d.speaker||'StreetVerse',text:d.text,objective:d.objective||'',missionId:d.missionId||'',step:Number(d.step||0)})
   setVisible(true)
   timer.current=window.setTimeout(()=>setVisible(false),9000)
  }
  const onMissionComplete=()=>{if(timer.current)window.clearTimeout(timer.current);timer.current=window.setTimeout(()=>setVisible(false),1200)}
  addEventListener('tryamm:streetverse-dialogue',onDialogue)
  addEventListener('tryamm:streetverse-mission-complete',onMissionComplete)
  return()=>{removeEventListener('tryamm:streetverse-dialogue',onDialogue);removeEventListener('tryamm:streetverse-mission-complete',onMissionComplete);if(timer.current)window.clearTimeout(timer.current)}
 },[])
 if(!dialogue||!visible)return null
 return <div role="status" aria-live="polite" style={{position:'fixed',left:'50%',bottom:102,transform:'translateX(-50%)',zIndex:17020,width:'min(680px,calc(100vw - 28px))',padding:'14px 16px',borderRadius:16,background:'linear-gradient(180deg,rgba(7,10,20,.96),rgba(12,8,23,.96))',border:'1px solid rgba(255,116,200,.62)',boxShadow:'0 18px 60px rgba(0,0,0,.72)',color:'#fff',fontFamily:'system-ui',backdropFilter:'blur(8px)'}}>
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}><strong style={{color:'#ffd36b',fontSize:13,letterSpacing:'.04em'}}>{dialogue.speaker.toUpperCase()}</strong><span style={{fontSize:10,opacity:.58}}>MISSION DIALOGUE</span></div>
  <div style={{fontSize:15,lineHeight:1.45,fontWeight:750,marginTop:7}}>{dialogue.text}</div>
  {dialogue.objective&&<div style={{marginTop:9,paddingTop:8,borderTop:'1px solid rgba(255,255,255,.12)',fontSize:11,color:'#bfefff'}}><b>OBJECTIVE:</b> {dialogue.objective}</div>}
  <button onClick={()=>setVisible(false)} style={{position:'absolute',right:8,top:8,width:30,height:30,borderRadius:999,border:'1px solid rgba(255,255,255,.2)',background:'rgba(0,0,0,.25)',color:'#fff',cursor:'pointer',fontWeight:900}} aria-label="Close dialogue">×</button>
 </div>
}
