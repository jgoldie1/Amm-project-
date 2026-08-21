import { FIELD_SERVICE_FUNNEL, FIELD_SERVICE_LANES, JOB_RUNTIME, PROVIDER_PROFILE, QUANTUM_FIELD_AI, AVIATION_TRUTH } from '../field/QuantumFieldServicesPlatform'

export default function FieldServicesHub(){
 return <section aria-label="TRYAMM Field Services" style={{padding:16,border:'1px solid #29445f',borderRadius:18,background:'#07111b',color:'#fff'}}>
  <div style={{fontSize:11,letterSpacing:2,color:'#4FE3FF',fontWeight:900}}>TRYAMM FIELD SERVICES • QUANTUM INSPECTION OS</div>
  <h2>Find work. Start a service business. Deliver verified field work.</h2>
  <p style={{color:'#a9b7c8'}}>Real estate imaging, construction inspection support, agriculture, environmental monitoring, media/movie production, HoloArena events, disaster assessment and approval-gated delivery operations share one provider identity, training, job, evidence, payment and reputation system.</p>
  <div style={grid}>{FIELD_SERVICE_LANES.map(l=><article key={l.id} style={card}><b>{l.label}</b><small>{l.aviationGate?'AVIATION APPROVAL GATED':'SERVICE QUALIFICATION GATED'}</small><p>{l.qualification.join(' • ')}</p><p style={{color:'#a9b7c8'}}>{l.deliverables.join(' • ')}</p></article>)}</div>
  <h3>Conversion path</h3><p>{FIELD_SERVICE_FUNNEL.join(' → ')}</p>
  <h3>Provider roles</h3><p>{PROVIDER_PROFILE.roles.join(' • ')}</p><p style={{color:'#a9b7c8'}}>{PROVIDER_PROFILE.checks.join(' • ')}</p>
  <h3>Job runtime</h3><p>{JOB_RUNTIME.join(' → ')}</p>
  <h3>{QUANTUM_FIELD_AI.name}</h3><p style={{color:'#a9b7c8'}}>{QUANTUM_FIELD_AI.functions.join(' • ')}</p>
  <p style={{color:'#ffcf66'}}>{QUANTUM_FIELD_AI.rule}</p><p style={{color:'#ff9b8d'}}>{AVIATION_TRUTH}</p>
 </section>
}
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:10} as const
const card={border:'1px solid #26394d',borderRadius:14,padding:13,background:'#0a1420',display:'grid',gap:6} as const
