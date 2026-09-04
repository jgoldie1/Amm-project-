import {ensureOmniverseGenesis,loadOmniverseEconomy,recordMissionReward} from './OmniverseAssetLedger'

const REWARD_KEY='tryamm.streetverse.mobile-rewards.v1'
const REWARDS:Record<string,number>={studio:20,market:25,river:35,stage:30}
let installed=false
const pending=new Set<string>()

type CheckpointDetail={id?:string;label?:string;mobileSafeMode?:boolean;htmlCity?:boolean;visited?:number;total?:number;vehicle?:boolean}

function readRewarded(){
  try{const value=JSON.parse(localStorage.getItem(REWARD_KEY)||'[]');return new Set<string>(Array.isArray(value)?value.map(String):[])}catch{return new Set<string>()}
}
function saveRewarded(values:Set<string>){try{localStorage.setItem(REWARD_KEY,JSON.stringify([...values]))}catch{}}
function missionKey(id:string){return `mobile-safe:${id}`}
function ledgerAlreadyHas(mission:string){
  return loadOmniverseEconomy().ledger.some(block=>block.event==='MISSION_REWARD'&&String(block.metadata?.mission||'')===mission)
}
function showReceipt(text:string){
  const id='tryamm-mobile-mission-reward-receipt'
  document.getElementById(id)?.remove()
  const node=document.createElement('div')
  node.id=id;node.setAttribute('role','status');node.setAttribute('aria-live','polite')
  Object.assign(node.style,{position:'fixed',right:'12px',top:'132px',zIndex:'25050',maxWidth:'280px',padding:'11px 13px',borderRadius:'14px',border:'2px solid #79ffad',background:'#04130fee',color:'#fff',font:'900 12px/1.45 system-ui,sans-serif',boxShadow:'0 10px 28px #000a',pointerEvents:'none'})
  node.textContent=text;document.body.appendChild(node)
  window.setTimeout(()=>node.remove(),6500)
}

async function awardCheckpoint(detail:CheckpointDetail){
  if(!detail.mobileSafeMode||!detail.htmlCity)return
  const id=String(detail.id||'')
  const amount=REWARDS[id]
  if(!amount||pending.has(id))return
  const mission=missionKey(id)
  const rewarded=readRewarded()
  if(rewarded.has(id)||ledgerAlreadyHas(mission)){
    if(!rewarded.has(id)){rewarded.add(id);saveRewarded(rewarded)}
    return
  }
  pending.add(id)
  try{
    await ensureOmniverseGenesis()
    if(ledgerAlreadyHas(mission)){rewarded.add(id);saveRewarded(rewarded);return}
    const economy=await recordMissionReward(amount,mission)
    rewarded.add(id);saveRewarded(rewarded)
    const receipt=economy.ledger[economy.ledger.length-1]
    const result={id,label:String(detail.label||id),amountCredits:amount,balance:Math.round(economy.playerBalance),mission,receiptIndex:receipt?.index??-1,receiptHash:receipt?.hash||'',mobileSafeMode:true,htmlCity:true,vehicle:!!detail.vehicle}
    const text=`MISSION REWARD +${amount} DEMO CREDITS • BALANCE ${result.balance} • LEDGER #${result.receiptIndex}`
    showReceipt(text)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-mobile-reward-recorded',{detail:result}))
    window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:`${result.label} • +${amount} demo credits • balance ${result.balance}`}}))
  }catch(error){
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-mobile-reward-error',{detail:{id,message:error instanceof Error?error.message:'reward-failed'}}))
  }finally{pending.delete(id)}
}

export function installStreetVerseMobileMissionRewardRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  void ensureOmniverseGenesis()
  window.addEventListener('tryamm:streetverse-checkpoint',(event:Event)=>{
    const detail=(event as CustomEvent<CheckpointDetail>).detail||{}
    void awardCheckpoint(detail)
  })
}
