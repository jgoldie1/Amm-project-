export type PocketDimensionKind=
 |'vehicle'|'clothing'|'tool'|'mission'|'gift'|'sports'|'collectible'|'business'|'media'|'faith'

export type PocketDimensionAction='use'|'equip'|'summon'|'give'|'drop'|'inspect'|'favorite'|'quick-slot'

export type PocketDimensionAsset=Readonly<{
 id:string
 name:string
 icon:string
 kind:PocketDimensionKind
 quantity:number
 authority:'GAME_STATE'|'SERVER'
 rarity?:'common'|'uncommon'|'rare'|'epic'|'legendary'
 tradable?:boolean
 droppable?:boolean
 quickSlotCompatible?:boolean
 source?:string
 metadata?:Readonly<Record<string,string|number|boolean>>
}>

export type PocketDimensionCatalogItem=Readonly<{
 id:string
 name:string
 icon:string
 kind:PocketDimensionKind
 actions:readonly PocketDimensionAction[]
 quickSlotCompatible:boolean
 searchTags:readonly string[]
}>

export const POCKET_DIMENSION_CATALOG:readonly PocketDimensionCatalogItem[]=[
 {id:'veh1',name:'Lowrider Classic',icon:'🚘',kind:'vehicle',actions:['summon','inspect','quick-slot'],quickSlotCompatible:true,searchTags:['car','ride','vehicle']},
 {id:'veh2',name:'AMM Muscle',icon:'🏎️',kind:'vehicle',actions:['summon','inspect','quick-slot'],quickSlotCompatible:true,searchTags:['car','muscle','vehicle']},
 {id:'veh3',name:'Quantum Cruiser',icon:'⚡',kind:'vehicle',actions:['summon','inspect','quick-slot'],quickSlotCompatible:true,searchTags:['car','quantum','vehicle']},
 {id:'veh4',name:'Holy Rider',icon:'✨',kind:'vehicle',actions:['summon','inspect','quick-slot'],quickSlotCompatible:true,searchTags:['car','faith','vehicle']},
 {id:'veh5',name:'Omniverse SUV',icon:'🚙',kind:'vehicle',actions:['summon','inspect','quick-slot'],quickSlotCompatible:true,searchTags:['suv','vehicle']},
 {id:'repair-kit',name:'Repair Kit',icon:'🧰',kind:'tool',actions:['use','give','inspect','quick-slot'],quickSlotCompatible:true,searchTags:['repair','car','tool','mission']},
 {id:'streetverse-phone',name:'Holo FON',icon:'📱',kind:'tool',actions:['use','inspect','quick-slot'],quickSlotCompatible:true,searchTags:['phone','holo','call','ride']},
 {id:'basketball',name:'Basketball',icon:'🏀',kind:'sports',actions:['use','give','inspect','quick-slot'],quickSlotCompatible:true,searchTags:['basketball','court','sport']},
 {id:'tennis-racket',name:'Tennis Racket',icon:'🎾',kind:'sports',actions:['use','give','inspect','quick-slot'],quickSlotCompatible:true,searchTags:['tennis','court','sport']},
 {id:'swim-kit',name:'Swim Kit',icon:'🏊',kind:'sports',actions:['equip','inspect','quick-slot'],quickSlotCompatible:true,searchTags:['pool','swim','sport']},
 {id:'reel-camera',name:'Reel Camera',icon:'🎥',kind:'media',actions:['use','inspect','quick-slot'],quickSlotCompatible:true,searchTags:['reel','camera','live','creator']},
 {id:'faith-reader',name:'Faith Reader',icon:'📖',kind:'faith',actions:['use','inspect','quick-slot'],quickSlotCompatible:true,searchTags:['bible','faith','reader']},
] as const

export const pocketCatalogItem=(id:string)=>POCKET_DIMENSION_CATALOG.find(item=>item.id===id)

export function pocketDimensionSuggestions(items:readonly PocketDimensionAsset[],limit=6){
 const priority:Record<PocketDimensionKind,number>={mission:100,tool:90,vehicle:80,sports:65,media:60,faith:55,clothing:50,gift:40,collectible:30,business:20}
 return [...items].sort((a,b)=>(priority[b.kind]||0)-(priority[a.kind]||0)||a.name.localeCompare(b.name)).slice(0,limit)
}

export const POCKET_DIMENSION_RULES={
 ownershipTruth:'Pocket Dimension never grants ownership locally. Owned assets come from game/server authority.',
 localStorageUse:'Local storage may remember view preferences, favorites and quick slots only.',
 serverValidatedActions:['give','drop','transfer','sell','consume'],
 maxQuickSlots:4,
 defaultCategory:'all',
} as const
