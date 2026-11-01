// Explicitly injected adapters; no external services are activated by importing this module.
import {createHash,randomUUID} from 'node:crypto';
import {mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const safeId=id=>{if(typeof id!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(id))throw new Error('Invalid identifier');return id};
export function bearerTokenAuth({verifyToken}={}){
 if(typeof verifyToken!=='function')throw new Error('A real token verifier is required');
 return async context=>{
  const header=context?.headers?.authorization||'';
  if(!header.startsWith('Bearer '))throw new Error('Unauthorized');
  const claims=await verifyToken(header.slice(7));
  if(!claims?.sub||typeof claims.sub!=='string')throw new Error('Unauthorized');
  return claims.sub;
 };
}
export function memoryAvatarJobStore(){
 const jobs=new Map();
 return {save:async job=>{jobs.set(job.id,structuredClone(job))},get:async id=>jobs.has(id)?structuredClone(jobs.get(id)):null,remove:async id=>{jobs.delete(id)}};
}
// This file store contains derived-job metadata only; never save raw face images here.
// Use encrypted object storage with RLS for private GLB bytes in production.
export function fileAvatarJobStore(directory){
 if(!directory)throw new Error('Private directory required');
 const base=resolve(directory);
 const file=id=>join(base,safeId(id)+'.json');
 return {
  async save(job){await mkdir(base,{recursive:true,mode:0o700});await writeFile(file(job.id),JSON.stringify(job),{flag:'wx',mode:0o600})},
  async get(id){try{return JSON.parse(await readFile(file(id),'utf8'))}catch(e){if(e?.code==='ENOENT')return null;throw e}},
  async remove(id){await rm(file(id),{force:true})}
 };
}
export function avatarAssetFingerprint(bytes){
 if(!(bytes instanceof Uint8Array))throw new Error('Derived GLB bytes required');
 if(bytes.byteLength<20||bytes.byteLength>40*1024*1024)throw new Error('Invalid GLB size');
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==bytes.byteLength)throw new Error('Invalid GLB header');
 return {id:randomUUID(),sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.byteLength};
}
