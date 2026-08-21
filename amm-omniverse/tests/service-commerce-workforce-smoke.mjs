import fs from 'node:fs';import path from 'node:path';const r=p=>fs.readFileSync(path.join(process.cwd(),p),'utf8'),m=(c,s)=>{if(!c)throw new Error(`SERVICE/WORKFORCE SMOKE FAIL: ${s}`)}
const main=r('src/main.tsx'),os=r('src/services/ServiceCommerceWorkforceOS.ts'),hub=r('src/components/ServiceCommerceWorkforceHub.tsx'),mig=r('supabase/migrations/20260821143000_service_workforce_onboarding.sql')
must= m
must(main.includes('<ServiceCommerceWorkforceHub />'),'hub mounted')
for(const t of ['rider','driver','food-delivery-courier','restaurant-owner','advertiser','ministry-worker','employee','student','educator'])must(os.includes(`'${t}'`),t)
for(const t of ['Holo Menu','Holo Coupons','Holo Advertising','Holo Search'])must(os.includes(t),t)
for(const t of ['REQUEST → QUOTE','BROWSE HOLO MENU','no client-generated fares or payouts'])must(os.includes(t),t)
for(const t of ['IRS IRIS transmission','SSA W-2/W-3 transmission','authorized payroll/tax filing provider'])must(os.includes(t),t)
for(const t of ['Ride + Food Delivery','Holo Commerce','Ministry + Employees + Education','Payroll + Tax Readiness'])must(hub.includes(t),t)
for(const t of ['tryamm_role_profiles','tryamm_role_evidence','tryamm_tax_filing_readiness','enable row level security','revoke all'])must(mig.includes(t),t)
console.log('✅ service commerce workforce smoke contracts passed')
