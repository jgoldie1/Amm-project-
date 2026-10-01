const SUPABASE_URL=()=>process.env.VITE_SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL||'';
const SERVICE_ROLE=()=>process.env.SUPABASE_SERVICE_ROLE_KEY||'';
export const STREETVERSE_ASSET_BUCKET='streetverse-assets';
export const MAX_GLB_BYTES=100*1024*1024;

const encodePath=path=>String(path||'').split('/').map(encodeURIComponent).join('/');

function ready(){
  return Boolean(SUPABASE_URL()&&SERVICE_ROLE());
}
function assertReady(){
  if(!ready())throw Object.assign(new Error('streetverse_asset_storage_not_configured'),{status:503,code:'streetverse_asset_storage_not_configured'});
}
export function publicAssetUrl(path){
  assertReady();
  return `${SUPABASE_URL().replace(/\/$/,'')}/storage/v1/object/public/${STREETVERSE_ASSET_BUCKET}/${encodePath(path)}`;
}
export async function downloadGlb(url){
  const source=String(url||'').trim();
  if(!/^https:\/\//i.test(source))throw Object.assign(new Error('invalid_glb_url'),{status:400,code:'invalid_glb_url'});
  const response=await fetch(source,{headers:{'User-Agent':'TRYAMM-Meshy-Asset-Publisher/1.0'},cache:'no-store'});
  if(!response.ok)throw Object.assign(new Error(`glb_download_failed_${response.status}`),{status:502,code:'glb_download_failed'});
  const length=Number(response.headers.get('content-length')||0);
  if(length>MAX_GLB_BYTES)throw Object.assign(new Error('glb_too_large'),{status:413,code:'glb_too_large'});
  const bytes=Buffer.from(await response.arrayBuffer());
  if(!bytes.length||bytes.length>MAX_GLB_BYTES)throw Object.assign(new Error('glb_size_invalid'),{status:413,code:'glb_size_invalid'});
  if(bytes.length<12||bytes.subarray(0,4).toString('ascii')!=='glTF')throw Object.assign(new Error('invalid_glb_magic'),{status:422,code:'invalid_glb_magic'});
  return bytes;
}
export async function uploadGlb(path,bytes){
  assertReady();
  const clean=String(path||'').replace(/^\/+/, '');
  if(!clean||!clean.endsWith('.glb'))throw Object.assign(new Error('invalid_asset_path'),{status:400,code:'invalid_asset_path'});
  const body=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes);
  if(!body.length||body.length>MAX_GLB_BYTES)throw Object.assign(new Error('glb_size_invalid'),{status:413,code:'glb_size_invalid'});
  const response=await fetch(`${SUPABASE_URL().replace(/\/$/,'')}/storage/v1/object/${STREETVERSE_ASSET_BUCKET}/${encodePath(clean)}`,{
    method:'POST',
    headers:{
      apikey:SERVICE_ROLE(),
      authorization:`Bearer ${SERVICE_ROLE()}`,
      'content-type':'model/gltf-binary',
      'x-upsert':'true',
      'cache-control':'3600',
    },
    body,
  });
  const text=await response.text();
  if(!response.ok)throw Object.assign(new Error(text||`asset_upload_failed_${response.status}`),{status:response.status,code:'asset_upload_failed'});
  return {path:clean,url:publicAssetUrl(clean),bytes:body.length};
}
export async function persistRemoteGlb(url,path){
  const bytes=await downloadGlb(url);
  return uploadGlb(path,bytes);
}
