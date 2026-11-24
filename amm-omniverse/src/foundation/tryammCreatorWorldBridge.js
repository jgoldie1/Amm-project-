/** TRYAMM creator/world handoff. Metadata only: video blobs must be exported or uploaded separately.
 * No publication, payment, identity, performer rights or AR/VR compatibility is inferred.
 */
export const CREATOR_HANDOFF_KEY='tryamm:living-world:creator-packet:v1'
export const CREATOR_HANDOFF_EVENT='tryamm:living-world:creator-handoff'
export const CREATOR_PACKET_SCHEMA='tryamm.creator.packet.v1'
export const REEL_CAPTURE_METADATA_KEY='tryamm:living-world:last-reel:v1'
export const LAST_MISSION_STORY_KEY='tryamm:living-world:last-mission-story:v1'
export const CREATOR_CHANNELS=Object.freeze([
 {id:'living',title:'StreetVerse Living World',path:'/streetverse?core=1&bj=v15',purpose:'Play and stage original city scenes'},
 {id:'reel',title:'HoloReel capture',path:'/streetverse?core=1&reel=1',purpose:'Record supported 9:16 gameplay clip'},
 {id:'omnibox',title:'OmniBox movie production',path:'/omni-box',purpose:'Plan shots, scenes and scripted episodes'},
 {id:'tv',title:'Isaiah AI TV',path:'/isaiah-ai-tv',purpose:'Human-reviewed network programming pitch'},
 {id:'live',title:'Omni LIVE',path:'/live-test',purpose:'Private broadcast acceptance only'},
 {id:'business',title:'TRYAMM Business OS',path:'/business-os',purpose:'Company site, lead and digital storefront workflow'},
 {id:'template',title:'111 company-type website catalog',path:'/business-os',purpose:'Open Business OS while the preserved 111-option selector is audited; catalog selection and publishing are not yet verified'}
])
const text=(x,max=160)=>String(x??'').trim().slice(0,max)
export function createCreatorPacket(input={},now=new Date()){
 const kind=['mission','business-spotlight','show','training','sports','music','event'].includes(input.kind)?input.kind:'mission'
 const packet={
 schema:CREATOR_PACKET_SCHEMA,id:'draft-'+now.getTime(),source:'tryamm-living-world',
 createdAt:now.toISOString(),kind,
 title:text(input.title,100)||'StreetVerse Chicago — Original Story',
 description:text(input.description,700),templateId:text(input.templateId,100),
 businessName:text(input.businessName,120),
 missionId:text(input.missionId,80),
 worldPath:text(input.worldPath,200)||'/streetverse?core=1&bj=v15',
 reel:{status:'not-attached',fileName:text(input.fileName,150),mimeType:text(input.mimeType,80),durationMs:Math.max(0,Math.min(180000,Number(input.durationMs)||0)),mediaAttached:false},
 destinations:['omnibox','isaiah-ai-tv','streetverse'],
 clearance:{artistPermission:false,musicRights:false,participantConsent:false,locationRights:false,privacyReview:false,humanEditorialReview:false},
 status:'local-draft',publishAuthorized:false,immersiveReady:false,monetizationReady:false
 }
 return packet
}
export function validCreatorPacket(p){return Boolean(p&&p.schema===CREATOR_PACKET_SCHEMA&&p.source==='tryamm-living-world'&&p.status==='local-draft'&&p.publishAuthorized===false&&p.immersiveReady===false&&p.reel?.mediaAttached===false&&typeof p.title==='string'&&typeof p.createdAt==='string')}
export function saveCreatorPacket(storage,packet){if(!validCreatorPacket(packet))throw new TypeError('Creator packet must remain a non-public metadata draft');storage.setItem(CREATOR_HANDOFF_KEY,JSON.stringify(packet));return packet}
export function readCreatorPacket(storage){try{const p=JSON.parse(storage?.getItem(CREATOR_HANDOFF_KEY)||'null');return validCreatorPacket(p)?p:null}catch{return null}}
export function storeReelCaptureMetadata(storage,input,at=new Date()){
 if(!input||typeof input.fileName!=='string'||typeof input.mimeType!=='string')throw new TypeError('Missing captured reel identity')
 const metadata={schema:'tryamm.reel.capture.metadata.v1',fileName:text(input.fileName,150),mimeType:text(input.mimeType,80),durationMs:Math.max(0,Math.min(180000,Number(input.durationMs)||0)),capturedAt:at.toISOString(),mediaAttached:false,publishAuthorized:false}
 storage.setItem(REEL_CAPTURE_METADATA_KEY,JSON.stringify(metadata))
 return metadata
}
export function readReelCaptureMetadata(storage){
 try{const x=JSON.parse(storage?.getItem(REEL_CAPTURE_METADATA_KEY)||'null')
  return x?.schema==='tryamm.reel.capture.metadata.v1'&&typeof x.fileName==='string'&&x.mediaAttached===false&&x.publishAuthorized===false?x:null
 }catch{return null}
}
export function storeLastMissionStory(storage,receipt){
 if(!receipt||receipt.schema!=='tryamm.mission.local.v1'||receipt.authoritative!==false||typeof receipt.missionId!=='string'||!/^(ad|ms|dt|sd|fr|uc|er|dp|hm|sp|gr|tr|ho|hc|pk|rs|ac)[1-3]$/.test(receipt.missionId))throw new TypeError('Unverified local mission story')
 const summary={schema:'tryamm.last.mission.story.v1',missionId:receipt.missionId,mode:String(receipt.mode||''),capturedAt:String(receipt.completedAt||''),authoritative:false}
 storage.setItem(LAST_MISSION_STORY_KEY,JSON.stringify(summary));return summary
}
export function readLastMissionStory(storage){
 try{const x=JSON.parse(storage?.getItem(LAST_MISSION_STORY_KEY)||'null');return x?.schema==='tryamm.last.mission.story.v1'&&x.authoritative===false&&/^(ad|ms|dt|sd|fr|uc|er|dp|hm|sp|gr|tr|ho|hc|pk|rs|ac)[1-3]$/.test(x.missionId)?x:null}catch{return null}
}
export function creatorReleaseGates(p){return {canPublish:false,canEnterVR:false,canSell:false,needs:['video file upload/verification','participant and location permissions','music and identity rights clearances','human editorial review','provider and device AR/VR acceptance','backend media processing and publishing authorization'],packetValid:validCreatorPacket(p)}}
