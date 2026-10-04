import fs from 'node:fs'
const onboard=fs.readFileSync(new URL('../src/logistics/ownerOperatorOnboarding.ts',import.meta.url),'utf8')
const pay=fs.readFileSync(new URL('../src/logistics/accessorialPay.ts',import.meta.url),'utf8')
const ui=fs.readFileSync(new URL('../src/components/FleetOwnerOperatorCenter.tsx',import.meta.url),'utf8')
for(const x of ['OPERATING AUTHORITY','INSURANCE','CDL / MEDICAL CARD','FACTORING / QUICK PAY','VERIFIED LOAD ACCESS'])if(!onboard.includes(x))throw new Error('Onboarding missing '+x)
for(const x of ['detention','layover','tonu','lumper-reimbursement','fuel-surcharge','deadhead-premium','automaticEntitlement:false','authoritative_approval_required'])if(!pay.includes(x))throw new Error('Accessorial pay missing '+x)
for(const x of ['DETENTION / ACCESSORIAL PAY','OWNER-OPERATOR ONBOARDING'])if(!ui.includes(x))throw new Error('Owner operator UI missing '+x)
console.log('Owner operator onboarding + accessorial pay contract: PASS')