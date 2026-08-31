export type OmniverseAssetClass='animal'|'car'|'luxury-car'|'boat'|'property'|'creator-item'
export type LedgerEventType='GENESIS'|'SPAWN'|'MISSION_REWARD'|'PURCHASE'|'RENTAL'|'MARKETPLACE_FEE'|'SPONSOR_REWARD'|'SUBSCRIPTION'|'TRANSFER'|'RIDE_REQUEST'|'DRONE_MISSION'

export type OmniverseAssetRecord={
  id:string
  class:OmniverseAssetClass
  label:string
  ownerId:string
  license:'ORIGINAL'|'LICENSED'|'PLACEHOLDER'
  provenance:string
  valueCredits:number
}

export type OmniverseLedgerBlock={
  index:number
  timestamp:string
  event:LedgerEventType
  playerId:string
  assetId?:string
  amountCredits:number
  revenueStream?:string
  metadata?:Record<string,string|number|boolean>
  previousHash:string
  hash:string
}

export type OmniverseEconomySnapshot={
  playerBalance:number
  grossPlatformCredits:number
  byStream:Record<string,number>
  ownedAssetIds:string[]
  ledger:OmniverseLedgerBlock[]
}

const LEDGER_KEY='tryamm.omniverse.asset-ledger.v1'
const ECONOMY_KEY='tryamm.omniverse.economy.v1'
const PLAYER_ID='streetverse-player-local'

const encoder=new TextEncoder()
let economyMutationQueue:Promise<void>=Promise.resolve()

async function sha256(value:string){
  if(globalThis.crypto?.subtle){
    const digest=await globalThis.crypto.subtle.digest('SHA-256',encoder.encode(value))
    return Array.from(new Uint8Array(digest)).map(byte=>byte.toString(16).padStart(2,'0')).join('')
  }
  let hash=2166136261
  for(let i=0;i<value.length;i++){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619)}
  return `compat-${(hash>>>0).toString(16).padStart(8,'0')}`
}

function loadJson<T>(key:string,fallback:T):T{
  try{return JSON.parse(localStorage.getItem(key)||'') as T}catch{return fallback}
}

function saveJson(key:string,value:unknown){localStorage.setItem(key,JSON.stringify(value))}

function serializeEconomyMutation<T>(operation:()=>Promise<T>):Promise<T>{
  const run=economyMutationQueue.then(operation,operation)
  economyMutationQueue=run.then(()=>undefined,()=>undefined)
  return run
}

export const OMNIVERSE_DEMO_ASSETS:OmniverseAssetRecord[]=[
  {id:'animal-dog-01',class:'animal',label:'City Dog',ownerId:'world',license:'PLACEHOLDER',provenance:'Procedural StreetVerse demo primitive',valueCredits:20},
  {id:'animal-deer-01',class:'animal',label:'Urban Deer',ownerId:'world',license:'PLACEHOLDER',provenance:'Procedural StreetVerse demo primitive',valueCredits:30},
  {id:'animal-horse-01',class:'animal',label:'Riding Horse',ownerId:'world',license:'PLACEHOLDER',provenance:'Procedural StreetVerse demo primitive',valueCredits:80},
  {id:'car-city-sedan',class:'car',label:'City Sedan',ownerId:'marketplace',license:'PLACEHOLDER',provenance:'Original unbranded StreetVerse vehicle class',valueCredits:120},
  {id:'car-euro-lux',class:'luxury-car',label:'European Luxury Sedan',ownerId:'marketplace',license:'PLACEHOLDER',provenance:'Original unbranded luxury vehicle class; no third-party marks',valueCredits:300},
  {id:'car-italian-gt',class:'luxury-car',label:'Italian-Style Grand Tourer',ownerId:'marketplace',license:'PLACEHOLDER',provenance:'Original unbranded luxury vehicle class; no third-party marks',valueCredits:420},
  {id:'car-super-01',class:'luxury-car',label:'Exotic Supercar',ownerId:'marketplace',license:'PLACEHOLDER',provenance:'Original unbranded supercar class; no third-party marks',valueCredits:500},
  {id:'boat-speed-01',class:'boat',label:'Lake Speedboat',ownerId:'marina',license:'PLACEHOLDER',provenance:'Procedural StreetVerse demo watercraft',valueCredits:240},
  {id:'boat-yacht-01',class:'boat',label:'Luxury Motor Yacht',ownerId:'marina',license:'PLACEHOLDER',provenance:'Original unbranded StreetVerse watercraft class',valueCredits:650},
]

const EMPTY_ECONOMY:OmniverseEconomySnapshot={playerBalance:250,grossPlatformCredits:0,byStream:{},ownedAssetIds:[],ledger:[]}

export function loadOmniverseEconomy(){
  const economy=loadJson<OmniverseEconomySnapshot>(ECONOMY_KEY,EMPTY_ECONOMY)
  const ledger=loadJson<OmniverseLedgerBlock[]>(LEDGER_KEY,economy.ledger||[])
  return {...EMPTY_ECONOMY,...economy,ledger}
}

async function appendBlockUnlocked(input:Omit<OmniverseLedgerBlock,'index'|'timestamp'|'previousHash'|'hash'>){
  const current=loadOmniverseEconomy()
  const previousHash=current.ledger.length?current.ledger[current.ledger.length-1].hash:'GENESIS'
  const blockBase={index:current.ledger.length,timestamp:new Date().toISOString(),...input,previousHash}
  const hash=await sha256(JSON.stringify(blockBase))
  const block:OmniverseLedgerBlock={...blockBase,hash}
  saveJson(LEDGER_KEY,[...current.ledger,block])
  return block
}

