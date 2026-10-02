import {useEffect,useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'

type RndRecord={
  id:string
  title:string
  category:string
  status:string
  publication_state:string
  summary?:string|null
  private_notes?:string|null
  updated_at?:string
}

const btn:React.CSSProperties={minHeight:44,borderRadius:12,border:'1px solid #665184',background:'#130d20',color:'#fff',fontWeight:900,fontSize:10,padding:'9px 11px',touchAction:'manipulation'}

async function authFetch(url:string,options:RequestInit={}){
  const token=await getAccessToken()
  if(!token)throw new Error('Sign in with founder/admin access to use the private 12D R&D vault.')
  const response=await fetch(url,{...options,headers:{'content-type':'application/json',authorization:`Bearer ${token}`,...(options.headers||{})},cache:'no-store'})
  const payload=await response.json().catch(()=>({}))
  if(!response.ok)throw new Error(payload?.message||payload?.error||`Request failed (${response.status})`)
  return payload
}

export default function TwelveDPrivateRnDPanel(){
  const [records,setRecords]=useState<RndRecord[]>([])
  const [title,setTitle]=useState('')
  const [category,setCategory]=useState('general')
  const [summary,setSummary]=useState('')
  const [notes,setNotes]=useState('')
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [selectedId,setSelectedId]=useState('')
  const [publicationPhrase,setPublicationPhrase]=useState('')

  const refresh=async()=>{
    try{
      const data=await authFetch('/api/rnd/12d-vault')
      setRecords(Array.isArray(data.records)?data.records:[])
      setMessage('')
    }catch(error){setMessage(error instanceof Error?error.message:String(error))}
  }

  useEffect(()=>{void refresh()},[])

  const create=async()=>{
    if(!title.trim())return
    setBusy(true);setMessage('')
    try{
      await authFetch('/api/rnd/12d-vault',{method:'POST',body:JSON.stringify({action:'create',title,category,summary,privateNotes:notes})})
      setTitle('');setSummary('');setNotes('')
      await refresh()
      setMessage('Private R&D record saved. It is not available through a public manifest.')
    }catch(error){setMessage(error instanceof Error?error.message:String(error))}
    finally{setBusy(false)}
  }

  const updateSelected=async()=>{
    if(!selectedId)return
    setBusy(true);setMessage('')
    try{
      await authFetch('/api/rnd/12d-vault',{method:'POST',body:JSON.stringify({action:'update',id:selectedId,title,category,summary,privateNotes:notes,status:'private-review'})})
      await refresh()
      setMessage('Private R&D record updated.')
    }catch(error){setMessage(error instanceof Error?error.message:String(error))}
    finally{setBusy(false)}
  }

  const loadRecord=(record:RndRecord)=>{
    setSelectedId(record.id)
    setTitle(record.title||'')
    setCategory(record.category||'general')
    setSummary(record.summary||'')
    setNotes(record.private_notes||'')
    setPublicationPhrase('')
    setMessage(`Loaded private record: ${record.title}`)
  }

  const approveFuturePublication=async()=>{
    if(!selectedId||publicationPhrase!=='APPROVE_12D_PUBLICATION')return
    setBusy(true);setMessage('')
    try{
      await authFetch('/api/rnd/12d-vault',{method:'POST',body:JSON.stringify({action:'approve-publication',id:selectedId,confirmation:publicationPhrase})})
      setPublicationPhrase('')
      await refresh()
      setMessage('Approved for a future publication decision. Nothing was made public.')
    }catch(error){setMessage(error instanceof Error?error.message:String(error))}
    finally{setBusy(false)}
  }

  const returnPrivate=async()=>{
    if(!selectedId)return
    setBusy(true);setMessage('')
    try{
      await authFetch('/api/rnd/12d-vault',{method:'POST',body:JSON.stringify({action:'return-private',id:selectedId})})
      await refresh()
      setMessage('Publication approval cleared. Record remains private.')
    }catch(error){setMessage(error instanceof Error?error.message:String(error))}
    finally{setBusy(false)}
  }

  return <section aria-label="Private 12D R&D Vault" style={{marginTop:12,padding:12,border:'1px solid #5d447d',borderRadius:16,background:'#0d0817dd'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}>
      <div><b style={{fontSize:12,color:'#d4b7ff'}}>PRIVATE 12D R&D VAULT</b><div style={{fontSize:10,lineHeight:1.5,color:'#b8a7cc',marginTop:4}}>Founder/admin only. Notes are stored in a service-role-only table. This panel has no public read endpoint and no public-release action.</div></div>
      <span style={{fontSize:9,padding:'4px 8px',border:'1px solid #6e5690',borderRadius:999,color:'#e6d7ff'}}>PRIVATE BY DEFAULT</span>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:7,marginTop:10}}>
      <label style={{fontSize:9,color:'#c8b9dc'}}>TITLE
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Private experiment / design note" style={{width:'100%',boxSizing:'border-box',minHeight:44,borderRadius:10,border:'1px solid #5d447d',background:'#090611',color:'#fff',padding:'0 9px',marginTop:4}}/>
      </label>
      <label style={{fontSize:9,color:'#c8b9dc'}}>CATEGORY
        <select value={category} onChange={e=>setCategory(e.target.value)} style={{width:'100%',minHeight:44,borderRadius:10,border:'1px solid #5d447d',background:'#090611',color:'#fff',padding:'0 9px',marginTop:4}}>
          {['general','materials','robotics','machine-vision','additive','assembly','tooling','safety','simulation','quality','controls','digital-twin'].map(item=><option key={item} value={item}>{item.toUpperCase()}</option>)}
        </select>
      </label>
    </div>
    <label style={{display:'block',fontSize:9,color:'#c8b9dc',marginTop:8}}>SUMMARY
      <textarea value={summary} onChange={e=>setSummary(e.target.value)} rows={3} style={{width:'100%',boxSizing:'border-box',borderRadius:10,border:'1px solid #5d447d',background:'#090611',color:'#fff',padding:9,marginTop:4}}/>
    </label>
    <label style={{display:'block',fontSize:9,color:'#c8b9dc',marginTop:8}}>PRIVATE NOTES
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={7} placeholder="Keep confidential R&D details here instead of committing them to the public GitHub repository." style={{width:'100%',boxSizing:'border-box',borderRadius:10,border:'1px solid #5d447d',background:'#090611',color:'#fff',padding:9,marginTop:4}}/>
    </label>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:8}}>
      <button disabled={busy||!title.trim()} onClick={()=>void create()} style={btn}>{busy?'WORKING…':'SAVE NEW PRIVATE RECORD'}</button>
      <button disabled={busy||!selectedId} onClick={()=>void updateSelected()} style={btn}>UPDATE SELECTED</button>
    </div>

    <div style={{display:'grid',gap:6,marginTop:10}}>
      {records.length===0?<div style={{fontSize:9,color:'#927fa9'}}>No private 12D R&D records are visible to this account yet.</div>:records.map(record=><button key={record.id} onClick={()=>loadRecord(record)} style={{...btn,textAlign:'left',borderColor:selectedId===record.id?'#c39cff':'#4f3b68',background:selectedId===record.id?'#211233':'#0b0712'}}>
        <b>{record.title}</b><span style={{display:'block',fontSize:8,opacity:.7,marginTop:2}}>{record.category} • {record.status} • publication: {record.publication_state}</span>
      </button>)}
    </div>

    {selectedId&&<div style={{marginTop:10,padding:10,border:'1px solid #684d8e',borderRadius:12,background:'#0b0712'}}>
      <b style={{fontSize:9,color:'#d4b7ff'}}>FUTURE PUBLICATION LOCK</b>
      <div style={{fontSize:9,lineHeight:1.45,color:'#ab9abc',marginTop:3}}>Nothing here can be made public by this panel. The phrase below only records your approval for a future explicit publication change.</div>
      <input value={publicationPhrase} onChange={e=>setPublicationPhrase(e.target.value)} placeholder="Type APPROVE_12D_PUBLICATION only when ready" style={{width:'100%',boxSizing:'border-box',minHeight:44,borderRadius:10,border:'1px solid #5d447d',background:'#090611',color:'#fff',padding:'0 9px',marginTop:7}}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:6}}>
        <button disabled={busy||publicationPhrase!=='APPROVE_12D_PUBLICATION'} onClick={()=>void approveFuturePublication()} style={btn}>MARK APPROVED FOR FUTURE</button>
        <button disabled={busy} onClick={()=>void returnPrivate()} style={btn}>KEEP / RETURN PRIVATE</button>
      </div>
    </div>}
    {message&&<div aria-live="polite" style={{fontSize:9,color:'#d4b7ff',marginTop:7}}>{message}</div>}
  </section>
}
