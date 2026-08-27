import { resolveQuantumName } from '../runtime/QuantumNetworkKernel'
import { listCTVProviders } from './ctvProvider'

export type BackboneHealth = {
  key:string
  label:string
  state:'live'|'degraded'|'gated'|'offline'
  detail:string
}

export function getQuantumBackboneHealth():BackboneHealth[]{
  const services=[
    ['hologpt','HoloGPT routing'],['streetverse','StreetVerse'],['quantum-time','Quantum Time stream'],['pocket-dimensions','Pocket Dimension sync'],['wallet','Wallet/payment network'],['ctv','CTV routing']
  ] as const
  const rows:BackboneHealth[]=services.map(([key,label])=>{
    const s=resolveQuantumName(key)
    return {key,label,state:s?.health??'offline',detail:s?`${s.protocol} • ${s.endpoint}`:'service not registered'}
  })
  const ctv=listCTVProviders()
  rows.push({key:'ctv-providers',label:'CTV providers',state:ctv.some(p=>p.isConfigured())?'live':'gated',detail:`${ctv.filter(p=>p.isConfigured()).length}/${ctv.length} configured`})
  rows.push({key:'device-network',label:'Device network',state:typeof navigator!=='undefined'&&navigator.onLine?'live':'offline',detail:typeof navigator!=='undefined'&&navigator.onLine?'browser reports online':'browser reports offline'})
  return rows
}

export function summarizeBackboneHealth(rows=getQuantumBackboneHealth()){
  const live=rows.filter(r=>r.state==='live').length
  const degraded=rows.filter(r=>r.state==='degraded').length
  const gated=rows.filter(r=>r.state==='gated').length
  const offline=rows.filter(r=>r.state==='offline').length
  return {live,degraded,gated,offline,total:rows.length,releaseReady:offline===0&&degraded===0&&gated===0}
}
