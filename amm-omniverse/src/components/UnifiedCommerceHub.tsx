import { useEffect, useMemo, useState } from 'react'

type Lane='grocery'|'beauty'|'business'
type Cost={wholesale:number;freight:number;pickPack:number;payment:number;spoilage:number;delivery:number;margin:number}
type Product={name:string;category:string;target:number;margin:string;source:string;note?:string}

const grocery:Product[]=[
{name:'Rice 5 lb',category:'Pantry',target:6.99,margin:'22–30%',source:'Verified grocery wholesaler'},
{name:'Dry beans 2 lb',category:'Pantry',target:3.99,margin:'25–35%',source:'Verified grocery wholesaler'},
{name:'Oats 42 oz',category:'Breakfast',target:5.99,margin:'25–35%',source:'Verified grocery wholesaler'},
{name:'Frozen vegetables 12–16 oz',category:'Frozen',target:2.49,margin:'25–35%',source:'Verified cold-chain supplier'},
{name:'Frozen fruit 16 oz',category:'Frozen',target:4.99,margin:'25–35%',source:'Verified cold-chain supplier'},
{name:'Whole-grain pasta',category:'Pantry',target:2.49,margin:'25–35%',source:'Verified grocery wholesaler'},
{name:'Plant-based milk 64 oz',category:'Dairy alternative',target:4.49,margin:'25–35%',source:'Verified cold-chain supplier'},
{name:'Family healthy staple box',category:'Food supplies',target:39.99,margin:'18–25%',source:'Multi-supplier'},
{name:'Emergency pantry supply box',category:'Food supplies',target:59.99,margin:'15–24%',source:'Verified shelf-stable suppliers',note:'Shelf-stable food, water-ready meal staples and household rotation guidance.'},
{name:'Wild-caught fish selection',category:'Eat Wild Food',target:18.99,margin:'18–28%',source:'Licensed seafood supplier',note:'Only commercially supplied, traceable and legally harvested products.'},
{name:'Cultivated specialty mushrooms',category:'Eat Wild Food',target:8.99,margin:'22–32%',source:'Verified farm / licensed food seller',note:'No unknown wild mushroom identification or safety claims.'},
{name:'Seasonal foraged-style berry preserve',category:'Eat Wild Food',target:9.99,margin:'25–35%',source:'Licensed food producer',note:'Commercially prepared product only; source and ingredient records required.'}]

const beauty:Product[]=[
{name:'Synthetic everyday wig',category:'Wigs',target:29.99,margin:'40–55%',source:'Verified beauty wholesaler'},
{name:'Premium synthetic wig',category:'Wigs',target:49.99,margin:'40–55%',source:'Verified beauty wholesaler'},
{name:'Human-hair bundle',category:'Hair',target:69.99,margin:'35–50%',source:'Verified beauty wholesaler'},
{name:'Braiding hair pack',category:'Braiding',target:6.99,margin:'35–50%',source:'Verified beauty wholesaler'},
{name:'Nail starter kit',category:'Nails',target:39.99,margin:'35–50%',source:'Verified beauty wholesaler'}]

const startup=[
{title:'Grocery Micro-Market',price:'$1,499+',detail:'Shelf-stable staples, food-supply catalog, storefront, pickup/delivery setup and warehouse routing. Inventory varies by verified quote.'},
{title:'YAHAVAH Food Seller',price:'Quote',detail:'Creator or merchant storefront connected to LIVE/PK product pins, verified inventory, Holo Fridge replenishment and delivery.'},
{title:'Local Food Producer',price:'Quote',detail:'Catalog, batch/lot records, order intake, pickup/delivery and compliance gates for applicable food operations.'},
{title:'Beauty Seller Starter',price:'$499',detail:'Fast-moving beauty assortment, TRYAMM storefront setup and live-commerce routing.'}]

