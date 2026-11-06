import {useEffect,useState} from 'react'
import {CERT_KEY,CERT_RELOAD_KEY,CERT_STEPS,certComplete,emptyCert,markCert,readCert,type CertStep,type ChicagoCert} from '../runtime/StreetVerseChicagoCertification'
import {SHOPPING_SAVE_KEY,readShoppingLedger} from '../runtime/StreetVerseShoppingLedger'
const labels:Record<CertStep,string>={'shop-entry':'BJ enters a Chicago shop','npc-dialogue':'Talk to NPC merchant','wardrobe':'Change BJ 3D outfit','checkout':'Purchase with game credits','van-drive':'Drive the Holo Delivery van','delivery':'Complete NPC package handoff','reload':'Reload and verify saved progress'}
const btn={minHeight:44,padding:'8px 12px',border:'1px solid #6adbe9',background:'#153f55',color:'white',borderRadius:9,cursor:'pointer'}
export default function StreetVerseChicagoCertificationHUD(){
 const [open,setOpen]=useState(false)
 const [cert,setCert]=useState<ChicagoCert>(()=>{try{return readCert(localStorage.getItem(CERT_KEY))}catch{return emptyCert()}})
 const [notice,setNotice]=useState('Complete the mission normally. No steps are awarded manually.')
 useEffect(()=>{try{localStorage.setItem(CERT_KEY,JSON.stringify(cert))}catch{}},[cert])
 useEffect(()=>{
  const mark=(step:CertStep,detail:string)=>setCert(c=>markCert(c,step,detail))
  let driving=false,lastDrive:{x:number;z:number}|null=null
  const onShop=(e:Event)=>{const d=(e as CustomEvent<{storeId?:string;demo?:boolean}>).detail;if(d?.demo&&d.storeId)mark('shop-entry','Entered '+d.storeId+' storefront')}
  const onTalk=(e:Event)=>{const d=(e as CustomEvent<{storeId?:string}>).detail;if(d?.storeId)mark('npc-dialogue','Merchant conversation at '+d.storeId)}
  const onOutfit=(e:Event)=>{const d=(e as CustomEvent<{outfit?:string;demo?:boolean}>).detail;if(d?.demo&&d.outfit&&d.outfit!=='default')mark('wardrobe','Visible outfit selected: '+d.outfit)}
  const onPurchase=(e:Event)=>{const d=(e as CustomEvent<{storeId?:string;demo?:boolean}>).detail;if(d?.demo&&d.storeId)mark('checkout','Fictional purchase completed at '+d.storeId)}
  const onPosition=(e:Event)=>{const d=(e as CustomEvent<{x?:number;z?:number;vehicleId?:string}>).detail;if(d?.vehicleId==='holo-delivery-van'&&Number.isFinite(d.x)&&Number.isFinite(d.z)){
   if(driving&&lastDrive&&Math.hypot(d.x!-lastDrive.x,d.z!-lastDrive.z)>2)mark('van-drive','Holo van moved at least 2 game units between samples')
   driving=true;lastDrive={x:d.x!,z:d.z!}
  }else{driving=false;lastDrive=null}}
  const onDelivery=(e:Event)=>{const d=(e as CustomEvent<{missionId?:string;demo?:boolean}>).detail;if(d?.demo&&d.missionId)mark('delivery','NPC handoff completed: '+d.missionId)}
  const handlers:[string,EventListener][]=[['tryamm:streetverse-shop-entered',onShop],['tryamm:streetverse-npc-conversation',onTalk],['tryamm:streetverse-avatar-outfit',onOutfit],['tryamm:streetverse-store-demo-purchase',onPurchase],['tryamm:streetverse-player-location',onPosition],['tryamm:streetverse-holo-delivery-mission-complete',onDelivery]]
  handlers.forEach(([name,fn])=>window.addEventListener(name,fn))
  try{const token=sessionStorage.getItem(CERT_RELOAD_KEY);if(token){sessionStorage.removeItem(CERT_RELOAD_KEY);const ledger=readShoppingLedger(localStorage.getItem(SHOPPING_SAVE_KEY));const mission=JSON.parse(localStorage.getItem('tryamm.streetverse.holo-mission.v1')||'null')
   if(ledger.receipts.length>0&&ledger.completedMissionIds.length>0&&mission?.stage==='complete'){mark('reload','Saved receipts, delivery reward and completed mission restored after reload');setNotice('Reload verified: local saved mission and shopping ledger restored.')}else setNotice('Reload check failed: missing completed mission, receipt or ledger.')}}catch{setNotice('Reload check could not read local storage.')}
  return()=>handlers.forEach(([name,fn])=>window.removeEventListener(name,fn))
 },[])
 const completed=CERT_STEPS.filter(s=>cert.events.some(e=>e.step===s)).length
 const verifyReload=()=>{try{sessionStorage.setItem(CERT_RELOAD_KEY,'pending');setNotice('Reload this browser tab now, then reopen this panel.')}catch{setNotice('Session storage unavailable: reload verification cannot run.')}}
 const reset=()=>{setCert(emptyCert());setNotice('Certification evidence reset. Game inventory and missions were not modified.')}
 return <aside data-streetverse-chicago-certification="true" style={{position:'fixed',left:8,top:'calc(env(safe-area-inset-top) + 154px)',zIndex:43992,width:'min(330px,calc(100vw - 16px))',maxHeight:'62dvh',overflow:'auto',padding:9,background:'rgba(8,20,35,.97)',border:'1px solid #6adbe9',borderRadius:12,color:'white',font:'12px system-ui'}}>
 <button style={btn} onClick={()=>setOpen(v=>!v)} aria-expanded={open}>🧪 CHICAGO CERTIFICATION {completed}/{CERT_STEPS.length}</button>
 {open&&<div style={{display:'grid',gap:8,marginTop:9}}>
  <strong>{certComplete(cert)?'LOCAL CHECKLIST COMPLETE — device playtest still required':'MISSION REGRESSION DIAGNOSTICS'}</strong>
  {CERT_STEPS.map(step=>{const evidence=cert.events.find(e=>e.step===step);return <div key={step} style={{borderBottom:'1px solid #ffffff33',paddingBottom:5}}><strong>{evidence?'✓':'○'} {labels[step]}</strong><div style={{color:'#b6d8e4'}}>{evidence?evidence.detail:'Awaiting game event'}</div></div>})}
  <button style={btn} onClick={verifyReload}>ARM SAVE/RELOAD CHECK</button>
  <button style={btn} onClick={()=>{try{navigator.clipboard.writeText(JSON.stringify(cert,null,2));setNotice('Local evidence copied.')}catch{setNotice('Clipboard unavailable.')}}}>COPY DIAGNOSTIC REPORT</button>
  <button style={btn} onClick={reset}>RESET CERTIFICATION ONLY</button>
  <div role="status" aria-live="polite">{notice}</div>
  <small>Local browser event diagnostics only. Does not prove GLB rig fidelity, real shipment, multiplayer synchronization or Chromebook compatibility.</small>
 </div>}</aside>
}
