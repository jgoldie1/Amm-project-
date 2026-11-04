/**
 * Original StreetVerse NPC GLB identity manifest, from owner-controlled
 * Google Drive asset recovery archive (verified-sha256-manifest.json,
 * 2026-10-08). NO private Drive URLs, access tokens or binary files.
 *
 * Header verification and SHA identity do not prove a model is licensed,
 * playable, properly rigged, production-approved or medically accurate.
 * BJ Stubbs hero is NOT established by these generic NPC identities.
 */
export type StreetVerseArchivedGLB=Readonly<{
 name:string
 bytes:number
 sha256:string
}>
export const STREETVERSE_ORIGINAL_GLB_ARCHIVE:readonly StreetVerseArchivedGLB[]=[
 {name:"SV_NPC_BLACK_MAN_ADULT_01.glb",bytes:12445832,sha256:"00103c51becfbb1758f16e592a6595739a2822aba7302c03964cde4aa2e60e5d"},
 {name:"SV_NPC_BLACK_MAN_ADULT_01.walk.glb",bytes:12425808,sha256:"555fe616bbed89df3083da0657286f004fb650bb0332b6dfdef766e7bc857e3f"},
 {name:"SV_NPC_BLACK_MAN_ADULT_01.run.glb",bytes:12415192,sha256:"e7c91608cbeadba3e0d7117b9ba28411b147503ff1ab698d62f36815247fbdef"},
 {name:"SV_NPC_BLACK_WOMAN_ADULT_01.glb",bytes:13389964,sha256:"768e4a32ffeecebffac05dcf2ebc3c01c392f895987ad1b19e5e7dba114e2afb"},
 {name:"SV_NPC_BLACK_WOMAN_ADULT_01.walk.glb",bytes:13369976,sha256:"118b4105da288c3c4acf4dc054c625102e9ab7a92b7e751de6a5e8701be8b9cb"},
 {name:"SV_NPC_BLACK_WOMAN_ADULT_01.run.glb",bytes:13359352,sha256:"1bd26ae80dcbac58574ba481ae7492badddcc349876b5ef1379a7fdefadff9c5"},
 {name:"SV_NPC_BLACK_MAN_YOUNGADULT_01.glb",bytes:12701232,sha256:"a8621bdc72b090ef949825630a3c956a40e09bfd95b926d10e7a09a55e69b43b"},
 {name:"SV_NPC_BLACK_MAN_YOUNGADULT_01.walk.glb",bytes:12681392,sha256:"880de2daa18cab67f46e778ff7cbaa44c91c8648c0872d7a2452c43ae951a380"},
 {name:"SV_NPC_BLACK_MAN_YOUNGADULT_01.run.glb",bytes:12670800,sha256:"693fa32075e50a62886f0f817530f89ac8ac24c10d1c81b5ed9ce7284e51c79f"},
 {name:"SV_NPC_BLACK_WOMAN_YOUNGADULT_01.glb",bytes:11742224,sha256:"a123e9d742b45fcadb2378c710055cdcbdeda6514a883779f1a8451f87f53be5"},
 {name:"SV_NPC_BLACK_WOMAN_YOUNGADULT_01.walk.glb",bytes:11722240,sha256:"310d6989a06b015f3fe0440032d18c8162f3339b0b98c08704774af0dd31c2cb"},
 {name:"SV_NPC_BLACK_WOMAN_YOUNGADULT_01.run.glb",bytes:11711604,sha256:"27823e7784bcb0aa208321e22df3164395381686c1ad94da585674380a75d30f"},
]
export const STREETVERSE_ORIGINAL_GLB_TOTAL_BYTES=STREETVERSE_ORIGINAL_GLB_ARCHIVE.reduce((n,r)=>n+r.bytes,0)

export function lookupArchivedStreetVerseGLB(bytes:number,sha256:string):StreetVerseArchivedGLB|null{
 if(!Number.isSafeInteger(bytes)||bytes<=0||!/^([0-9a-f]{64})$/.test(sha256))return null
 return STREETVERSE_ORIGINAL_GLB_ARCHIVE.find(entry=>entry.bytes===bytes&&entry.sha256===sha256)||null
}
export async function hashStreetVerseGLBLocally(buffer:ArrayBuffer):Promise<string>{
 if(buffer.byteLength>24*1024*1024)throw Error('glb_hash_size_limit')
 if(typeof crypto==='undefined'||!crypto.subtle)throw Error('secure_webcrypto_not_available')
 const output=await crypto.subtle.digest('SHA-256',buffer)
 return Array.from(new Uint8Array(output),n=>n.toString(16).padStart(2,'0')).join('')
}
