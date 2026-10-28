import {useEffect,useMemo,useState} from 'react'

export type RPGItem = {
 id:string
 name:string
 category:'gear'|'weapon'|'consumable'|'quest'|'vehicle'|'collectible'
 quantity:number
 equipped?:boolean
 rarity?:'common'|'uncommon'|'rare'|'epic'|'legendary'
 description?:string
}
const categories=['all','gear','weapon','consumable','quest','vehicle','collectible'] as const
type Filter=typeof categories[number]
const validCategory=(value:unknown):value is RPGItem['category']=>categories.includes(value as Filter)&&value!=='all'
function normalize(input:unknown):RPGItem[]{
 if(!Array.isArray(input))return []
 const seen=new Set<string>()
 return input.filter((v):v is Record<string,unknown>=>v!==null&&typeof v==='object').flatMap(v=>{
  const id=typeof v.id==='string'?v.id:''
  if(!id||seen.has(id)||!validCategory(v.category)||typeof v.name!=='string')return []
  seen.add(id)
  return [{id,name:v.name.slice(0,90),category:v.category,quantity:Math.max(0,Math.min(9999,Math.floor(Number(v.quantity)||0))),equipped:v.equipped===true,rarity:typeof v.rarity==='string'&&['common','uncommon','rare','epic','legendary'].includes(v.rarity)?v.rarity as RPGItem['rarity']:undefined,description:typeof v.description==='string'?v.description.slice(0,240):undefined}]
 }).filter(v=>v.quantity>0)
}
export default function StreetVerseInventoryPanel(){
 const [open,setOpen]=useState(false)
 const [items,setItems]=useState<RPGItem[]>([])
 const [filter,setFilter]=useState<Filter>('all')
 const [pending,setPending]=useState<string|null>(null)
 const [status,setStatus]=useState('Inventory will appear when the game supplies its owned-item state.')
 useEffect(()=>{
  const receive=(event:Event)=>{
   const detail=(event as CustomEvent<{items?:unknown}>).detail
   if(!detail||!Array.isArray(detail.items))return
   setItems(normalize(detail.items))
   setPending(null)
   setStatus('Inventory refreshed from game state.')
  }
  const failure=(event:Event)=>{
   const detail=(event as CustomEvent<{message?:string}>).detail
   setPending(null)
   setStatus(detail?.message||'Equipment request was not confirmed.')
  }
  const openInventory=()=>setOpen(true)
  window.addEventListener('tryamm:streetverse-inventory-state',receive)
  window.addEventListener('tryamm:streetverse-inventory-error',failure)
  window.addEventListener('tryamm:streetverse-inventory-open',openInventory)
  window.dispatchEvent(new Event('tryamm:streetverse-inventory-request'))
  return()=>{
   window.removeEventListener('tryamm:streetverse-inventory-state',receive)
   window.removeEventListener('tryamm:streetverse-inventory-error',failure)
   window.removeEventListener('tryamm:streetverse-inventory-open',openInventory)
  }
 },[])
 const visible=useMemo(()=>items.filter(i=>filter==='all'||i.category===filter),[items,filter])
 const requestEquip=(item:RPGItem)=>{
  setPending(item.id)
  setStatus('Equipment requested. Waiting for the game to confirm.')
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-inventory-equip-request',{detail:{itemId:item.id,source:'inventory-panel',serverAuthoritative:true}}))
 }
 const button:React.CSSProperties={minHeight:44,borderRadius:10,border:'1px solid #67e8f966',background:'#071c2c',color:'#fff',padding:'8px 12px',fontWeight:800,touchAction:'manipulation'}
 return <section aria-label="StreetVerse RPG inventory" data-no-realm-swipe="true" style={{marginTop:8}}>
  <button type="button" aria-expanded={open} aria-controls="streetverse-rpg-inventory" onClick={()=>setOpen(o=>!o)} style={{...button,width:'100%'}}>🎒 INVENTORY / EQUIPMENT {open?'▲':'▼'}</button>
  {open&&<div id="streetverse-rpg-inventory" style={{marginTop:8,padding:8,borderRadius:12,background:'#06121dea',border:'1px solid #67e8f944'}}>
   <label style={{display:'block',fontSize:12,fontWeight:800,color:'#b5eafa'}}>Items <select aria-label="Filter inventory" value={filter} onChange={e=>setFilter(e.target.value as Filter)} style={{...button,marginLeft:8}}>{categories.map(c=><option key={c} value={c}>{c.toUpperCase()}</option>)}</select></label>
   <div role="status" aria-live="polite" style={{fontSize:12,color:'#b5d1dd',margin:'8px 0'}}>{status}</div>
   {!visible.length?<p style={{fontSize:12,color:'#ddd'}}>No owned items reported in this category.</p>:<div style={{display:'grid',gap:8,maxHeight:260,overflowY:'auto'}}>
    {visible.map(item=><div key={item.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:9,borderRadius:10,background:'#0e2637'}}>
     <div><strong style={{fontSize:13}}>{item.name} ×{item.quantity}</strong><div style={{fontSize:11,color:'#abc0d0'}}>{item.category.toUpperCase()} {item.rarity?' • '+item.rarity.toUpperCase():''}{item.equipped?' • EQUIPPED':''}</div>{item.description&&<div style={{fontSize:11}}>{item.description}</div>}</div>
     {['weapon','gear'].includes(item.category)&&<button type="button" disabled={item.equipped||pending===item.id} onClick={()=>requestEquip(item)} style={{...button,opacity:item.equipped?.5:1}}>{item.equipped?'Active':pending===item.id?'Requested':'Equip'}</button>}
    </div>)}
   </div>}
   <button type="button" onClick={()=>window.dispatchEvent(new Event('tryamm:streetverse-inventory-request'))} style={button}>Refresh inventory</button>
  </div>}
 </section>
}
