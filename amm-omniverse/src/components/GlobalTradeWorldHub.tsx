import { useMemo, useState } from 'react'

type WorldProfile={name:string;tagline:string;description:string;focus:string[];path:string}

const worlds:WorldProfile[]=[
  {name:'Global Trade Command',tagline:'Source • Move • Pay • Verify',description:'The shared trade, supply-chain and IoT control layer for TRYAMM businesses and worlds.',focus:['supplier discovery','procurement','inventory','logistics','IoT telemetry','customs readiness','payments','traceability','risk'],path:'/global-trade'},
  {name:'My World',tagline:'Build your own economy',description:'A personal or business world where users can build stores, factories, farms, warehouses, services and supply chains.',focus:['world builder','business creation','local inventory','supplier links','jobs and missions','creator commerce'],path:'/my-world'},
  {name:'We Are the World',tagline:'Global discovery and trade map',description:'A discovery layer connecting countries, cities, cultures, creators, suppliers, buyers and logistics corridors.',focus:['country discovery','trade corridors','global marketplace','translation','culture and tourism','cross-border commerce'],path:'/we-are-the-world'},
  {name:'Kingdom',tagline:'Settlement, stewardship and community economy',description:'A settlement-building world for land, food, housing, public works, trade, learning, service and community decision-making.',focus:['settlement planning','food systems','housing','public works','local trade','education','community missions'],path:'/kingdom'},
]

const tradeModules=[
  ['Supplier Network','Verified supplier profiles, RFQs, quotes, scorecards, contracts and sourcing missions.'],
  ['Procurement','Purchase requests, approvals, POs, budgets, receiving and exception handling.'],
  ['Inventory + Warehouses','Stock, lots, serials, bins, reorder points, multi-location availability and fulfillment.'],
  ['IoT Control Plane','Device registry, sensor telemetry, temperature/location/condition events, alerts and maintenance records.'],
  ['Logistics','Truck, rail, air, ocean, last-mile and StreetVerse delivery mission orchestration.'],
  ['Trade Documents','Commercial invoice, packing list, certificates and customs-readiness workflow; official filings remain broker/provider gated.'],
  ['Payments + FX','Omni Cash and Aniyah payment routing with Africa-rail adapters and provider-gated settlement.'],
  ['Track + Trace','Shipment milestones, chain of custody, QR/NFC/IoT event history and exception alerts.'],
  ['Risk + Compliance','Supplier risk, sanctions/compliance hooks, product restrictions, insurance/document expiry and human approvals.'],
  ['Demand + AI Planning','Forecasting hooks, replenishment suggestions, route options and scenario planning without autonomous financial commitments.'],
]

const bridges=[
  ['StreetVerse','/streetverse','Warehouses, stores, ports, trucks, couriers and supply missions become visible/playable city activity.'],
  ['My World','/my-world','A user can build a business or production chain and connect it to real or simulated suppliers.'],
  ['We Are the World','/we-are-the-world','Shows global sourcing, trade lanes, countries, languages and cross-border discovery.'],
  ['Kingdom','/kingdom','Connects settlement needs—food, housing, energy, materials and services—to a managed local economy.'],
  ['Omni Cash','/omni-cash','Receivables, creator/business earnings and payout routing.'],
  ['Aniyah Pay','/aniyah-pay','Cross-border and Africa payment-rail orchestration.'],
  ['Omni Workstation','/workstation','Founder/operator control center for projects, jobs, teams, media and trade operations.'],
]

