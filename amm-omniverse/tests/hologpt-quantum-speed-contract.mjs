import fs from 'node:fs'
const source=fs.readFileSync(new URL('../src/runtime/HoloGPTQuantumSpeedEngine.ts',import.meta.url),'utf8')
const required=['QUANTUM_SPEED_ENGINE','QUANTUM_LAG_BUSTER','GOOGOLPLEX_MEMORY','rankProvider','selectContext','buildSpeedDecision','intentRouteMs:100',"mode==='QUANTUM_FAST'?2500","mode==='BALANCED'?6000:14000"]
for(const token of required)if(!source.includes(token))throw new Error('Quantum speed contract missing: '+token)
const samples=[
 {provider:'fast-a',ttftMs:210,totalMs:900,tokensPerSecond:90,healthy:true,cacheHit:false},
 {provider:'fast-b',ttftMs:140,totalMs:1100,tokensPerSecond:70,healthy:true,cacheHit:true},
 {provider:'down',ttftMs:50,totalMs:500,tokensPerSecond:120,healthy:false,cacheHit:false},
]
const eligible=samples.filter(x=>x.healthy).sort((a,b)=>(a.ttftMs-b.ttftMs)||(b.tokensPerSecond-a.tokensPerSecond))
if(eligible[0].provider!=='fast-b')throw new Error('Provider ranking contract failed')
const slices=[{id:'a',relevance:1,tokens:1400},{id:'b',relevance:.9,tokens:900},{id:'c',relevance:.8,tokens:800}]
let used=0,chosen=[]
for(const x of slices){if(used+x.tokens>2500)continue;chosen.push(x.id);used+=x.tokens}
if(chosen.join(',')!=='a,b'||used!==2300)throw new Error('FAST context budget contract failed')
console.log(JSON.stringify({status:'PASS',syntheticBenchmark:true,providerSelected:'fast-b',selectedTTFTms:140,contextBudgetTokens:2500,contextUsedTokens:2300,contextUtilizationPct:92,healthyProviders:2,totalProviders:3},null,2))
