import { useEffect,useState } from 'react'
import { loadMyUnifiedPayouts,payoutStateLabel,type UnifiedPayoutRow } from '../services/payoutStatus'

const money=(cents:number,currency='USD')=>new Intl.NumberFormat(undefined,{style:'currency',currency}).format((cents||0)/100)

export default function UnifiedPayoutCenter(){
 const[open,setOpen]=useState(false),[rows,setRows]=useState<UnifiedPayoutRow[]>([]),[status,setStatus]=useState('')
 useEffect(()=>{const h=()=>setOpen(true);window.addEventListener('tryamm:payouts-open',h);return()=>window.removeEventListener('tryamm:payouts-open',h)},[])
 async function refresh(){setStatus('Loading…');try{setRows(await loadMyUnifiedPayouts());setStatus('')}catch(e:any){setStatus(e?.message||'Unable to load payouts')}}
 useEffect(()=>{if(open)void refresh()},[open])
 return <>{<button onClick={()=>setOpen(true)} style={{position:'fixed',right:14,bottom:86,zIndex:12000,border:'1px solid #E8B944',borderRadius:999,padding:'10px 14px',background:'#07111b',color:'#fff',fontWeight:900}}>💸 PAYOUTS</button>}{open&&<div role="dialog" aria-label="Unified Payout Center" style={{position:'fixed',inset:0,zIndex:12550,overflowY:'auto',background:'rgba(1,2,5,.97)',padding:18,color:'#fff'}}><div style={{maxWidth:980,margin:'0 auto'}}>
  <button onClick={()=>setOpen(false)} aria-label="Close payouts" style={{float:'right',fontSize:24,background:'#111',color:'#fff',border:'1px solid #555',borderRadius:999,width:42,height:42}}>×</button>
  <div style={{fontSize:11,letterSpacing:2,color:'#4FE3FF',fontWeight:900}}>TRYAMM MONEY ENGINE • VERIFIED PAYOUTS</div><h1>Unified Payout Center</h1>
  <p style={{color:'#a9b7c8'}}>Game/race prizes and Pastor Kofi / Servants of Christ service-share payouts stay in separate ledgers, but this view gives the signed-in recipient one place to see status, provider handoff, holds, failures and reversals.</p>
  <button onClick={()=>void refresh()} style={{padding:'9px 13px',borderRadius:10,border:'1px solid #4FE3FF',background:'#0b1622',color:'#fff'}}>Refresh</button>{status&&<p>{status}</p>}
  <div style={{display:'grid',gap:10,marginTop:14}}>{rows.map(r=><article key={`${r.lane}:${r.id}`} style={{border:'1px solid #26394d',borderRadius:14,padding:14,background:'#09131f'}}><div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><b>{r.lane==='game-prize'?'🏆 Game / Race Prize':'⛪ Pastor Kofi Service Share'}</b><strong>{money(r.amount_cents,r.currency)}</strong></div><p style={{margin:'8px 0',color:'#a9b7c8'}}>{payoutStateLabel(r.state)}</p><small>{r.provider_ref?`Provider ref: ${r.provider_ref}`:'Provider reference not assigned yet'}</small></article>)}</div>
  {!status&&rows.length===0&&<p style={{color:'#a9b7c8'}}>No payout records are visible for this signed-in account yet.</p>}
  <section style={{marginTop:18,border:'1px solid #4a3d1f',background:'#171207',borderRadius:14,padding:14}}><b>Money truth</b><p style={{color:'#d7c9a5'}}>A prize, 20% beneficiary allocation, or 10% service share is not payable from gameplay or browser state alone. Server-authoritative eligibility, funding, anti-fraud, identity/age, tax-if-required and payout-provider gates must be green first.</p></section>
 </div></div>}</>
}
