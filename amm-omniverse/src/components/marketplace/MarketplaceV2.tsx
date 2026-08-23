// AMM Marketplace v2 — Shopify + QVC + HSN + Amazon Dropshipping
// Features: Live selling studio (QVC-style), product builder (Shopify-style),
// automated dropshipping (Amazon-style), supplier network, logistics dashboard,
// creator storefronts, flash sales, countdown timers, live viewer shopping

import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../../game/state/useGameStore'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Product {
  id: string
  name: string
  description: string
  price: number
  comparePrice?: number  // strikethrough price (QVC style)
  cost: number           // dropship cost
  margin: number         // %
  category: string
  tags: string[]
  images: string[]       // emoji placeholders
  inventory: number
  sold: number
  rating: number
  reviews: number
  isDropship: boolean
  supplier?: string
  shipsIn: string        // "2-5 days"
  isLive?: boolean       // featured in live selling
  sku: string
  commission: number     // affiliate %
}

export interface Supplier {
  id: string
  name: string
  country: string
  categories: string[]
  minOrder: number
  shipsTo: string[]
  processingTime: string
  rating: number
  verified: boolean
  flag: string
}

export interface Order {
  id: string
  product: string
  customer: string
  amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
  shipsVia: string
  trackingNum?: string
  profit: number
  date: number
}

export interface LiveSession {
  id: string
  host: string
  title: string
  viewers: number
  products: Product[]
  currentProductIdx: number
  unitsSoldThisSession: number
  revenue: number
  chatActive: boolean
}

// ── Demo data ─────────────────────────────────────────────────────────────────

export const DEMO_PRODUCTS: Product[] = [
  { id:'p1', name:'Gospel Beats Pack Vol. 1', description:'50 original gospel/worship beats. Royalty-free for churches and creators.', price:29, comparePrice:79, cost:0, margin:100, category:'Music', tags:['faith','gospel','beats'], images:['🎵'], inventory:999, sold:412, rating:4.9, reviews:87, isDropship:false, shipsIn:'Instant', sku:'GB-001', commission:30 },
  { id:'p2', name:'Creator Starter Bundle', description:'Everything to launch your creator brand: templates, presets, scripts.', price:49, comparePrice:149, cost:0, margin:100, category:'Education', tags:['creator','tools'], images:['📦'], inventory:999, sold:287, rating:4.7, reviews:63, isDropship:false, shipsIn:'Instant', sku:'CS-002', commission:25 },
  { id:'p3', name:'Holographic LED Light Panel', description:'RGB panel for streaming setups. 20×20cm, USB-C, app controlled.', price:34.99, comparePrice:59.99, cost:8.50, margin:76, category:'Tech', tags:['streaming','setup','led'], images:['💡'], inventory:45, sold:156, rating:4.6, reviews:34, isDropship:true, supplier:'TechDrop CN', shipsIn:'7-12 days', sku:'LED-003', commission:15 },
  { id:'p4', name:'Faith Journal — Leather Cover', description:'Premium journal with Scripture prompts, feast calendar inserts, prayer tracker.', price:24.99, comparePrice:39.99, cost:7.20, margin:71, category:'Faith', tags:['faith','journal','prayer'], images:['📖'], inventory:120, sold:903, rating:4.9, reviews:201, isDropship:true, supplier:'PrintUS', shipsIn:'3-5 days', sku:'FJ-004', commission:20, isLive:true },
  { id:'p5', name:'AMM Creator Hoodie', description:'Premium heavyweight hoodie. "All American Creator" embroidered.', price:59.99, comparePrice:89.99, cost:18.50, margin:69, category:'Apparel', tags:['apparel','creator','brand'], images:['👕'], inventory:200, sold:78, rating:4.8, reviews:22, isDropship:true, supplier:'PrintfulUS', shipsIn:'5-7 days', sku:'AH-005', commission:18 },
  { id:'p6', name:'Boxing Training Program', description:'12-week program from Coach Titan. Video modules + PDF + Discord access.', price:97, comparePrice:297, cost:0, margin:100, category:'Fitness', tags:['boxing','fitness','program'], images:['🥊'], inventory:999, sold:34, rating:5.0, reviews:11, isDropship:false, shipsIn:'Instant', sku:'BTP-006', commission:40 },
]

