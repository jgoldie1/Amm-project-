import {useEffect,useState} from 'react'

type Character='bj'|'jacobie'|'lateasia'
type Evidence={id:string;name:string;loaded:boolean;clips:number;source?:string;movement?:boolean}

const LABELS:Record<Character,string>={bj:'BJ',jacobie:'JACOBIE',lateasia:'LATEASIA'}

function targetUrl(character:Character){
 const base='/streetverse?core=1'
 if(character==='bj')return base+'&bj=v15'
 if(character==='jacobie')return base+'&character=jacobie&world=greenville'
 return base+'&character=lateasia'
}

export default function StreetVerseCharacterSwitchHUD(){
 const params=new URLSearchParams(window.location.search)
 const initial:Character=params.get('character')?.startsWith('jacobie')?'jacobie':params.get('character')?.startsWith('lateasia')?'lateasia':'bj'
 const [open,setOpen]=useState(false)
 const [active]=useState<Character>(initial)
 const [evidence,setEvidence]=useState<Record<string,Evidence>>({})
 const [moved,setMoved]=useState(false)

 useEffect(()=>{
   const onRecovered=(event:Event)=>{
     const d=(event as CustomEvent<any>).detail||{}
     setEvidence(v=>({...v,[d.id]:{id:d.id,name:d.name||d.id,loaded:true,clips:Array.isArray(d.clips)?d.clips.length:Number(d.clipCount||0),source:d.source}}))
   }
   const onBJ=(event:Event)=>{
     const d=(event as CustomEvent<any>).detail||{}
     setEvidence(v=>({...v,['bj-stubbs']:{id:'bj-stubbs',name:'BJ Stubbs',loaded:true,clips:Number(d.animationCount||0),source:d.localImported?'device-local-owner':'preview'}}))
   }
   const onMove=()=>setMoved(true)
   addEventListener('tryamm:streetverse-recovered-playable-ready',onRecovered)
   addEventListener('tryamm:streetverse-bj-visible-version',onBJ)
   addEventListener('tryamm:streetverse-mobile-movement',onMove)
   addEventListener('tryamm:streetverse-world-input',onMove)
   return()=>{removeEventListener('tryamm:streetverse-recovered-playable-ready',onRecovered);removeEventListener('tryamm:streetverse-bj-visible-version',onBJ);removeEventListener('tryamm:streetverse-mobile-movement',onMove);removeEventListener('tryamm:streetverse-world-input',onMove)}
 },[])

 const activeId=active==='bj'?'bj-stubbs':active==='jacobie'?'jacobie-stubbs':'lateasia-monroe'
 const activeEvidence=evidence[activeId]
 const exportReport=()=>{
   const report={
     generatedAt:new Date().toISOString(),
     route:location.href,
     activeCharacter:activeId,
     activeEvidence:activeEvidence||null,
     movementInputObserved:moved,
     verdict:activeEvidence?.loaded&&moved?'INPUT_AND_RIG_EVIDENCE_CAPTURED':'INCOMPLETE_DEVICE_ACCEPTANCE',
     note:'This report records browser runtime evidence. Visual likeness and final device acceptance still require human review on the target device.',
   }
   const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'})
   const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='StreetVerse_Character_Acceptance_'+activeId+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
 }
 return <aside style={{position:'fixed',left:'max(10px,env(safe-area-inset-left))',bottom:'calc(env(safe-area-inset-bottom) + 88px)',zIndex:52000,fontFamily:'system-ui,sans-serif'}}>
   <button type="button" onClick={()=>setOpen(v=>!v)} style={{minHeight:48,padding:'8px 12px',borderRadius:14,border:'2px solid #c59cff',background:'#16102aee',color:'#fff',fontWeight:950}}>👤 {LABELS[active]}</button>
   {open&&<div style={{marginTop:7,width:260,maxWidth:'calc(100vw - 20px)',display:'grid',gap:7,padding:10,borderRadius:14,border:'1px solid #694a98',background:'rgba(7,7,18,.96)',color:'#fff'}}>
     <strong>PLAYABLE CHARACTER</strong>
     {(['bj','jacobie','lateasia'] as Character[]).map(id=><a key={id} href={targetUrl(id)} style={{minHeight:44,display:'grid',placeItems:'center',borderRadius:10,border:id===active?'1px solid #fff':'1px solid #37415c',background:id===active?'#4d2f79':'#111827',color:'#fff',fontWeight:900,textDecoration:'none'}}>PLAY AS {LABELS[id]}</a>)}
     <div style={{fontSize:11,lineHeight:1.35,color:'#cbd1dd'}}>
       Rig: {activeEvidence?.loaded?'LOADED':'WAITING'}<br/>
       Clips: {activeEvidence?.clips??'—'}<br/>
       Source: {activeEvidence?.source??'—'}<br/>
       Movement input: {moved?'SEEN':'NOT YET'}
     </div>
     <button type="button" onClick={exportReport} style={{minHeight:44,borderRadius:10,border:'1px solid #75e7b0',background:'#123d2a',color:'#fff',fontWeight:900}}>EXPORT ONE-PUSH REPORT</button>
   </div>}
 </aside>
}
