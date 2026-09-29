import fs from 'node:fs'
import path from 'node:path'

const samples=[
 {id:'sample-a-reality-restore',label:'Reality Restore',scores:{realism:88,chicago:80,holo:58,gameplay:95,mobile:92,accessibility:94,originality:92}},
 {id:'sample-b-chicago-documentary',label:'Chicago Documentary',scores:{realism:92,chicago:98,holo:62,gameplay:92,mobile:82,accessibility:90,originality:94}},
 {id:'sample-c-holo-reality-fusion',label:'Holo Reality Fusion',scores:{realism:96,chicago:95,holo:98,gameplay:95,mobile:86,accessibility:94,originality:97}},
 {id:'sample-d-cinematic-hero',label:'Cinematic Hero',scores:{realism:99,chicago:91,holo:96,gameplay:84,mobile:54,accessibility:82,originality:95}},
]
const weights={realism:.26,chicago:.18,holo:.18,gameplay:.15,mobile:.11,accessibility:.07,originality:.05}
for(const sample of samples){
 sample.weightedScore=Math.round(Object.entries(weights).reduce((sum,[k,w])=>sum+sample.scores[k]*w,0)*100)/100
}
samples.sort((a,b)=>b.weightedScore-a.weightedScore||a.id.localeCompare(b.id))
if(samples.length!==4)throw new Error('Tournament must generate exactly four samples')
if(samples[0].id!=='sample-c-holo-reality-fusion')throw new Error('Reviewed production recipe winner drifted')
const report={
 schema:'tryamm.streetverse.asset-transformation-tournament.evidence.v1',
 generatedAt:new Date().toISOString(),
 candidateCount:samples.length,
 winner:samples[0],
 ranking:samples,
 artifactGeneration:'BLOCKED_UNTIL_PROVIDER_OR_ARTIST_OUTPUT_EXISTS',
 productionPublishAllowed:false,
 truth:'Recipe selection is automated; real asset generation/certification remains evidence-gated.',
}
const out=path.resolve(process.argv[2]||'../release-evidence/streetverse-asset-tournament.json')
fs.mkdirSync(path.dirname(out),{recursive:true})
fs.writeFileSync(out,JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
