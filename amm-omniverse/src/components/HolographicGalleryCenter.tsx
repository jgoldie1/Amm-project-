import {useMemo,useState} from 'react'
import HolographicGalleryViewport from './HolographicGalleryViewport'

type GalleryItem={id:string;title:string;creator:string;kind:'3d-product'|'art'|'music'|'reel'|'world-object'|'collectible';priceMinor?:number;currency?:string;productId?:string;assetUrl?:string;description:string;shoppable:boolean}

const seed:GalleryItem[]=[
 {id:'gallery-1',title:'StreetVerse Creator Jacket',creator:'All American Marketplace',kind:'3d-product',priceMinor:8900,currency:'USD',productId:'streetverse-jacket',description:'Holographic product display with AR/VR-ready product identity.',shoppable:true},
 {id:'gallery-2',title:'Chicago World Art',creator:'TRYAMM Creator',kind:'art',priceMinor:2400,currency:'USD',productId:'chicago-world-art',description:'Creator artwork that can appear in a virtual gallery, Reel, LIVE room or StreetVerse interior.',shoppable:true},
 {id:'gallery-3',title:'Holo Music Showcase',creator:'All American Records',kind:'music',description:'Rights-aware music exhibit linked to creator pages, LIVE and ticket/merch commerce.',shoppable:false},
 {id:'gallery-4',title:'StreetVerse Memory Reel',creator:'TRYAMM Creator',kind:'reel',description:'A Reel can be projected into the gallery and used as an entry point into the world.',shoppable:false},
 {id:'gallery-5',title:'West Side Police Unit Study',creator:'TRYAMM World Lab',kind:'world-object',assetUrl:'/free-assets/kenney/vehicles/police.glb',description:'CC0 vehicle study rendered as a real 3D holographic exhibit for StreetVerse, CrossVerse and AR.',shoppable:false},
 {id:'gallery-6',title:'Circle Park Oak Study',creator:'TRYAMM World Lab',kind:'world-object',assetUrl:'/free-assets/kenney/nature/tree-oak.glb',description:'CC0 environment asset shown in the Holographic Gallery and reusable in AR/Holo world building.',shoppable:false},
]

