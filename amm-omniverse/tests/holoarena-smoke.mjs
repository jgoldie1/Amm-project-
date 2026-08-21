import fs from 'node:fs'
import path from 'node:path'
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8'),must=(c,m)=>{if(!c)throw new Error(`HOLOARENA SMOKE FAIL: ${m}`)}
const main=read('src/main.tsx'),platform=read('src/immersive/LocationVRPlatform.ts'),launcher=read('src/components/HoloArenaLauncher.tsx'),consoleUi=read('src/components/HoloArenaOperatorConsole.tsx'),migration=read('supabase/migrations/20260821004000_location_vr_venue_runtime.sql')
must(main.includes('<HoloArenaLauncher />'),'launcher mounted')
must(launcher.includes('tryamm:holoarena-open')&&launcher.includes('HOLOARENA'),'launcher contract')
for(const token of ['StreetVerse Free Roam','Reality Lab: District 01','Immersive Library Timewalk','SpaceVerse Crew Mission','StarVerse Creator Stage','All American University XR Lab'])must(platform.includes(token),token)
for(const token of ['tracking lost','boundary breach','operator emergency stop','participant distress','Safety state overrides score'])must(platform.includes(token),`safety ${token}`)
for(const token of ['OpenXR runtime','record/replay/movie capture','World Memory/checkpoint persistence','franchise/license fees after legal readiness'])must(platform.includes(token),token)
for(const token of ['tryamm_vr_venues','tryamm_vr_rooms','tryamm_vr_sessions','tryamm_vr_session_members','tryamm_vr_safety_events','tryamm_vr_highlights','enable row level security','revoke all'])must(migration.includes(token),`migration ${token}`)
for(const token of ['Operator safety','Venue jobs + operations','Hardware adapter path','Business + franchise'])must(consoleUi.includes(token),token)
console.log('✅ HoloArena location VR smoke contracts passed')
