import crypto from 'node:crypto';
import {userAccessToken,userSupabaseReady} from './supabase-user.js';

const SUPABASE_URL=()=>process.env.VITE_SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL||'';
const PUBLIC_KEY=()=>process.env.VITE_SUPABASE_ANON_KEY||process.env.VITE_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'';
export const MEDIA_BUCKET='creator-media';
export const MAX_MEDIA_BYTES=1024*1024*1024;
export const ALLOWED_MEDIA_TYPES=new Set(['video/mp4','video/webm','audio/webm','audio/mp4','image/jpeg','image/png','image/webp','image/gif']);

const storageBase=()=>`${SUPABASE_URL().replace(/\/$/,'')}/storage/v1`;
const encodePath=path=>String(path||'').split('/').map(encodeURIComponent).join('/');
export const safeFileName=value=>String(value||'').trim().slice(0,180).replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-+|-+$/g,'')||'tryamm-media.webm';
export const objectPath=(userId,fileName)=>`${userId}/${crypto.randomUUID()}/${safeFileName(fileName)}`;

function headers(req,extra={}){
  if(!userSupabaseReady())throw Object.assign(new Error('storage_not_configured'),{status:503});
  const token=userAccessToken(req);
  if(!token)throw Object.assign(new Error('authentication_required'),{status:401});
  return {apikey:PUBLIC_KEY(),authorization:`Bearer ${token}`,...extra};
}
async function parse(res){const text=await res.text();let data={};try{data=text?JSON.parse(text):{}}catch{data={text}}if(!res.ok){const err=new Error(data?.message||data?.error||`storage_${res.status}`);err.status=res.status;err.details=data;throw err}return data}

export async function createSignedUpload(req,path){
  const data=await parse(await fetch(`${storageBase()}/object/upload/sign/${MEDIA_BUCKET}/${encodePath(path)}`,{method:'POST',headers:headers(req,{'content-type':'application/json'}),body:'{}'}));
  const relative=String(data.url||'');
  const signedUrl=relative.startsWith('http')?relative:`${storageBase()}${relative}`;
  const token=new URL(signedUrl).searchParams.get('token');
  if(!token)throw Object.assign(new Error('storage_upload_token_missing'),{status:502});
  return {signedUrl,token};
}

export async function verifyStoredObject(req,path){
  const res=await fetch(`${storageBase()}/object/authenticated/${MEDIA_BUCKET}/${encodePath(path)}`,{method:'HEAD',headers:headers(req)});
  if(res.status===404)return false;
  if(!res.ok)throw Object.assign(new Error(`storage_verify_${res.status}`),{status:res.status});
  return true;
}

export async function createSignedPlayback(req,path,expiresIn=3600){
  const data=await parse(await fetch(`${storageBase()}/object/sign/${MEDIA_BUCKET}/${encodePath(path)}`,{method:'POST',headers:headers(req,{'content-type':'application/json'}),body:JSON.stringify({expiresIn})}));
  const relative=String(data.signedURL||data.signedUrl||'');
  if(!relative)throw Object.assign(new Error('storage_playback_url_missing'),{status:502});
  return relative.startsWith('http')?relative:`${storageBase()}${relative}`;
}


// Only the verified-publication server route may use the service role to sign
// approved playback. No secret or private storage path is sent to the client.
export async function createSignedPlaybackApprovedMedia(path,expiresIn=600){
 const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY||'';
 if(!SUPABASE_URL()||!serviceKey)throw Object.assign(new Error('approved_media_playback_not_configured'),{status:503});
 if(!/^[a-f0-9-]{36}\/[a-f0-9-]{36}\/[a-zA-Z0-9._-]+$/.test(String(path)))
  throw Object.assign(new Error('invalid_approved_media_path'),{status:400});
 const response=await fetch(storageBase()+'/object/sign/'+MEDIA_BUCKET+'/'+encodePath(path),{
  method:'POST',headers:{apikey:serviceKey,authorization:'Bearer '+serviceKey,'content-type':'application/json'},
  body:JSON.stringify({expiresIn:Math.min(600,Math.max(60,Number(expiresIn)||600))})
 });
 const data=await parse(response),relative=String(data.signedURL||data.signedUrl||'');
 if(!relative)throw Object.assign(new Error('approved_media_playback_missing'),{status:502});
 return relative.startsWith('http')?relative:storageBase()+relative;
}
