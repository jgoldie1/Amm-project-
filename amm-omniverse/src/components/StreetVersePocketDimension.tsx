import {useEffect,useMemo,useState,type CSSProperties} from 'react'
import {useGameStore} from '../game/state/useGameStore'
import {POCKET_DIMENSION_CATALOG,pocketCatalogItem,pocketDimensionSuggestions,type PocketDimensionAction,type PocketDimensionAsset,type PocketDimensionKind} from '../data/streetVersePocketDimension'

const FAV_KEY='tryamm:pocket-dimension:favorites:v1'
const QUICK_KEY='tryamm:pocket-dimension:quick-slots:v1'
const readList=(key:string)=>{try{const x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x.filter(v=>typeof v==='string').slice(0,32):[]}catch{return[]}}

const SYSTEM_ACCESS:readonly PocketDimensionAsset[]=[
 {id:'streetverse-phone',name:'Holo FON',icon:'📱',kind:'tool',quantity:1,authority:'GAME_STATE',tradable:false,droppable:false,quickSlotCompatible:true,source:'system-access'},
 {id:'reel-camera',name:'Reel Camera',icon:'🎥',kind:'media',quantity:1,authority:'GAME_STATE',tradable:false,droppable:false,quickSlotCompatible:true,source:'system-access'},
 {id:'faith-reader',name:'Faith Reader',icon:'📖',kind:'faith',quantity:1,authority:'GAME_STATE',tradable:false,droppable:false,quickSlotCompatible:true,source:'system-access'},
]

