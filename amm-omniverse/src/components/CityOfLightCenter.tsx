type Props = { onClose: () => void }

const districts = [
  ['QUANTUM WALL STREET', 'Finance, fintech, CDFIs, capital, insurance, procurement and business incubation.'],
  ['BLACK WALL STREET', 'Business ownership, commerce, restaurants, beauty, technology, media, manufacturing and property pathways.'],
  ['12D INNOVATION', 'AI, robotics, construction, digital twins, energy R&D, prefab and advanced manufacturing.'],
  ['EDUCATION + TRADES', 'All American University, apprenticeships, certification/licensure pathways and workforce training.'],
  ['HEALTH + ACCESS', 'Healthcare, wellness, accessible housing, mobility and inclusive city services.'],
  ['FOOD + AGRICULTURE', 'Greenhouses, appropriate urban agriculture, processing, storage and marketplace distribution.'],
  ['ENERGY DISTRICT', 'Microgrids, solar/local generation, storage, certified transformers, QT-1 R&D and charging.'],
  ['MOBILITY + AVIATION', 'Walking, accessible transit, Automan research, rail, logistics, drones and future eVTOL infrastructure.'],
] as const

const systems = [
  ['LAND', 'Survey → geotech → grading → roads → foundations → utility corridors'],
  ['WATER', 'Source → treatment → storage → distribution → wastewater → treatment/reuse'],
  ['AIR', 'Indoor air quality + HVAC + weather sensing + authorized drone operations'],
  ['ELECTRICAL', 'Grid/local generation → substation → transformer → distribution → smart panels → loads'],
  ['BUILD', 'Design → engineering → permit → BOM → source → prefab/robotics/trades → inspection'],
  ['MOBILITY', 'Pedestrian → transit → Automan → rail → aviation/eVTOL hub'],
  ['GSS', 'Sensors → prediction → active stabilization → telemetry; no claim of gravity cancellation'],
  ['DIGITAL TWIN', 'Physical asset IDs → live telemetry → maintenance history → StreetVerse mirror'],
] as const

const phases = [
  'Construct Engine v0.1',
  'BMO-class companion',
  'Room-scale Construct Lab',
  '10–15 MPH Automan mule',
  '25 MPH LSV research prototype',
  'One-property 12D digital twin',
  'Smart/accessibility demonstration house',
  '12D Innovation Campus',
  '10-home pilot',
  '100-home neighborhood',
  'Business district + Quantum Wall Street',
  'City of Light master-planned community',
]

