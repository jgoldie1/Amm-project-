import { useEffect, useState } from 'react'
import { listMySetApartPassportReceipts, type SetApartPassportReceipt } from '../services/setApartPassportPersistence'

export default function SetApartPassportReceipts(){
  const [receipts,setReceipts]=useState<SetApartPassportReceipt[]>([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState<string|null>(null)

  useEffect(()=>{
    let active=true
    setLoading(true)
    setError(null)
    listMySetApartPassportReceipts()
      .then(rows=>{if(active)setReceipts(rows)})
      .catch(()=>{if(active)setError('Unable to load protected Passport receipts.')})
      .finally(()=>{if(active)setLoading(false)})
    return()=>{active=false}
  },[])

  return <section aria-label="My approved Set Apart Passport receipts" style={{marginTop:18}}>
    <div style={{fontSize:9,letterSpacing:1.6,color:'#78ffb4',fontWeight:900,marginBottom:9}}>MY APPROVED RECEIPTS</div>
    <div aria-live="polite">
      {loading&&<div style={stateStyle}>Loading protected Passport receipts…</div>}
      {!loading&&error&&<div role="alert" style={stateStyle}>{error}</div>}
      {!loading&&!error&&receipts.length===0&&<div style={stateStyle}>No approved Set Apart attestations have been published to this Passport yet.</div>}
      {!loading&&!error&&receipts.length>0&&<div style={{display:'grid',gap:9}}>{receipts.map(receipt=><ReceiptCard key={receipt.receipt_id} receipt={receipt}/>)}</div>}
    </div>
  </section>
}

function ReceiptCard({receipt}:{receipt:SetApartPassportReceipt}){
  return <article style={{border:'1px solid #24412f',borderRadius:14,padding:13,background:'#07100c'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
      <strong style={{fontSize:13,color:'#f3fff6'}}>{receipt.display_title}</strong>
      <span style={{fontSize:8,color:'#78ffb4',fontWeight:900}}>{receipt.event_type.replaceAll('_',' ')}</span>
    </div>
    {receipt.display_summary&&<p style={{margin:'7px 0 0',fontSize:11,lineHeight:1.55,color:'#b7c8bc'}}>{receipt.display_summary}</p>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:7,marginTop:10}}>
      <Meta label="Classification" value={receipt.classification.replaceAll('_',' ')}/>
      <Meta label="Attested" value={formatDate(receipt.attested_at)}/>
      <Meta label="Resource" value={receipt.resource_ref}/>
      <Meta label="Evidence hash" value={`${receipt.block_hash.slice(0,12)}…`}/>
    </div>
  </article>
}

function Meta({label,value}:{label:string;value:string}){
  return <div><div style={{fontSize:7,letterSpacing:1.2,color:'#799486',fontWeight:900}}>{label.toUpperCase()}</div><div style={{fontSize:10,color:'#dce8df',marginTop:3,wordBreak:'break-word'}}>{value}</div></div>
}

function formatDate(value:string){
  const d=new Date(value)
  return Number.isNaN(d.getTime())?'Recorded':d.toLocaleString()
}

const stateStyle={border:'1px dashed #284636',borderRadius:12,padding:13,color:'#9eb1a4',fontSize:11,lineHeight:1.5,background:'#07100c'} as const
