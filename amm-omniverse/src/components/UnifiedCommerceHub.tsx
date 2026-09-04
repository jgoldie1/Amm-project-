import { useEffect, useMemo, useState } from 'react'

type Lane='grocery'|'beauty'|'business'
type Cost={wholesale:number;freight:number;pickPack:number;payment:number;spoilage:number;delivery:number;margin:number}
type Product={name:string;category:string;target:number;margin:string;source:string}

const grocery:Product[]=[
{name:'Rice 5 lb',category:'Pantry',target:6.99,margin:'22–30%',source:'AWG / UNFI'},
{name:'Dry beans 2 lb',category:'Pantry',target:3.99,margin:'25–35%',source:'AWG / UNFI'},
{name:'Oats 42 oz',category:'Breakfast',target:5.99,margin:'25–35%',source:'AWG / KeHE'},
{name:'Frozen vegetables 12–16 oz',category:'Frozen',target:2.49,margin:'25–35%',source:'AWG / KeHE'},
{name:'Frozen fruit 16 oz',category:'Frozen',target:4.99,margin:'25–35%',source:'KeHE / UNFI'},
{name:'Whole-grain pasta',category:'Pantry',target:2.49,margin:'25–35%',source:'AWG / KeHE'},
{name:'Low-sodium canned vegetables',category:'Pantry',target:1.49,margin:'25–35%',source:'AWG / UNFI'},
{name:'Plant-based milk 64 oz',category:'Dairy alternative',target:4.49,margin:'25–35%',source:'KeHE / UNFI'},
{name:'Healthy cooking oil',category:'Pantry',target:8.99,margin:'20–30%',source:'AWG / KeHE'},
{name:'Family healthy staple box',category:'Bundle',target:39.99,margin:'18–25%',source:'Multi-supplier'}]

const beauty:Product[]=[
{name:'Synthetic everyday wig',category:'Wigs',target:29.99,margin:'40–55%',source:'Jinny / Bee Sales / PK'},
{name:'Premium synthetic wig',category:'Wigs',target:49.99,margin:'40–55%',source:'Jinny / Bee Sales'},
{name:'Human-hair bundle',category:'Hair',target:69.99,margin:'35–50%',source:'Verified beauty wholesaler'},
{name:'3-bundle hair deal',category:'Hair bundle',target:179.99,margin:'30–45%',source:'Verified beauty wholesaler'},
{name:'Braiding hair pack',category:'Braiding',target:6.99,margin:'35–50%',source:'Jinny / Bee Sales / PK'},
{name:'Closure / frontal',category:'Hair',target:79.99,margin:'35–50%',source:'Verified beauty wholesaler'},
{name:'Lash multipack',category:'Lashes',target:9.99,margin:'45–60%',source:'Bee Sales / PK'},
{name:'Lip / makeup item',category:'Makeup',target:7.99,margin:'40–55%',source:'Bee Sales / PK'},
{name:'Nail starter kit',category:'Nails',target:39.99,margin:'35–50%',source:'Nail Superstore / beauty wholesaler'},
{name:'Salon / beauty starter box',category:'Business bundle',target:299,margin:'25–40%',source:'Multi-supplier'}]

const startup=[
{title:'Nail Tech Starter',price:'$299',detail:'Core nail tools, tips, gel/acrylic starter assortment, sanitation/storage basics and retail add-ons.'},
{title:'Beauty Seller Starter',price:'$499',detail:'Fast-moving wigs, braiding hair, lashes, accessories, displays and TRYAMM storefront setup.'},
{title:'Beauty Store Launch',price:'$2,499+',detail:'Opening assortment planning, supplier/MOQ routing, pricing, storefront, catalog and reorder plan. Inventory varies by approved quote.'},
{title:'Grocery Micro-Market',price:'$1,499+',detail:'Shelf-stable healthy staples, small-parcel specialty assortment, pricing plan and pickup/delivery catalog. Inventory varies by quote.'}]

function initialRoute(){
 const p=window.location.pathname.replace(/\/$/,'')
 if(p==='/yahavah-grocery')return {open:true,lane:'grocery' as Lane,coupon:false}
 if(p==='/beauty-supply'||p==='/all-american-beauty')return {open:true,lane:'beauty' as Lane,coupon:false}
 if(p==='/supply-plug'||p==='/supply-plug-global')return {open:true,lane:'business' as Lane,coupon:false}
 if(p==='/holo-coupon')return {open:true,lane:'grocery' as Lane,coupon:true}
 return {open:false,lane:'grocery' as Lane,coupon:false}
}

