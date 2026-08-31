export type SecretAssetCategory='ip'|'media'|'business'|'software'|'contract'|'financial-record'|'identity-record'|'research'|'world-asset'|'other'
export type SecretAssetAccess='founder-only'|'trusted-team'|'share-by-approval'

export interface SecretAssetDescriptor{
  id:string
  title:string
  category:SecretAssetCategory
  access:SecretAssetAccess
  storageRef?:string
  checksum?:string
  tags?:string[]
  createdAt:string
  updatedAt:string
  metadata?:Record<string,unknown>
}

export interface SecretAssetVaultState{
  locked:boolean
  ownerScope:'founder'
  count:number
  categories:SecretAssetCategory[]
  providerBackedStorageRequired:boolean
  rawSecretsAllowedInClientBundle:false
  updatedAt:string
}

const assets=new Map<string,SecretAssetDescriptor>()
const emit=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))
const now=()=>new Date().toISOString()

function sanitizeDescriptor(input:Omit<SecretAssetDescriptor,'createdAt'|'updatedAt'>):SecretAssetDescriptor{
  if(!input.id.trim()||!input.title.trim())throw new Error('secret-asset-id-and-title-required')
  if(input.storageRef&&/^(sk-|api[_-]?key|secret|password|token)/i.test(input.storageRef))throw new Error('raw-secret-material-not-allowed-in-client-bundle')
  const stamp=now()
  return {...input,tags:[...(input.tags||[])],createdAt:stamp,updatedAt:stamp}
}

export function getSecretAssetVaultState():SecretAssetVaultState{
  return {locked:true,ownerScope:'founder',count:assets.size,categories:['ip','media','business','software','contract','financial-record','identity-record','research','world-asset','other'],providerBackedStorageRequired:true,rawSecretsAllowedInClientBundle:false,updatedAt:now()}
}

export function listSecretAssetDescriptors(){return [...assets.values()].map(asset=>({...asset,tags:[...(asset.tags||[])]}))}

export function registerSecretAsset(input:Omit<SecretAssetDescriptor,'createdAt'|'updatedAt'>){
  const descriptor=sanitizeDescriptor(input)
  assets.set(descriptor.id,descriptor)
  emit('tryamm:secret-assets:changed',{action:'registered',asset:{...descriptor,storageRef:descriptor.storageRef?'provider-reference-present':undefined},state:getSecretAssetVaultState()})
  return descriptor
}

export function requestSecretAssetAccess(input:{assetId:string;reason:string;requestedBy:'founder'|'trusted-team'}){
  const asset=assets.get(input.assetId)
  const request={id:`vault-access-${Date.now()}`,assetId:input.assetId,exists:Boolean(asset),requestedBy:input.requestedBy,reason:input.reason,requiresFounderAuthorization:input.requestedBy!=='founder'||asset?.access!=='founder-only',requiresAuthenticatedServerFetch:true,neverExposeStorageCredentialsToClient:true,createdAt:now()}
  emit('tryamm:secret-assets:access-request',request)
  return request
}

export function openSecretAssetVault(){
  const snapshot={state:getSecretAssetVaultState(),assets:listSecretAssetDescriptors().map(asset=>({...asset,storageRef:asset.storageRef?'protected-provider-reference':undefined}))}
  emit('tryamm:secret-assets:open',snapshot)
  emit('tryamm:benny:overlay-request',{context:'secret-asset-vault',mode:'robot-holographic-overlay',privacyScope:'founder',createdAt:now()})
  return snapshot
}

let installed=false
export function installSecretAssetVaultRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  const runtime=window as unknown as Record<string,unknown>
  runtime.__openSecretAssetVault=openSecretAssetVault
  runtime.__getSecretAssetVaultState=getSecretAssetVaultState
  runtime.__listSecretAssetDescriptors=listSecretAssetDescriptors
  runtime.__registerSecretAsset=registerSecretAsset
  runtime.__requestSecretAssetAccess=requestSecretAssetAccess
  window.addEventListener('tryamm:secret-assets:open-request',()=>openSecretAssetVault())
  emit('tryamm:secret-assets:ready',{schema:'tryamm.secret-assets.v1',state:getSecretAssetVaultState(),security:['metadata-only-in-public-client','authenticated-server-fetch','provider-backed-private-storage','founder-authorization','audit-events','no-raw-api-keys-or-passwords-in-repo']})
}
