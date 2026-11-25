import {listMeshyFactoryJobs} from './meshy-factory.js';

/** Read-only evidence adapter. Never starts paid generation or treats queued jobs as completed. */
export function selectPublishedWorldAsset(jobs,{assetId,cityScope='global'}){
  if(typeof assetId!=='string'||!assetId.trim())throw new Error('asset_id_required');
  const job=jobs.find(j=>j.asset_id===assetId&&(j.city_scope===cityScope||j.city_scope==='global')&&j.stage==='ready'&&j.progress===100&&j.published_path&&j.evidence?.immutableAssetVersion&&Number(j.evidence?.publishedBytes)>20&&j.public_url);
  if(!job)return {verified:false,artifact:'',reason:'published_asset_not_found'};
  let url;
  try{url=new URL(job.public_url)}catch{return {verified:false,artifact:'',reason:'invalid_asset_url'}}
  if(url.protocol!=='https:')return {verified:false,artifact:'',reason:'invalid_asset_url'};
  return {verified:true,artifact:url.href,jobId:job.id,version:job.evidence.immutableAssetVersion,bytes:Number(job.evidence.publishedBytes)};
}
export async function resolvePublishedWorldAsset(user,request){
  const jobs=await listMeshyFactoryJobs(user,{limit:100});
  return selectPublishedWorldAsset(jobs,request);
}
