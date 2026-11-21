import React,{useState} from 'react'
import {StreetVerseBJCreatorPreview3D} from './StreetVerseBJCreatorPreview3D'
import {submitPersistentCreatorListing,listApprovedCreatorListings} from '../services/streetverseCreatorMarketplace'
import {createAccessibleModDraft,reviewCreatorMod,submitCreatorMod,decideCreatorMod} from '../runtime/StreetVerseCreatorProgram'
import type {CreatorSubmission} from '../runtime/StreetVerseCreatorProgram'
const palette=['#ff69b4','#151515','#2845a7','#a31b30','#e0b64b']
const preset={id:'streetverse-jacket',category:'clothing' as const,label:'StreetVerse Jacket',palette}
export function StreetVerseCreatorStudio(){
 const [color,setColor]=useState(palette[0])
 const [creatorId,setCreatorId]=useState('demo-creator')
 const [rights,setRights]=useState(false)
 const [submission,setSubmission]=useState<CreatorSubmission|null>(null)
 const [market,setMarket]=useState<CreatorSubmission[]>([])
 const [threeD,setThreeD]=useState(false)
 const [published,setPublished]=useState<Array<{id:string;title:string;price_credits:number}>>([])
 const [loading,setLoading]=useState(false)
 const [message,setMessage]=useState('Choose a jacket color, confirm your rights and submit for review.')
 const draft={...createAccessibleModDraft(creatorId,preset,color),rightsConfirmed:rights}
 const submit=()=>{
  const checks=reviewCreatorMod(draft)
  if(!checks.approved){setMessage(checks.reasons.join('; '));return}
  setSubmission(submitCreatorMod(draft));setMessage('Submitted for independent review. Not publicly listed.')
 }
 const submitReal=async()=>{
  const checks=reviewCreatorMod(draft)
  if(!checks.approved){setMessage(checks.reasons.join('; '));return}
  setLoading(true)
  try{
   const row=await submitPersistentCreatorListing(draft)
   setMessage('Saved to authenticated marketplace as '+row.status+'. Publication requires an independent moderator.')
  }catch(e){setMessage(e instanceof Error?e.message:'Submission failed')}
  finally{setLoading(false)}
 }
 const refreshPublished=async()=>{
  setLoading(true)
  try{
   const rows=await listApprovedCreatorListings()
   setPublished(rows.map(x=>({id:String(x.id),title:String(x.title),price_credits:Number(x.price_credits)})))
   setMessage('Loaded approved server listings only. No real-money transactions are enabled.')
  }catch(e){setMessage(e instanceof Error?e.message:'Marketplace unavailable')}
  finally{setLoading(false)}
 }
 const demoApprove=()=>{
  if(!submission)return
  try{
   const approved=decideCreatorMod(submission,'demo-reviewer',true,'Demo review only; not a production moderation approval')
   setSubmission(approved);setMarket(old=>[...old.filter(x=>x.draft.id!==approved.draft.id),approved])
   setMessage('Approved in this local demonstration only. No public marketplace listing or payment.')
  }catch(error){setMessage(error instanceof Error?error.message:String(error))}
 }
 return <section aria-label="StreetVerse Creator Studio" style={{background:'#141c30',color:'white',padding:16,borderRadius:16,maxWidth:540}}>
  <h2>StreetVerse Creator Studio</h2>
  <p>Design a jacket for BJ. This is a lightweight preview, not a fitted 3D garment.</p>
  <button type="button" onClick={()=>setThreeD(v=>!v)} style={{minHeight:48,padding:'10px 16px',marginBottom:12}}>{threeD?'Use low-data 2D preview':'Load BJ V15 3D preview (optional)'}</button>
  {threeD&&<StreetVerseBJCreatorPreview3D jacketColor={color}/>}
  <div role="img" aria-label={'Jacket color preview '+color} style={{display:'grid',placeItems:'center',minHeight:180,background:'#28334c',borderRadius:12}}>
   <svg width="180" height="160" viewBox="0 0 180 160" aria-hidden="true"><path d="M58 20 L90 38 L122 20 L155 52 L137 88 L128 76 L128 148 L52 148 L52 76 L43 88 L25 52 Z" fill={color} stroke="white" strokeWidth="3"/><path d="M90 38 L90 148 M64 45 L84 72 M116 45 L96 72" fill="none" stroke="white" strokeWidth="2"/></svg>
  </div>
  <label htmlFor="streetverse-creator-id">Creator ID</label>
  <input id="streetverse-creator-id" value={creatorId} onChange={e=>setCreatorId(e.target.value)} style={{display:'block',minHeight:44,width:'100%',margin:'8px 0'}}/>
  <div role="group" aria-label="Choose jacket color" style={{display:'flex',gap:8,flexWrap:'wrap',margin:'12px 0'}}>
   {palette.map(c=><button key={c} type="button" onClick={()=>{setColor(c);setSubmission(null)}} aria-label={'Choose color '+c} aria-pressed={color===c} style={{background:c,width:48,height:48,border:color===c?'4px solid white':'2px solid gray',borderRadius:12}}/>)}
  </div>
  <label style={{display:'flex',gap:12,alignItems:'center',minHeight:48}}><input type="checkbox" checked={rights} onChange={e=>setRights(e.target.checked)}/> I created this design or have permission to submit it.</label>
  <button type="button" onClick={submit} style={{minHeight:48,padding:'8px 16px',marginRight:8}}>Submit for review</button>
  <button type="button" disabled={!submission||submission.status!=='pending'} onClick={demoApprove} style={{minHeight:48,padding:'8px 16px'}}>Simulate moderator approval</button>
  <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:12}}>
   <button type="button" disabled={loading} onClick={()=>{void submitReal()}} style={{minHeight:48,padding:'8px 16px'}}>Save signed-in submission</button>
   <button type="button" disabled={loading} onClick={()=>{void refreshPublished()}} style={{minHeight:48,padding:'8px 16px'}}>Refresh approved marketplace</button>
  </div>
  <p role="status" aria-live="polite">{message}</p>
  <h3>Approved server listings</h3>
  {published.length?published.map(item=><p key={item.id}>{item.title} — {item.price_credits} fictional credits</p>):<p>No published server listings loaded. Sign-in and server configuration are required for submissions.</p>}
  <h3>Local demonstration marketplace</h3>
  {market.length?market.map(item=><p key={item.draft.id}>{item.draft.title} — approved in demo — {item.draft.priceCredits} fictional credits</p>):<p>No approved demonstration mods yet.</p>}
  <small>Real creator payments, actual BJ clothing attachment, production moderation and persistent marketplace storage are not enabled.</small>
 </section>
}
