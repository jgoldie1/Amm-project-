import { BUSINESS_MODEL, HARDWARE_ADAPTERS, LOCATION_VR_BRAND, ORIGINAL_EXPERIENCE_LANES, SAFETY_CONTRACT, SESSION_PIPELINE, VENUE_OPERATIONS, VENUE_STACK } from '../immersive/LocationVRPlatform'
import { HOLOARENA_LAUNCH_GAMES } from '../holoverse/HoloArenaLaunchGames'
import { HOLOARENA_STORE_CATALOG, STORE_RULES } from '../commerce/HoloArenaStoreCatalog'

export default function HoloArenaOperatorConsole({onClose}:{onClose:()=>void}){
 return <div role="dialog" aria-label="TRYAMM HoloArena" style={{position:'fixed',inset:0,zIndex:12500,overflowY:'auto',background:'radial-gradient(circle at top,#10253a,#03040c 55%,#010106)',color:'#fff',padding:18}}><div style={{maxWidth:1180,margin:'0 auto'}}>
  <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><div><div style={{fontSize:10,letterSpacing:3,color:'#4FE3FF',fontWeight:900}}>TRYAMM • LOCATION XR • ORIGINAL SYSTEM</div><h1 style={{margin:'7px 0'}}>{LOCATION_VR_BRAND.name}</h1><p style={{color:'#a9b7c8',maxWidth:840}}>{LOCATION_VR_BRAND.promise}</p></div><button aria-label="Close HoloArena" onClick={onClose} style={close}>×</button></header>
  <section style={panel}><h2>Session pipeline</h2><p style={accent}>{SESSION_PIPELINE}</p></section>
  <section style={panel}><h2>4 launch games • multi-level</h2><div style={grid}>{HOLOARENA_LAUNCH_GAMES.map(game=><article key={game.id} style={card}><b>{game.title}</b><small>{game.lane} • {game.players}</small>{game.levels.map(level=><p key={level.id} style={muted}><strong>{level.name}:</strong> {level.objective}</p>)}</article>)}</div></section>
  <section style={panel}><h2>Original experience catalog</h2><div style={grid}>{ORIGINAL_EXPERIENCE_LANES.map(x=><article key={x.id} style={card}><b>{x.name}</b><small>{x.source}</small><p style={muted}>{x.loop}</p></article>)}</div></section>
  <section style={panel}><h2>Venue runtime</h2><div style={grid}>{VENUE_STACK.map(x=><article key={x} style={card}><b>{x}</b></article>)}</div></section>
  <section style={panel}><h2>Operator safety</h2><p style={{...muted,color:'#ffcf66'}}>{SAFETY_CONTRACT.rule}</p><div style={grid}>{SAFETY_CONTRACT.hardStops.map(x=><article key={x} style={card}><b>{x}</b></article>)}</div><p style={muted}>Actions: {SAFETY_CONTRACT.operatorActions.join(' • ')}</p><p style={muted}>Accessibility: {SAFETY_CONTRACT.accessibility.join(' • ')}</p></section>
  <section style={panel}><h2>Venue jobs + operations</h2><p style={muted}>Roles: {VENUE_OPERATIONS.roles.join(' • ')}</p><p style={muted}>Inventory: {VENUE_OPERATIONS.inventory.join(' • ')}</p><p style={muted}>Maintenance: {VENUE_OPERATIONS.maintenance.join(' • ')}</p></section>
  <section style={panel}><h2>Hardware adapter path</h2><p style={muted}>{HARDWARE_ADAPTERS.current}</p><p style={muted}>Targets: {HARDWARE_ADAPTERS.targets.join(' • ')}</p><p style={muted}>Future: {HARDWARE_ADAPTERS.future.join(' • ')}</p></section>
  <section style={panel}><h2>Store + profit catalog</h2><div style={grid}>{HOLOARENA_STORE_CATALOG.map(x=><article key={x.sku} style={card}><b>{x.name}</b><small>{x.category} • {x.channel.join(' / ')}</small><p style={muted}>{x.marginStrategy}</p>{x.gate&&<p style={{...muted,color:'#ffcf66'}}>Gate: {x.gate}</p>}</article>)}</div><p style={muted}>{STORE_RULES.join(' • ')}</p></section>
  <section style={panel}><h2>Business + franchise</h2><div style={grid}>{BUSINESS_MODEL.revenue.map(x=><article key={x} style={card}><b>{x}</b></article>)}</div><p style={muted}>Upsell: {BUSINESS_MODEL.upsell.join(' • ')}</p><p style={{...muted,color:'#ffcf66'}}>{BUSINESS_MODEL.franchiseTruth}</p></section>
  <section style={panel}><h2>Release truth</h2><p style={muted}>{LOCATION_VR_BRAND.truth}</p><p style={muted}>Real venue operation still requires tested hardware, site safety, insurance, trained operators, applicable permits, payment/ticketing activation and production database deployment.</p></section>
 </div></div>
}
const panel={border:'1px solid #25415a',borderRadius:18,padding:16,margin:'14px 0',background:'#08111b'} as const
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10} as const
const card={border:'1px solid #26394d',borderRadius:14,padding:13,background:'#0a1420',display:'grid',gap:6} as const
const muted={color:'#a9b7c8',lineHeight:1.55} as const
const accent={color:'#7dffb0',fontWeight:800,lineHeight:1.5} as const
const close={width:44,height:44,borderRadius:'50%',border:'1px solid #4a5e73',background:'#0b1320',color:'#fff',fontSize:22} as const
