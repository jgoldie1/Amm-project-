import fs from 'node:fs'
import path from 'node:path'
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8'),must=(c,m)=>{if(!c)throw new Error(`HOLOARENA SMOKE FAIL: ${m}`)}
const main=read('src/main.tsx'),platform=read('src/immersive/LocationVRPlatform.ts'),launcher=read('src/components/HoloArenaLauncher.tsx'),consoleUi=read('src/components/HoloArenaOperatorConsole.tsx'),migration=read('supabase/migrations/20260821004000_location_vr_venue_runtime.sql'),games=read('src/holoarena/HoloArenaLaunchPack.ts'),legacyRace=read('src/legacy/RaceSponsorshipLegacyContract.ts'),sampleContract=read('src/music/SampleRightsRegistry.ts'),sampleMigration=read('supabase/migrations/20260821014600_music_sample_registry.sql'),sampleApi=read('api/music/sample/[action].ts'),holoWallet=read('supabase/migrations/20260821012500_holo_credit_wallet.sql'),movieBox=read('src/economy/HoloCreditProductionContract.ts')
must(main.includes('<HoloArenaLauncher />'),'launcher mounted')
must(launcher.includes('tryamm:holoarena-open')&&launcher.includes('HOLOARENA'),'launcher contract')
for(const token of ['StreetVerse Free Roam','Reality Lab: District 01','Immersive Library Timewalk','SpaceVerse Crew Mission','StarVerse Creator Stage','All American University XR Lab'])must(platform.includes(token),token)
for(const token of ['tracking lost','boundary breach','operator emergency stop','participant distress','Safety state overrides score'])must(platform.includes(token),`safety ${token}`)
for(const token of ['OpenXR runtime','record/replay/movie capture','World Memory/checkpoint persistence','franchise/license fees after legal readiness'])must(platform.includes(token),token)
for(const token of ['tryamm_vr_venues','tryamm_vr_rooms','tryamm_vr_sessions','tryamm_vr_session_members','tryamm_vr_safety_events','tryamm_vr_highlights','enable row level security','revoke all'])must(migration.includes(token),`migration ${token}`)
for(const token of ['Operator safety','Venue jobs + operations','Hardware adapter path','Business + franchise'])must(consoleUi.includes(token),token)
for(const token of ['Volcano: Last Route','Battle Deck: Holo Champions','Photon Tag: Neon District','Timewalk: Archive Detectives'])must(games.includes(token),`startup game ${token}`)
for(const token of ['shareBps: 2000','sponsorEligible: true','server-authoritative result','Kenosha Stubbs Legacy','Kenosha Shelton Memorial','serviceShareBps: 1000'])must(legacyRace.includes(token),`legacy/race ${token}`)
for(const token of ['audio-fingerprint','spectral-similarity','Detection is a risk signal','sample-clearance-bypass'])must(sampleContract.includes(token),`sample contract ${token}`)
for(const token of ['music_sample_submissions','music_sample_matches','music_sample_clearances','enable row level security','trusted-server/admin operations only'])must(sampleMigration.includes(token),`sample migration ${token}`)
for(const token of ["action==='submit'","action==='status'","action==='release-gate'","action==='fingerprint-result'","action==='review'",'TRYAMM_RIGHTS_REVIEWER_USER_IDS','SUPABASE_SERVICE_ROLE_KEY'])must(sampleApi.includes(token),`sample API ${token}`)
for(const token of ['holo_credit_wallets','holo_credit_ledger','holo_credit_entitlements','holo_credit_family_controls','No authenticated INSERT/UPDATE/DELETE policies'])must(holoWallet.includes(token),`Holo wallet ${token}`)
for(const token of ['TRYAMM Movie Box','LOTTIE 2.0 OVERLAYS','never charge HC for accessibility','closed-loop-virtual-credit'])must(movieBox.includes(token),`Movie/Holo ${token}`)
console.log('✅ HoloArena location VR + legacy + rights + economy smoke contracts passed')
