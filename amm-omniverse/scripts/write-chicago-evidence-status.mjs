import fs from 'node:fs/promises'
import path from 'node:path'

const outcome=String(process.env.CHICAGO_EVIDENCE_OUTCOME||'unknown').toLowerCase()
const outDir=path.resolve(process.argv[2]||'../release-evidence/chicago-reconstruction')
const manifestFile=path.join(outDir,'manifest.json')
let manifest=null
try{manifest=JSON.parse(await fs.readFile(manifestFile,'utf8'))}catch{}

const available=outcome==='success'&&Array.isArray(manifest?.sources)&&manifest.sources.length>=3
const status={
  schema:'tryamm.streetverse.chicago-evidence-provider-status.v1',
  generatedAt:new Date().toISOString(),
  outcome,
  available,
  mode:available?'provider-ready':'provider-degraded',
  proofZone:'Circle Park → Roosevelt → Taylor → UIC',
  exactDigitalTwin:false,
  gameplayFallback:'existing public-data-grounded game reconstruction remains authoritative when fresh provider evidence is unavailable',
  promotionRule:'Do not label City geometry refreshed/current unless the evidence fetch and proof-zone compile both succeed.',
  providerNote:available
    ?'City evidence package completed for this run.'
    :'External City GIS evidence was unavailable or incomplete for this run; this does not invalidate the existing game reconstruction.',
  sourceManifest:manifest?{
    downloadedAt:manifest.downloadedAt||null,
    sourceCount:Array.isArray(manifest.sources)?manifest.sources.length:0,
    sources:(manifest.sources||[]).map(source=>({id:source.id,featureCount:source.featureCount,provider:source.provider,caveat:source.caveat||null})),
  }:null,
}
await fs.mkdir(outDir,{recursive:true})
await fs.writeFile(path.join(outDir,'provider-status.json'),JSON.stringify(status,null,2)+'\n')
console.log(`Chicago provider status: ${status.mode} • outcome=${outcome} • exactDigitalTwin=false`)
