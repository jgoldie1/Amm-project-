import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const read=p=>readFileSync(resolve(root,p),'utf8')
const main=read('src/main.tsx')
const bridge=read('src/components/StreetVerseGeoSpawnBridge.tsx')
const panel=read('src/components/StreetVerseTowerConnections.tsx')
const dock=read('src/components/StreetVerseCoreGameplayDock.tsx')
const live=read('src/components/LiveCenter.tsx')
const mod=read('src/runtime/TryammModPassRuntime.ts')
const tower=read('src/runtime/StreetVerseQuantumTowerLaunchRuntime.ts')
const checks=[
 ['LIVE route gamecast flag',main.includes("get('format')==='gamecast'")],
 ['LIVE route viewer role',main.includes("get('role')==='viewer'")],
 ['game mounted through geo bridge',main.includes('<StreetVerseGeoSpawnBridge')],
 ['tower panel lazily mounted',bridge.includes('<StreetVerseTowerConnections/>')],
 ['tower state import',panel.includes('QUANTUM_TOWER_LAUNCH_MODULES')],
 ['broadcast runtime present',main.includes('installTryammBroadcastOSRuntime()')],
 ['Mod Pass runtime mounted',main.includes('installTryammModPassRuntime()')],
 ['AI fabric mounted',main.includes('installStubbsLyonsMiddleverseRuntime()')],
 ['JARVIS runtime mounted',main.includes('installJarvisOrchestratorRuntime()')],
 ['global travel runtime mounted',main.includes('installGlobalTravelExperienceRuntime()')],
 ['mod manifest validator',mod.includes('validateTryammModManifest')],
 ['tower shows verification caveat',panel.includes('verifiedEndToEnd:false')],
 ['actual gamecast display capture',live.includes('setScreenShareEnabled(enable)')],
 ['separate tab gamecast',dock.includes("window.open('/live?format=gamecast&role=host&from=streetverse'")],
 ['publisher protection',read('api/live/token.js').includes('LIVE_HOST_USER_IDS')],
 ['sale proof required',tower.includes('server-side checkout confirmation')]
]
for(const [name,passed] of checks)assert.ok(passed, name)
console.log('StreetVerse Quantum Tower source wiring: '+checks.length+' assertions passed; not runtime/live proof')
