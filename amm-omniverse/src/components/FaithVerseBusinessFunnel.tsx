import {useState,type CSSProperties} from 'react'
import FaithVerseBusinessEnrollment from './FaithVerseBusinessEnrollment'
type Interest='Bible Reading'|'Paleo-Hebrew and Strong’s'|'Dead Sea Scrolls and Apocrypha'|'Kingdoms Press Publishing'|'FaithVerse Experiences'
type Step='discover'|'learn'|'enroll'
const OPTIONS:readonly Interest[]=['Bible Reading','Paleo-Hebrew and Strong’s','Dead Sea Scrolls and Apocrypha','Kingdoms Press Publishing','FaithVerse Experiences']
const button:CSSProperties={minHeight:56,padding:'12px 15px',borderRadius:13,border:'1px solid #d2b77c',background:'#18384a',color:'#fff',fontWeight:800,fontSize:16,cursor:'pointer'}
export default function FaithVerseBusinessFunnel({onOpenBible,onOpenHebrew,onOpenScrolls,onOpenPress}:{onOpenBible:()=>void;onOpenHebrew:()=>void;onOpenScrolls:()=>void;onOpenPress:()=>void}){
 const [step,setStep]=useState<Step>('discover')
 const [interest,setInterest]=useState<Interest>('Bible Reading')
 const [agreed,setAgreed]=useState(false)
 const [notice,setNotice]=useState('No email marketing, payments or lead database are active in this preview.')
 const openSelected=()=>{if(interest==='Bible Reading'||interest==='FaithVerse Experiences')onOpenBible();else if(interest==='Paleo-Hebrew and Strong’s')onOpenHebrew();else if(interest==='Dead Sea Scrolls and Apocrypha')onOpenScrolls();else onOpenPress()}
 const exportBrief=()=>{
  const payload={schema:'tryamm.faithverse.business-interest.v1',interestedIn:interest,createdAt:new Date().toISOString(),contactInformation:null,consentToMarketing:false,submittedToServer:false,pricing:false,providerVerified:false,notes:'User-controlled study interest receipt only. No contact details, payment or background submission.'}
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='FaithVerse_Study_Interest.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500)
  setNotice('Downloaded personal study interest receipt. No lead was sent to TRYAMM or Kingdoms Press.')
 }
 return <section aria-label="TRYAMM FaithVerse study and publishing landing funnel" style={{display:'grid',gap:14,padding:'clamp(14px,4vw,24px)',background:'linear-gradient(140deg,#102d37,#112136)',border:'1px solid #ad9e78',borderRadius:22,color:'#fff'}}>
  <div style={{fontSize:12,letterSpacing:2,fontWeight:900,color:'#f1cf93'}}>TRYAMM BUSINESS • FAITHVERSE LEARNING</div>
  <h2 style={{fontSize:'clamp(23px,5vw,34px)',margin:0}}>Study scripture. Explore its history. Publish responsibly.</h2>
  <p style={{fontSize:16,lineHeight:1.65,margin:0}}>Begin with the accessible Bible reader, deepen your Hebrew and manuscript research, and explore original study-guide publishing through Kingdoms Press. Free preview; no paid enrollment or book order is available here.</p>
  <nav aria-label="Study journey steps" style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:7}}>{(['discover','learn','enroll'] as Step[]).map(x=><button key={x} aria-pressed={step===x} onClick={()=>setStep(x)} style={{...button,background:step===x?'#516444':'#18384a',fontSize:13}}>{x==='discover'?'1 · Discover':x==='learn'?'2 · Study':'3 · My pathway'}</button>)}</nav>
  {step==='discover'&&<div style={{display:'grid',gap:10}}><p style={{lineHeight:1.6}}>Explore a rights-labeled Bible edition, the existing 1611 Apocrypha study index, and research links to official Dead Sea Scrolls archives. No manuscript translations are generated or copied without authorization.</p><button style={button} onClick={onOpenBible}>OPEN METAVERSE BIBLE</button><button style={button} onClick={()=>setStep('learn')}>CHOOSE A STUDY PATH</button></div>}
  {step==='learn'&&<div style={{display:'grid',gap:9}}><label htmlFor="faith-funnel-interest">What would you like to study or create?</label><select style={button} id="faith-funnel-interest" value={interest} onChange={e=>setInterest(e.target.value as Interest)}>{OPTIONS.map(x=><option key={x}>{x}</option>)}</select><button style={button} onClick={openSelected}>OPEN SELECTED EXISTING STUDY TOOL</button><button style={button} onClick={()=>setStep('enroll')}>PREPARE MY STUDY PLAN</button></div>}
  {step==='enroll'&&<div style={{display:'grid',gap:10}}><h3 style={{margin:0}}>Your learning pathway: {interest}</h3><p style={{lineHeight:1.6}}>Save a personal interest receipt, then continue studying in the existing TRYAMM modules. An approved email marketing provider, opt-in records, privacy policy, subscription terms and accessible unsubscribe are still required before an actual enrollment funnel can accept leads.</p><label style={{display:'flex',gap:12,alignItems:'start',fontSize:14}}><input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{width:22,height:22,flexShrink:0}}/>I understand this is a private study preview, not an actual marketing subscription or paid course enrollment.</label><button style={{...button,opacity:agreed?1:.5}} disabled={!agreed} onClick={exportBrief}>EXPORT MY STUDY INTEREST</button><button style={button} onClick={openSelected}>CONTINUE INTO STUDY TOOL</button></div>}
  {step==='enroll'&&<FaithVerseBusinessEnrollment interest={interest}/>}
  <p role="status" aria-live="polite" style={{fontSize:13,color:'#dddbcf',margin:0}}>{notice}</p>
  <p style={{fontSize:12,color:'#ccd1d9',margin:0}}>Business boundary: no health information, financial account details or private pastoral messages are collected. Educational interest is not a verified sale, lead or income entry; marketing requires explicit opt-in and a secure authorized backend.</p>
 </section>
}
