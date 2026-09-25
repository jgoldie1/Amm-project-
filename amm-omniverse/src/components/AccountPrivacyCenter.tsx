import {useEffect,useState} from 'react'
import {ACCOUNT_DELETE_CONFIRM,getAccountDeletionStatus,requestAccountDeletion} from '../services/accountPrivacy'

type DeleteRequest={id:string;status:string;requestedAt:string}

export default function AccountPrivacyCenter({onClose}:{onClose:()=>void}){
  const [request,setRequest]=useState<DeleteRequest|null>(null)
  const [confirm,setConfirm]=useState('')
  const [busy,setBusy]=useState(false)
  const [notice,setNotice]=useState('Sign in to view or request account deletion.')

  useEffect(()=>{
    let active=true
    getAccountDeletionStatus().then(result=>{
      if(!active)return
      setRequest(result.request)
      setNotice(result.request?'An account deletion request is already open.':'No open account deletion request was found.')
    }).catch(error=>{if(active)setNotice(error instanceof Error?error.message:'Could not load account privacy status.')})
    return()=>{active=false}
  },[])

  const submit=async()=>{
    if(confirm!==ACCOUNT_DELETE_CONFIRM)return
    setBusy(true)
    try{
      const result=await requestAccountDeletion()
      setRequest(result.request)
      setNotice(result.existing?'Your existing deletion request is still open.':'Your account deletion request was received.')
      setConfirm('')
    }catch(error){
      setNotice(error instanceof Error?error.message:'Could not submit account deletion request.')
    }finally{setBusy(false)}
  }

  return <main style={{minHeight:'100dvh',background:'linear-gradient(180deg,#030611,#101531)',color:'#fff',fontFamily:'system-ui,sans-serif',padding:'24px 16px 80px'}}>
    <section style={{maxWidth:760,margin:'0 auto'}}>
      <button onClick={onClose} style={small}>← Back to TRYAMM</button>
      <div style={{marginTop:18,fontSize:11,letterSpacing:2.4,color:'#4fe3ff',fontWeight:950}}>PRIVACY • ACCOUNT CONTROL</div>
      <h1 style={{fontSize:'clamp(30px,7vw,52px)',margin:'8px 0 10px'}}>Delete your TRYAMM account</h1>
      <p style={{opacity:.8,lineHeight:1.6}}>You can request deletion from the web or inside TRYAMM. The request applies to the account associated with your current signed-in session.</p>

      <section style={card}>
        <h2 style={{marginTop:0}}>Current request</h2>
        {request?<div>
          <div style={{fontWeight:900,color:'#ffd65a'}}>{request.status.toUpperCase()}</div>
          <div style={{fontSize:12,opacity:.72,marginTop:5}}>Requested {new Date(request.requestedAt).toLocaleString()}</div>
          <div style={{fontSize:11,opacity:.55,marginTop:5}}>Request ID: {request.id}</div>
        </div>:<div style={{fontSize:13,opacity:.78}}>No open request.</div>}
        <div role="status" style={status}>{notice}</div>
      </section>

      <section style={{...card,borderColor:'rgba(255,95,95,.45)'}}>
        <h2 style={{marginTop:0}}>Request deletion</h2>
        <p style={{fontSize:13,lineHeight:1.6}}>Deletion removes or irreversibly de-identifies account data that TRYAMM is not legally required to retain. Transaction, fraud/security, tax, safety, contractual or other records may be retained only for their required period. Public content may take time to disappear from caches or copies.</p>
        <p style={{fontSize:13,lineHeight:1.6}}>Type <b>{ACCOUNT_DELETE_CONFIRM}</b> to confirm. This creates a tracked deletion request; it does not falsely claim that every backend record vanished instantly.</p>
        <input aria-label="Deletion confirmation" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder={ACCOUNT_DELETE_CONFIRM} autoComplete="off" style={field}/>
        <button disabled={busy||confirm!==ACCOUNT_DELETE_CONFIRM||Boolean(request)} onClick={()=>void submit()} style={{...danger,opacity:(busy||confirm!==ACCOUNT_DELETE_CONFIRM||Boolean(request))?0.55:1}}>{busy?'Submitting…':request?'Deletion request already open':'Request account deletion'}</button>
      </section>

      <section style={card}>
        <h2 style={{marginTop:0}}>Privacy links</h2>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <a href="/privacy.html" style={link}>Privacy Notice</a>
          <a href="/terms.html" style={link}>Terms</a>
          <a href="/community-rules.html" style={link}>Community Rules</a>
        </div>
      </section>
    </section>
  </main>
}

const card:React.CSSProperties={marginTop:16,padding:18,borderRadius:18,border:'1px solid rgba(79,227,255,.28)',background:'rgba(255,255,255,.05)'}
const field:React.CSSProperties={width:'100%',boxSizing:'border-box',padding:12,borderRadius:12,border:'1px solid rgba(255,255,255,.18)',background:'#060b17',color:'#fff',fontSize:14}
const danger:React.CSSProperties={width:'100%',marginTop:10,padding:13,borderRadius:12,border:'1px solid rgba(255,95,95,.6)',background:'rgba(133,25,25,.45)',color:'#fff',fontWeight:950,cursor:'pointer'}
const small:React.CSSProperties={padding:'9px 12px',borderRadius:12,border:'1px solid rgba(255,255,255,.18)',background:'#0a1020',color:'#fff',cursor:'pointer'}
const status:React.CSSProperties={marginTop:12,padding:10,borderRadius:11,border:'1px solid rgba(255,255,255,.1)',background:'#070c17',fontSize:12}
const link:React.CSSProperties={padding:'9px 11px',borderRadius:999,border:'1px solid #4fe3ff55',color:'#fff',textDecoration:'none',fontSize:12,fontWeight:850}
