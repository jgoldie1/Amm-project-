import {createHash,verify as verifySignature} from 'node:crypto';

/** All American App Store offline artifact verification; no downloads, purchases, or auto-install. */
const APP_ID=/^[a-z0-9][a-z0-9._-]{2,79}$/;
const SHA=/^[a-f0-9]{64}$/;
const VERSION=/^\d+\.\d+\.\d+$/;
export function verifyStoreArtifact({manifest,artifactBytes,trustedPublicKeyPem,installedVersion=null}){
 const fail=reason=>({verified:false,reason,installAllowed:false});
 if(!manifest||!Buffer.isBuffer(artifactBytes)||!trustedPublicKeyPem)return fail('missing_proof');
 if(!APP_ID.test(manifest.appId||'')||!VERSION.test(manifest.version||'')||!SHA.test(manifest.sha256||'')||
 !Number.isSafeInteger(manifest.bytes)||manifest.bytes<1||artifactBytes.length!==manifest.bytes)return fail('invalid_manifest');
 if(!['general','mature-story','adult-device'].includes(manifest.lane))return fail('unrecognized_content_lane');
 if(!['desktop-download','vr-device-store'].includes(manifest.channel))return fail('unsupported_delivery_channel');
 if(manifest.sha256!==createHash('sha256').update(artifactBytes).digest('hex'))return fail('checksum_mismatch');
 if(installedVersion&&VERSION.test(installedVersion)){
  const a=manifest.version.split('.').map(Number),b=installedVersion.split('.').map(Number);
  if(a.every((n,i)=>n===b[i])||a.findIndex((n,i)=>n!==b[i])>=0&&(()=>{const i=a.findIndex((n,j)=>n!==b[j]);return a[i]<b[i]})())return fail('not_an_upgrade');
 }
 const message=[manifest.appId,manifest.version,manifest.sha256,manifest.bytes,manifest.lane,manifest.channel].join('\n');
 try {
  if(!verifySignature(null,Buffer.from(message),trustedPublicKeyPem,Buffer.from(manifest.signature||'','base64')))return fail('signature_invalid');
 } catch {return fail('signature_invalid')}
 return {verified:true,reason:'signature_and_artifact_verified',installAllowed:false,requiresHumanInstallerAction:true};
}
