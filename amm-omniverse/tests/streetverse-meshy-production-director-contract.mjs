import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const script=read('../scripts/streetverse-meshy-asset-production.mjs')
const workflow=read('../../.github/workflows/streetverse-meshy-asset-production.yml')
const profiles=JSON.parse(read('../config/streetverse-meshy-production-profiles.json'))
const envExample=read('../amm-backend/.env.example')
const render=read('../amm-backend/render.yaml')
const pkg=JSON.parse(read('../package.json'))

const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE MESHY PRODUCTION DIRECTOR CONTRACT FAIL: '+msg)}

must(pkg.scripts['asset:meshy:produce']==='node scripts/streetverse-meshy-asset-production.mjs','package command missing')
must(profiles.provider==='meshy','Meshy provider profile identity missing')
must(profiles.model==='meshy-7.1','production profiles must pin the reviewed current Meshy model family')
for(const id of ['hero-player','premium-resident-a','sport-sedan','city-transit-train','chicago-storefront-module']){
  must(profiles.profiles.some(profile=>profile.id===id),'missing production profile '+id)
}
for(const marker of [
  "confirm!=='YES'",
  'MESHY_API_KEY_REQUIRED',
  "mode:'preview'",
  "mode:'refine'",
  "target_formats:['glb']",
  'enable_pbr:true',
  'texture_resolution:textureResolution',
  'geometry_resolution:geometryResolution',
  "moderation:true",
  "glb.subarray(0,4).toString('ascii')!=='glTF'",
  'consumed_credits',
  'assetPassportCertified:false',
  'humanVisualReview:false',
  'runtimePerformanceEvidence:false',
  'productionPublishAllowed:false',
])must(script.includes(marker),'production script missing '+marker)

must(!script.includes('VITE_MESHY'),'Meshy secret must never use a browser-exposed Vite variable')
must(workflow.includes('workflow_dispatch:'),'Meshy production must be operator-dispatched')
must(workflow.includes('confirm_paid_generation'),'paid generation confirmation input missing')
must(workflow.includes('secrets.MESHY_API_KEY'),'workflow must use GitHub server secret')
must(workflow.includes('contents: read'),'generation workflow must not have automatic repository write authority')
must(workflow.includes('Enforce review-before-publish truth'),'workflow must fail closed before production promotion')
must(workflow.includes('actions/upload-artifact@v4'),'workflow must preserve generated candidates for human review')
must(envExample.includes('MESHY_API_KEY=msy_'),'backend env example must document Meshy server secret')
must(render.includes('# MESHY_API_KEY'),'Render config must document Meshy server secret')
console.log('STREETVERSE MESHY PRODUCTION DIRECTOR CONTRACT PASS: explicit paid confirmation -> preview -> PBR refine -> GLB evidence -> human review gate -> no auto-publish')
