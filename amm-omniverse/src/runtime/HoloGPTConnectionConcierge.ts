export type ConnectionStep={id:string;label:string;kind:'user-external'|'oauth'|'server-secret'|'webhook'|'verify';required:boolean;complete:boolean}
export type ProviderConnectionPlan={provider:string;capabilities:string[];steps:ConnectionStep[];status:'needs-user'|'ready-to-connect'|'verifying'|'connected'|'error'}

export const HOLOGPT_CONNECTION_RULES={
 neverInventApiKeys:true,
 neverExposeSecretsToClient:true,
 neverStoreSecretsInChat:true,
 userCompletesExternalAccountRequirements:true,
 oauthRequiresUserConsent:true,
 serverSecretsUseEncryptedEnvironment:true,
 verifyBeforeMarkingConnected:true,
 capabilityByCapabilityVerification:true,
 rotateRevokedOrExposedKeys:true
} as const

export function connectionPlan(provider:string,capabilities:string[]=[]):ProviderConnectionPlan{
 return{provider,capabilities,status:'needs-user',steps:[
  {id:'external',label:'Complete provider account, developer-app, approval, billing, or identity requirements on the provider side',kind:'user-external',required:true,complete:false},
  {id:'oauth',label:'Authorize TRYAMM through the provider consent flow when OAuth is supported',kind:'oauth',required:false,complete:false},
  {id:'secret',label:'Store provider-issued credentials only in encrypted server-side environment/secrets storage',kind:'server-secret',required:true,complete:false},
  {id:'webhook',label:'Register approved callback/webhook endpoints and verification secrets',kind:'webhook',required:false,complete:false},
  {id:'verify',label:'Run a non-destructive capability test before enabling production',kind:'verify',required:true,complete:false}
 ]}
}

export function nextConnectionStep(plan:ProviderConnectionPlan){
 return plan.steps.find(s=>s.required&&!s.complete)||plan.steps.find(s=>!s.complete)||null
}

export function connectionReady(plan:ProviderConnectionPlan){
 return plan.steps.filter(s=>s.required).every(s=>s.complete)
}