export default function UnifiedCommerceHub(){
 const route=initialRoute()
 const [open,setOpen]=useState(route.open);const [lane,setLane]=useState<Lane>(route.lane);const [coupon,setCoupon]=useState(route.coupon)
 const [cost,setCost]=useState<Cost>({wholesale:40,freight:4,pickPack:3,payment:2,spoilage:1,delivery:6,margin:8})
 useEffect(()=>{const show=(target?:Lane)=>{if(target)setLane(target);setOpen(true)};(window as any).__showYahavahGrocery=()=>show('grocery');(window as any).__showAllAmericanBeauty=()=>show('beauty');(window as any).__showSupplyPlug=()=>show('business');(window as any).__showHoloCoupon=()=>{setCoupon(true);setOpen(true)};return()=>{delete (window as any).__showYahavahGrocery;delete (window as any).__showAllAmericanBeauty;delete (window as any).__showSupplyPlug;delete (window as any).__showHoloCoupon}},[])
 const floor=useMemo(()=>Object.values(cost).reduce((a,b)=>a+Number(b||0),0),[cost])
 const products=lane==='grocery'?grocery:beauty
 if(!open)return null
 const close=()=>{setOpen(false);if(['/yahavah-grocery','/beauty-supply','/all-american-beauty','/supply-plug','/supply-plug-global','/holo-coupon'].includes(window.location.pathname.replace(/\/$/,'')))window.location.href='/'}
 return <div role="dialog" aria-modal="true" aria-label="TRYAMM Living Commerce" style={{position:'fixed',inset:0,zIndex:23050,background:'rgba(2,4,10,.97)',color:'#fff',overflow:'auto'}}><div style={{maxWidth:1180,margin:'0 auto',padding:18}}>
  <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><div><div style={{color:'#4FE3FF',fontSize:10,fontWeight:900,letterSpacing:3}}>TRYAMM LIVING COMMERCE · SUPPLY PLUG GLOBAL</div><h1 style={{margin:'5px 0'}}>YAHAVAH Grocery • All American Beauty • Business-in-a-Box</h1><div style={{color:'#9fb3c6',fontSize:11}}>Target prices are launch guardrails—not supplier quotes. Final price engine uses verified landed cost, fees, MAP rules and margin floor.</div></div><button onClick={close} style={btn}>Close</button></header>
  <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'14px 0'}}>{([['grocery','YAHAVAH Grocery'],['beauty','Beauty Supply'],['business','Start Your Business']] as [Lane,string][]).map(([id,label])=><button key={id} onClick={()=>setLane(id)} style={{...btn,background:lane===id?'#12354a':'#0b1320'}}>{label}</button>)}<button onClick={()=>setCoupon(v=>!v)} style={{...btn,borderColor:'#E8B94499',color:'#ffe49b'}}>✦ Holo Coupon</button></div>
  {coupon&&<section style={{...panel,borderColor:'#E8B94466'}}><h2>Holo Coupon Wallet</h2><p style={{color:'#c9b977'}}>Coupons never bypass the safe floor. Fund discounts with supplier promotions, membership value, sponsored offers, loyalty credits, bundles or controlled acquisition budget.</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:8}}>{['WELCOME10 · up to 10% funded discount','BASKET5 · $5 on qualifying basket','BUNDLE SAVE · automatic multi-buy value','CREATOR CODE · attributable creator promotion','STREETVERSE DROP · mission-linked promotional offer'].map(x=><div key={x} style={card}>{x}</div>)}</div></section>}
  {lane!=='business'?<><section style={panel}><h2>{lane==='grocery'?'Healthy-value launch catalog':'High-margin beauty launch catalog'}</h2><div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}><thead><tr>{['Product','Category','Target retail','Target gross margin','Supplier lane'].map(x=><th key={x} style={th}>{x}</th>)}</tr></thead><tbody>{products.map(p=><tr key={p.name}><td style={td}><b>{p.name}</b></td><td style={td}>{p.category}</td><td style={td}>${p.target.toFixed(2)}</td><td style={td}>{p.margin}</td><td style={td}>{p.source}</td></tr>)}</tbody></table></div></section>
  <section style={panel}><h2>Dynamic floor-price engine</h2><p style={{color:'#9fb3c6'}}>WHOLESALE + FREIGHT + PICK/PACK + PAYMENT FEE + SPOILAGE RESERVE + DELIVERY + REQUIRED MARGIN = FLOOR PRICE. The catalog must never publish below the higher of this floor or an applicable supplier MAP constraint.</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:8}}>{Object.entries(cost).map(([k,v])=><label key={k} style={card}>{k}<input type="number" value={v} onChange={e=>setCost(c=>({...c,[k]:Number(e.target.value)||0}))} style={input}/></label>)}</div><div style={{marginTop:12,fontSize:22,fontWeight:950,color:'#E8B944'}}>SAFE FLOOR: ${floor.toFixed(2)}</div></section></>:<><section style={panel}><h2>Supply Plug Global · Business-in-a-Box</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:8}}>{startup.map(x=><div key={x.title} style={card}><h3 style={{marginTop:0}}>{x.title}</h3><div style={{fontSize:22,color:'#E8B944',fontWeight:950}}>{x.price}</div><p style={{color:'#9fb3c6'}}>{x.detail}</p></div>)}</div></section><section style={panel}><h2>Entrepreneur engine</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:8}}>{['STARTUP BUDGET','STORE TYPE','LOCATION','PRODUCT MIX','VERIFIED WHOLESALERS','MOQ','LANDED COST','OPENING INVENTORY','FLOOR PRICE','RETAIL PRICE','TRYAMM STOREFRONT','LIVE COMMERCE','LOCAL DELIVERY','AUTOMATIC REORDER'].map((x,i)=><div key={x} style={card}><b>{i+1}. {x}</b></div>)}</div></section></>}
  <section style={panel}><h2>Supplier routing</h2><p style={{color:'#9fb3c6',lineHeight:1.6}}>Grocery: AWG for cooperative scale/private brands when membership economics fit; KeHE for specialty/natural/fresh and small-parcel expansion; UNFI for scaled conventional/natural distribution after order volume supports its minimums. Beauty: Jinny, Bee Sales, PK International and specialist nail wholesalers, subject to account approval, authenticity, MAP and current quotes.</p></section>
  <section style={panel}><b>PRODUCT FLOW</b><div style={{marginTop:8,color:'#9fb3c6'}}>VERIFIED SUPPLIER → SUPPLY PLUG GLOBAL → LANDED COST → VIRTUAL WAREHOUSE → STOREFRONT → ORDER RESERVATION → VERIFIED PAYMENT → PICK/PACK → DELIVERY/PICKUP → PROOF → INVENTORY DECREMENT → REORDER</div></section>
  <section style={panel}><b>ULTIMATE TRYAMM LOOP</b><div style={{marginTop:8,color:'#9fb3c6'}}>PERSON → HOLOGPT → INTENT → GUARDIAN COVENANT → HOLO CONCIERGE → HOLO MENU → WORLD/STORE/SERVICE → CART OR EXPERIENCE → AUTHORIZATION → VERIFIED RESULT → WALLET/XP/INVENTORY → PERSONAL MEMORY → NEXT EXPERIENCE</div></section>
 </div></div>
}
const panel:React.CSSProperties={marginTop:12,padding:16,border:'1px solid #20374a',borderRadius:18,background:'#07111c'}
const card:React.CSSProperties={padding:12,border:'1px solid #26394a',borderRadius:12,background:'#0a1521',fontSize:12}
const btn:React.CSSProperties={border:'1px solid #4FE3FF77',borderRadius:10,padding:'10px 13px',background:'#0b1a27',color:'#fff',fontWeight:900,cursor:'pointer',minHeight:44}
const input:React.CSSProperties={display:'block',width:'100%',boxSizing:'border-box',marginTop:7,padding:8,borderRadius:8,border:'1px solid #345',background:'#030914',color:'#fff',minHeight:44}
const th:React.CSSProperties={textAlign:'left',padding:10,borderBottom:'1px solid #345',color:'#4FE3FF'}
const td:React.CSSProperties={padding:10,borderBottom:'1px solid #172938',verticalAlign:'top'}
