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
 const onScan=(e:Event)=>{
  const d=(e as CustomEvent<{id?:string;species?:string}>).detail||{}
  if(d.id&&d.species&&isAnatomyProfile(d.species))register(d.id,d.species)
 }
 window.addEventListener('tryamm:streetverse-mycelium-signal',onSignal)
 window.addEventListener('tryamm:streetverse-ecology-cycle',onEcologyCycle)
 window.addEventListener('tryamm:streetverse-creature-register',onRegister)
 window.addEventListener('tryamm:streetverse-mycelium-register-creature',onScan)
 return {
  snapshot:()=>({...node,creatures:[...creatures.entries()]}),
  dispose:()=>{
   window.removeEventListener('tryamm:streetverse-mycelium-signal',onSignal)
   window.removeEventListener('tryamm:streetverse-ecology-cycle',onEcologyCycle)
   window.removeEventListener('tryamm:streetverse-creature-register',onRegister)
   window.removeEventListener('tryamm:streetverse-mycelium-register-creature',onScan)
   creatures.clear()
  },
 }
}
