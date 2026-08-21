import { AIRSPACE_PIPELINE, AIR_MOBILITY_MISSIONS, EVTOL_FLYING_CAR_PATHWAY, PROVIDER_GATES, STREETVERSE_AIR_MOBILITY } from '../airmobility/StreetVerseAirMobility'

export default function StreetVerseAirMobilityCenter(){
  return <section style={{border:'1px solid #28475f',borderRadius:18,padding:16,margin:'14px 0',background:'#07121d',color:'#fff'}}>
    <div style={{fontSize:11,letterSpacing:2,color:'#4FE3FF',fontWeight:900}}>STREETVERSE AIR MOBILITY</div>
    <h2 style={{margin:'8px 0'}}>Sky Grid + Airports + Drones + eVTOL/Flying Cars</h2>
    <p style={{color:'#b2c0cf'}}>{STREETVERSE_AIR_MOBILITY.purpose}</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
      {STREETVERSE_AIR_MOBILITY.layers.map(x=><article key={x} style={{border:'1px solid #233a4e',borderRadius:12,padding:12}}><b>{x}</b></article>)}
    </div>
    <h3>Airspace pipeline</h3><ol>{AIRSPACE_PIPELINE.map(x=><li key={x}>{x}</li>)}</ol>
    <h3>eVTOL / flying-car pathway</h3><ol>{EVTOL_FLYING_CAR_PATHWAY.phases.map(x=><li key={x}>{x}</li>)}</ol>
    <h3>New jobs + controller roles</h3><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:8}}>{EVTOL_FLYING_CAR_PATHWAY.controllerRoles.map(x=><div key={x} style={{padding:10,border:'1px solid #233a4e',borderRadius:10}}>{x}</div>)}</div>
    <h3>Missions</h3>{AIR_MOBILITY_MISSIONS.map(m=><article key={m.id} style={{padding:'10px 0',borderBottom:'1px solid #1d3142'}}><b>{m.name}</b><p style={{color:'#b2c0cf',margin:'4px 0'}}>{m.goal}</p></article>)}
    <h3>Provider gates</h3>{Object.entries(PROVIDER_GATES).map(([k,v])=><p key={k}><b>{k}:</b> <span style={{color:'#b2c0cf'}}>{v}</span></p>)}
    <p style={{color:'#ffcf66'}}>{STREETVERSE_AIR_MOBILITY.hardRule}</p>
  </section>
}
