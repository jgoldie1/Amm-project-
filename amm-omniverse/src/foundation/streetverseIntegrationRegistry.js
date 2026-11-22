/**
 * TRYAMM cross-product mission receipt protocol.
 * Local-only prototype receipts are NOT authoritative ledger entries, identity proofs,
 * cloud saves, payouts, character rig validation or LIVE acceptance.
 */
export const TRYAMM_MISSION_EVENT = 'tryamm:mission-local-completed'
export const RECEIPT_SCHEMA = 'tryamm.mission.local.v1'
const MODE_IDS = Object.freeze(['after-dark','mystery','districts','shadow','fire','undercover','er','dispatch','homicide'])
const MISSION_PREFIXES = Object.freeze(['ad','ms','dt','sd','fr','uc','er','dp','hm'])
export function validateMissionReceipt(input) {
 if (!input || typeof input !== 'object' || Array.isArray(input)) return false
 if (input.schema !== RECEIPT_SCHEMA || input.source !== 'mission-arcade-local') return false
 if (!MODE_IDS.includes(input.mode) || typeof input.missionId !== 'string') return false
 if (!/^(ad|ms|dt|sd|fr|uc|er|dp|hm)[1-3]$/.test(input.missionId)) return false
 if (!input.missionId.startsWith(MISSION_PREFIXES[MODE_IDS.indexOf(input.mode)])) return false
 if (input.xp !== 75 || input.credits !== 50 || input.authoritative !== false) return false
 return typeof input.completedAt === 'string' && !Number.isNaN(Date.parse(input.completedAt))
}
export function makeLocalMissionReceipt(mode, missionId, at=new Date()) {
 const receipt={schema:RECEIPT_SCHEMA,source:'mission-arcade-local',mode,missionId,xp:75,credits:50,authoritative:false,completedAt:at.toISOString()}
 if (!validateMissionReceipt(receipt)) throw new TypeError('Invalid local mission receipt')
 return Object.freeze(receipt)
}
export const BRIDGES=Object.freeze([
 {id:'streetverse',name:'StreetVerse / Living World',path:'/streetverse?core=1',scope:'3D route exists',acceptance:'Device movement, overlays, characters and save/reload require visual acceptance'},
 {id:'missions',name:'Mission Arcade',path:'/streetverse-missions',scope:'Browser story prototype',acceptance:'27 scripted stages and local-only progression; not integrated with 3D world'},
 {id:'districts',name:'District Tycoon',path:'/streetverse-missions',scope:'Local fictional business board',acceptance:'No server economy, multiplayer or payments'},
 {id:'soul',name:'Soul Ascension',path:'/soul-ascension-chicago',scope:'Casting inquiry page',acceptance:'No verified public signup, artist releases or broadcast clearance'},
 {id:'campus',name:'CampusVerse',path:'/streetverse?core=1&world=greenville',scope:'Requested school world route',acceptance:'Campus visuals, rigs, student experience and navigation require device verification'},
 {id:'holomyc',name:'HoloGPT / Mycelium',path:'/',scope:'Existing orchestration components',acceptance:'No proven end-to-end mission handoff from this prototype'},
 {id:'live',name:'Omni LIVE',path:'/live-test',scope:'Private test route',acceptance:'Host/viewer, recording, moderation and two-device verification pending'},
 {id:'characters',name:'Universal Character Factory',path:'/streetverse?core=1&graphics=character',scope:'3D character loader route',acceptance:'BJ, Jacobie and LaTeasia GLB/rig/animations require real device tests'},
 {id:'ledger',name:'Unified Value Ledger',path:'/streetverse-missions',scope:'Local arcade XP and credits only',acceptance:'Server authoritative, idempotent ledger bridge unimplemented'},
 {id:'business',name:'TRYAMM Business Engine',path:'/business-os',scope:'Business OS route',acceptance:'Purchases, storefront checkout and provider services need production acceptance'}
])
export function buildMissionIntegrationReport({now=new Date(),hasLocalStorage=false,hasDownload=false}={}){
 return {
 schema:'tryamm.streetverse.integration-readiness.v1',at:now.toISOString(),
 status:'development-not-production-ready',
 authoritativeLedgerConnected:false,liveIntegrationVerified:false,deviceAcceptanceVerified:false,
 prototypeCapabilities:{missionModes:9,scriptedStages:27,localPersistenceAvailable:Boolean(hasLocalStorage),reportDownloadAvailable:Boolean(hasDownload)},
 systems:BRIDGES.map(x=>({...x,liveVerified:false})),
 warnings:['This is a client-side implementation inventory, not a live provider check.','A URL listed here is a route intent, not proof of successful deployment.','No money, player account, 3D character, LIVE stream, or server ledger was verified.']
 }
}
