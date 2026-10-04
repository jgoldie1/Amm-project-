import {useMemo,useState} from 'react'

type GalleryItem={id:string;title:string;creator:string;kind:'3d-product'|'art'|'music'|'reel'|'world-object'|'collectible';priceMinor?:number;currency?:string;productId?:string;assetUrl?:string;description:string;shoppable:boolean}

const seed:GalleryItem[]=[
 {id:'gallery-1',title:'StreetVerse Creator Jacket',creator:'All American Marketplace',kind:'3d-product',priceMinor:8900,currency:'USD',productId:'streetverse-jacket',description:'Holographic product display with AR/VR-ready product identity.',shoppable:true},
 {id:'gallery-2',title:'Chicago World Art',creator:'TRYAMM Creator',kind:'art',priceMinor:2400,currency:'USD',productId:'chicago-world-art',description:'Creator artwork that can appear in a virtual gallery, Reel, LIVE room or StreetVerse interior.',shoppable:true},
 {id:'gallery-3',title:'Holo Music Showcase',creator:'All American Records',kind:'music',description:'Rights-aware music exhibit linked to creator pages, LIVE and ticket/merch commerce.',shoppable:false},
 {id:'gallery-4',title:'StreetVerse Memory Reel',creator:'TRYAMM Creator',kind:'reel',description:'A Reel can be projected into the gallery and used as an entry point into the world.',shoppable:false},
]

export default function HolographicGalleryCenter({onClose}:{onClose:()=>void}){
 const [items]=useState(seed)
 const [selectedId,setSelectedId]=useState(seed[0].id)
 const selected=useMemo(()=>items.find(x=>x.id===selectedId)||items[0],[items,selectedId])
 const buy=()=>{
  if(!selected?.shoppable||!selected.productId)return
  window.dispatchEvent(new CustomEvent('tryamm:commerce-intent-request',{detail:{schema:'tryamm.revenue.intent.v1',id:'gallery-'+selected.id+'-'+Date.now(),surface:'world-object',channel:'product-sale',itemId:selected.productId,currency:selected.currency||'USD',amountMinor:selected.priceMinor,attribution:{sourceContentId:selected.id,sourceVerse:'streetverse'},requiresServerVerification:true,clientMayCreatePayableBalance:false,authority:'server',settlement:'transaction-orchestrator'}}))
 }
 const openReel=()=>window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'holographic-gallery',title:selected?.title}}))
 const openLive=()=>{(window as any).__showTryAMMLive?.();window.dispatchEvent(new CustomEvent('tryamm:live-shopping-product-featured',{detail:{source:'holographic-gallery',productId:selected?.productId,itemId:selected?.id}}))}
 return <div role="dialog" aria-modal="true" aria-label="TRYAMM Holographic Gallery" style={{position:'fixed',inset:0,zIndex:17200,background:'radial-gradient(circle at top,#10283c,#030611 52%,#010207)',color:'#fff',overflowY:'auto',fontFamily:'system-ui'}}>
  <div style={{maxWidth:1100,margin:'0 auto',padding:'18px 14px 70px'}}>
   <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start'}}>
    <div><div style={{fontSize:10,letterSpacing:3,color:'#62e8ff',fontWeight:950}}>HOLOVERSE • CREATOR + COMMERCE</div><h1 style={{margin:'5px 0',fontSize:'clamp(30px,7vw,52px)'}}>HOLOGRAPHIC GALLERY</h1><div style={{fontSize:12,color:'#a7bccd',lineHeight:1.55,maxWidth:760}}>3D products • art • music • Reels • virtual exhibits • creator showcases • shoppable world objects. Gallery commerce still requires server-verified pricing and payment.</div></div>
    <button onClick={onClose} style={close}>×</button>
   </header>
   <div style={{display:'grid',gridTemplateColumns:'minmax(220px,320px) 1fr',gap:12,marginTop:16}}>
    <aside style={panel}><div style={{fontSize:10,color:'#8ea4b7',fontWeight:900}}>EXHIBITS</div><div style={{display:'grid',gap:8,marginTop:9}}>{items.map(item=><button key={item.id} onClick={()=>setSelectedId(item.id)} style={{...itemButton,borderColor:selectedId===item.id?'#62e8ff':'#1e3748'}}><b>{item.title}</b><span style={{fontSize:9,color:'#8196a8'}}>{item.kind.toUpperCase()} • {item.creator}</span></button>)}</div></aside>
    <main style={panel}>
     <div aria-hidden="true" style={{minHeight:250,borderRadius:18,border:'1px solid #31566e',background:'radial-gradient(circle,#50e7ff33,#122234 42%,#050a10 72%)',display:'grid',placeItems:'center',boxShadow:'inset 0 0 80px #42e7ff18'}}><div style={{textAlign:'center'}}><div style={{fontSize:70}}>◈</div><div style={{fontSize:11,letterSpacing:3,color:'#62e8ff'}}>HOLOGRAPHIC DISPLAY SURFACE</div></div></div>
     <h2>{selected.title}</h2><div style={{fontSize:11,color:'#80a0b6'}}>{selected.creator} • {selected.kind.replaceAll('-',' ').toUpperCase()}</div>
     <p style={{fontSize:12,color:'#b7c8d4',lineHeight:1.65}}>{selected.description}</p>
     {selected.priceMinor&&<div style={{fontSize:26,fontWeight:950}}>${(selected.priceMinor/100).toFixed(2)}</div>}
     <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>{selected.shoppable&&<button onClick={buy} style={button}>BUY / CHECKOUT</button>}<button onClick={openReel} style={button}>MAKE REEL</button><button onClick={openLive} style={button}>FEATURE IN LIVE</button><button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:holo-scan-request',{detail:{source:'holographic-gallery',targetId:selected.id,item:selected}}))} style={button}>HOLO SCAN</button></div>
    </main>
   </div>
   <section style={{...panel,marginTop:12}}><b style={{color:'#77efb1'}}>GALLERY BUSINESS MODEL</b><div style={{fontSize:12,lineHeight:1.7,color:'#c5d6df',marginTop:6}}>Creator exhibit → Holo Lens / AR / VR view → Reel or LIVE feature → product / ticket / license / rental / sponsorship intent → verified checkout → Creator Money / Business Income ledger. Exhibits can also become StreetVerse interiors, event venues, museums, stores and branded showrooms.</div></section>
  </div>
 </div>
}
const panel:React.CSSProperties={background:'#07111ddd',border:'1px solid #20394b',borderRadius:16,padding:14}
const close:React.CSSProperties={width:44,height:44,borderRadius:'50%',border:'1px solid #36536a',background:'#0a1622',color:'#fff',fontSize:24}
const button:React.CSSProperties={minHeight:44,border:'1px solid #50e7ff77',borderRadius:10,background:'#0c2531',color:'#fff',fontWeight:900,padding:'0 12px'}
const itemButton:React.CSSProperties={display:'grid',gap:5,textAlign:'left',padding:11,border:'1px solid #1e3748',borderRadius:11,background:'#08131d',color:'#fff'}