export async function verifyOmniverseLedger(){
  const ledger=loadOmniverseEconomy().ledger
  for(let i=0;i<ledger.length;i++){
    const block=ledger[i]
    const expectedPrevious=i===0?'GENESIS':ledger[i-1].hash
    if(block.index!==i||block.previousHash!==expectedPrevious)return {ok:false,blocks:ledger.length,failedIndex:i}
    const {hash,...blockBase}=block
    const expectedHash=await sha256(JSON.stringify(blockBase))
    if(hash!==expectedHash)return {ok:false,blocks:ledger.length,failedIndex:i}
  }
  return {ok:true,blocks:ledger.length,failedIndex:null as number|null}
}

export async function ensureOmniverseGenesis(){
  return serializeEconomyMutation(async()=>{
    const current=loadOmniverseEconomy()
    if(current.ledger.length)return current
    await appendBlockUnlocked({event:'GENESIS',playerId:PLAYER_ID,amountCredits:0,metadata:{network:'El Saturn Quantum Omniverse Internal Game Ledger',mode:'local-demo',architecture:'hash-chained-ledger'}})
    return loadOmniverseEconomy()
  })
}

export async function recordMobilityEvent(kind:'ride'|'drone',metadata:Record<string,string|number|boolean>={}){
  return serializeEconomyMutation(async()=>{
    await ensureOmniverseGenesisUnlocked()
    await appendBlockUnlocked({event:kind==='ride'?'RIDE_REQUEST':'DRONE_MISSION',playerId:PLAYER_ID,amountCredits:0,revenueStream:kind==='ride'?'holo-ride-share':'holo-drone',metadata:{...metadata,providerStatus:'provider-gated'}})
    return loadOmniverseEconomy()
  })
}

async function ensureOmniverseGenesisUnlocked(){
  const current=loadOmniverseEconomy()
  if(current.ledger.length)return
  await appendBlockUnlocked({event:'GENESIS',playerId:PLAYER_ID,amountCredits:0,metadata:{network:'El Saturn Quantum Omniverse Internal Game Ledger',mode:'local-demo',architecture:'hash-chained-ledger'}})
}

export async function recordMissionReward(amountCredits:number,mission:string){
  return serializeEconomyMutation(async()=>{
    const economy=loadOmniverseEconomy();economy.playerBalance+=amountCredits;saveJson(ECONOMY_KEY,economy)
    await appendBlockUnlocked({event:'MISSION_REWARD',playerId:PLAYER_ID,amountCredits,metadata:{mission}})
    return loadOmniverseEconomy()
  })
}

export async function recordPurchase(assetId:string){
  return serializeEconomyMutation(async()=>{
    const asset=OMNIVERSE_DEMO_ASSETS.find(item=>item.id===assetId);if(!asset)throw new Error('Unknown asset')
    const economy=loadOmniverseEconomy();if(economy.ownedAssetIds.includes(assetId))return economy;if(economy.playerBalance<asset.valueCredits)throw new Error('Not enough demo credits')
    const platformFee=Math.max(1,Math.round(asset.valueCredits*.10));economy.playerBalance-=asset.valueCredits;economy.grossPlatformCredits+=platformFee;economy.byStream['asset-marketplace']=(economy.byStream['asset-marketplace']||0)+platformFee;economy.ownedAssetIds=[...economy.ownedAssetIds,assetId];saveJson(ECONOMY_KEY,economy)
    await appendBlockUnlocked({event:'PURCHASE',playerId:PLAYER_ID,assetId,amountCredits:asset.valueCredits,revenueStream:'asset-marketplace',metadata:{platformFee,license:asset.license}})
    return loadOmniverseEconomy()
  })
}

export async function recordRental(assetId:string){
  return serializeEconomyMutation(async()=>{
    const asset=OMNIVERSE_DEMO_ASSETS.find(item=>item.id===assetId);if(!asset)throw new Error('Unknown asset')
    const rental=Math.max(5,Math.round(asset.valueCredits*.08));const economy=loadOmniverseEconomy();if(economy.playerBalance<rental)throw new Error('Not enough demo credits')
    economy.playerBalance-=rental;economy.grossPlatformCredits+=rental;economy.byStream['vehicle-watercraft-rental']=(economy.byStream['vehicle-watercraft-rental']||0)+rental;saveJson(ECONOMY_KEY,economy)
    await appendBlockUnlocked({event:'RENTAL',playerId:PLAYER_ID,assetId,amountCredits:rental,revenueStream:'vehicle-watercraft-rental'})
    return loadOmniverseEconomy()
  })
}

export async function recordSponsorReward(amountCredits=5){
  return serializeEconomyMutation(async()=>{
    const economy=loadOmniverseEconomy();economy.playerBalance+=amountCredits;economy.grossPlatformCredits+=amountCredits;economy.byStream['sponsored-missions']=(economy.byStream['sponsored-missions']||0)+amountCredits;saveJson(ECONOMY_KEY,economy)
    await appendBlockUnlocked({event:'SPONSOR_REWARD',playerId:PLAYER_ID,amountCredits,revenueStream:'sponsored-missions',metadata:{demo:true}})
    return loadOmniverseEconomy()
  })
}

export function resetOmniverseEconomy(){localStorage.removeItem(LEDGER_KEY);localStorage.removeItem(ECONOMY_KEY);return {...EMPTY_ECONOMY,byStream:{},ownedAssetIds:[],ledger:[]}}
