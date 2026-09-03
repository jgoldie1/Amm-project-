import { FormEvent, useEffect, useMemo, useState } from 'react'

type WorldProfile={name:string;tagline:string;description:string;focus:string[];path:string}
type ShipmentStatus='PLANNED'|'ORDERED'|'SUPPLIER READY'|'PICKUP'|'EXPORT CUSTOMS'|'DEPARTED'|'IMPORT CUSTOMS'|'ARRIVED WAREHOUSE'|'RECEIVED'|'LAST MILE'|'DELIVERED'|'EXCEPTION'
type ShipmentMode='OCEAN'|'AIR'|'RAIL'|'TRUCK'
type Docs={invoice:boolean;packing:boolean;origin:boolean;transport:boolean}
type Shipment={id:string;po:string;supplier:string;sku:string;qty:number;mode:ShipmentMode;origin:string;destination:string;eta:string;status:ShipmentStatus;exception:string;docs:Docs;updatedAt:string}

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

const statusFlow:ShipmentStatus[]=['PLANNED','ORDERED','SUPPLIER READY','PICKUP','EXPORT CUSTOMS','DEPARTED','IMPORT CUSTOMS','ARRIVED WAREHOUSE','RECEIVED','LAST MILE','DELIVERED']
const STORAGE_KEY='tryamm.globalSupplyChain.v1'
const inputStyle={width:'100%',boxSizing:'border-box' as const,padding:'11px 12px',borderRadius:12,border:'1px solid #355269',background:'#07111b',color:'#fff',fontWeight:750}
const cardStyle={padding:18,border:'1px solid #29435a',borderRadius:18,background:'#09131f'}
const money=(value:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(Number.isFinite(value)?value:0)

function readShipments():Shipment[]{
  try{
    const raw=localStorage.getItem(STORAGE_KEY)
    const parsed=raw?JSON.parse(raw):[]
    return Array.isArray(parsed)?parsed:[]
  }catch{return []}
}

export default function GlobalTradeWorldHub(){
  const current=window.location.pathname.replace(/\/$/,'')||'/global-trade'
  const active=worlds.find(w=>w.path===current)||worlds[0]
  const [mode,setMode]=useState<'SIMULATION'|'CONNECTED'>('SIMULATION')
  const [shipments,setShipments]=useState<Shipment[]>(()=>readShipments())
  const [form,setForm]=useState({po:'',supplier:'',sku:'',qty:'1',mode:'OCEAN' as ShipmentMode,origin:'',destination:'',eta:''})
  const [cost,setCost]=useState({goods:'0',freight:'0',duty:'0',insurance:'0',handling:'0',units:'1'})
  const status=useMemo(()=>mode==='SIMULATION'?'Operator planning mode: records are stored in this browser only. No carrier, customs or payment action is sent.':'Connected readiness mode: provider/device credentials and server verification are still required before any real shipment, customs filing, IoT command or money movement.',[mode])

  useEffect(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(shipments))}catch{}},[shipments])

  const metrics=useMemo(()=>({
    total:shipments.length,
    inTransit:shipments.filter(s=>['PICKUP','EXPORT CUSTOMS','DEPARTED','IMPORT CUSTOMS','ARRIVED WAREHOUSE','LAST MILE'].includes(s.status)).length,
    received:shipments.filter(s=>s.status==='RECEIVED'||s.status==='DELIVERED').reduce((n,s)=>n+s.qty,0),
    exceptions:shipments.filter(s=>s.status==='EXCEPTION'||s.exception.trim()).length,
    customs:shipments.filter(s=>s.status==='EXPORT CUSTOMS'||s.status==='IMPORT CUSTOMS').length,
  }),[shipments])

  const landed=useMemo(()=>{
    const total=['goods','freight','duty','insurance','handling'].reduce((n,k)=>n+Number(cost[k as keyof typeof cost]||0),0)
    const units=Math.max(1,Number(cost.units||1))
    return {total,perUnit:total/units}
  },[cost])

  const addShipment=(event:FormEvent)=>{
    event.preventDefault()
    if(!form.po.trim()||!form.supplier.trim()||!form.sku.trim()||!form.origin.trim()||!form.destination.trim())return
    const record:Shipment={
      id:`SC-${Date.now().toString(36).toUpperCase()}`,
      po:form.po.trim(),supplier:form.supplier.trim(),sku:form.sku.trim(),qty:Math.max(1,Number(form.qty)||1),mode:form.mode,
      origin:form.origin.trim(),destination:form.destination.trim(),eta:form.eta,status:'PLANNED',exception:'',
      docs:{invoice:false,packing:false,origin:false,transport:false},updatedAt:new Date().toISOString(),
    }
    setShipments(prev=>[record,...prev])
    setForm(prev=>({...prev,po:'',supplier:'',sku:'',qty:'1',origin:'',destination:'',eta:''}))
  }

  const updateShipment=(id:string,patch:Partial<Shipment>)=>setShipments(prev=>prev.map(s=>s.id===id?{...s,...patch,updatedAt:new Date().toISOString()}:s))
  const advance=(shipment:Shipment)=>{
    if(mode!=='SIMULATION'||shipment.status==='EXCEPTION'||shipment.status==='DELIVERED')return
    const index=statusFlow.indexOf(shipment.status)
    const next=statusFlow[Math.min(index+1,statusFlow.length-1)]
    updateShipment(shipment.id,{status:next})
  }
  const toggleDoc=(shipment:Shipment,key:keyof Docs)=>updateShipment(shipment.id,{docs:{...shipment.docs,[key]:!shipment.docs[key]}})
  const setException=(shipment:Shipment)=>{
    const next=window.prompt('Planning exception note. This does not contact a carrier or customs authority.',shipment.exception)
    if(next===null)return
    updateShipment(shipment.id,{exception:next.trim(),status:next.trim()?'EXCEPTION':shipment.status==='EXCEPTION'?'PLANNED':shipment.status})
  }

  return <main style={{minHeight:'100vh',background:'radial-gradient(circle at top,#12304a 0,#07101b 38%,#030507 75%)',color:'#fff',fontFamily:'system-ui,sans-serif',padding:'26px 18px 120px'}}>
    <div style={{maxWidth:1180,margin:'0 auto'}}>
      <a href='/' style={{color:'#b9d8ef',textDecoration:'none',fontWeight:850}}>← TRYAMM HOME</a>
      <header style={{marginTop:18,padding:'28px 24px',border:'1px solid #31536c',borderRadius:26,background:'#07131ed9'}}>
        <div style={{fontSize:12,letterSpacing:2,fontWeight:950,color:'#71ddff'}}>GLOBAL TRADE • SUPPLY CHAIN • IoT • WORLD FABRIC</div>
        <h1 style={{fontSize:'clamp(34px,7vw,70px)',lineHeight:.98,margin:'10px 0'}}>{active.name}</h1>
        <h2 style={{fontSize:18,margin:'0 0 10px',color:'#9fe5c1'}}>{active.tagline}</h2>
        <p style={{maxWidth:850,color:'#ccd8e4',lineHeight:1.6,fontSize:17}}>{active.description}</p>
        <div role='status' aria-live='polite' style={{marginTop:16,padding:12,borderRadius:14,border:'1px solid #6b5f35',background:'#19180f',color:'#ffe3a2',fontWeight:800}}>{status}</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}>
          <button onClick={()=>setMode('SIMULATION')} style={{padding:'11px 14px',borderRadius:999,border:'1px solid #4a6882',background:mode==='SIMULATION'?'#123b58':'#0a1017',color:'#fff',fontWeight:900}}>SIMULATION / OPERATOR</button>
          <button onClick={()=>setMode('CONNECTED')} style={{padding:'11px 14px',borderRadius:999,border:'1px solid #4a6882',background:mode==='CONNECTED'?'#123b58':'#0a1017',color:'#fff',fontWeight:900}}>CONNECTED READINESS</button>
        </div>
      </header>

      <nav aria-label='World network' style={{display:'flex',gap:8,flexWrap:'wrap',margin:'18px 0'}}>{worlds.map(w=><a key={w.path} href={w.path} aria-current={w.path===active.path?'page':undefined} style={{padding:'10px 13px',borderRadius:999,textDecoration:'none',fontWeight:900,fontSize:12,color:'#fff',border:`1px solid ${w.path===active.path?'#6ee7ff':'#34485a'}`,background:w.path===active.path?'#103149':'#081019'}}>{w.name}</a>)}</nav>

      <section aria-label='Supply chain operating metrics' style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12,marginTop:20}}>
        {[['SHIPMENTS',metrics.total],['IN TRANSIT',metrics.inTransit],['CUSTOMS QUEUE',metrics.customs],['RECEIVED UNITS',metrics.received],['EXCEPTIONS',metrics.exceptions]].map(([label,value])=><article key={label} style={{...cardStyle,padding:16}}><div style={{fontSize:11,letterSpacing:1.3,color:'#8eb5cd',fontWeight:900}}>{label}</div><div style={{fontSize:30,fontWeight:950,marginTop:6}}>{value}</div></article>)}
      </section>

      {active.path==='/global-trade'&&<>
        <section style={{marginTop:24,padding:20,border:'1px solid #35604f',borderRadius:22,background:'#071813'}}>
          <div style={{fontSize:12,letterSpacing:1.7,fontWeight:950,color:'#7ff0bb'}}>SUPPLY CHAIN OPERATOR</div>
          <h2 style={{fontSize:30,margin:'7px 0 6px'}}>Supplier → PO → freight → customs → warehouse → last mile</h2>
          <p style={{color:'#c1d9cf',lineHeight:1.55,marginTop:0}}>Create planning records, advance shipment milestones, check document readiness and isolate exceptions. Inventory counts as received only after a RECEIVED or DELIVERED milestone.</p>
          <form onSubmit={addShipment} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10,marginTop:16}}>
            <label>PO / order<input required aria-label='PO or order' value={form.po} onChange={e=>setForm({...form,po:e.target.value})} style={inputStyle}/></label>
            <label>Supplier<input required value={form.supplier} onChange={e=>setForm({...form,supplier:e.target.value})} style={inputStyle}/></label>
            <label>SKU / product<input required value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})} style={inputStyle}/></label>
            <label>Quantity<input min='1' type='number' value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})} style={inputStyle}/></label>
            <label>Mode<select value={form.mode} onChange={e=>setForm({...form,mode:e.target.value as ShipmentMode})} style={inputStyle}><option>OCEAN</option><option>AIR</option><option>RAIL</option><option>TRUCK</option></select></label>
            <label>Origin<input required value={form.origin} onChange={e=>setForm({...form,origin:e.target.value})} style={inputStyle}/></label>
            <label>Destination<input required value={form.destination} onChange={e=>setForm({...form,destination:e.target.value})} style={inputStyle}/></label>
            <label>Planned ETA<input type='date' value={form.eta} onChange={e=>setForm({...form,eta:e.target.value})} style={inputStyle}/></label>
            <button type='submit' style={{alignSelf:'end',minHeight:44,borderRadius:12,border:'1px solid #52d6a1',background:'#0e563d',color:'#fff',fontWeight:950}}>+ ADD PLANNED SHIPMENT</button>
          </form>
        </section>

        <section style={{marginTop:18}}>
          <div style={{fontSize:12,letterSpacing:1.7,fontWeight:950,color:'#84d9ff'}}>CHAIN OF CUSTODY</div>
          <h2 style={{margin:'7px 0 14px'}}>Shipment board</h2>
          {shipments.length===0?<div style={{...cardStyle,color:'#b9c8d7'}}>No operator records yet. Add a planned shipment above. Nothing here is presented as live carrier or customs data.</div>:<div style={{display:'grid',gap:12}}>{shipments.map(s=>{
            const docsReady=Object.values(s.docs).every(Boolean)
            return <article key={s.id} style={{...cardStyle,borderColor:s.status==='EXCEPTION'?'#9a514e':'#29435a'}}>
              <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><div><strong>{s.po} • {s.sku}</strong><div style={{color:'#9eb3c4',fontSize:13,marginTop:4}}>{s.supplier} • {s.qty} units • {s.mode} • {s.origin} → {s.destination}</div></div><div style={{textAlign:'right'}}><strong style={{color:s.status==='EXCEPTION'?'#ff9d96':'#7ff0bb'}}>{s.status}</strong><div style={{fontSize:12,color:'#91a9bb'}}>ETA {s.eta||'not set'}</div></div></div>
              <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:12}}>{statusFlow.map(step=><span key={step} style={{fontSize:10,padding:'5px 7px',borderRadius:999,border:'1px solid #36536a',background:step===s.status?'#174e6d':'#07101a',color:step===s.status?'#fff':'#8ca3b5'}}>{step}</span>)}</div>
              <div style={{marginTop:13,padding:12,borderRadius:13,background:'#061019',border:'1px solid #243b4c'}}><strong style={{fontSize:12}}>DOCUMENT READINESS • {docsReady?'READY FOR HUMAN/PROVIDER REVIEW':'INCOMPLETE'}</strong><div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>{([['invoice','Commercial invoice'],['packing','Packing list'],['origin','Origin docs'],['transport','Transport docs']] as [keyof Docs,string][]).map(([key,label])=><button key={key} onClick={()=>toggleDoc(s,key)} style={{padding:'8px 10px',borderRadius:10,border:'1px solid #3a596e',background:s.docs[key]?'#164f3e':'#0c151d',color:'#fff',fontWeight:800}}>{s.docs[key]?'✓':'○'} {label}</button>)}</div></div>
              {s.exception&&<div role='alert' style={{marginTop:10,padding:10,borderRadius:10,background:'#351615',color:'#ffc2bd'}}>Exception: {s.exception}</div>}
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}><button disabled={mode!=='SIMULATION'||s.status==='DELIVERED'||s.status==='EXCEPTION'} onClick={()=>advance(s)} style={{padding:'9px 11px',borderRadius:10,border:'1px solid #5a7487',background:'#10283a',color:'#fff',fontWeight:850,opacity:mode==='SIMULATION'?1:.5}}>ADVANCE PLANNING MILESTONE</button><button onClick={()=>setException(s)} style={{padding:'9px 11px',borderRadius:10,border:'1px solid #8f5f5c',background:'#2a1414',color:'#fff',fontWeight:850}}>EXCEPTION</button><button onClick={()=>setShipments(prev=>prev.filter(x=>x.id!==s.id))} style={{padding:'9px 11px',borderRadius:10,border:'1px solid #5a6772',background:'#11171c',color:'#ddd',fontWeight:850}}>REMOVE LOCAL RECORD</button></div>
            </article>
          })}</div>}
        </section>

        <section style={{marginTop:24,padding:20,border:'1px solid #5d5534',borderRadius:22,background:'#16140a'}}>
          <div style={{fontSize:12,letterSpacing:1.7,fontWeight:950,color:'#ffe39a'}}>LANDED COST PLANNER</div>
          <h2 style={{margin:'7px 0 8px'}}>Know the estimated unit cost before inventory is received</h2>
          <p style={{color:'#d8cfb6',lineHeight:1.5}}>Planning only. Duty, tax, FX, brokerage and carrier charges must be replaced by authoritative provider values before a financial commitment.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:9}}>{([['goods','Goods'],['freight','Freight'],['duty','Duty/tax estimate'],['insurance','Insurance'],['handling','Handling'],['units','Units']] as [keyof typeof cost,string][]).map(([key,label])=><label key={key}>{label}<input type='number' min='0' step={key==='units'?'1':'0.01'} value={cost[key]} onChange={e=>setCost({...cost,[key]:e.target.value})} style={inputStyle}/></label>)}</div>
          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:14}}><strong style={{fontSize:20}}>Estimated landed total: {money(landed.total)}</strong><strong style={{fontSize:20,color:'#ffe39a'}}>Estimated/unit: {money(landed.perUnit)}</strong></div>
        </section>
      </>}

      <section style={{marginTop:24}}>
        <div style={{fontSize:12,letterSpacing:1.7,fontWeight:950,color:'#84d9ff'}}>SHARED TRADE ENGINE</div>
        <h2 style={{fontSize:30,margin:'7px 0 14px'}}>Everything needed around the supply chain</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))',gap:14}}>{tradeModules.map(([name,description])=><article key={name} style={cardStyle}><h3 style={{margin:'0 0 8px'}}>{name}</h3><p style={{margin:0,color:'#b9c8d7',lineHeight:1.5,fontSize:14}}>{description}</p></article>)}</div>
      </section>

      <section style={{marginTop:24,padding:20,border:'1px solid #35604f',borderRadius:22,background:'#071813'}}>
        <div style={{fontSize:12,letterSpacing:1.7,fontWeight:950,color:'#7ff0bb'}}>WORLD CONNECTIONS</div>
        <h2 style={{margin:'7px 0 14px'}}>One economy fabric, multiple worlds</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:12}}>{bridges.map(([name,path,description])=><a key={path} href={path} style={{padding:16,border:'1px solid #315846',borderRadius:16,background:'#0a2119',color:'#fff',textDecoration:'none'}}><strong>{name}</strong><p style={{margin:'7px 0 0',color:'#c1d9cf',fontSize:14,lineHeight:1.45}}>{description}</p></a>)}</div>
      </section>

      <section style={{marginTop:24,padding:20,border:'1px solid #634f35',borderRadius:22,background:'#171109'}}>
        <strong>REAL-WORLD GATE</strong>
        <p style={{color:'#ddcfbc',lineHeight:1.55}}>The software can model suppliers, inventory, shipments, IoT events, documents and landed-cost scenarios. Actual device control, carrier bookings/tracking, customs submissions or clearance, regulated goods decisions, financial settlement and external ERP/WMS/TMS actions require verified integrations, credentials, permissions and applicable compliance. Browser milestones never create payable balances or prove that goods moved.</p>
      </section>
    </div>
  </main>
}
