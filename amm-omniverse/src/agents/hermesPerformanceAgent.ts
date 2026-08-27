export type StreetVersePerfSample={ts:number;route:string;loadMs:number;fps?:number;assetLatencyMs?:number;apiLatencyMs?:number;deviceClass?:'mobile'|'desktop'|'unknown';region?:string}
export type PerfFinding={metric:'load'|'fps'|'asset'|'api';severity:'info'|'warn'|'critical';value:number;recommendation:string}

const samples:StreetVersePerfSample[]=[]

export function recordStreetVersePerf(sample:Omit<StreetVersePerfSample,'ts'> & {ts?:number}){
 const row={...sample,ts:sample.ts??Date.now()};samples.push(row);if(samples.length>500)samples.splice(0,samples.length-500);return row
}

export function analyzeStreetVersePerf(recent=60):PerfFinding[]{
 const rows=samples.slice(-recent);if(!rows.length)return []
 const avg=(values:number[])=>values.length?values.reduce((a,b)=>a+b,0)/values.length:0
 const findings:PerfFinding[]=[]
 const load=avg(rows.map(r=>r.loadMs));if(load>5000)findings.push({metric:'load',severity:'critical',value:load,recommendation:'Profile bundle size and initial world assets; test CDN/edge or OCI object delivery for large assets.'});else if(load>3000)findings.push({metric:'load',severity:'warn',value:load,recommendation:'Defer noncritical assets and compare edge/cache delivery.'})
 const fps=avg(rows.map(r=>r.fps||0).filter(Boolean));if(fps&&fps<30)findings.push({metric:'fps',severity:'critical',value:fps,recommendation:'Reduce draw calls, LOD/poly count, shadows and post-processing before adding cloud capacity.'});else if(fps&&fps<45)findings.push({metric:'fps',severity:'warn',value:fps,recommendation:'Tune quality presets and dynamic resolution for the measured device class.'})
 const asset=avg(rows.map(r=>r.assetLatencyMs||0).filter(Boolean));if(asset>800)findings.push({metric:'asset',severity:'warn',value:asset,recommendation:'Benchmark current CDN vs OCI/edge cache and route only asset traffic if measurably faster.'})
 const api=avg(rows.map(r=>r.apiLatencyMs||0).filter(Boolean));if(api>700)findings.push({metric:'api',severity:'warn',value:api,recommendation:'Trace slow APIs and test region placement/cache before migrating workloads.'})
 return findings
}

export type HermesAgentState={enabled:boolean;mode:'sandbox';role:'learning-performance';endpoint?:string;lastRun?:number}
let state:HermesAgentState={enabled:false,mode:'sandbox',role:'learning-performance'}

export function configureHermesPerformanceAgent(input:{enabled:boolean;endpoint?:string}){state={...state,...input};return state}
export function getHermesPerformanceAgent(){return {...state,findings:analyzeStreetVersePerf(),sampleCount:samples.length}}

export async function runHermesPerformanceLearning(){
 const findings=analyzeStreetVersePerf();state.lastRun=Date.now()
 if(!state.enabled||!state.endpoint)return {ok:false,degraded:true,mode:'sandbox',message:'Hermes is registered but not connected. Local performance analysis remains active.',findings}
 const r=await fetch(state.endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({task:'learn-streetverse-performance-patterns',samples:samples.slice(-60),findings,guardrails:{readOnly:true,noDeploy:true,noPayments:true,noProductionMutation:true}})})
 const text=await r.text();return {ok:r.ok,degraded:!r.ok,mode:'sandbox',response:text,findings}
}
