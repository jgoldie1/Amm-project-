import {useState} from 'react'

export type LaTeasiaChainId='whos-your-daddy'|'lateasia-monroe'
export const LATEASIA_CHAINS:ReadonlyArray<{id:LaTeasiaChainId;label:string}>=[
 {id:'whos-your-daddy',label:"Who's Your Daddy"},
 {id:'lateasia-monroe',label:'LaTeasia Monroe'}
]
/** Jewelry selection is cosmetic and fictional; no purchase or inventory claim. */
export default function StreetVerseLaTeasiaChainSwitcher(){
 const [selected,setSelected]=useState<LaTeasiaChainId>('lateasia-monroe')
 const choose=(id:LaTeasiaChainId)=>{
  setSelected(id)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-lateasia-chain-selected',{detail:{characterId:'lateasia-monroe',chainId:id}}))
 }
 return <section aria-label="LaTeasia necklace switcher" style={{position:'absolute',right:12,top:80,zIndex:32,width:'min(260px,60vw)',padding:12,borderRadius:12,background:'rgba(8,21,37,.96)',border:'1px solid #92eaff',color:'white'}}>
  <strong>💎 LaTeasia • Necklace</strong>
  <div style={{display:'grid',gap:8,marginTop:10}}>
   {LATEASIA_CHAINS.map(chain=><button key={chain.id} type="button" aria-pressed={selected===chain.id} onClick={()=>choose(chain.id)} style={{minHeight:48,borderRadius:10,padding:10,fontSize:14,fontWeight:800,border:selected===chain.id?'3px solid #f7cb68':'1px solid #8cdfff'}}>{chain.label}</button>)}
  </div>
  <div aria-live="polite" role="status" style={{fontSize:12,marginTop:8}}>Selected: {LATEASIA_CHAINS.find(chain=>chain.id===selected)?.label}</div>
 </section>
}
