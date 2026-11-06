import {useState} from 'react'
import AniyahCrossBorderLiteracy,{calculateCrossBorderQuote} from './AniyahCrossBorderLiteracy'
import StreetVersePhotoCamera from './StreetVersePhotoCamera'
const KEY='streetverse.aniyah.missions.v1'
type Progress={photo:boolean;literacy:boolean;order:boolean}
const initial=():Progress=>{try{const p=JSON.parse(localStorage.getItem(KEY)||'{}');return {photo:p.photo===true,literacy:p.literacy===true,order:p.order===true}}catch{return {photo:false,literacy:false,order:false}}}
export default function AniyahStreetVerseMissions({onClose}:{onClose:()=>void}){
 const [progress,setProgress]=useState<Progress>(initial)
 const [camera,setCamera]=useState(false)
 const [answer,setAnswer]=useState('')
 const [customer,setCustomer]=useState('')
 const [destination,setDestination]=useState('')
 const [message,setMessage]=useState('Complete all three training missions. No real money moves.')
 const mark=(key:keyof Progress)=>{setProgress(prev=>{const next={...prev,[key]:true};try{localStorage.setItem(KEY,JSON.stringify(next))}catch{}return next})}
 const photoComplete=progress.photo, literacyComplete=progress.literacy
 const checkLiteracy=()=>{
  // $100 with $4 fee at 0.9 vs $100 with $8 fee at 0.92: 86.40 vs 84.64.
  const a=calculateCrossBorderQuote(100,.9,4),b=calculateCrossBorderQuote(100,.92,8)
  if(answer==='A'&&a.received>b.received){mark('literacy');setMessage('Correct: Provider A delivers more destination currency.')}else setMessage('Try again: compare the recipient amount after fees and exchange rates.')
 }
 const checkOrder=()=>{
  if(!literacyComplete){setMessage('Complete the financial literacy challenge first.');return}
  if(customer.trim().length<2||destination.trim().length<2){setMessage('Enter a fictional customer name and destination country. Do not enter personal information.');return}
  mark('order');setMessage('Simulated international order prepared. No payment or shipment was created.')
 }
 return <section role="dialog" aria-modal="true" aria-label="Aniyah StreetVerse missions" style={{position:'fixed',inset:0,zIndex:18000,background:'#071422',color:'#fff',overflow:'auto',padding:16}}>
  <div style={{maxWidth:760,margin:'auto'}}>
   <button onClick={onClose} style={btn}>Return to Chicago</button>
   <h2>Aniyah · StreetVerse Cross Borders Missions</h2>
   <p role="status">{message}</p>
   <p>Mission progress: {Object.values(progress).filter(Boolean).length}/3 · saved on this browser · training only</p>
   <section><h3>1. Photography {photoComplete?'✓':''}</h3><p>Take a photo or select an existing image, then save it to your device.</p><button onClick={()=>setCamera(true)} style={btn}>📷 Open Photo Camera</button>{camera&&<StreetVersePhotoCamera onClose={()=>setCamera(false)} onPhotoCaptured={()=>{mark('photo');setMessage('Photo saved/download requested. Mission step recorded locally.')}}/>}</section>
   <section><h3>2. Compare international payment quotes {literacyComplete?'✓':''}</h3><p>For a $100 transfer: Provider A charges $4 and gives 0.90 units/USD. Provider B charges $8 and gives 0.92 units/USD. Which delivers more?</p>
    <label>Choose provider <select value={answer} onChange={e=>setAnswer(e.target.value)} style={input}><option value="">Select</option><option value="A">Provider A</option><option value="B">Provider B</option></select></label>
    <button onClick={checkLiteracy} style={btn}>Check Answer</button><AniyahCrossBorderLiteracy/></section>
   <section><h3>3. Cross-border business simulation {progress.order?'✓':''}</h3><p>Prepare a fictional international order. No real customer or payment details.</p>
    <label>Fictional customer <input value={customer} onChange={e=>setCustomer(e.target.value)} style={input}/></label>
    <label>Destination country <input value={destination} onChange={e=>setDestination(e.target.value)} style={input}/></label>
    <button onClick={checkOrder} style={btn}>Prepare Simulated Order</button></section>
   {Object.values(progress).every(Boolean)&&<p role="status">All three Aniyah training missions complete! This is a local demo achievement, not a server-authorized reward.</p>}
  </div>
 </section>
}
const btn:React.CSSProperties={minHeight:44,padding:12,margin:5,border:'1px solid #7398c0',borderRadius:8,background:'#1a3c5b',color:'#fff'}
const input:React.CSSProperties={display:'block',minHeight:44,padding:8,margin:5,maxWidth:280}
