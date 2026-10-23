import assert from 'node:assert/strict'
import fs from 'node:fs'
const r=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const site=r('src/business/FullTemplateSite.tsx'),list=r('src/business/ClientSiteLaunchChecklist.tsx'),pkg=JSON.parse(r('package.json'))
assert(site.includes("import ClientSiteLaunchChecklist from './ClientSiteLaunchChecklist'"))
assert(site.includes('<ClientSiteLaunchChecklist templateId={id} businessName={demo.brand} sector={sector}/>'))
for(const id of ['owner','assets','domain','contact','checkout','phone','handoff'])assert(list.includes("'"+id+"'"))
assert(list.includes('productionPublished:false'))
assert(list.includes('verifiedLiveUrl:null'))
assert(list.includes('DOWNLOAD CLIENT LAUNCH HANDOFF'))
assert(list.includes('111 template categories are reusable previews'))
assert(pkg.scripts.build.includes('tryamm-111-client-launch-handoff-contract.mjs'))
console.log('111 CLIENT WEBSITE HANDOFF PASS: templates are not falsely shown as deployed stores')