export default function UnifiedCommerceHub(){
 const [open,setOpen]=useState(false);const [lane,setLane]=useState<Lane>('grocery');const [coupon,setCoupon]=useState(false);const [wildOnly,setWildOnly]=useState(false)
 const [cost,setCost]=useState<Cost>({wholesale:40,freight:4,pickPack:3,payment:2,spoilage:1,delivery:6,margin:8})
 useEffect(()=>{const show=(target?:Lane)=>{if(target)setLane(target);setOpen(true)};(window as any).__showYahavahGrocery=()=>show('grocery');(window as any).__showYahavahFood=()=>show('grocery');(window as any).__showEatWildFood=()=>{setLane('grocery');setWildOnly(true);setOpen(true)};(window as any).__showAllAmericanBeauty=()=>show('beauty');(window as any).__showSupplyPlug=()=>show('business');(window as any).__showHoloCoupon=()=>{setCoupon(true);setOpen(true)};return()=>{delete (window as any).__showYahavahGrocery;delete (window as any).__showYahavahFood;delete (window as any).__showEatWildFood;delete (window as any).__showAllAmericanBeauty;delete (window as any).__showSupplyPlug;delete (window as any).__showHoloCoupon}},[])
 const floor=useMemo(()=>Object.values(cost).reduce((a,b)=>a+Number(b||0),0),[cost])
 const products=lane==='grocery'?(wildOnly?grocery.filter(p=>p.category==='Eat Wild Food'):grocery):beauty
 const openLive=()=>{(window as any).__showLive?.();window.dispatchEvent(new CustomEvent('tryamm:live-commerce-open',{detail:{source:'yahavah-food',mode:'live-pk-storefront'}}))}
 if(!open)return null
 return <div role="dialog" aria-modal="true" aria-label="TRYAMM Living Commerce" style={{position:'fixed',inset:0,zIndex:13050,background:'rgba(2,4,10,.97)',color:'#fff',overflow:'auto'}}><div style={{maxWidth:1180,margin:'0 auto',padding:18}}>
  <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><div><div style={{color:'#4FE3FF',fontSize:10,fontWeight:900,letterSpacing:3}}>TRYAMM LIVING COMMERCE · YAHAVAH FOOD · SUPPLY PLUG</div><h1 style={{margin:'5px 0'}}>YAHAVAH Food • Groceries • Eat Wild Food • Food Supplies</h1><div style={{color:'#9fb3c6',fontSize:11}}>Storefront inventory routes through verified suppliers, warehouse availability, fulfillment and Vault/ledger records before an order is treated as complete.</div></div><button onClick={()=>setOpen(false)} style={btn}>Close</button></header>
  <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'14px 0'}}>{([['grocery','YAHAVAH Food'],['beauty','Beauty Supply'],['business','Start Your Business']] as [Lane,string][]).map(([id,label])=><button key={id} onClick={()=>{setLane(id);setWildOnly(false)}} style={{...btn,background:lane===id?'#12354a':'#0b1320'}}>{label}</button>)}<button onClick={()=>{setLane('grocery');setWildOnly(v=>!v)}} style={{...btn,borderColor:'#7ef29a88'}}>🌿 Eat Wild Food</button><button onClick={openLive} style={{...btn,borderColor:'#ff6fae88'}}>● LIVE / PK SELL</button><button onClick={()=>setCoupon(v=>!v)} style={{...btn,borderColor:'#E8B94499',color:'#ffe49b'}}>✦ Holo Coupon</button></div>
  {coupon&&<section style={{...panel,borderColor:'#E8B94466'}}><h2>Holo Coupon Wallet</h2><p style={{color:'#c9b977'}}>Coupons never bypass the safe floor. Discounts can be funded by supplier promotions, sponsorships, memberships, creator codes or controlled acquisition budgets.</p></section>}
  {lane!=='business'?<><section style={panel}><h2>{lane==='grocery'?(wildOnly?'Eat Wild Food · verified commercial products':'YAHAVAH Food launch catalog'):'Beauty launch catalog'}</h2><div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}><thead><tr>{['Product','Category','Target retail','Margin','Supplier lane','Safety / supply note'].map(x=><th key={x} style={th}>{x}</th>)}</tr></thead><tbody>{products.map(p=><tr key={p.name}><td style={td}><b>{p.name}</b></td><td style={td}>{p.category}</td><td style={td}>${p.target.toFixed(2)}</td><td style={td}>{p.margin}</td><td style={td}>{p.source}</td><td style={td}>{p.note||'Verified inventory and applicable food handling requirements.'}</td></tr>)}</tbody></table></div></section>
  {lane==='grocery'&&<section style={panel}><h2>LIVE / PK → Storefront → Warehouse → Holo Fridge</h2><div style={{color:'#9fb3c6',lineHeight:1.65}}>CREATOR OR FOOD BUSINESS → LIVE/PK DEMO → PIN PRODUCT → VIEWER CART → INVENTORY RESERVATION → VAULT ORDER RECORD → PAYMENT AUTHORIZATION → WAREHOUSE / STORE PICK → DELIVERY OR PICKUP → HOLO FRIDGE UPDATE → REVIEW / REEL → CREATOR ATTRIBUTION.</div><div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:10}}><button style={btn} onClick={openLive}>Start LIVE commerce</button><button style={btn} onClick={()=>{(window as any).__showVirtualWarehouse?.()}}>Open Warehouse</button><button style={btn} onClick={()=>{(window as any).__showHoloFridge?.()}}>Open Holo Fridge</button><button style={btn} onClick={()=>{(window as any).__showVault?.();(window as any).__showOmniVault?.()}}>Open Vault</button></div></section>}
  <section style={panel}><h2>Dynamic floor-price engine</h2><p style={{color:'#9fb3c6'}}>WHOLESALE + FREIGHT + PICK/PACK + PAYMENT FEE + SPOILAGE RESERVE + DELIVERY + REQUIRED MARGIN = FLOOR PRICE. Do not publish below verified floor/MAP constraints.</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:8}}>{Object.entries(cost).map(([k,v])=><label key={k} style={card}>{k}<input type="number" value={v} onChange={e=>setCost(c=>({...c,[k]:Number(e.target.value)||0}))} style={input}/></label>)}</div><div style={{marginTop:12,fontSize:22,fontWeight:950,color:'#E8B944'}}>SAFE FLOOR: ${floor.toFixed(2)}</div></section></>:<><section style={panel}><h2>Supply Plug · Business-in-a-Box</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:8}}>{startup.map(x=><div key={x.title} style={card}><h3 style={{marginTop:0}}>{x.title}</h3><div style={{fontSize:22,color:'#E8B944',fontWeight:950}}>{x.price}</div><p style={{color:'#9fb3c6'}}>{x.detail}</p></div>)}</div></section></>}
  <section style={{...panel,borderColor:'#7ef29a55'}}><h2>Eat Wild Food safety gate</h2><p style={{color:'#b8cbbd',lineHeight:1.6}}>This lane is for lawful, commercially supplied and traceable foods. TRYAMM must not tell a user that an unknown wild mushroom, plant, berry, fish or animal is safe to eat from an image alone. Sellers need applicable licensing/food-safety compliance, source records and lawful harvest/sale status where required.</p></section>
  <section style={panel}><h2>Warehouse + food-supply resilience</h2><div style={{color:'#9fb3c6'}}>SKU → LOT/BATCH → SELLER → LOCATION → AVAILABLE QUANTITY → EXPIRATION/USE-BY → TEMPERATURE CLASS → RESERVED → PICKED → DELIVERED. Low-stock alerts can drive household replenishment, merchant purchase orders, community food boxes and emergency supply planning without automatically charging a customer.</div></section>
  <section style={panel}><b>ULTIMATE FOOD LOOP</b><div style={{marginTop:8,color:'#9fb3c6'}}>WATCH → DISCOVER → BUY → VERIFY INVENTORY → FULFILL → DELIVER/PICKUP → STOCK HOLO FRIDGE → USE/COOK → REVIEW/REEL → CREATOR ATTRIBUTION → REORDER</div></section>
 </div></div>
}
const panel:React.CSSProperties={marginTop:12,padding:16,border:'1px solid #20374a',borderRadius:18,background:'#07111c'}
const card:React.CSSProperties={padding:12,border:'1px solid #26394a',borderRadius:12,background:'#0a1521',fontSize:12}
const btn:React.CSSProperties={border:'1px solid #4FE3FF77',borderRadius:10,padding:'10px 13px',background:'#0b1a27',color:'#fff',fontWeight:900,cursor:'pointer'}
const input:React.CSSProperties={display:'block',width:'100%',boxSizing:'border-box',marginTop:7,padding:8,borderRadius:8,border:'1px solid #345',background:'#030914',color:'#fff'}
const th:React.CSSProperties={textAlign:'left',padding:10,borderBottom:'1px solid #345',color:'#4FE3FF'}
const td:React.CSSProperties={padding:10,borderBottom:'1px solid #172938',verticalAlign:'top'}
