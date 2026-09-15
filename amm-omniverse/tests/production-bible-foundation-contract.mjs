import fs from 'node:fs'
import path from 'node:path'

const root=process.cwd()
const source=fs.readFileSync(path.join(root,'src/foundation/productionBibleFoundation.ts'),'utf8')

const requiredTokens=[
  "'feature-30'",
  "'feature-60'",
  "'feature-90'",
  "'feature-120'",
  'CharacterBibleEntry',
  'ContinuityState',
  'RightsGrant',
  'ProductPlacement',
  "'holographic-overlay'",
  "'dynamic-zone'",
  'cleanArchivalMasterRequired: true',
  'verifiedAdultAccessRequired',
  'hideFromMinorDiscovery',
  'explicitSexualGenerationEnabled: false',
  'sexualContentInvolvingMinorsAllowed: false',
  'createShotGenerationContext',
  'canRenderPlacement',
  'canExposeToMinorDiscovery',
  'payment verification',
  'seller payable balance',
  'server-authoritative',
]

for(const token of requiredTokens){
  if(!source.includes(token))throw new Error(`Production Bible foundation missing ${token}`)
}

const forbidden=[
  'explicitSexualGenerationEnabled: true',
  'sexualContentInvolvingMinorsAllowed: true',
]
for(const token of forbidden){
  if(source.includes(token))throw new Error(`Production Bible safety boundary violated: ${token}`)
}

console.log('Production Bible foundation contract passed')
