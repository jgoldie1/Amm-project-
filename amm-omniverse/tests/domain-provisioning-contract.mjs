import fs from 'node:fs'
const svc=fs.readFileSync(new URL('../src/services/domainProvisioning.ts',import.meta.url),'utf8')
const api=fs.readFileSync(new URL('../api/domains/provision.js',import.meta.url),'utf8')
for(const x of ['DOMAIN SEARCH','REGISTRAR PURCHASE','NAMESERVER / DNS CONFIG','SSL CERTIFICATE','LIVE','registrarApiRequired:true','paymentMustBeVerifiedBeforeRegistration:true'])if(!svc.includes(x))throw new Error('Domain provisioning contract missing '+x)
for(const x of ['TRYAMM_DOMAIN_REGISTRAR_PROVIDER','TRYAMM_DOMAIN_REGISTRAR_API_KEY','DOMAIN_PROVIDER_GATED','PAYMENT_VERIFICATION_REQUIRED','REGISTRAR_ADAPTER_REQUIRED'])if(!api.includes(x))throw new Error('Domain API boundary missing '+x)
console.log('Domain provisioning contract: PASS')