export type BuildLane='runtime'|'world'|'commerce'|'media'|'assets'|'qa'
export type BuildTask={id:string;lane:BuildLane;title:string;status:'queued'|'ready'|'blocked';dependsOn?:string[];output:string;verification:string}
export const BUILD_AGENTS=[
 {id:'runtime',name:'Runtime Agent',mission:'Routes, HoloGPT, auth, persistence, APIs and deployment truth.'},
 {id:'world',name:'Living World Agent',mission:'NPC schedules, traffic, weather, missions, stores, events and world economy.'},
 {id:'commerce',name:'Commerce Agent',mission:'Virtual Warehouse, YAHAVAH, beauty, Holo Fridge, pricing, checkout and fulfillment.'},
 {id:'media',name:'Creator Agent',mission:'Capture, edit, reels, product tags, publishing and attribution.'},
 {id:'assets',name:'HoloForge / GLE Asset Agent',mission:'Reusable world assets with provenance, optimization and engine adapters.'},
 {id:'qa',name:'Guardian QA Agent',mission:'Security, accessibility, tests, telemetry and deployed proof before GREEN.'},
] as const
export const ASSET_FORGE_CONTRACT=[
 'PROMPT/BRIEF','PROVENANCE/LICENSE','MASTER GLTF/GLB','PBR MATERIALS','COLLISION','LOD0/LOD1/LOD2','THUMBNAIL','SEMANTIC TAGS','PERFORMANCE BUDGET','WEB EXPORT','UNITY ADAPTER','UNREAL ADAPTER','GODOT ADAPTER','WORLD REGISTRY'
] as const
export const DEFAULT_BUILD_QUEUE:BuildTask[]=[
 {id:'deploy',lane:'runtime',title:'Converge developer-vic onto tryamm.online',status:'blocked',output:'Current canonical build on production domain',verification:'public route + health smoke tests'},
 {id:'hologpt',lane:'runtime',title:'Activate real HoloGPT provider',status:'blocked',output:'Generative provider response',verification:'/api/ai/health 200 + answer smoke'},
 {id:'streetverse',lane:'world',title:'Expand StreetVerse living simulation',status:'ready',output:'Persistent NPC/store/event loops',verification:'repeatable state + performance checks'},
 {id:'commerce',lane:'commerce',title:'Connect real product/inventory/payment fulfillment',status:'ready',output:'Verified product-to-delivery transaction',verification:'Stripe + ledger + fulfillment proof'},
 {id:'creator',lane:'media',title:'Prove play-to-reel-to-publish loop',status:'ready',output:'Saved/published reel with attribution',verification:'device smoke + cloud publish proof'},
 {id:'asset-pack',lane:'assets',title:'Forge reusable StreetVerse starter asset pack',status:'ready',output:'GLB/glTF asset registry for buildings, stores, props, traffic, animals and interiors',verification:'license + LOD + collision + load budget'},
 {id:'release',lane:'qa',title:'Run GREEN release matrix',status:'queued',dependsOn:['deploy','hologpt','streetverse','commerce','creator','asset-pack'],output:'Release evidence',verification:'source + route + runtime + persistence + tests + deployed smoke'},
]
export function readyTasks(tasks=DEFAULT_BUILD_QUEUE){const done=new Set<string>();return tasks.filter(t=>t.status==='ready'&&(!t.dependsOn||t.dependsOn.every(x=>done.has(x))))}
