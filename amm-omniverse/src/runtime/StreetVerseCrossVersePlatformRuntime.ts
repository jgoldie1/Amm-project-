/** CrossVerse registry: opt-in world connections, not unauthorized third-party access. */
export type CrossVerseWorld={id:string;name:string;kind:'internal'|'partner';enabled:boolean}
export type CrossVersePassport={playerId:string;worldId:string;permissions:string[]}
export function createCrossVersePlatform(){
 const worlds=new Map<string,CrossVerseWorld>()
 const passports=new Map<string,CrossVersePassport>()
 const addWorld=(world:CrossVerseWorld)=>{if(!world.id||worlds.has(world.id))throw new Error('Duplicate or empty world ID');worlds.set(world.id,{...world});return world.id}
 for(const id of ['streetverse','campusverse','faithverse','chronoverse'])addWorld({id,name:id,kind:'internal',enabled:true})
 return {
  registerPartner:(world:CrossVerseWorld,approved:boolean)=>{if(!approved||world.kind!=='partner')throw new Error('Partner approval required');return addWorld(world)},
  listWorlds:()=>Array.from(worlds.values()).map(w=>({...w})),
  setEnabled:(id:string,enabled:boolean)=>{const w=worlds.get(id);if(!w)throw new Error('Unknown world');worlds.set(id,{...w,enabled})},
  grant:(passport:CrossVersePassport)=>{if(!passport.playerId||!worlds.has(passport.worldId))throw new Error('Unknown player or world');passports.set(passport.playerId+':'+passport.worldId,{...passport,permissions:[...new Set(passport.permissions)]})},
  canTravel:(playerId:string,destinationId:string)=>{
   const world=worlds.get(destinationId),passport=passports.get(playerId+':'+destinationId)
   return Boolean(world?.enabled&&passport?.permissions.includes('travel'))
  },
  travel:(playerId:string,fromId:string,toId:string)=>{
   if(!worlds.get(fromId)?.enabled||!thisCanTravel(playerId,toId))throw new Error('CrossVerse travel denied')
   return {playerId,fromId,toId,at:new Date().toISOString()}
  }
 }
 function thisCanTravel(playerId:string,destinationId:string){
  const world=worlds.get(destinationId),passport=passports.get(playerId+':'+destinationId)
  return Boolean(world?.enabled&&passport?.permissions.includes('travel'))
 }
}
