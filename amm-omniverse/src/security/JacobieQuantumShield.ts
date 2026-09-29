export type QuantumReadinessState='CURRENT-SAFE'|'MIGRATION-REQUIRED'|'PQC-READY'|'PROVIDER-DEPENDENT'
export type CryptoOwner='tryamm'|'supabase'|'vercel'|'render'|'browser-platform'|'provider'

export interface CryptoInventoryEntry{
  id:string
  system:string
  purpose:string
  algorithmOrProtocol:string
  owner:CryptoOwner
  longLivedSensitiveData:boolean
  state:QuantumReadinessState
  migrationTarget?:string
  evidenceRequired:string[]
}

export const JACOBIE_QUANTUM_SHIELD={
  productName:'Jacobie Cybersecurity • Quantum Shield',
  truthBoundary:'Post-quantum ready architecture is not a claim that every connected provider or browser session already uses post-quantum cryptography.',
  standards:{
    keyEstablishment:'NIST FIPS 203 ML-KEM',
    primarySignatures:'NIST FIPS 204 ML-DSA',
    alternateSignatures:'NIST FIPS 205 SLH-DSA',
    cryptoAgility:'NIST CSWP 39 / current crypto-agility guidance',
  },
  principles:[
    'inventory cryptography before migration',
    'do not invent or hand-roll cryptographic algorithms',
    'prefer validated provider/library implementations',
    'make algorithms configurable and replaceable',
    'protect long-lived sensitive data from harvest-now-decrypt-later exposure',
    'minimize and dispose of sensitive raw data that does not need long retention',
    'keep secret key material server-side or in managed key stores',
    'use least privilege and short-lived credentials',
    'require step-up authentication for high-risk actions',
    'verify build/source provenance and dependency integrity',
    'log defensive security events without logging secrets',
    'fail closed when identity, signature, rights or provider evidence is missing',
  ] as const,
  neverClaim:[
    'quantum-proof',
    'unhackable',
    'all traffic is post-quantum encrypted',
    'provider-managed cryptography is PQC unless verified by evidence',
  ] as const,
} as const

export const TRYAMM_CRYPTO_INVENTORY:CryptoInventoryEntry[]=[
  {
    id:'web-auth-transport',
    system:'Browser ↔ TRYAMM edge/API',
    purpose:'TLS transport encryption',
    algorithmOrProtocol:'TLS provider-managed',
    owner:'provider',
    longLivedSensitiveData:true,
    state:'PROVIDER-DEPENDENT',
    migrationTarget:'PQC/hybrid TLS when verified supported by the deployed edge and client ecosystem',
    evidenceRequired:['edge TLS configuration','provider PQC statement','interoperability test'],
  },
  {
    id:'supabase-auth',
    system:'Supabase Auth',
    purpose:'session/JWT authentication',
    algorithmOrProtocol:'provider-managed public-key signatures',
    owner:'supabase',
    longLivedSensitiveData:false,
    state:'PROVIDER-DEPENDENT',
    migrationTarget:'provider-supported PQC/hybrid signing path when production-ready',
    evidenceRequired:['provider algorithm inventory','migration roadmap','token compatibility tests'],
  },
  {
    id:'webauthn-passkeys',
    system:'TRYAMM step-up/passkeys',
    purpose:'phishing-resistant user authentication',
    algorithmOrProtocol:'WebAuthn authenticator/provider algorithms',
    owner:'browser-platform',
    longLivedSensitiveData:false,
    state:'PROVIDER-DEPENDENT',
    migrationTarget:'standards-compliant PQC-capable authenticators when browser/platform support is mature',
    evidenceRequired:['authenticator algorithm inventory','browser/platform support matrix','step-up regression tests'],
  },
  {
    id:'step-up-token-hash',
    system:'TRYAMM security step-up token hashing',
    purpose:'store non-reversible challenge/token verifier',
    algorithmOrProtocol:'HMAC-SHA-256 / SHA-256',
    owner:'tryamm',
    longLivedSensitiveData:false,
    state:'CURRENT-SAFE',
    evidenceRequired:['server-side pepper','rotation procedure','no raw token persistence'],
  },
  {
    id:'release-artifact-hash',
    system:'TRYAMM release pipeline',
    purpose:'artifact integrity manifest',
    algorithmOrProtocol:'SHA-256',
    owner:'tryamm',
    longLivedSensitiveData:false,
    state:'CURRENT-SAFE',
    evidenceRequired:['artifact hash manifest','commit SHA binding'],
  },
]

export const QUANTUM_DATA_PRIORITY=[
  {class:'credentials-and-secrets',priority:'CRITICAL',action:'short-lived credentials, managed secrets, aggressive rotation; never retain plaintext secrets'},
  {class:'financial-and-payout-data',priority:'CRITICAL',action:'minimize fields, encrypt in transit/at rest, isolate authority, retain only required records'},
  {class:'health-and-biometric-data',priority:'CRITICAL',action:'local/ephemeral processing where possible; discard raw captures after purpose is complete'},
  {class:'private-messages-and-private-media',priority:'HIGH',action:'minimize retention and prepare provider encryption migration'},
  {class:'proprietary-source-and-ip',priority:'HIGH',action:'access control, encrypted repositories/storage, build provenance, backup integrity'},
  {class:'public-content',priority:'NORMAL',action:'integrity/authenticity and moderation protections; confidentiality usually not required'},
] as const

export const JACOBIE_DEFENSE_LAYERS={
  identity:['passkeys','step-up authentication','short-lived sessions','least privilege','role evidence'],
  application:['authorization before execution','input validation','rate limits','CSRF/origin controls where applicable','secure headers'],
  data:['data minimization','retention lanes','delete/de-identify waste data','managed secrets','encrypted transport/storage'],
  supplyChain:['lockfiles','dependency audit','secret scan','malware/exfiltration scan','SBOM','artifact SHA-256 manifest'],
  pqc:['crypto inventory','algorithm ownership map','ML-KEM migration target','ML-DSA/SLH-DSA signature targets','provider evidence'],
  incidentResponse:['detect','contain','revoke credentials','preserve minimal evidence','rotate secrets','recover','postmortem'],
} as const

export function quantumMigrationBlockers(entries:CryptoInventoryEntry[]=TRYAMM_CRYPTO_INVENTORY){
  return entries.filter(entry=>entry.state==='MIGRATION-REQUIRED'||entry.state==='PROVIDER-DEPENDENT')
}

export function canClaimPqcForEntry(entry:CryptoInventoryEntry,evidence:string[]){
  if(entry.state!=='PQC-READY')return false
  return entry.evidenceRequired.every(required=>evidence.includes(required))
}
