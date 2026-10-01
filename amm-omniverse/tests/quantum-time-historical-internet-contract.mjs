import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const hologpt=read('src/components/HoloGPTAssistant.tsx')
const helper=read('api/_lib/quantum-time-internet.js')
const endpoint=read('api/time-machine/internet.js')
const ai=read('api/ai/answer.js')
const migration=read('supabase/migrations/20261001065619_quantum_time_historical_internet_index.sql')
const hardening=read('supabase/migrations/20261001065658_quantum_time_historical_internet_hardening.sql')

const must=(ok,msg)=>{if(!ok)throw new Error('QUANTUM TIME HISTORICAL INTERNET CONTRACT FAIL: '+msg)}

must(hologpt.includes("'historical'")&&hologpt.includes("HISTORY"),'HoloGPT must expose HISTORY source mode')
must(hologpt.includes('/api/time-machine/internet'),'HoloGPT HISTORY must call the Time Machine Internet API')
must(hologpt.includes('THEN')&&hologpt.includes('NOW / COMPARE'),'HoloGPT must expose THEN ↔ NOW comparison controls')
must(hologpt.includes('OPEN ARCHIVE'),'HISTORY mode must expose direct archive evidence links')
must(hologpt.includes('No verified historical snapshot found'),'missing archive evidence must remain explicit')

must(helper.includes('web.archive.org/cdx/search/cdx'),'historical engine must use Internet Archive CDX')
must(helper.includes('index.commoncrawl.org/collinfo.json'),'historical engine must use Common Crawl collection metadata')
must(helper.includes('for(const collection of chosen)')&&helper.includes('setTimeout(resolve,250)'),'Common Crawl collection queries must be sequential and rate-limited')
must(!helper.includes('Promise.all(chosen.map'),'Common Crawl collection queries must not run in a parallel burst')
must(helper.includes('MAX_ARCHIVE_BYTES=750000'),'archive body reads must remain bounded')
must(helper.includes('completeHistory:false'),'persisted provenance must never claim complete Internet history')
must(helper.includes('adSignals'),'historical capture extraction must retain bounded promotional/ad signals')
must(helper.includes('adminRest')&&helper.includes('quantum_time_documents'),'historical observations must persist server-side')
must(!helper.includes('SUPABASE_SERVICE_ROLE_KEY'),'historical helper must not inline or expose service-role credentials')

must(endpoint.includes("action==='timeline'")&&endpoint.includes("action==='capture'")&&endpoint.includes("action==='compare'"),'Time Machine API must support timeline capture and compare')
must(endpoint.includes('Archived webpage changes are evidence of observed webpage versions'),'compare API must preserve evidence boundary')
must(ai.includes("lane:'HISTORICAL INTERNET'"),'HoloGPT answer grounding must preserve historical lane')
must(ai.includes('does not by itself prove a Mandela effect'),'HoloGPT must not turn webpage differences into altered-reality claims')
must(ai.includes('Missing archive captures are unknown evidence'),'HoloGPT must treat archive gaps as unknown evidence')

must(migration.includes('quantum_time_documents'),'durable historical index table must be versioned in repository')
must(migration.includes('enable row level security'),'historical index must enable RLS')
must(migration.includes('revoke all on table public.quantum_time_documents from anon, authenticated'),'historical index must deny direct browser roles')
must(hardening.includes('using (false)')&&hardening.includes('with check (false)'),'historical index must have explicit deny policy')
must(hardening.includes('quantum_time_documents_supersedes_idx'),'supersession foreign key must be indexed')

console.log('QUANTUM TIME HISTORICAL INTERNET CONTRACT PASS: archive + Common Crawl + persistence + HISTORY compare + provenance guardrails')
