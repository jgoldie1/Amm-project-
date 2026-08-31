import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root=process.cwd()
const networkPath=path.join(root,'src/runtime/HolographicInternetRuntime.ts')
const gridPath=path.join(root,'src/runtime/ConstructHoloGridRuntime.ts')
const secsPath=path.join(root,'src/runtime/SECSConstructRuntime.ts')

for(const file of [networkPath,gridPath,secsPath]){
  if(!fs.existsSync(file))throw new Error(`Holographic Internet contract missing file: ${file}`)
}

const network=fs.readFileSync(networkPath,'utf8')
const grid=fs.readFileSync(gridPath,'utf8')
const secs=fs.readFileSync(secsPath,'utf8')

for(const token of ['SpatialSessionRouter','HoloStateSync','HoloTrustGateway','critical','constructTransport','providerTransport']){
  if(!network.includes(token))throw new Error(`Holographic Internet runtime missing: ${token}`)
}

for(const token of ['spawnHoloPresence','moveAutonomousCursor','projectConstructToGrid','consentGatedPresence','physicalization']){
  if(!grid.includes(token))throw new Error(`Construct Holo Grid runtime missing: ${token}`)
}

for(const token of ['installHolographicInternetRuntime','installConstructHoloGridRuntime','networkFabric','autonomousCursor']){
  if(!secs.includes(token))throw new Error(`SECS integration missing: ${token}`)
}

if(!network.includes("commerce-cannot-bypass-ledger-gates"))throw new Error('Commerce trust gate is missing')
if(!grid.includes("Physical holograms and tactile constructs still require validated display/haptic hardware"))throw new Error('Hardware validation disclaimer is missing')

console.log('Holographic Internet + Construct Holo Grid contract: PASS')
