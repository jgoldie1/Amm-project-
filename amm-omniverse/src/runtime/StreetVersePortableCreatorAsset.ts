/** Portable creator asset metadata, without external wallet or money transfer.
 * Import requires independent platform approval; metadata is not executable code.
 */
export type PortableAsset={schema:'streetverse.creator.v1';assetId:string;creatorId:string;title:string;category:'clothing'|'hair'|'building'|'mission'|'animation';license:'original'|'licensed';sourceWorld:string;contentSha256:string;assetPath:string;version:string;approved:boolean}
const safe=(s:string)=>/^[a-zA-Z0-9_-]{3,80}$/.test(s)
export function validatePortableCreatorAsset(a:PortableAsset){
 const errors:string[]=[]
 if(a.schema!=='streetverse.creator.v1')errors.push('Unsupported asset schema')
 if(!safe(a.assetId)||!safe(a.creatorId)||!safe(a.sourceWorld))errors.push('Invalid identifier')
 if(!a.title.trim()||a.title.length>100)errors.push('Invalid title')
 if(!/^[a-f0-9]{64}$/i.test(a.contentSha256))errors.push('Invalid content hash')
 if(!/^\/assets\/mods\/[a-zA-Z0-9/_-]+\.(glb|json)$/.test(a.assetPath)||a.assetPath.includes('..'))errors.push('Unreviewed asset path')
 if(!/^\d+\.\d+\.\d+$/.test(a.version))errors.push('Invalid version')
 return {valid:errors.length===0,errors}
}
export function canImportCreatorAsset(a:PortableAsset,approvedWorlds:ReadonlySet<string>,moderatorApproved:boolean){
 return validatePortableCreatorAsset(a).valid&&a.approved&&approvedWorlds.has(a.sourceWorld)&&moderatorApproved
}
export type PortableSave={schema:'streetverse.save.v1';playerId:string;career:string;level:number;unlockedCosmeticIds:string[];missionReceiptIds:string[];world:string}
export function exportPortableSave(save:PortableSave):string{
 if(save.schema!=='streetverse.save.v1'||!safe(save.playerId)||!safe(save.world)||!Number.isSafeInteger(save.level)||save.level<1||save.level>1000||save.unlockedCosmeticIds.length>500||save.missionReceiptIds.length>5000)throw new Error('Invalid save export')
 return JSON.stringify(save)
}
export function importPortableSave(json:string,expectedPlayerId:string):PortableSave{
 if(json.length>200000)throw new Error('Save exceeds size limit')
 const save:PortableSave=JSON.parse(json)
 if(save.playerId!==expectedPlayerId||save.schema!=='streetverse.save.v1')throw new Error('Invalid save identity or version')
 exportPortableSave(save)
 return save
}
/** External engines must revalidate receipts server-side; imports never mint currency or authorize ownership. */
