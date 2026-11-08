// TRYAMM "Quantum Cloud Computer" economy policy.
// Uses the existing Pocket Edge + Supabase architecture as classical
// software orchestration. NOT a quantum hardware service or new paid cloud.
export const QUANTUM_CLOUD_LIMITS={
 websiteDraftDebounceMs:15_000,
 recoverySnapshotsPerOwner:40,
 maximumBackupBytes:256_000,
 minimumSiteBackupIntervalMs:15_000,
 automaticPaidCompute:false,
 automaticDomainPurchases:false,
 uploadVideoToDatabase:false,
} as const;

export type QuantumJob='website-draft'|'thumbnail'|'video-render'|'llm-inference'|'domain-purchase'|'live-broadcast';
export type QuantumRoute='browser'|'existing-supabase'|'deferred'|'manual-approval';
export type QuantumCloudContext={
 signedIn:boolean;
 online:boolean;
 webCodecs?:boolean;
 localModelAvailable?:boolean;
 serverInferenceVerified?:boolean;
};
export function routeQuantumCloudJob(job:QuantumJob,ctx:QuantumCloudContext):{route:QuantumRoute;reason:string}{
 if(job==='website-draft'){
  return ctx.online&&ctx.signedIn?
   {route:'existing-supabase',reason:'small RLS-scoped draft snapshots only'}:
   {route:'browser',reason:'preserve local unsynced draft'};
 }
 if(job==='thumbnail'||job==='video-render'){
  return ctx.webCodecs?
   {route:'browser',reason:'use local Chromium/Chromebook media processing'}:
   {route:'deferred',reason:'device support unverified; do not start paid cloud processing'};
 }
 if(job==='llm-inference'){
  return ctx.localModelAvailable?
   {route:'browser',reason:'approved local inference service, no cloud GPU charge'}:
   ctx.serverInferenceVerified?
    {route:'deferred',reason:'approved external service requires explicit request-level policy'}:
    {route:'deferred',reason:'owned Llama endpoint not verified; offline reply only'};
 }
 return {route:'manual-approval',reason:'no automatic purchases, paid streams or remote execution'};
}
export function estimatedSnapshotBytes(serialized:string):number{
 return new TextEncoder().encode(serialized).byteLength;
}
export async function fingerprintSnapshot(serialized:string):Promise<string>{
 const bytes=new TextEncoder().encode(serialized);
 const cryptoApi=globalThis.crypto;
 if(!cryptoApi?.subtle)throw new Error('secure_digest_unavailable');
 const digest=await cryptoApi.subtle.digest('SHA-256',bytes);
 return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}
export function validateBackupBudget(serialized:string):void{
 if(estimatedSnapshotBytes(serialized)>QUANTUM_CLOUD_LIMITS.maximumBackupBytes)
  throw new Error('cloud_backup_size_cap_exceeded');
}
