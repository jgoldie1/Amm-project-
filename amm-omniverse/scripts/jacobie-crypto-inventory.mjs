import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root=process.cwd()
const output=path.resolve(process.argv[2]||'../release-evidence/jacobie-crypto-inventory.json')
const skip=new Set(['node_modules','dist','.git','build','coverage','public/generated-assets'])
const textExt=/\.(js|jsx|ts|tsx|mjs|cjs|json|yml|yaml|toml)$/i
const rows=[]
const blocked=[]
const providerCompatibility=[]

const patterns=[
  ['RSA',/\bRSA\b|rsa[-_]?sha|createPrivateKey\([^\n]{0,100}rsa/i],
  ['ECC/ECDSA/ECDH',/\bECDSA\b|\bECDH\b|\bEC(?:DH|DSA)\b|prime256v1|secp256/i],
  ['WebAuthn',/webauthn|navigator\.credentials/i],
  ['JWT',/\bjwt\b|authorization:\s*['"`]?Bearer|Bearer \$\{/i],
  ['TLS/HTTPS',/https:\/\/|\btls\b/i],
  ['AES',/aes-(?:128|192|256)|createCipheriv\(['"`]aes/i],
  ['SHA-256/HMAC',/sha-?256|createHmac\(['"`]sha256|createHash\(['"`]sha256/i],
  ['PQC ML-KEM',/ML-KEM|ml_kem|ml-kem/i],
  ['PQC ML-DSA',/ML-DSA|ml_dsa|ml-dsa/i],
  ['PQC SLH-DSA',/SLH-DSA|slh_dsa|slh-dsa/i],
]

const insecure=[
  ['MD5 cryptographic use',/createHash\(['"`]md5['"`]\)|createHmac\(['"`]md5['"`]/i],
  ['SHA-1 cryptographic use',/createHash\(['"`]sha1['"`]\)|createHmac\(['"`]sha1['"`]|RSA-SHA1/i],
  ['hard-coded private key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
]

function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(skip.has(ent.name))continue
    const full=path.join(dir,ent.name)
    if(ent.isDirectory())walk(full)
    else if(textExt.test(ent.name))scan(full)
  }
}

function scan(file){
  const rel=path.relative(root,file).split(path.sep).join('/')
  // Do not self-scan the detector's own regular-expression source as application crypto.
  if(rel==='scripts/jacobie-crypto-inventory.mjs')return
  let text=''
  try{text=fs.readFileSync(file,'utf8')}catch{return}
  for(const [name,re] of patterns){
    if(re.test(text))rows.push({file:rel,signal:name})
  }
  for(const [name,re] of insecure){
    if(!re.test(text))continue
    const twilioLegacyVerifier=name==='SHA-1 cryptographic use'
      && rel==='api/_lib/twilio.js'
      && text.includes('TWILIO_LEGACY_HMAC_SHA1_COMPAT')
    if(twilioLegacyVerifier){
      providerCompatibility.push({
        file:rel,
        finding:name,
        reason:'Twilio legacy/default webhook signature verification requires provider-defined HMAC-SHA1; migration path supports HMAC-SHA256 SharedKey.',
        scope:'verification-only',
      })
      continue
    }
    blocked.push({file:rel,finding:name})
  }
}

walk(root)
const dedupe=(list,key)=>[...new Map(list.map(x=>[key(x),x])).values()]
const inventory=dedupe(rows,x=>x.file+'|'+x.signal).sort((a,b)=>a.file.localeCompare(b.file)||a.signal.localeCompare(b.signal))
const blockers=dedupe(blocked,x=>x.file+'|'+x.finding)

const manifest={
  schema:'tryamm.jacobie.crypto-inventory.v1',
  generatedAt:new Date().toISOString(),
  commitSha:process.env.GITHUB_SHA||null,
  storesKeyMaterial:false,
  note:'Inventory records crypto usage signals only; it intentionally never records cryptographic key material.',
  standardsTargets:['FIPS 203 ML-KEM','FIPS 204 ML-DSA','FIPS 205 SLH-DSA'],
  inventory,
  providerCompatibility,
  blockers,
}

fs.mkdirSync(path.dirname(output),{recursive:true})
fs.writeFileSync(output,JSON.stringify(manifest,null,2))
const hash=crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex')
fs.writeFileSync(output+'.sha256',hash+'  '+path.basename(output)+'\n')
console.log(`Jacobie crypto inventory: ${inventory.length} usage signal(s), ${providerCompatibility.length} provider compatibility exception(s), ${blockers.length} blocking insecure crypto finding(s)`)
if(blockers.length){
  for(const item of blockers)console.error(`::error::${item.finding} in ${item.file}`)
  process.exit(1)
}