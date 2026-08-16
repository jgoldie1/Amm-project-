import fs from 'node:fs'
import path from 'node:path'

const root=process.cwd()
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8')
const must=(condition,message)=>{ if(!condition) throw new Error(`SMOKE FAIL: ${message}`) }

const main=read('src/main.tsx')
const app=read('src/App.tsx')
const live=read('src/services/live.ts')
const protectedLive=read('src/services/protectedLive.ts')
const moderation=read('src/services/moderation.ts')
const launcher=read('src/components/UniversalSafetyLauncher.tsx')
const commerce=read('src/services/commerceOS.ts')

must(main.includes('installProductionHealthMonitor()'),'production health monitor must install at startup')
must(main.includes('<UniversalSafetyLauncher />'),'universal Safety launcher must be mounted')
must(app.includes("import('./components/LiveCenter')"),'LIVE Center must remain reachable from App')
must(live.includes('installCallSafeLive'),'LiveKit connection must wire protected/call-safe LIVE')
must(live.includes('RoomEvent.Disconnected'),'protected LIVE listeners must be cleaned up on disconnect')
must(protectedLive.includes("'phone-call'"),'phone-call protected break must exist')
must(protectedLive.includes("'bathroom'"),'bathroom protected break must exist')
must(protectedLive.includes('visibilitychange'),'background interruption detection must exist')
must(moderation.includes('/api/moderation/report'),'misconduct reporting API contract must exist')
must(moderation.includes('/api/moderation/appeal'),'moderation appeal API contract must exist')
must(moderation.includes('relationshipAction(') && moderation.includes("'block'"),'persistent block API contract must exist')
must(moderation.includes("'mute'"),'persistent mute API contract must exist')
must(moderation.includes('/api/moderation/relationships'),'safety relationship list contract must exist')
must(launcher.includes('tryamm:safety-open'),'context-aware Safety launcher event must exist')
must(commerce.includes('COMMERCE_CAPABILITIES'),'Commerce OS capability model must exist')

const env=read('.env.example')
for(const key of ['VITE_SUPABASE_URL','VITE_SUPABASE_ANON_KEY','VITE_API_URL']) must(env.includes(key),`${key} must be documented`)

console.log('✅ frontend smoke contracts passed')