export default function HolographicGalleryCenter({onClose}:{onClose:()=>void}){
 const [minimized,setMinimized]=useState(false)
 const [maximized,setMaximized]=useState(false)
 const [collapsed,setCollapsed]=useState(false)
 const [items]=useState(seed)
 const [selectedId,setSelectedId]=useState(seed[0].id)
 const selected=useMemo(()=>items.find(x=>x.id===selectedId)||items[0],[items,selectedId])
 const buy=()=>{
  if(!selected?.shoppable||!selected.productId)return
  window.dispatchEvent(new CustomEvent('tryamm:commerce-intent-request',{detail:{schema:'tryamm.revenue.intent.v1',id:'gallery-'+selected.id+'-'+Date.now(),surface:'world-object',channel:'product-sale',itemId:selected.productId,currency:selected.currency||'USD',amountMinor:selected.priceMinor,attribution:{sourceContentId:selected.id,sourceVerse:'streetverse'},requiresServerVerification:true,clientMayCreatePayableBalance:false,authority:'server',settlement:'transaction-orchestrator'}}))
 }
 const openReel=()=>window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'holographic-gallery',title:selected?.title}}))
 const openLive=()=>{(window as any).__showTryAMMLive?.();window.dispatchEvent(new CustomEvent('tryamm:live-shopping-product-featured',{detail:{source:'holographic-gallery',productId:selected?.productId,itemId:selected?.id}}))}
 if(minimized)return <button autoFocus type="button" onClick={()=>setMinimized(false)}
  style={{...button,position:'fixed',left:'max(8px,env(safe-area-inset-left))',top:'max(8px,env(safe-area-inset-top))',zIndex:2147483501}}>Restore gallery</button>
 return <div role="dialog" aria-label="TRYAMM Holographic Gallery" className="holo-gallery" data-maximized={maximized} onKeyDown={event=>{if(event.key==='Escape'){event.stopPropagation();onClose()}}}>
  <style>{`
   .holo-gallery{position:fixed;inset:8px;z-index:17200;max-width:1100px;margin:auto;display:flex;flex-direction:column;background:#030811;color:white;font-family:system-ui;border:1px solid #31566e;border-radius:16px;overflow:hidden}
   .holo-gallery[data-maximized=true]{inset:0;max-width:none;border-radius:0}
   .holo-gallery *{box-sizing:border-box}
   .holo-gallery-tools{display:flex;align-items:center;flex-wrap:wrap;gap:5px;padding:6px max(8px,env(safe-area-inset-right)) 6px max(8px,env(safe-area-inset-left));padding-top:max(6px,env(safe-area-inset-top));background:#10202c}
   .holo-gallery-tools button{min-height:44px;padding:0 8px;font:600 14px system-ui;color:white;background:#163649;border:1px solid #57788d;border-radius:8px}
   .holo-gallery button:focus-visible{outline:3px solid #ffda85;outline-offset:-3px}
   .holo-gallery-body{overflow:auto;overscroll-behavior:contain;padding:12px 12px max(20px,env(safe-area-inset-bottom))}
   .holo-gallery-grid{display:grid;grid-template-columns:minmax(180px,280px) minmax(0,1fr);gap:12px}
   .holo-gallery-grid[data-collapsed=true]{grid-template-columns:minmax(0,1fr)}
   .holo-gallery canvas{display:block;width:100%;height:100%}
   @media(max-width:700px){.holo-gallery-grid{grid-template-columns:minmax(0,1fr)}.holo-gallery-exhibits{display:none}}
   @media(min-width:701px){.holo-gallery-picker{display:none}}
  `}</style>
  <div className="holo-gallery-tools" role="group" aria-label="Gallery window controls">
   <button autoFocus type="button" onClick={()=>setMinimized(true)}>Minimize</button>
   <button type="button" aria-pressed={maximized} onClick={()=>setMaximized(!maximized)}>{maximized?'Restore size':'Maximize'}</button>
   <button type="button" aria-expanded={!collapsed} aria-controls="gallery-exhibits" onClick={()=>setCollapsed(!collapsed)}>{collapsed?'Expand':'Collapse'}</button>
   <button type="button" aria-label="Close gallery" onClick={onClose}>× Close</button>
  </div>
  <div className="holo-gallery-body">
   <h1 style={{margin:'0 0 12px',fontSize:'clamp(24px,5vw,40px)'}}>HOLOGRAPHIC GALLERY</h1>
   <div className="holo-gallery-grid" data-collapsed={collapsed}>
    <aside id="gallery-exhibits" hidden={collapsed} style={panel}>
     <label className="holo-gallery-picker">Exhibit
      <select value={selectedId} onChange={e=>setSelectedId(e.target.value)} style={{display:'block',width:'100%',minHeight:44,font:'inherit'}}>
       {items.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}
      </select>
     </label>
     <div className="holo-gallery-exhibits"><strong>Exhibits</strong>
      <div style={{display:'grid',gap:8,marginTop:9}}>{items.map(item=><button key={item.id} aria-pressed={selectedId===item.id} onClick={()=>setSelectedId(item.id)} style={{...itemButton,minHeight:44,borderColor:selectedId===item.id?'#62e8ff':'#1e3748'}}>{item.title}</button>)}</div>
     </div>
    </aside>
    <main style={panel}>
     <HolographicGalleryViewport assetUrl={selected.assetUrl} title={selected.title}/>
     <h2>{selected.title}</h2><div style={{fontSize:11,color:'#80a0b6'}}>{selected.creator} • {selected.kind.replaceAll('-',' ').toUpperCase()}</div>
     <p style={{fontSize:12,color:'#b7c8d4',lineHeight:1.65}}>{selected.description}</p>
     {selected.priceMinor&&<div style={{fontSize:26,fontWeight:950}}>${(selected.priceMinor/100).toFixed(2)}</div>}
     <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>{selected.shoppable&&<button onClick={buy} style={button}>BUY / CHECKOUT</button>}<button onClick={openReel} style={button}>MAKE REEL</button><button onClick={openLive} style={button}>FEATURE IN LIVE</button><button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:holo-scan-request',{detail:{source:'holographic-gallery',targetId:selected.id,item:selected}}))} style={button}>HOLO SCAN</button>{selected.assetUrl&&<button onClick={()=>{window.dispatchEvent(new CustomEvent('tryamm:holo-gallery-ar-request',{detail:{source:'holographic-gallery',targetId:selected.id,title:selected.title,assetUrl:selected.assetUrl}}));window.dispatchEvent(new CustomEvent('tryamm:holo-scan-request',{detail:{source:'holographic-gallery',kind:'gallery-ar',targetId:selected.id,assetUrl:selected.assetUrl}}))}} style={button}>AR / HOLO</button>}</div>
    </main>
   </div>
   <section style={{...panel,marginTop:12}}><b style={{color:'#77efb1'}}>GALLERY BUSINESS MODEL</b><div style={{fontSize:12,lineHeight:1.7,color:'#c5d6df',marginTop:6}}>Creator exhibit → Holo Lens / AR / VR view → Reel or LIVE feature → product / ticket / license / rental / sponsorship intent → verified checkout → Creator Money / Business Income ledger. Exhibits can also become StreetVerse interiors, event venues, museums, stores and branded showrooms.</div></section>
  </div>
 </div>
}
const panel:React.CSSProperties={background:'#07111ddd',border:'1px solid #20394b',borderRadius:16,padding:14}
const button:React.CSSProperties={minHeight:44,border:'1px solid #50e7ff77',borderRadius:10,background:'#0c2531',color:'#fff',fontWeight:900,padding:'0 12px'}
const itemButton:React.CSSProperties={display:'grid',gap:5,textAlign:'left',padding:11,border:'1px solid #1e3748',borderRadius:11,background:'#08131d',color:'#fff'}