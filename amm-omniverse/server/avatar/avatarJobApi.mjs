// Dependency-free, opt-in backend adapter for derived StreetVerse avatar assets.
// Intentionally rejects raw photographs/video and does not expose an unauthenticated upload endpoint.
import {randomUUID} from 'node:crypto';
const MAX_BYTES=40*1024*1024;
export function validateDerivedAvatarRequest({userId,asset,consent}={}){
 if(typeof userId!=='string'||!userId.trim())throw new Error('Authenticated player required');
 if(!consent||consent.granted!==true||consent.adultOrGuardianAuthorized!==true)throw new Error('Avatar processing consent required');
 if(!asset||asset.kind!=='derived-rigged-glb'||asset.mimeType!=='model/gltf-binary')throw new Error('Only derived rigged GLB assets accepted');
 if(!Number.isSafeInteger(asset.bytes)||asset.bytes<1||asset.bytes>MAX_BYTES)throw new Error('Invalid model size');
 if(asset.rawPhotos||asset.video||asset.faceEmbeddings||asset.biometricTemplate)throw new Error('Raw biometric payloads are forbidden');
 return {userId:userId.trim(),kind:'derived-rigged-glb',bytes:asset.bytes};
}
export function createAvatarJobService({authorize,store,clock=()=>new Date().toISOString()}={}){
 if(typeof authorize!=='function'||typeof store?.save!=='function'||typeof store?.get!=='function'||typeof store?.remove!=='function')throw new Error('Auth and private storage adapters required');
 return {
  async create(context,request){
   const userId=await authorize(context);
   const valid=validateDerivedAvatarRequest({...request,userId});
   const job={id:randomUUID(),ownerId:valid.userId,status:'awaiting-private-asset',kind:valid.kind,bytes:valid.bytes,createdAt:clock()};
   await store.save(job);return {id:job.id,status:job.status};
  },
  async status(context,id){
   const userId=await authorize(context);const job=await store.get(id);
   if(!job||job.ownerId!==userId)throw new Error('Not found');
   return {id:job.id,status:job.status};
  },
  async delete(context,id){
   const userId=await authorize(context);const job=await store.get(id);
   if(!job||job.ownerId!==userId)throw new Error('Not found');
   await store.remove(id);return {deleted:true};
  }
 };
}
// No network listener, storage bucket, payment provider, AI service, or automatic upload is started here.
// Production integration must enforce account auth, encrypted private storage, ownership and retention.