export const DEMO_SUPPLIERS: Supplier[] = [
  { id:'s1', name:'PrintfulUS', country:'USA', categories:['Apparel','Print-on-demand'], minOrder:1, shipsTo:['US','CA','EU'], processingTime:'2-3 days', rating:4.8, verified:true, flag:'🇺🇸' },
  { id:'s2', name:'PrintUS', country:'USA', categories:['Books','Journals','Paper'], minOrder:1, shipsTo:['US','CA'], processingTime:'1-2 days', rating:4.9, verified:true, flag:'🇺🇸' },
  { id:'s3', name:'TechDrop CN', country:'China', categories:['Tech','Electronics','LED'], minOrder:5, shipsTo:['US','CA','AU','EU'], processingTime:'2-3 days', rating:4.5, verified:true, flag:'🇨🇳' },
  { id:'s4', name:'FaithGoods', country:'USA', categories:['Faith','Religious','Books'], minOrder:1, shipsTo:['US'], processingTime:'1-2 days', rating:4.9, verified:true, flag:'🇺🇸' },
  { id:'s5', name:'AMM Merch Hub', country:'USA', categories:['Apparel','Accessories','Custom'], minOrder:1, shipsTo:['US','CA'], processingTime:'3-5 days', rating:4.7, verified:true, flag:'🇺🇸' },
  { id:'s6', name:'DropEasy Global', country:'UK', categories:['General','Home','Accessories'], minOrder:1, shipsTo:['US','EU','AU','CA'], processingTime:'1-4 days', rating:4.6, verified:true, flag:'🇬🇧' },
]

export const DEMO_ORDERS: Order[] = [
  { id:'ORD-1001', product:'Faith Journal', customer:'SisRuth_ATL', amount:24.99, status:'delivered', shipsVia:'USPS', trackingNum:'9400111899223821047', profit:17.79, date:Date.now()-86400000*2 },
  { id:'ORD-1002', product:'Gospel Beats Pack', customer:'ChurchSound_TX', amount:29, status:'delivered', shipsVia:'Digital', profit:29, date:Date.now()-86400000 },
  { id:'ORD-1003', product:'LED Panel', customer:'StreamKing_LA', amount:34.99, status:'shipped', shipsVia:'FedEx', trackingNum:'784082456765', profit:26.49, date:Date.now()-3600000*6 },
  { id:'ORD-1004', product:'Creator Bundle', customer:'NewCreator_22', amount:49, status:'processing', shipsVia:'Digital', profit:49, date:Date.now()-3600000 },
  { id:'ORD-1005', product:'AMM Hoodie', customer:'King_2026', amount:59.99, status:'pending', shipsVia:'Printful', profit:41.49, date:Date.now()-1800000 },
]

// ── Main Marketplace Component ─────────────────────────────────────────────────

