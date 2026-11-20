import {ANIMAL_NEEDS,type AnatomyProfile,type CreatureEnvironment,isAnatomyProfile} from './StreetVerseThreeCastHealthRuntime'

/** One bounded, game-only Mycelium signal fabric for StreetVerse wildlife and
 * care loops. It connects existing Ecology Lifecycle, world events, and per-
 * creature health events. It does not claim a biological fungal network,
 * remote multiplayer, blockchain, medical simulation, or automatic asset spawn.
 */
export type LivingWorldHabitat='forest'|'grassland'|'garden'|'urban'|'freshwater'|'saltwater'|'wetland'|'desert'
export type MyceliumSignal={nodeId:string;habitat:LivingWorldHabitat;moisture:number;waterQuality:number;foodSupply:number;oxygen:number;temperatureFit:number;pollination:number;soilHealth:number;cycle:number}
const HABITATS:LivingWorldHabitat[]=['forest','grassland','garden','urban','freshwater','saltwater','wetland','desert']
const clamp=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(100,n)):50
export const defaultMyceliumNode=(habitat:LivingWorldHabitat='garden'):MyceliumSignal=>({
 nodeId:'streetverse-mycelium-'+habitat,habitat,moisture:70,waterQuality:80,foodSupply:70,oxygen:90,temperatureFit:80,pollination:70,soilHealth:75,cycle:0
})
export function creatureEnvironmentFromMycelium(signal:MyceliumSignal,profile:AnatomyProfile):CreatureEnvironment{
 const aquatic=profile==='fish'
 const insect=profile==='insect'
 const water=signal.waterQuality>=40&&signal.moisture>=30
 const nativeHabitat=aquatic?['freshwater','saltwater','wetland'].includes(signal.habitat):
   insect?['forest','grassland','garden','urban','wetland'].includes(signal.habitat):true
 return {
  oxygenOk:signal.oxygen>=45&&(aquatic?signal.waterQuality>=40:true),
  temperatureOk:signal.temperatureFit>=40,
  habitatOk:nativeHabitat&&signal.soilHealth>=25,
  foodAvailable:signal.foodSupply>=30,
  waterAvailable:water,
  restAvailable:signal.temperatureFit>=30&&signal.soilHealth>=25,
 }
}
export function updateMyceliumNode(current:MyceliumSignal,input:Partial<MyceliumSignal>):MyceliumSignal{
 const habitat=HABITATS.includes(input.habitat as LivingWorldHabitat)?input.habitat as LivingWorldHabitat:current.habitat
 return {
  ...current,habitat,cycle:current.cycle+1,
  moisture:clamp(input.moisture??current.moisture),
  waterQuality:clamp(input.waterQuality??current.waterQuality),
  foodSupply:clamp(input.foodSupply??current.foodSupply),
  oxygen:clamp(input.oxygen??current.oxygen),
  temperatureFit:clamp(input.temperatureFit??current.temperatureFit),
  pollination:clamp(input.pollination??current.pollination),
  soilHealth:clamp(input.soilHealth??current.soilHealth),
 }
}
export function createStreetVerseMyceliumLivingBridge(){
 let node=defaultMyceliumNode()
 let cycleAt=0
 const creatures=new Map<string,AnatomyProfile>()
 const send=(id:string,profile:AnatomyProfile,hours=1)=>{
  const env=creatureEnvironmentFromMycelium(node,profile)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-creature-environment',{detail:{characterId:id,environment:env,hours,source:'mycelium-living-world',cycle:node.cycle}}))
 }
 const publish=(origin:string)=>{
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mycelium-living-world-updated',{detail:{...node,source:'mycelium-living-world',origin,registeredCreatures:creatures.size,simulated:true}}))
  for(const [id,profile] of creatures)send(id,profile)
 }
 const register=(id:string,profile:AnatomyProfile)=>{
  if(!/^[a-z0-9][a-z0-9-]{0,79}$/.test(id)||!ANIMAL_NEEDS[profile]||creatures.size>=256&&!creatures.has(id))return
  creatures.set(id,profile)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-health-register',{detail:{characterId:id,anatomyProfile:profile,source:'mycelium-living-world'}}))
  send(id,profile,0)
 }
 const onRegister=(e:Event)=>{
  const d=(e as CustomEvent<{characterId?:string;anatomyProfile?:string}>).detail||{}
  const profile=String(d.anatomyProfile||'')
  if(d.characterId&&isAnatomyProfile(profile))register(d.characterId,profile)
 }
 const onSignal=(e:Event)=>{
  const d=(e as CustomEvent<Partial<MyceliumSignal>>).detail||{}
  node=updateMyceliumNode(node,d)
  publish('habitat-signal')
 }
 const onEcologyCycle=(e:Event)=>{
  const d=(e as CustomEvent<{cycle?:number;season?:string;populations?:Record<string,{adult?:number;young?:number}>}>).detail||{}
  const tick=Number(d.cycle??0)
  if(!Number.isFinite(tick)||tick<=cycleAt)return
  cycleAt=tick
  const species=d.populations||{}
  const mapping:Record<string,AnatomyProfile>={fish:'fish',butterfly:'insect',roach:'insect',spider:'insect',pigeon:'bird',goose:'bird',parrot:'bird',hawk:'bird',owl:'bird',crocodile:'reptile',rabbit:'mammal',deer:'mammal',squirrel:'mammal',lion:'mammal',elephant:'mammal',giraffe:'mammal',wolf:'mammal',coyote:'mammal'}
  for(const [speciesId,profile] of Object.entries(mapping)){
   if(!Object.prototype.hasOwnProperty.call(species,speciesId))continue
   register('ecosystem-'+speciesId,profile)
  }
  const winter=d.season==='winter'
  node=updateMyceliumNode(node,{temperatureFit:winter?48:82,pollination:winter?28:78})
  publish('existing-wildlife-cycle')
 }
 // Existing life-cycle service remains authoritative for mating, births,
 // migration, protected wildlife, hunting limits and population counts.
 // The bridge only translates accepted events into game-health/habitat signals.
 const animalGroup:Record<string,AnatomyProfile>={
  fish:'fish',butterfly:'insect',roach:'insect',spider:'insect',bee:'insect',
  pigeon:'bird',goose:'bird',parrot:'bird',hawk:'bird',owl:'bird',
  crocodile:'reptile',rabbit:'mammal',deer:'mammal',squirrel:'mammal',
  lion:'mammal',elephant:'mammal',giraffe:'mammal',wolf:'mammal',coyote:'mammal',
 }
 const ecosystemActor=(species:string)=>{
  const profile=animalGroup[species]
  if(!profile)return null
  const id='ecosystem-'+species
  register(id,profile)
  return id
 }
 const relay=(action:string,detail:Record<string,unknown>)=>{
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mycelium-wildlife-event',{detail:{
   ...detail,action,nodeId:node.nodeId,habitat:node.habitat,cycle:node.cycle,graphic:false,simulated:true
  }}))
 }
 const onOffspring=(e:Event)=>{
  const d=(e as CustomEvent<{species?:string;babies?:number;generation?:number;group?:string}>).detail||{}
  const species=String(d.species||'')
  if(!ecosystemActor(species))return
  relay('birth',{species,babies:Math.max(0,Math.min(100,Number(d.babies||0))),generation:d.generation,group:d.group})
  // Population changes are already applied by the existing ecology lifecycle.
  node=updateMyceliumNode(node,{foodSupply:node.foodSupply-1})
  publish('offspring-resource-needs')
 }
 const onMatured=(e:Event)=>{
  const d=(e as CustomEvent<{species?:string;count?:number}>).detail||{}
  const species=String(d.species||'')
  if(!ecosystemActor(species))return
  relay('matured',{species,count:d.count})
 }
 const onMigration=(e:Event)=>{
  const d=(e as CustomEvent<{species?:string;season?:string;behavior?:string}>).detail||{}
  const species=String(d.species||'')
  const id=ecosystemActor(species)
  if(!id)return
  relay('migration',{species,season:d.season,behavior:d.behavior})
  send(id,animalGroup[species],.25)
 }
 const onPredatorPrey=(e:Event)=>{
  const d=(e as CustomEvent<{predator?:string;prey?:string;count?:number;graphic?:boolean}>).detail||{}
  const predator=String(d.predator||''),prey=String(d.prey||'')
  const preyId=ecosystemActor(prey)
  if(!preyId||!ecosystemActor(predator))return
  relay('predator-prey',{predator,prey,count:d.count})
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-injury',{detail:{characterId:preyId,kind:'light',cause:'predator-prey',fictional:true,graphic:false}}))
 }
 const onHarvest=(e:Event)=>{
  // Rejected hunts never produce injury or change resources.
  const d=(e as CustomEvent<{ok?:boolean;species?:string;count?:number;kind?:string}>).detail||{}
  if(d.ok!==true)return
  const species=String(d.species||'')
  const id=ecosystemActor(species)
  if(!id)return
  relay('regulated-harvest',{species,count:d.count,harvestKind:d.kind})
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-injury',{detail:{characterId:id,kind:'moderate',cause:d.kind==='fish'?'fishing':'hunting',fictional:true,graphic:false}}))
 }
 const onWildlifeInjury=(e:Event)=>{
  const d=(e as CustomEvent<{characterId?:string;species?:string;kind?:string;cause?:string}>).detail||{}
  const species=String(d.species||'')
  const id=d.characterId||ecosystemActor(species)
  if(!id||!creatures.has(id))return
  // Shot and stab are fictional, non-graphic moderate injury events. They do
  // not bypass the separate protected-species hunting/conservation authority.
  const kind=d.kind==='recover'?'recover':d.kind==='moderate'||d.kind==='shot'||d.kind==='stab'||d.cause==='shot'||d.cause==='stab'?'moderate':'light'
  relay('wildlife-care',{species,characterId:id,kind,cause:d.cause||'injury'})
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-injury',{detail:{characterId:id,kind,cause:d.cause||'injury',graphic:false,fictional:true}}))
 }
 const onScan=(e:Event)=>{
  const d=(e as CustomEvent<{id?:string;species?:string}>).detail||{}
  if(d.id&&d.species&&isAnatomyProfile(d.species))register(d.id,d.species)
 }
 window.addEventListener('tryamm:streetverse-mycelium-signal',onSignal)
 window.addEventListener('tryamm:streetverse-ecology-cycle',onEcologyCycle)
 window.addEventListener('tryamm:streetverse-creature-register',onRegister)
 window.addEventListener('tryamm:streetverse-mycelium-register-creature',onScan)
 window.addEventListener('tryamm:streetverse-wildlife-offspring',onOffspring)
 window.addEventListener('tryamm:streetverse-wildlife-matured',onMatured)
 window.addEventListener('tryamm:streetverse-wildlife-seasonal',onMigration)
 window.addEventListener('tryamm:streetverse-predator-prey',onPredatorPrey)
 window.addEventListener('tryamm:streetverse-wildlife-harvest',onHarvest)
 window.addEventListener('tryamm:streetverse-wildlife-injury',onWildlifeInjury)
 return {
  snapshot:()=>({...node,creatures:[...creatures.entries()]}),
  dispose:()=>{
   window.removeEventListener('tryamm:streetverse-mycelium-signal',onSignal)
   window.removeEventListener('tryamm:streetverse-ecology-cycle',onEcologyCycle)
   window.removeEventListener('tryamm:streetverse-creature-register',onRegister)
   window.removeEventListener('tryamm:streetverse-mycelium-register-creature',onScan)
   window.removeEventListener('tryamm:streetverse-wildlife-offspring',onOffspring)
   window.removeEventListener('tryamm:streetverse-wildlife-matured',onMatured)
   window.removeEventListener('tryamm:streetverse-wildlife-seasonal',onMigration)
   window.removeEventListener('tryamm:streetverse-predator-prey',onPredatorPrey)
   window.removeEventListener('tryamm:streetverse-wildlife-harvest',onHarvest)
   window.removeEventListener('tryamm:streetverse-wildlife-injury',onWildlifeInjury)
   creatures.clear()
  },
 }
}
