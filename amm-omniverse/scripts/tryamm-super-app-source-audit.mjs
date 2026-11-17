/**
 * TRYAMM Super App source inventory. Reports wiring evidence, never invents
 * customer/device/provider certification. Fails if a required source module is absent.
 * Usage: node scripts/tryamm-super-app-source-audit.mjs [output.json]
 */
import fs from 'node:fs'
import path from 'node:path'
const root=path.resolve(import.meta.dirname,'..')
const required=[
 ['streetverse-world','src/components/StreetVerseMobileWorld.tsx'],
 ['streetverse-router','src/components/StreetVerseGeoSpawnBridge.tsx'],
 ['chicago-grid','src/data/StreetVerseChicagoGrid.ts'],
 ['bj-anatomy','src/runtime/StreetVerseBJAnatomyRuntime.ts'],
 ['bj-injury','src/runtime/StreetVerseBJInjuryBridgeRuntime.ts'],
 ['bj-rescue','src/runtime/StreetVerseBJRescueMissionRuntime.ts'],
 ['holoverse-gallery','src/components/HolographicGalleryCenter.tsx'],
 ['holoverse-hub','src/components/HoloverseHub.tsx'],
 ['hologpt','src/components/HoloGPTAssistant.tsx'],
 ['aniyah-studio','src/components/Aniyah64TrackStudio.tsx'],
 ['aniyah-engineer','src/components/RecordingStudio.tsx'],
 ['aniyah-server-readiness','api/studio/aniyah-readiness.js'],
 ['aniyah-checkout','api/commerce/checkout.js'],
 ['global-payment-router','api/payments/route.js'],
 ['africa-payment-status','api/payments/global-status.js'],
 ['global-payment-bridge','src/runtime/GlobalAfricaPaymentsRuntime.ts'],
 ['logistics-bridge','src/components/StreetVerseOmniWorld.tsx'],
 ['livekit-status','api/live/status.js'],
 ['livekit-room-token','api/live/token.js'],
 ['holo-reels','src/components/StreetVerseReelCaptureOverlay.tsx'],
 ['recording-studio','src/components/MusicCreatorStudio.tsx'],
 ['live-stream-interface','src/components/StreetVerseLiveTalkControl.tsx'],
 ['aniyah-cross-border-pay','src/components/AniyahPayCenter.tsx'],
 ['aniyah-corridor-map','src/services/aniyahPay.ts'],
 ['omni-payment-rails','src/services/paymentRails.ts'],
 ['omnicash-ui','src/components/OmniCashLauncher.tsx'],
 ['earth-twin-cesium','src/components/StreetVerseTwinWorld.tsx'],
 ['holo-district-twin','src/runtime/StreetVerseHoloCityBridgeRuntime.ts'],
 ['holo-credit-wallet','api/credits/wallet.js'],
 ['holo-credit-spend','api/credits/spend.js'],
 ['holo-credit-policy','src/data/TryammHoloPlayCreditEconomy.ts'],
 ['holo-credit-ledger-migration','supabase/migrations/20261005013000_tryamm_holo_play_credit_wallet.sql'],
 ['weather-sync','src/components/StreetVerseWeatherSync.tsx'],
 ['weather-global-api','api/intelligence/global-weather.js'],
]
const presence=required.map(([id,relative])=>({id,path:relative,sourcePresent:fs.existsSync(path.join(root,relative))}))
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8')
const live=read('api/live/status.js')
const aniyah=read('src/components/Aniyah64TrackStudio.tsx')
const payments=read('api/payments/route.js')
const studio=read('api/studio/aniyah-readiness.js')
const holoCredits=read('src/data/TryammHoloPlayCreditEconomy.ts')
const crossBorder=read('src/components/AniyahPayCenter.tsx')
const weatherSync=read('src/components/StreetVerseWeatherSync.tsx')
const cash=read('src/components/OmniCashLauncher.tsx')
const earth=read('src/components/StreetVerseTwinWorld.tsx')
const safety=[
 {id:'livekit-provider-config-not-public-proof',passed:live.includes('readyForPublic=configured&&Object.values(proof).every(Boolean)')},
 {id:'livekit-status-matches-token-url',passed:live.includes("const url=process.env.LIVEKIT_URL||''")},
 {id:'studio-does-not-claim-all-services-ready',passed:aniyah.includes('Studio editor available.')&&!aniyah.includes("Aniyah 64-Track Studio is ready.")},
 {id:'studio-fails-closed-on-charges',passed:studio.includes('readyForCharges=')&&studio.includes('reconciliationVerified')},
 {id:'crossborder-no-money-without-verification',passed:payments.includes('canMoveRealMoney')&&payments.includes('TRYAMM_PAYMENT_KYB_KYC_VERIFIED')&&payments.includes('TRYAMM_PAYMENT_WEBHOOKS_VERIFIED')},
 {id:'credits-never-real-money',passed:holoCredits.includes('withdrawable:false')&&holoCredits.includes('cashValueMinor:0')&&holoCredits.includes('peerToPeerTransfer:false')},
 {id:'aniyah-crossborder-sandbox-not-live-money',passed:crossBorder.includes('No real money moved')&&crossBorder.includes('Sandbox transfer intent verified')},
 {id:'weather-labels-simulation-and-unavailable',passed:weatherSync.includes('simulated:true')&&weatherSync.includes('unavailable:true')},
 {id:'omnicash-has-distinct-crossborder-entry',passed:cash.includes('__showOmniCash')&&cash.includes('__showAniyahCrossBorder')},
 {id:'earth-twin-map-is-provider-backed-not-synthetic-world',passed:earth.includes('Cesium')&&earth.includes('VITE_GOOGLE_MAP_TILES_API_KEY')},
]
const blockers=[
 'Published BJ V12 GLB must have verified skin and usable animation clips; source presence is not sufficient',
 'Shared 3D BJ/Jacobie/LaTeasia control and fly-in + city transitions need iPhone and Chromebook video evidence',
 'PR #734 regression repairs must be reviewed and merged before PR #736 is rebased; do not suppress genuine release checks',
 'LiveKit healthy server/agent, signed room tokens, real host-viewer, reconnect and moderation must be verified externally',
 'Aniyah remote recording, per-track durable audio project, studio consent, payment, booking, refunds and payouts require E2E proof',
 'African and global payment corridor approvals, webhook signatures, settlement, KYB/KYC, FX quoting and destination compliance are not established by source checks',
 'Omni Cash must not share a balance or cash-out path with non-withdrawable Holo/Play Credits. A separately authorized regulated real-money provider is required.',
 'Mycelium digital-twin weather and satellite tiles need provider timestamps, legal attributions, caches and missing-data fallback; an imagery overlay is not a cloned Earth or authoritative 3D road/collision world.',
 'Real cloud backups and account recovery, warehouse inventory authority, supply-chain fulfillment and tenant isolation need evidence',
 'Creator video export, rights and Remotion free/company eligibility must be reviewed before production',
]
const sourceReady=presence.every(x=>x.sourcePresent)&&safety.every(x=>x.passed)
const report={
 schema:'tryamm.super-app.source-audit.v1',
 generatedAt:new Date().toISOString(),
 sourceReady,
 releaseCertified:false,
 scope:'source presence and selected guardrails only — no provider/device/financial/network access',
 summary:{modulesFound:presence.filter(x=>x.sourcePresent).length,modulesExpected:presence.length,safetyPassed:safety.filter(x=>x.passed).length,safetyExpected:safety.length,externalReleaseBlockers:blockers.length},
 modules:presence,safety,externalReleaseBlockers:blockers,
}
const output=process.argv[2]
if(output){const target=path.resolve(output);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n')}
process.stdout.write(JSON.stringify(report.summary)+'\n')
if(!sourceReady)process.exitCode=1
