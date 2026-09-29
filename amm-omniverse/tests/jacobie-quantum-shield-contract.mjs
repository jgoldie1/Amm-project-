import fs from 'node:fs'

const shield=fs.readFileSync(new URL('../src/security/JacobieQuantumShield.ts',import.meta.url),'utf8')
const scan=fs.readFileSync(new URL('../scripts/jacobie-crypto-inventory.mjs',import.meta.url),'utf8')
const repoScan=fs.readFileSync(new URL('./repository-security-scan.mjs',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('JACOBIE QUANTUM SHIELD CONTRACT FAIL: '+msg)}

for(const standard of ['FIPS 203 ML-KEM','FIPS 204 ML-DSA','FIPS 205 SLH-DSA']){
  must(shield.includes(standard),'missing PQC migration target '+standard)
}
must(shield.includes('Post-quantum ready architecture is not a claim'),'truth boundary missing')
must(shield.includes('do not invent or hand-roll cryptographic algorithms'),'anti-hand-rolled-crypto rule missing')
must(shield.includes('harvest-now-decrypt-later'),'long-lived-data threat model missing')
must(shield.includes('minimize and dispose of sensitive raw data'),'data disposal must be part of quantum readiness')
must(shield.includes("owner:'supabase'"),'provider-owned crypto inventory missing')
must(shield.includes("owner:'browser-platform'"),'browser/authenticator crypto ownership missing')
must(shield.includes("state:'PROVIDER-DEPENDENT'"),'provider cryptography must not be falsely marked PQC ready')
must(shield.includes('dependency audit')&&shield.includes('SBOM'),'supply-chain defenses missing')
must(shield.includes('step-up authentication')&&shield.includes('least privilege'),'identity defenses missing')
must(shield.includes('revoke credentials')&&shield.includes('rotate secrets'),'incident containment missing')

must(scan.includes('storesKeyMaterial:false'),'crypto inventory must never store key material')
must(scan.includes('MD5 cryptographic use'),'MD5 block missing')
must(scan.includes('SHA-1 cryptographic use'),'SHA-1 block missing')
must(scan.includes('hard-coded private key'),'private-key block missing')
must(scan.includes("createHash('sha256')")||scan.includes("createHash('sha256'"),'inventory integrity hash missing')
must(repoScan.includes('credential-exfil'),'existing exfiltration scan must remain enabled')
must(repoScan.includes('reverse-shell'),'existing reverse-shell scan must remain enabled')

console.log('JACOBIE QUANTUM SHIELD CONTRACT PASS: crypto agility + PQC roadmap + supply-chain + identity + incident containment + truth boundaries')
