import fs from 'node:fs'

const rightsFile=new URL('../src/data/assetRightsRegistry.ts',import.meta.url)
const loaderFile=new URL('../src/services/streetverseAssetLoader.ts',import.meta.url)
const policyFile=new URL('../ASSET_RIGHTS_CLEARANCE.md',import.meta.url)
for(const file of [rightsFile,loaderFile,policyFile])if(!fs.existsSync(file))throw new Error(`Missing rights gate contract: ${file.pathname}`)

const rights=fs.readFileSync(rightsFile,'utf8')
const loader=fs.readFileSync(loaderFile,'utf8')
const policy=fs.readFileSync(policyFile,'utf8')

for(const token of ['ORIGINAL','LICENSED','PUBLIC_DOMAIN','PENDING_REVIEW','REJECTED','NO_PROVENANCE_RECORD','NO_COMMERCIAL_USE_RIGHT','NO_DERIVATIVE_USE_RIGHT','LIKENESS_CONSENT_REQUIRED','TRADEMARK_CLEARANCE_REQUIRED','MUSIC_SYNC_CLEARANCE_REQUIRED','LICENSE_PROOF_REQUIRED']){
  if(!rights.includes(token))throw new Error(`Asset rights registry missing ${token}`)
}
for(const token of ['evaluateProductionClearance','requireClearance','StreetVerse rights gate']){
  if(!loader.includes(token))throw new Error(`StreetVerse asset loader missing ${token}`)
}
for(const token of ['No third-party asset enters a production game build','Missing provenance is a failure','original fictionalized replacement']){
  if(!policy.includes(token))throw new Error(`Asset clearance policy missing: ${token}`)
}
console.log('Asset rights and provenance contract PASS')