export default function MarketplaceV2({ onBack }: { onBack: () => void }) {
  const store = useGameStore()
  const [tab, setTab] = useState<'storefront'|'live_sell'|'add_product'|'suppliers'|'orders'|'analytics'>('storefront')
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS)
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS)
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null)
  const [liveChat, setLiveChat] = useState<Array<{user:string;text:string}>>([
    { user:'SisRuth', text:'This journal is beautiful 🙏' },
    { user:'ChurchPastor', text:'How fast does it ship?' },
    { user:'CreatorFan22', text:'BUYING NOW!! 🔥' },
  ])
  const [flashSale, setFlashSale] = useState<{product:Product;discount:number;endsIn:number}|null>(null)
  const [flashTimer, setFlashTimer] = useState(0)
  const [newProduct, setNewProduct] = useState({ name:'', price:'', description:'', category:'Faith', isDropship:false, supplier:'' })
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier|null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)

  const totalRevenue = orders.reduce((s,o) => s + o.amount, 0)
  const totalProfit = orders.reduce((s,o) => s + o.profit, 0)
  const convRate = 3.4 // mock

  useEffect(() => { chatRef.current?.scrollTo(0,9999) }, [liveChat])

  // Simulate live session activity
  useEffect(() => {
    if (!liveSession) return
    const iv = setInterval(() => {
      setLiveSession(s => s ? ({
        ...s,
        viewers: Math.max(10, s.viewers + Math.floor((Math.random()-0.3)*8)),
      }) : null)
      const msgs = [
        { user:'FAN_'+Math.floor(Math.random()*9999), text:Math.random()>0.5?'BUYING!!':'how much is shipping?' },
        { user:'SupportTeam', text:'Ships 3-5 days nationwide 🚚' },
        { user:'LIVE_BUYER', text:'just ordered x3 for my church ⛪🙏' },
      ]
      const msg = msgs[Math.floor(Math.random()*msgs.length)]
      setLiveChat(p => [...p.slice(-49), msg])
      // Random purchase during live
      if (Math.random() > 0.7 && liveSession) {
        const prod = liveSession.products[liveSession.currentProductIdx]
        if (prod) {
          setLiveSession(s => s ? ({...s, unitsSoldThisSession: s.unitsSoldThisSession+1, revenue: s.revenue+prod.price}) : null)
          setLiveChat(p => [...p, { user:'🎉 SYSTEM', text:`${['SisRuth','KingFan','CreatorX'][Math.floor(Math.random()*3)]} just bought ${prod.name}!` }])
          store.earnCash(Math.floor(prod.price * 0.9))
        }
      }
    }, 2500)
    return () => clearInterval(iv)
  }, [liveSession])

  // Flash sale timer
  useEffect(() => {
    if (!flashSale) return
    timerRef.current = setInterval(() => {
      setFlashSale(f => f ? ({ ...f, endsIn: f.endsIn - 1 }) : null)
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [flashSale])

  const startLive = () => {
    const featuredProducts = products.filter(p => p.isLive || p.sold > 100)
    setLiveSession({
      id:'ls_'+Date.now(), host: store.player.name||'You',
      title:'AMM Creator Live Shopping Event',
      viewers: Math.floor(Math.random()*300)+50,
      products: featuredProducts.length>0 ? featuredProducts : products.slice(0,3),
      currentProductIdx:0, unitsSoldThisSession:0, revenue:0, chatActive:true,
    })
    store.setNotif('🔴 Live selling session started!')
  }

  const launchFlashSale = (product: Product) => {
    const disc = Math.floor(Math.random()*20)+15 // 15-35% off
    setFlashSale({ product, discount:disc, endsIn: 300 }) // 5 min
    store.setNotif(`⚡ Flash sale launched! ${disc}% off ${product.name}`)
  }

  const addProductToStore = () => {
    if (!newProduct.name || !newProduct.price) { store.setNotif('❌ Name and price required'); return }
    const p: Product = {
      id:'user-'+Date.now(), name:newProduct.name, description:newProduct.description,
      price:parseFloat(newProduct.price)||0, cost:0, margin:100, category:newProduct.category,
      tags:[newProduct.category.toLowerCase()], images:['📦'], inventory:999,
      sold:0, rating:5.0, reviews:0, isDropship:newProduct.isDropship,
      supplier:newProduct.supplier||undefined, shipsIn:newProduct.isDropship?'5-7 days':'Instant',
      sku:'USR-'+Date.now().toString().slice(-6), commission:20,
    }
    setProducts(prev => [p, ...prev])
    store.earnXp(100); store.setNotif(`✅ "${newProduct.name}" listed! Share on social to drive traffic.`)
    setNewProduct({ name:'', price:'', description:'', category:'Faith', isDropship:false, supplier:'' })
    setTab('storefront')
  }

  const C = '#00cc44'
  const filteredProducts = products.filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.tags.some(t=>t.includes(searchTerm.toLowerCase())))

  return (
    <div style={{ width:'100%',height:'100%',background:'#020212',fontFamily:'monospace',display:'flex',flexDirection:'column' }}>
      {/* Header */}
      <div style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 16px',borderBottom:`1px solid ${C}33`,background:'rgba(0,5,0,0.95)' }}>
        <button onClick={onBack} style={{ background:`${C}11`,border:`1px solid ${C}44`,color:C,borderRadius:6,padding:'5px 12px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>← BACK</button>
        <span style={{ color:C,fontWeight:900,fontSize:15,letterSpacing:3 }}>🛒 AMM MARKETPLACE</span>
        {/* Live flash sale banner */}
        {flashSale && (
          <div style={{ marginLeft:'auto',background:'#ff440022',border:'1px solid #ff4400',borderRadius:6,padding:'4px 10px',fontSize:11,color:'#ff4400',display:'flex',gap:6,alignItems:'center' }}>
            ⚡ FLASH {flashSale.discount}% OFF · {Math.floor(flashSale.endsIn/60)}:{(flashSale.endsIn%60).toString().padStart(2,'0')}
          </div>
        )}
      </div>

      {/* Top metrics */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,padding:'8px 14px',borderBottom:`1px solid ${C}22` }}>
        {[
          { l:'REVENUE', v:`$${totalRevenue.toFixed(0)}`, c:'#00cc44' },
          { l:'PROFIT', v:`$${totalProfit.toFixed(0)}`, c:'#ffd700' },
          { l:'ORDERS', v:orders.length, c:C },
          { l:'PRODUCTS', v:products.length, c:'#00ccff' },
          { l:'CONV RATE', v:`${convRate}%`, c:'#ff8800' },
        ].map(m=>(
          <div key={m.l} style={{ background:'rgba(5,5,30,0.9)',borderRadius:6,padding:'8px 10px',textAlign:'center' }}>
            <div style={{ color:m.c,fontSize:18,fontWeight:700 }}>{m.v}</div>
            <div style={{ color:'#555',fontSize:9,marginTop:2 }}>{m.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex',gap:6,padding:'8px 14px 0',borderBottom:`1px solid ${C}22`,overflowX:'auto' }}>
        {([['storefront','🏪 STORE'],['live_sell','🔴 LIVE SELL'],['add_product','➕ ADD PRODUCT'],['suppliers','🌍 SUPPLIERS'],['orders','📦 ORDERS'],['analytics','📊 ANALYTICS']] as [typeof tab,string][]).map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            background:tab===t?`${C}22`:'transparent', border:`1px solid ${tab===t?C:'#333'}`,
            color:tab===t?C:'#666', borderRadius:'6px 6px 0 0', padding:'6px 12px',
            cursor:'pointer', fontFamily:'monospace', fontWeight:700, fontSize:10, whiteSpace:'nowrap',
          }}>{l}</button>
        ))}
      </div>

      <div style={{ flex:1,overflowY:'auto',padding:14 }}>

        {/* ── STOREFRONT (QVC-style product grid) ── */}
        {tab==='storefront' && (
          <div>
            {/* Search + Flash sale button */}
            <div style={{ display:'flex',gap:8,marginBottom:14 }}>
              <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search products..." style={{ flex:1,background:'#0a0a20',border:'1px solid #333',color:'#fff',borderRadius:6,padding:'8px 12px',fontFamily:'monospace',fontSize:12 }} />
              <button onClick={startLive} style={{ background:'#ff440022',border:'1px solid #ff4400',color:'#ff4400',borderRadius:6,padding:'8px 14px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:11 }}>🔴 GO LIVE</button>
            </div>

            {/* Flash sale product */}
            {flashSale && (
              <div style={{ background:'rgba(255,68,0,0.1)',border:'2px solid #ff4400',borderRadius:10,padding:14,marginBottom:14,display:'flex',gap:14,alignItems:'center' }}>
                <div style={{ fontSize:40 }}>{flashSale.product.images[0]}</div>
                <div style={{ flex:1 }}>
                  <div style={{ color:'#ff4400',fontWeight:700,fontSize:14 }}>⚡ FLASH SALE — {flashSale.discount}% OFF</div>
                  <div style={{ color:'#fff',fontSize:13 }}>{flashSale.product.name}</div>
                  <div style={{ display:'flex',gap:10,marginTop:4 }}>
                    <span style={{ color:'#ffd700',fontSize:16,fontWeight:900 }}>${(flashSale.product.price*(1-flashSale.discount/100)).toFixed(2)}</span>
                    <span style={{ color:'#555',fontSize:13,textDecoration:'line-through' }}>${flashSale.product.price}</span>
                    <span style={{ color:'#ff4400',fontSize:12 }}>⏱ {Math.floor(flashSale.endsIn/60)}:{(flashSale.endsIn%60).toString().padStart(2,'0')}</span>
                  </div>
                </div>
                <button onClick={()=>{store.earnCash(Math.floor(flashSale.product.price*0.9*(1-flashSale.discount/100)));store.setNotif('🛒 Sold via flash sale!');setFlashSale(null)}}
                  style={{ background:'#ff440022',border:'1px solid #ff4400',color:'#ff4400',borderRadius:6,padding:'10px 16px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>BUY NOW</button>
              </div>
            )}

            <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10 }}>
              {filteredProducts.map(p=>(
                <div key={p.id} style={{ background:'rgba(5,5,30,0.9)',border:`1px solid ${p.isLive?'#ff4400':'#1a1a3e'}`,borderRadius:10,overflow:'hidden' }}>
                  {/* Product image area */}
                  <div style={{ background:`linear-gradient(135deg,${C}11,#8800ff11)`,padding:'16px 0',textAlign:'center',position:'relative' }}>
                    <div style={{ fontSize:40 }}>{p.images[0]}</div>
                    {p.isLive && <div style={{ position:'absolute',top:4,left:4,background:'#ff4400',color:'#fff',fontSize:9,padding:'2px 6px',borderRadius:3 }}>● LIVE</div>}
                    {p.comparePrice && <div style={{ position:'absolute',top:4,right:4,background:'#ffd700',color:'#111',fontSize:9,padding:'2px 6px',borderRadius:3,fontWeight:700 }}>SAVE ${(p.comparePrice-p.price).toFixed(0)}</div>}
                  </div>
                  <div style={{ padding:10 }}>
                    <div style={{ color:'#fff',fontWeight:700,fontSize:12,marginBottom:3 }}>{p.name}</div>
                    <div style={{ color:'#888',fontSize:10,marginBottom:6 }}>{p.category} · {p.isDropship?`📦 Ships ${p.shipsIn}`:'⚡ Instant'}</div>
                    <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
                      <span style={{ color:C,fontWeight:900,fontSize:16 }}>${p.price}</span>
                      {p.comparePrice && <span style={{ color:'#555',fontSize:12,textDecoration:'line-through' }}>${p.comparePrice}</span>}
                      <span style={{ color:'#ffd700',fontSize:11,marginLeft:'auto' }}>⭐{p.rating} ({p.reviews})</span>
                    </div>
                    <div style={{ display:'flex',gap:6,marginBottom:6 }}>
                      <span style={{ color:'#555',fontSize:10 }}>{p.sold} sold</span>
                      <span style={{ color:p.margin>80?'#00cc44':p.margin>60?'#ffd700':'#ff8800',fontSize:10,marginLeft:'auto' }}>{p.margin}% margin</span>
                    </div>
                    <div style={{ display:'flex',gap:6 }}>
                      <button onClick={()=>{store.earnCash(Math.floor(p.price*0.9)); store.setNotif(`💰 Sale: ${p.name} — +$${Math.floor(p.price*0.9)}`)}}
                        style={{ flex:1,background:`${C}22`,border:`1px solid ${C}`,color:C,borderRadius:5,padding:'6px',cursor:'pointer',fontFamily:'monospace',fontSize:10,fontWeight:700 }}>SELL NOW</button>
                      <button onClick={()=>launchFlashSale(p)}
                        style={{ background:'#ff440011',border:'1px solid #ff440055',color:'#ff4400',borderRadius:5,padding:'6px 8px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>⚡</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LIVE SELL (QVC/HSN studio) ── */}
        {tab==='live_sell' && (
          <div>
            {!liveSession ? (
              <div>
                <div style={{ background:'rgba(255,68,0,0.08)',border:'1px solid #ff440033',borderRadius:10,padding:20,marginBottom:16,textAlign:'center' }}>
                  <div style={{ fontSize:48,marginBottom:8 }}>📺</div>
                  <div style={{ color:'#ff4400',fontWeight:700,fontSize:16,marginBottom:6 }}>QVC/HSN-STYLE LIVE SELLING</div>
                  <div style={{ color:'#888',fontSize:12,marginBottom:16,lineHeight:1.6 }}>
                    Go live and sell products in real time. Viewers watch, chat, and buy. Products show with countdown timers, limited quantities, and live purchase alerts — just like QVC and HSN, but for your creator community.
                  </div>
                  <button onClick={startLive} style={{ background:'#ff440022',border:'2px solid #ff4400',color:'#ff4400',borderRadius:8,padding:'14px 40px',cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:16 }}>
                    🔴 START LIVE SELLING
                  </button>
                </div>
                <div style={{ background:'rgba(5,5,30,0.9)',border:'1px solid #1a1a3e',borderRadius:10,padding:14 }}>
                  <div style={{ color:C,fontWeight:700,marginBottom:10 }}>HOW AMM LIVE SELLING BEATS QVC/HSN</div>
                  {[
                    ['QVC/HSN cut','30-50% of sale','AMM takes 10%'],
                    ['Creator payout','Net 60 (2 months later)','AMM: next day via Stripe'],
                    ['Audience','TV subscribers only','Your followers + AMM city users'],
                    ['Products','Pre-approved only','You list anything (within policy)'],
                    ['NFT of sale moment','Never','Every sale can mint a collectible'],
                    ['Faith-specific show','Never','Your entire channel can be faith-centered'],
                  ].map(([aspect,them,us])=>(
                    <div key={aspect} style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,padding:'6px 0',borderBottom:'1px solid #1a1a3e',fontSize:11 }}>
                      <div style={{ color:'#888' }}>{aspect}</div>
                      <div style={{ color:'#ff4400' }}>❌ {them}</div>
                      <div style={{ color:'#00cc44' }}>✅ {us}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {/* Live studio */}
                <div style={{ background:'rgba(255,0,0,0.08)',border:'1px solid #ff4400',borderRadius:10,padding:14,marginBottom:12 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                      <div style={{ width:10,height:10,borderRadius:'50%',background:'#ff4400',boxShadow:'0 0 6px #ff4400' }} />
                      <span style={{ color:'#ff4400',fontWeight:900 }}>LIVE</span>
                      <span style={{ color:'#888',fontSize:12 }}>· {liveSession.title}</span>
                    </div>
                    <div style={{ color:'#ffd700',fontSize:13 }}>👁 {liveSession.viewers} watching</div>
                  </div>
                  {/* Current product */}
                  {liveSession.products[liveSession.currentProductIdx] && (() => {
                    const prod = liveSession.products[liveSession.currentProductIdx]
                    return (
                      <div style={{ display:'flex',gap:14,alignItems:'center',padding:'10px 0',borderBottom:'1px solid #ff440033',marginBottom:10 }}>
                        <div style={{ fontSize:40 }}>{prod.images[0]}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ color:'#fff',fontWeight:700 }}>{prod.name}</div>
                          <div style={{ color:C,fontSize:20,fontWeight:900 }}>${prod.price}</div>
                          {prod.comparePrice && <div style={{ color:'#555',fontSize:12,textDecoration:'line-through' }}>${prod.comparePrice}</div>}
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ color:'#ffd700',fontSize:13 }}>🛒 {liveSession.unitsSoldThisSession} sold</div>
                          <div style={{ color:'#00cc44',fontSize:13 }}>💰 ${liveSession.revenue.toFixed(0)}</div>
                          <button onClick={()=>{
                            setLiveSession(s=>s?({...s,currentProductIdx:Math.min(s.products.length-1,s.currentProductIdx+1)}):null)
                          }} style={{ marginTop:6,background:`${C}22`,border:`1px solid ${C}`,color:C,borderRadius:4,padding:'4px 8px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>NEXT PRODUCT</button>
                        </div>
                      </div>
                    )
                  })()}
                  {/* Product tabs */}
                  <div style={{ display:'flex',gap:6,overflowX:'auto',marginBottom:10 }}>
                    {liveSession.products.map((p,i)=>(
                      <button key={p.id} onClick={()=>setLiveSession(s=>s?({...s,currentProductIdx:i}):null)}
                        style={{ background:liveSession.currentProductIdx===i?'#ff440022':'transparent',border:`1px solid ${liveSession.currentProductIdx===i?'#ff4400':'#333'}`,color:liveSession.currentProductIdx===i?'#ff4400':'#555',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10,whiteSpace:'nowrap' }}>
                        {p.images[0]} {p.name.split(' ').slice(0,2).join(' ')}
                      </button>
                    ))}
                  </div>
                  <button onClick={()=>setLiveSession(null)} style={{ width:'100%',background:'transparent',border:'1px solid #333',color:'#555',borderRadius:6,padding:'8px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>END SESSION</button>
                </div>
                {/* Live chat */}
                <div style={{ background:'rgba(5,5,30,0.9)',border:'1px solid #1a1a3e',borderRadius:10,height:200,display:'flex',flexDirection:'column' }}>
                  <div style={{ padding:'6px 10px',borderBottom:'1px solid #1a1a3e',color:C,fontSize:11,fontWeight:700 }}>💬 LIVE CHAT</div>
                  <div ref={chatRef} style={{ flex:1,overflowY:'auto',padding:'6px 10px',fontSize:11 }}>
                    {liveChat.map((m,i)=>(
                      <div key={i} style={{ marginBottom:3 }}>
                        <span style={{ color:m.user.startsWith('🎉')?'#ffd700':C }}>{m.user}: </span>
                        <span style={{ color:'#ccc' }}>{m.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ADD PRODUCT (Shopify-style builder) ── */}
        {tab==='add_product' && (
          <div>
            <div style={{ color:'#888',fontSize:12,marginBottom:14,lineHeight:1.6 }}>
              List a digital product (instant delivery, 100% margin) or a physical dropship product (supplier ships for you, no inventory needed).
            </div>
            <div style={{ background:'rgba(5,5,30,0.9)',border:`1px solid ${C}33`,borderRadius:10,padding:16 }}>
              {[['Product Name *','name'],['Price ($) *','price'],['Description','description']].map(([l,k])=>(
                <div key={k} style={{ marginBottom:10 }}>
                  <div style={{ color:'#888',fontSize:11,marginBottom:4 }}>{l}</div>
                  {k==='description' ?
                    <textarea value={newProduct[k as 'description']} onChange={e=>setNewProduct(p=>({...p,[k]:e.target.value}))} style={{ width:'100%',background:'#0a0a20',border:'1px solid #333',color:'#fff',borderRadius:6,padding:'8px 12px',fontFamily:'monospace',fontSize:12,boxSizing:'border-box',minHeight:80,resize:'vertical' }} /> :
                    <input value={newProduct[k as 'name'|'price']} onChange={e=>setNewProduct(p=>({...p,[k]:e.target.value}))} style={{ width:'100%',background:'#0a0a20',border:'1px solid #333',color:'#fff',borderRadius:6,padding:'8px 12px',fontFamily:'monospace',fontSize:12,boxSizing:'border-box' }} />
                  }
                </div>
              ))}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12 }}>
                <div>
                  <div style={{ color:'#888',fontSize:11,marginBottom:4 }}>Category</div>
                  <select value={newProduct.category} onChange={e=>setNewProduct(p=>({...p,category:e.target.value}))} style={{ width:'100%',background:'#0a0a20',border:'1px solid #333',color:'#fff',borderRadius:6,padding:'8px 12px',fontFamily:'monospace',fontSize:12 }}>
                    {['Faith','Music','Education','Tech','Apparel','Fitness','Digital','Food','Home','Beauty'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ color:'#888',fontSize:11,marginBottom:4 }}>Fulfillment</div>
                  <select value={newProduct.isDropship?'dropship':'digital'} onChange={e=>setNewProduct(p=>({...p,isDropship:e.target.value==='dropship'}))} style={{ width:'100%',background:'#0a0a20',border:'1px solid #333',color:'#fff',borderRadius:6,padding:'8px 12px',fontFamily:'monospace',fontSize:12 }}>
                    <option value="digital">⚡ Digital / Instant</option>
                    <option value="dropship">📦 Dropship (supplier ships)</option>
                  </select>
                </div>
              </div>
              {newProduct.isDropship && (
                <div style={{ marginBottom:12 }}>
                  <div style={{ color:'#888',fontSize:11,marginBottom:4 }}>Supplier (from your approved suppliers)</div>
                  <select value={newProduct.supplier} onChange={e=>setNewProduct(p=>({...p,supplier:e.target.value}))} style={{ width:'100%',background:'#0a0a20',border:'1px solid #333',color:'#fff',borderRadius:6,padding:'8px 12px',fontFamily:'monospace',fontSize:12 }}>
                    <option value="">Select supplier...</option>
                    {DEMO_SUPPLIERS.map(s=><option key={s.id} value={s.id}>{s.flag} {s.name} — {s.processingTime}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display:'flex',gap:4,flexWrap:'wrap',marginBottom:14 }}>
                {['Faith','Creator','Trending','New Arrival','Limited'].map(badge=>(
                  <button key={badge} style={{ background:`${C}11`,border:`1px solid ${C}33`,color:C,borderRadius:4,padding:'3px 8px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}># {badge}</button>
                ))}
              </div>
              <button onClick={addProductToStore} disabled={!newProduct.name||!newProduct.price} style={{ width:'100%',background:newProduct.name&&newProduct.price?`${C}22`:'#111',border:`1px solid ${newProduct.name&&newProduct.price?C:'#333'}`,color:newProduct.name&&newProduct.price?C:'#444',borderRadius:8,padding:'12px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:14 }}>
                ✅ LIST PRODUCT — goes live immediately
              </button>
              <div style={{ color:'#555',fontSize:10,marginTop:6,textAlign:'center' }}>You keep 90% of every sale · AMM takes 10% · Stripe handles all payments</div>
            </div>
          </div>
        )}

        {/* ── SUPPLIERS (Amazon/AliExpress-style network) ── */}
        {tab==='suppliers' && (
          <div>
            <div style={{ color:'#888',fontSize:12,marginBottom:14 }}>
              Connect to verified suppliers. They handle inventory, packaging, and shipping. You sell, they fulfill. Zero upfront cost.
            </div>
            {DEMO_SUPPLIERS.map(s=>(
              <div key={s.id} onClick={()=>setSelectedSupplier(selectedSupplier?.id===s.id?null:s)} style={{ background:'rgba(5,5,30,0.9)',border:`1px solid ${selectedSupplier?.id===s.id?C:'#1a1a3e'}`,borderRadius:10,padding:14,marginBottom:10,cursor:'pointer' }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6 }}>
                  <div style={{ display:'flex',gap:8,alignItems:'center' }}>
                    <span style={{ fontSize:20 }}>{s.flag}</span>
                    <div>
                      <div style={{ color:'#fff',fontWeight:700,fontSize:13 }}>{s.name}</div>
                      <div style={{ color:'#555',fontSize:10 }}>{s.country} · {s.processingTime} processing</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ color:'#ffd700',fontSize:12 }}>⭐ {s.rating}</div>
                    {s.verified && <div style={{ color:'#00cc44',fontSize:10 }}>✅ Verified</div>}
                  </div>
                </div>
                <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                  {s.categories.map(c=><span key={c} style={{ background:`${C}11`,border:`1px solid ${C}33`,color:C,borderRadius:4,padding:'2px 6px',fontSize:10 }}>{c}</span>)}
                </div>
                {selectedSupplier?.id===s.id && (
                  <div style={{ marginTop:10,paddingTop:10,borderTop:'1px solid #1a1a3e' }}>
                    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10 }}>
                      <div style={{ fontSize:11,color:'#888' }}>Min order: <span style={{ color:'#fff' }}>{s.minOrder} unit{s.minOrder>1?'s':''}</span></div>
                      <div style={{ fontSize:11,color:'#888' }}>Ships to: <span style={{ color:'#fff' }}>{s.shipsTo.join(', ')}</span></div>
                    </div>
                    <button onClick={(e)=>{e.stopPropagation();store.setNotif(`✅ Connected to ${s.name}! You can now add their products.`)}}
                      style={{ width:'100%',background:`${C}22`,border:`1px solid ${C}`,color:C,borderRadius:6,padding:'8px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>
                      CONNECT SUPPLIER
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div style={{ background:'rgba(255,170,0,0.08)',border:'1px solid #ffaa0033',borderRadius:10,padding:14 }}>
              <div style={{ color:'#ffaa00',fontWeight:700,marginBottom:8 }}>⚡ AMM vs Amazon Dropshipping</div>
              {[
                ['Monthly fees','Amazon: $39.99/mo','AMM: included in Creator plan'],
                ['FBA requirement','Must use Amazon warehouse','AMM: any supplier ships direct'],
                ['Brand control','Amazon brand dominates','Your brand front and center'],
                ['Customer data','Amazon keeps it','You own your customer emails'],
                ['Faith-friendly','Low visibility','Faith + culture = your niche'],
              ].map(([a,t,u])=>(
                <div key={a} style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,padding:'5px 0',borderBottom:'1px solid #1a1a3e',fontSize:10 }}>
                  <div style={{ color:'#888' }}>{a}</div>
                  <div style={{ color:'#ff4400' }}>{t}</div>
                  <div style={{ color:'#00cc44' }}>{u}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab==='orders' && (
          <div>
            <div style={{ color:'#888',fontSize:12,marginBottom:14 }}>All orders auto-route to your connected supplier for fulfillment. You just collect the profit.</div>
            {orders.map(o=>(
              <div key={o.id} style={{ background:'rgba(5,5,30,0.9)',border:'1px solid #1a1a3e',borderRadius:10,padding:14,marginBottom:10 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
                  <span style={{ color:'#fff',fontWeight:700,fontSize:12 }}>{o.product}</span>
                  <span style={{ color:{pending:'#ffaa00',processing:'#00ccff',shipped:'#ff8800',delivered:'#00cc44'}[o.status],fontSize:11,fontWeight:700 }}>{o.status.toUpperCase()}</span>
                </div>
                <div style={{ display:'flex',gap:12,fontSize:11,color:'#888',marginBottom:6 }}>
                  <span>👤 {o.customer}</span>
                  <span>💰 ${o.amount}</span>
                  <span style={{ color:'#00cc44' }}>Profit: ${o.profit.toFixed(2)}</span>
                </div>
                <div style={{ display:'flex',gap:10,fontSize:10,color:'#555' }}>
                  <span>📦 {o.shipsVia}</span>
                  {o.trackingNum && <span>🔍 {o.trackingNum.slice(0,12)}...</span>}
                  <span>{new Date(o.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab==='analytics' && (
          <div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:16 }}>
              {[
                { l:'Top Category', v:'Faith Products', sub:'47% of sales', c:'#8800ff' },
                { l:'Best Day', v:'Saturday', sub:'3× avg revenue', c:'#ffd700' },
                { l:'Repeat Buyers', v:'34%', sub:'vs 12% industry', c:'#00cc44' },
                { l:'Avg Order Value', v:`$${(totalRevenue/Math.max(1,orders.length)).toFixed(2)}`, sub:'AMM avg: $41', c:'#00ccff' },
              ].map(m=>(
                <div key={m.l} style={{ background:'rgba(5,5,30,0.9)',border:`1px solid ${m.c}33`,borderRadius:10,padding:14,textAlign:'center' }}>
                  <div style={{ color:m.c,fontSize:20,fontWeight:700 }}>{m.v}</div>
                  <div style={{ color:'#555',fontSize:10 }}>{m.l}</div>
                  <div style={{ color:m.c,fontSize:10,marginTop:4 }}>{m.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ background:'rgba(5,5,30,0.9)',border:`1px solid ${C}33`,borderRadius:10,padding:14 }}>
              <div style={{ color:C,fontWeight:700,marginBottom:12 }}>REVENUE STREAMS THIS MONTH</div>
              {[
                { source:'Digital products', revenue:totalRevenue*0.45, pct:45, c:'#00cc44' },
                { source:'Physical / dropship', revenue:totalRevenue*0.32, pct:32, c:'#00ccff' },
                { source:'Live selling', revenue:totalRevenue*0.15, pct:15, c:'#ff4400' },
                { source:'Affiliates', revenue:totalRevenue*0.08, pct:8, c:'#ffd700' },
              ].map(r=>(
                <div key={r.source} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:3,fontSize:12 }}>
                    <span style={{ color:'#ccc' }}>{r.source}</span>
                    <span style={{ color:r.c,fontWeight:700 }}>${r.revenue.toFixed(0)} ({r.pct}%)</span>
                  </div>
                  <div style={{ background:'#111',borderRadius:4,height:6 }}>
                    <div style={{ background:r.c,height:'100%',width:`${r.pct}%`,borderRadius:4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