export default function GlobalTradeWorldHub(){
  const current=window.location.pathname.replace(/\/$/,'')||'/global-trade'
  const active=worlds.find(w=>w.path===current)||worlds[0]
  const [mode,setMode]=useState<'SIMULATION'|'CONNECTED'>('SIMULATION')
  const status=useMemo(()=>mode==='SIMULATION'?'Simulation mode: safe for planning, learning, missions and demos.':'Connected mode: provider/device credentials are still required before any real shipment, customs filing, IoT command or money movement.',[mode])
  return <main style={{minHeight:'100vh',background:'radial-gradient(circle at top,#12304a 0,#07101b 38%,#030507 75%)',color:'#fff',fontFamily:'system-ui,sans-serif',padding:'26px 18px 120px'}}>
    <div style={{maxWidth:1180,margin:'0 auto'}}>
      <a href='/' style={{color:'#b9d8ef',textDecoration:'none',fontWeight:850}}>← TRYAMM HOME</a>
      <header style={{marginTop:18,padding:'28px 24px',border:'1px solid #31536c',borderRadius:26,background:'#07131ed9'}}>
        <div style={{fontSize:12,letterSpacing:2,fontWeight:950,color:'#71ddff'}}>GLOBAL TRADE • SUPPLY CHAIN • IoT • WORLD FABRIC</div>
        <h1 style={{fontSize:'clamp(34px,7vw,70px)',lineHeight:.98,margin:'10px 0'}}>{active.name}</h1>
        <h2 style={{fontSize:18,margin:'0 0 10px',color:'#9fe5c1'}}>{active.tagline}</h2>
        <p style={{maxWidth:850,color:'#ccd8e4',lineHeight:1.6,fontSize:17}}>{active.description}</p>
        <div role='status' style={{marginTop:16,padding:12,borderRadius:14,border:'1px solid #6b5f35',background:'#19180f',color:'#ffe3a2',fontWeight:800}}>{status}</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}>
          <button onClick={()=>setMode('SIMULATION')} style={{padding:'10px 13px',borderRadius:999,border:'1px solid #4a6882',background:mode==='SIMULATION'?'#123b58':'#0a1017',color:'#fff',fontWeight:900}}>SIMULATION</button>
          <button onClick={()=>setMode('CONNECTED')} style={{padding:'10px 13px',borderRadius:999,border:'1px solid #4a6882',background:mode==='CONNECTED'?'#123b58':'#0a1017',color:'#fff',fontWeight:900}}>CONNECTED READINESS</button>
        </div>
      </header>

      <nav aria-label='World network' style={{display:'flex',gap:8,flexWrap:'wrap',margin:'18px 0'}}>{worlds.map(w=><a key={w.path} href={w.path} aria-current={w.path===active.path?'page':undefined} style={{padding:'10px 13px',borderRadius:999,textDecoration:'none',fontWeight:900,fontSize:12,color:'#fff',border:`1px solid ${w.path===active.path?'#6ee7ff':'#34485a'}`,background:w.path===active.path?'#103149':'#081019'}}>{w.name}</a>)}</nav>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14}}>
        {active.focus.map(item=><article key={item} style={{padding:18,border:'1px solid #2b4053',borderRadius:18,background:'#07111b'}}><strong style={{textTransform:'uppercase',fontSize:13}}>{item}</strong></article>)}
      </section>

      <section style={{marginTop:24}}>
        <div style={{fontSize:12,letterSpacing:1.7,fontWeight:950,color:'#84d9ff'}}>SHARED TRADE ENGINE</div>
        <h2 style={{fontSize:30,margin:'7px 0 14px'}}>Everything needed around the supply chain</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))',gap:14}}>{tradeModules.map(([name,description])=><article key={name} style={{padding:18,border:'1px solid #29435a',borderRadius:18,background:'#09131f'}}><h3 style={{margin:'0 0 8px'}}>{name}</h3><p style={{margin:0,color:'#b9c8d7',lineHeight:1.5,fontSize:14}}>{description}</p></article>)}</div>
      </section>

      <section style={{marginTop:24,padding:20,border:'1px solid #35604f',borderRadius:22,background:'#071813'}}>
        <div style={{fontSize:12,letterSpacing:1.7,fontWeight:950,color:'#7ff0bb'}}>WORLD CONNECTIONS</div>
        <h2 style={{margin:'7px 0 14px'}}>One economy fabric, multiple worlds</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:12}}>{bridges.map(([name,path,description])=><a key={path} href={path} style={{padding:16,border:'1px solid #315846',borderRadius:16,background:'#0a2119',color:'#fff',textDecoration:'none'}}><strong>{name}</strong><p style={{margin:'7px 0 0',color:'#c1d9cf',fontSize:14,lineHeight:1.45}}>{description}</p></a>)}</div>
      </section>

      <section style={{marginTop:24,padding:20,border:'1px solid #634f35',borderRadius:22,background:'#171109'}}>
        <strong>REAL-WORLD GATE</strong>
        <p style={{color:'#ddcfbc',lineHeight:1.55}}>The software can model suppliers, inventory, shipments, IoT events, documents and payments now. Actual device control, carrier bookings, customs submissions, regulated goods, financial settlement and external ERP/WMS/TMS actions require verified integrations, credentials, permissions and applicable compliance.</p>
      </section>
    </div>
  </main>
}
