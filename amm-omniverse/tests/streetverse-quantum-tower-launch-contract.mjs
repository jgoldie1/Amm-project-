import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const tower=readFileSync(resolve(root,'src/runtime/StreetVerseQuantumTowerLaunchRuntime.ts'),'utf8')
const mod=readFileSync(resolve(root,'src/runtime/TryammModPassRuntime.ts'),'utf8')
const consent=readFileSync(resolve(root,'src/runtime/CrossVerseConsentRuntime.ts'),'utf8')
const broadcast=readFileSync(resolve(root,'src/runtime/TryammBroadcastOSRuntime.ts'),'utf8')
const live=readFileSync(resolve(root,'src/runtime/StreetVerseLiveAudienceGateway.ts'),'utf8')
const checks=[
 ['all nine launch modules', (tower.match(/id:'(?:streetverse-game|livekit-gamecast|tiktok-distribution|crossverse|ai-operations|mod-sandbox|creator-marketplace|reels-marketing|global-transit)'/g)||[]).length===9],
 ['release dependency gate',tower.includes('blockedBy=module.dependencies.filter')],
 ['no automatic production claim',tower.includes('proofRequired')],
 ['LiveKit integration gate',tower.includes('authorized host + separate viewer')],
 ['TikTok authorization gate',tower.includes('account LIVE eligibility verified')],
 ['marketplace checkout gate',tower.includes('server-side checkout confirmation')],
 ['mod review gate',tower.includes('security and content review passed')],
 ['existing mod API',mod.includes('validateTryammModManifest')],
 ['existing consent gate',consent.includes('consentAllows')],
 ['existing Broadcast OS',broadcast.includes('TRYAMM_NETWORK_CHANNELS')],
 ['audience moderation gate',live.includes('moderatorApproved')]
]
for(const [name,ok] of checks)assert.ok(ok,name)
console.log('Quantum Tower launch integration source checks: '+checks.length+' passed (static checks, not deployment)')
