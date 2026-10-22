'use strict';
/* AI Cafe release coordinator: safe deterministic checks and owner approval gates.
   Does not claim autonomous execution or production release. */
const fs=require('node:fs');
const path=require('node:path');
const {getEarthRegistry}=require('./streetverse-earth-registry');
const {getExpansionDestinations}=require('./streetverse-global-expansion');
const lanes=[
 {id:'runtime',checks:['existing Chicago runtime preserved','renderer boot','movement controls','mobile browser']},
 {id:'world',checks:['world manifests','district preview geometry','collision','licensed assets','city travel']},
 {id:'commerce',checks:['verified payment webhooks','owner-approved referral rules','ledger reconciliation']},
 {id:'creator',checks:['reel recording','upload','playback','creator consent']},
 {id:'assets',checks:['license provenance','GLB validation','LOD','memory budget']},
 {id:'guardian',checks:['regression suite','security','backup','production smoke test']}
];
function releaseReadiness(){
 const root=path.resolve(__dirname,'..');
 const exists=relative=>fs.existsSync(path.join(root,relative));
 const registry=getEarthRegistry();
 const required=['public/streetverse-rpg-engine.js','public/streetverse-san-diego.html','public/streetverse-san-diego.js','lib/streetverse-us-city-preview-compiler.js'];
 const files=required.map(file=>({file,present:exists(file)}));
 const destinations=getExpansionDestinations();
 return {name:'AI Cafe build swarm',mode:'read-only-assessment',lanes,regions:registry.regions.length,cityExpansion:destinations.map(d=>({id:d.id,registered:d.registered,playable:false})),files,blocked:files.some(f=>!f.present),productionApproved:false,testsExecuted:false,deployExecuted:false,ownerApprovalRequired:['production deployment','payments and commissions','new public business locations','cost-incurring asset generation']};
}
module.exports={lanes,releaseReadiness};
