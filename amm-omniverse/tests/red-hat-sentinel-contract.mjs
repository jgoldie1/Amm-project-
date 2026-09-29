import fs from 'node:fs'

const backend=fs.readFileSync(new URL('../amm-backend/lib/red-hat-sentinel.js',import.meta.url),'utf8')
const route=fs.readFileSync(new URL('../amm-backend/routes/red-hat-sentinel.js',import.meta.url),'utf8')
const panel=fs.readFileSync(new URL('../src/components/RedHatSentinelPanel.tsx',import.meta.url),'utf8')
const center=fs.readFileSync(new URL('../src/components/JacobieVisionCenter.tsx',import.meta.url),'utf8')
const migration=fs.readFileSync(new URL('../amm-backend/migrations/202609290001_red_hat_sentinel.sql',import.meta.url),'utf8')

const must=(ok,msg)=>{if(!ok)throw new Error('RED HAT SENTINEL CONTRACT FAIL: '+msg)}

for(const marker of ['canary-route','secret-file-probe','path-traversal','sql-injection-probe','xss-probe','shell-probe','framework-admin-scan','high-velocity']){
  must(backend.includes(marker),'missing defensive detection signal '+marker)
}

must(backend.includes('hackBack:false'),'hack-back prohibition missing')
must(backend.includes('rawCredentialsStored:false'),'raw credential retention must be prohibited')
must(backend.includes('rawPayloadStored:false'),'raw payload retention must be prohibited')
must(backend.includes('rawIpStored:false'),'raw IP retention must be prohibited')
must(backend.includes('retentionDays:14'),'short retention window missing')
must(backend.includes("createHmac('sha256'"),'source fingerprints must be peppered/HMACed')
must(backend.includes("createHash('sha256')"),'payload contents must be represented only by digest')
must(backend.includes("return res.status(404).json({error:'Not found'})"),'decoy routes must not reveal honeypot status')
must(route.includes("['owner','admin','security','release']"),'operator endpoint role gate missing')
must(route.includes("select('event_kind,risk_score,signal_codes,user_agent_class,occurred_at')"),'summary must use minimized fields')
must(!route.includes('source_hash,user_agent_hash'),'summary must not return source/user-agent hashes')
must(panel.includes('Raw IP addresses, passwords, tokens, cookies and raw exploit payloads'),'operator UI privacy explanation missing')
must(center.includes('RedHatSentinelPanel'),'Jacobie Vision must expose defensive dashboard')
must(migration.includes('enable row level security'),'telemetry table must enable RLS')
must(migration.includes('Intentionally no client-facing RLS policies'),'telemetry table must remain service-role only')
must(migration.includes('expires_at'),'retention expiry field missing')

console.log('RED HAT SENTINEL CONTRACT PASS: defensive canaries + minimized telemetry + operator-only summary + no hack-back')