export default function CityOfLightCenter({ onClose }: Props) {
  return (
    <div role="dialog" aria-label="City of Light 12D City Builder" style={{position:'fixed',inset:0,zIndex:10040,overflowY:'auto',background:'radial-gradient(circle at 50% 0%,#12243d 0,#060916 42%,#02030a 100%)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{maxWidth:1180,margin:'0 auto',padding:'26px 18px 80px'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:18}}>
          <div>
            <div style={{fontSize:10,fontWeight:900,letterSpacing:4,color:'#55e8ff'}}>STREETVERSE • 12D CITY BUILDER</div>
            <h1 style={{fontSize:'clamp(30px,7vw,68px)',lineHeight:.95,margin:'10px 0 12px',letterSpacing:-2}}>CITY OF LIGHT</h1>
            <p style={{maxWidth:760,color:'#b8c6d9',lineHeight:1.65,margin:0}}>A digital-to-physical prototype for designing, sourcing, constructing, operating and expanding a modern community. This screen is a planning and simulation layer; physical construction still requires land control, licensed engineering, permits, financing, testing and certification.</p>
          </div>
          <button onClick={onClose} aria-label="Close City of Light" style={{position:'sticky',top:18,width:42,height:42,borderRadius:'50%',border:'1px solid #55e8ff66',background:'#07101d',color:'#fff',fontSize:24,cursor:'pointer'}}>×</button>
        </div>

        <div style={{marginTop:26,padding:18,border:'1px solid #55e8ff44',borderRadius:18,background:'#07111ddd'}}>
          <div style={{fontSize:11,fontWeight:900,letterSpacing:2,color:'#ffd96a'}}>MASTER LOOP</div>
          <div style={{marginTop:10,fontFamily:'monospace',fontSize:13,lineHeight:1.8,color:'#d9f8ff'}}>STREETVERSE DIGITAL TWIN → STUBBS AI → CONSTRUCT ENGINE → 12D-COS → QUANTUM SOURCING → FOUNDRY / PREFAB / MANUFACTURING → HUMAN + ROBOTIC CONSTRUCTION → CITY ASSETS → SENSORS / TELEMETRY → DIGITAL TWIN</div>
        </div>

        <h2 style={{margin:'34px 0 14px'}}>City districts</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:12}}>
          {districts.map(([name,desc]) => <article key={name} style={{padding:16,borderRadius:16,border:'1px solid #223852',background:'linear-gradient(145deg,#0a1523,#080b12)'}}><div style={{fontSize:11,fontWeight:950,color:'#55e8ff',letterSpacing:1}}>{name}</div><p style={{fontSize:12,lineHeight:1.55,color:'#aebed1',margin:'9px 0 0'}}>{desc}</p></article>)}
        </div>

        <h2 style={{margin:'34px 0 14px'}}>12D infrastructure systems</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(245px,1fr))',gap:10}}>
          {systems.map(([name,flow]) => <div key={name} style={{padding:14,borderRadius:14,background:'#08101a',border:'1px solid #1d2b3d'}}><div style={{fontSize:10,fontWeight:950,color:'#ffd96a',letterSpacing:1.3}}>{name}</div><div style={{fontFamily:'monospace',fontSize:11,lineHeight:1.55,color:'#b9c7d8',marginTop:7}}>{flow}</div></div>)}
        </div>

        <h2 style={{margin:'34px 0 14px'}}>Development ladder</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:9}}>
          {phases.map((phase,index) => <div key={phase} style={{display:'flex',gap:10,alignItems:'flex-start',padding:12,borderRadius:13,background:'#070c14',border:'1px solid #182638'}}><span style={{minWidth:24,height:24,display:'grid',placeItems:'center',borderRadius:999,background:'#10283a',color:'#55e8ff',fontSize:10,fontWeight:900}}>{index+1}</span><span style={{fontSize:11,lineHeight:1.45,color:'#d8e1ec'}}>{phase}</span></div>)}
        </div>

        <div style={{marginTop:34,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:12}}>
          <div style={{padding:17,borderRadius:16,border:'1px solid #2a3f58',background:'#08101b'}}><div style={{fontSize:11,fontWeight:950,color:'#55e8ff'}}>FIRST PROOF</div><p style={{fontSize:12,lineHeight:1.6,color:'#b8c6d9'}}>One property: DESIGN → SOURCE → BUILD → CONNECT → OPERATE → MONITOR → MAINTAIN. Measure cost, schedule, quality, energy, water, reliability and maintenance before scaling.</p></div>
          <div style={{padding:17,borderRadius:16,border:'1px solid #2a3f58',background:'#08101b'}}><div style={{fontSize:11,fontWeight:950,color:'#ffd96a'}}>QT-1 TRANSFORMER PROGRAM</div><p style={{fontSize:12,lineHeight:1.6,color:'#b8c6d9'}}>Monitoring, thermal management, load prediction, fault detection, modular maintenance, cybersecurity and digital-twin integration. Unproven quantum/material concepts remain a separate research track.</p></div>
          <div style={{padding:17,borderRadius:16,border:'1px solid #2a3f58',background:'#08101b'}}><div style={{fontSize:11,fontWeight:950,color:'#87ffbe'}}>COMPETITION STRATEGY</div><p style={{fontSize:12,lineHeight:1.6,color:'#b8c6d9'}}>Build the orchestration layer; legally integrate proven printers, robots, BIM/digital-twin platforms, drones, energy equipment and construction machinery through adapters, partnerships, licensing and procurement.</p></div>
        </div>
      </div>
    </div>
  )
}
