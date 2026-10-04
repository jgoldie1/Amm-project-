import fs from 'node:fs'
const runtime=fs.readFileSync(new URL('../src/runtime/BusinessDiscoveryLensRuntime.ts',import.meta.url),'utf8')
const passport=fs.readFileSync(new URL('../src/commerce/businessPassport.ts',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
for(const x of ['tryamm.business-passport.qr.v1','tryamm:business-passport-qr-open','tryamm:business-lens-discovery','small-business','minority-owned','owner-declared','program-import','certifier','noDemographicInference','minorityStatusMustBeOwnerDeclaredOrProgramVerified'])if(!runtime.includes(x))throw new Error('Business lens missing '+x)
if(!passport.includes('QR_OR_INVITE'))throw new Error('Business Passport QR flow missing')
if(!main.includes('installBusinessDiscoveryLensRuntime'))throw new Error('Business lens not installed')
console.log('Business QR + Holographic Lens discovery contract: PASS')
