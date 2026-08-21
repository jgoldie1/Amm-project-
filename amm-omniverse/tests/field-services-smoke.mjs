import fs from 'node:fs'
import path from 'node:path'
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8'),must=(c,m)=>{if(!c)throw new Error(`FIELD SERVICES SMOKE FAIL: ${m}`)}
const main=read('src/main.tsx'),platform=read('src/field/QuantumFieldServicesPlatform.ts'),hub=read('src/components/FieldServicesHub.tsx'),launcher=read('src/components/FieldServicesLauncher.tsx'),migration=read('supabase/migrations/20260821150000_field_services_runtime.sql')
must(main.includes('<FieldServicesLauncher />'),'launcher mounted')
for(const token of ['Real Estate Imaging','Construction Inspection Imaging','Agriculture Imaging & Monitoring','Environmental Monitoring','Media / Movie Production','HoloArena Event Capture','Disaster Assessment Imaging','Approved Delivery Operations'])must(platform.includes(token),token)
for(const token of ['SEARCH/DISCOVERY','TRAIN/QUALIFY','GET JOB OR START BUSINESS','PAYMENT/LEDGER','WORLD MEMORY','QUANTUMVERSE'])must(platform.includes(token),token)
must(platform.includes('aviation approvals')&&platform.includes('software approval equals aviation approval'),'aviation truth gate')
for(const token of ['field_service_providers','field_service_jobs','field_service_evidence','field_service_reviews','field_service_payouts','enable row level security','revoke all'])must(migration.includes(token),token)
must(launcher.includes('tryamm:field-services-open')&&launcher.includes('FIELD SERVICES'),'launcher contract')
must(hub.includes('Quantum Field Assistant')&&hub.includes('Find work. Start a service business.'),'conversion hub')
console.log('✅ Field Services smoke contracts passed')