export default function StreetVersePocketDimension({onClose}:{onClose:()=>void}){
 const ownedVehicleIds=useGameStore(s=>s.player.ownedVehicles)
 const vehicles=useGameStore(s=>s.vehicles)
 const [external,setExternal]=useState<PocketDimensionAsset[]>([])
 const [selectedId,setSelectedId]=useState<string|null>(null)
 const [query,setQuery]=useState('')
 const [category,setCategory]=useState<'all'|PocketDimensionKind>('all')
 const [favorites,setFavorites]=useState<string[]>(()=>readList(FAV_KEY))
 const [quick,setQuick]=useState<string[]>(()=>readList(QUICK_KEY).slice(0,4))
 const [notice,setNotice]=useState('Pocket Dimension keeps player assets organized without changing ownership truth.')
 const [actionQty,setActionQty]=useState(1)

 useEffect(()=>{
  const sync=(e:Event)=>{
   const rows=(e as CustomEvent<{items?:PocketDimensionAsset[]}>).detail?.items
   if(Array.isArray(rows))setExternal(rows.filter(item=>item&&typeof item.id==='string'&&item.quantity>0))
  }
  window.addEventListener('tryamm:pocket-dimension-sync',sync)
  window.dispatchEvent(new CustomEvent('tryamm:pocket-dimension-sync-request',{detail:{source:'pocket-dimension-ui'}}))
  return()=>window.removeEventListener('tryamm:pocket-dimension-sync',sync)
 },[])

 const vehicleAssets=useMemo(()=>ownedVehicleIds.map(id=>{
  const v=vehicles.find(x=>x.id===id)
  const cat=pocketCatalogItem(id)
  return {id,name:v?.name||cat?.name||id,icon:cat?.icon||'🚗',kind:'vehicle' as const,quantity:1,authority:'GAME_STATE' as const,tradable:false,droppable:false,quickSlotCompatible:true,source:'game-store'}
 }),[ownedVehicleIds,vehicles])

 const items=useMemo(()=>{
  const map=new Map<string,PocketDimensionAsset>()
  ;[...SYSTEM_ACCESS,...vehicleAssets,...external].forEach(item=>map.set(item.id,item))
  return [...map.values()]
 },[vehicleAssets,external])

 const filtered=useMemo(()=>items.filter(item=>{
  if(category!=='all'&&item.kind!==category)return false
  const cat=pocketCatalogItem(item.id)
  const hay=[item.name,item.kind,item.source,...(cat?.searchTags||[])].join(' ').toLowerCase()
  return hay.includes(query.trim().toLowerCase())
 }).sort((a,b)=>(favorites.includes(b.id)?1:0)-(favorites.includes(a.id)?1:0)||a.name.localeCompare(b.name)),[items,category,query,favorites])

 const selected=items.find(x=>x.id===selectedId)||null
 useEffect(()=>{setActionQty(1)},[selectedId])
 const suggested=useMemo(()=>pocketDimensionSuggestions(items.filter(x=>x.quickSlotCompatible),6),[items])

 const persist=(key:string,value:string[])=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
 const toggleFavorite=(id:string)=>setFavorites(old=>{const next=old.includes(id)?old.filter(x=>x!==id):[id,...old];persist(FAV_KEY,next);return next})
 const toggleQuick=(id:string)=>setQuick(old=>{
  const exists=old.includes(id)
  const next=exists?old.filter(x=>x!==id):[...old.filter(x=>x!==id),id].slice(-4)
  persist(QUICK_KEY,next)
  return next
 })

 const requestAction=(asset:PocketDimensionAsset,action:PocketDimensionAction)=>{
  if(action==='favorite'){toggleFavorite(asset.id);return}
  if(action==='quick-slot'){toggleQuick(asset.id);return}
  const quantity=Math.max(1,Math.min(asset.quantity,actionQty))
  const detail={assetId:asset.id,assetName:asset.name,kind:asset.kind,quantity,action,serverValidate:['give','drop'].includes(action),source:'pocket-dimension'}
  window.dispatchEvent(new CustomEvent('tryamm:pocket-dimension-action-request',{detail}))
  if(asset.id==='reel-camera'&&action==='use')window.dispatchEvent(new CustomEvent('tryamm:reel-capture-toggle'))
  if(asset.id==='faith-reader'&&action==='use')window.location.href='/faithverse'
  if(asset.id==='streetverse-phone'&&action==='use')window.dispatchEvent(new CustomEvent('tryamm:holofon-open',{detail:{source:'pocket-dimension'}}))
  setNotice(['give','drop'].includes(action)?`${action.toUpperCase()} x${quantity} REQUESTED • server validation required.`:`${action.toUpperCase()} x${quantity} • ${asset.name}`)
 }

 const actionsFor=(asset:PocketDimensionAsset)=>{
  const base=pocketCatalogItem(asset.id)?.actions||(['inspect'] as const)
  return base.filter(action=>{
   if(action==='give'&&!asset.tradable)return false
   if(action==='drop'&&!asset.droppable)return false
   return true
  })
 }

 const categories:Array<'all'|PocketDimensionKind>=['all','vehicle','tool','mission','sports','clothing','gift','collectible','business','media','faith']

 return <section aria-label="StreetVerse Pocket Dimension" style={{position:'fixed',inset:0,zIndex:48500,overflow:'auto',padding:'max(12px,env(safe-area-inset-top)) 12px max(28px,env(safe-area-inset-bottom))',background:'linear-gradient(180deg,#071018 0%,#08131d 55%,#03070b 100%)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
  <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,position:'sticky',top:0,zIndex:2,padding:'8px 0 10px',background:'#071018ee',backdropFilter:'blur(9px)'}}>
   <div><small style={{color:'#7be9ff',fontWeight:950,letterSpacing:2}}>STREETVERSE • PERSONAL ASSET SPACE</small><h1 style={{margin:'2px 0',fontSize:26}}>♾️ POCKET DIMENSION</h1><div style={{fontSize:10,color:'#9fb3c4'}}>{items.length} accessible assets • 4 quick slots • ownership authority preserved</div></div>
   <button onClick={onClose} aria-label="Close Pocket Dimension" style={circleBtn}>×</button>
  </header>

  <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:8}}>
   <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search assets…" aria-label="Search Pocket Dimension" style={{minHeight:48,borderRadius:13,border:'1px solid #315269',background:'#0b1923',color:'#fff',padding:'0 13px',fontSize:16}}/>
   <button onClick={()=>{setQuery('');setCategory('all')}} style={{...btn,minWidth:64}}>RESET</button>
  </div>

  <div aria-label="Pocket Dimension categories" style={{display:'flex',gap:7,overflowX:'auto',padding:'10px 0',scrollbarWidth:'none'}}>
   {categories.map(c=><button key={c} onClick={()=>setCategory(c)} style={{...pill,background:category===c?'#153948':'#0a1821',borderColor:category===c?'#7be9ff':'#28404e'}}>{c.toUpperCase()}</button>)}
  </div>

  <section aria-label="Suggested quick access" style={panel}>
   <div style={sectionTitle}>SUGGESTED QUICK ACCESS</div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:7}}>
    {Array.from({length:4}).map((_,i)=>{const id=quick[i];const asset=items.find(x=>x.id===id)||suggested.find(x=>!quick.includes(x.id)&&suggested.indexOf(x)===i)
     return <button key={i} onClick={()=>asset&&setSelectedId(asset.id)} style={{minHeight:74,borderRadius:13,border:'1px solid #31566a',background:'#091722',color:'#fff',padding:7,touchAction:'manipulation'}}>{asset?<><span style={{fontSize:26}}>{asset.icon}</span><small style={{display:'block',fontWeight:900,marginTop:3,overflow:'hidden',textOverflow:'ellipsis'}}>{asset.name}</small></>:<span style={{opacity:.45}}>EMPTY</span>}</button>})}
   </div>
  </section>

  <section style={{...panel,marginTop:10}}>
   <div style={sectionTitle}>OWNED / ACCESSIBLE ASSETS</div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8}}>
    {filtered.map(asset=><button key={asset.id} onClick={()=>setSelectedId(asset.id)} style={{minHeight:112,borderRadius:14,border:selectedId===asset.id?'2px solid #7be9ff':'1px solid #2d4756',background:selectedId===asset.id?'#102c39':'#091620',color:'#fff',padding:9,textAlign:'left',position:'relative',touchAction:'manipulation'}}>
     <span style={{position:'absolute',right:7,top:6,fontSize:14}}>{favorites.includes(asset.id)?'★':''}</span>
     <div style={{fontSize:32,lineHeight:1}}>{asset.icon}</div>
     <strong style={{display:'block',marginTop:7,fontSize:11}}>{asset.name}</strong>
     <small style={{display:'block',marginTop:3,color:'#89a3b6'}}>{asset.kind.toUpperCase()} • x{asset.quantity}</small>
     <small style={{display:'block',marginTop:2,color:asset.authority==='SERVER'?'#8cffb2':'#7be9ff'}}>{asset.authority}</small>
    </button>)}
   </div>
   {!filtered.length&&<div style={{padding:20,textAlign:'center',color:'#91a5b6'}}>No assets match this filter.</div>}
  </section>

  {selected&&<section aria-label="Pocket Dimension item actions" style={{...panel,marginTop:10,borderColor:'#7be9ff88'}}>
   <div style={{display:'grid',gridTemplateColumns:'72px 1fr',gap:12,alignItems:'center'}}>
    <div style={{height:72,display:'grid',placeItems:'center',fontSize:44,borderRadius:16,background:'#102634'}}>{selected.icon}</div>
    <div><small style={{color:'#7be9ff',fontWeight:950}}>{selected.kind.toUpperCase()}</small><h2 style={{margin:'2px 0'}}>{selected.name}</h2><div style={{fontSize:10,color:'#9db0bf'}}>{selected.source||'player asset'} • {selected.authority}</div></div>
   </div>
   {selected.quantity>1&&<div aria-label="Pocket Dimension quantity" style={{display:'grid',gridTemplateColumns:'48px 1fr 48px 64px',gap:7,marginTop:10,alignItems:'center'}}>
    <button onClick={()=>setActionQty(q=>Math.max(1,q-1))} style={btn}>−</button>
    <div style={{minHeight:44,display:'grid',placeItems:'center',borderRadius:11,border:'1px solid #355365',background:'#08151e',fontWeight:950}}>QTY • {actionQty} / {selected.quantity}</div>
    <button onClick={()=>setActionQty(q=>Math.min(selected.quantity,q+1))} style={btn}>+</button>
    <button onClick={()=>setActionQty(selected.quantity)} style={btn}>MAX</button>
   </div>}
   <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8,marginTop:10}}>
    {actionsFor(selected).map(action=><button key={action} onClick={()=>requestAction(selected,action)} style={{...btn,minHeight:50}}>{action==='quick-slot'?(quick.includes(selected.id)?'REMOVE QUICK':'ADD QUICK'):action.toUpperCase()}</button>)}
    <button onClick={()=>requestAction(selected,'favorite')} style={{...btn,minHeight:50}}>{favorites.includes(selected.id)?'★ FAVORITE':'☆ FAVORITE'}</button>
   </div>
  </section>}

  <div aria-live="polite" style={{...panel,marginTop:10,fontSize:11,color:'#b8cad7'}}>{notice}</div>
 </section>
}

const panel:CSSProperties={padding:11,borderRadius:16,border:'1px solid #294352',background:'#07141dcc'}
const sectionTitle:CSSProperties={fontSize:10,fontWeight:950,letterSpacing:1.5,color:'#8fefff',marginBottom:8}
const btn:CSSProperties={minHeight:44,borderRadius:11,border:'1px solid #3c5969',background:'#0c1b25',color:'#fff',fontWeight:950,padding:'8px 10px',touchAction:'manipulation'}
const pill:CSSProperties={minHeight:44,borderRadius:999,border:'1px solid #28404e',color:'#fff',fontWeight:900,padding:'0 13px',whiteSpace:'nowrap',touchAction:'manipulation'}
const circleBtn:CSSProperties={width:48,height:48,borderRadius:24,border:'1px solid #456273',background:'#0a1923',color:'#fff',fontSize:25,fontWeight:900,touchAction:'manipulation'}
