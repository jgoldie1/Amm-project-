import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const history=read('api/quantum/history.js')
const snapshot=read('api/quantum/snapshot.js')
const store=read('api/_lib/quantumTimeStore.js')
const hologpt=read('src/components/HoloGPTAssistant.tsx')
const answer=read('api/ai/answer.js')

const must=(ok,msg)=>{if(!ok)throw new Error('QUANTUM HISTORICAL INTERNET CONTRACT FAIL: '+msg)}

must(history.includes('web.archive.org/cdx/search/cdx'),'Internet Archive CDX source must be present')
must(history.includes('index.commoncrawl.org/collinfo.json'),'Common Crawl historical source must be present')
must(history.includes('absenceIsNotProofOfNonexistence:true'),'archive absence must never be treated as proof of nonexistence')
must(history.includes('persistQuantumTimeDocuments'),'history lookup must persist capture metadata server-side')
must(history.includes('readQuantumTimeVersions'),'history lookup must merge durable Time Machine versions')

must(snapshot.includes("redirect:'manual'"),'archived snapshot inspection must not follow arbitrary redirects')
must(snapshot.includes("replace(/<script"),'archived scripts must be stripped rather than executed')
must(snapshot.includes('marketingSignals'),'historical snapshot must extract limited promotional/ad signals')
must(snapshot.includes('persistQuantumTimeDocument'),'inspected snapshot must persist provenance and ad signals')

must(store.includes('SUPABASE_SECRET_KEY')&&store.includes('SUPABASE_SERVICE_ROLE_KEY'),'server store must support current secret key and legacy service-role key during migration')
must(store.includes('quantum_time_documents'),'server store must use hardened Quantum Time table')
must(store.includes('supersedes'),'durable historical versions must preserve supersession chain')
must(!store.includes('VITE_SUPABASE_SERVICE_ROLE_KEY'),'privileged database key must never use a browser-prefixed env name')

must(hologpt.includes("['quantum','QUANTUM']"),'HoloGPT must expose Quantum Internet mode')
must(hologpt.includes("['historical','HISTORY']"),'HoloGPT must expose Historical Internet mode')
must(hologpt.includes('/api/quantum/history')&&hologpt.includes('/api/quantum/snapshot'),'HoloGPT history mode must query timeline and selected capture')
must(hologpt.includes('extractHistoricalYear')&&hologpt.includes('extractHistoricalUrl'),'HoloGPT must infer date/domain from normal questions')

must(answer.includes("lane:'HISTORICAL-INTERNET'"),'AI grounding must label historical evidence separately')
must(answer.includes('Absence from an archive is NOT proof'),'AI grounding must preserve archive incompleteness warning')
must(answer.includes('capturedAt')&&answer.includes('digest'),'AI grounding must preserve capture date and digest')

console.log('QUANTUM HISTORICAL INTERNET RECOVERY CONTRACT PASS')
