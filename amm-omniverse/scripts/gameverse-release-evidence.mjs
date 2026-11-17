/** Reproducible source evidence export. Never claims live play, payment, payouts or external provider certifications. */
import fs from 'node:fs'
import path from 'node:path'
const root=path.resolve(import.meta.dirname,'..')
const get=file=>fs.readFileSync(path.join(root,file),'utf8')
const gameVerse=get('src/components/GameVerseHub.tsx')
const existing=get('../data/omni-news-and-social-games-expansion.json')
const catalog=JSON.parse(existing)
const historicalGames=Object.keys(catalog.social_games.games)
const lineup=[...gameVerse.matchAll(/\{slug:'([^']+)',name:'([^']+)'[^\n]+?status:'(PROTOTYPE|PLANNED)'/g)].map(x=>({id:x[1],title:x[2],sourceStatus:x[3]}))
const required=[
 'src/components/GameVerseHub.tsx','src/components/GameVerseEntertainmentDistrict.tsx',
 'src/components/GameVerseSpadesPractice.tsx','src/runtime/GameVerseSpadesTrick.mjs',
 'src/runtime/GameVerseEntertainmentDistrict.mjs','src/components/HoloCreditChannelShop.tsx',
 'src/components/HoloLabGateway.tsx','src/runtime/HoloForgeAssetRuntime.ts',
 'src/components/StreetVerseGeoSpawnBridge.tsx'
]
const modules=required.map(file=>({file,present:fs.existsSync(path.join(root,file))}))
const sourcePass=lineup.length===11&&modules.every(x=>x.present)&&historicalGames.includes('spades')&&historicalGames.includes('poker')
const report={
 schema:'tryamm.gameverse.release-evidence.v1',
 generatedAt:new Date().toISOString(),sourcePass,productionCertified:false,
 actualGameplayVerified:false,streamingVerified:false,stripeChargesVerified:false,
 humanApprovalsRequired:true,liveGameServersVerified:false,
 summary:{livingGames:lineup.length,modulesFound:modules.filter(x=>x.present).length,modulesExpected:modules.length,historicalSocialGameSpecs:historicalGames.length},
 livingGames:lineup,modules,historicalSocialGameSpecs:historicalGames,
 confirmedLocalTestSurfaces:['GameVerse Living City entry','free-play four-venue tour','one-player Spades practice with three deterministic bots','JSON receipt export'],
 unverifiedOrMissing:[
 'Spades bids/bags/nil/blind nil, four real players, lobbies, ranked tables and anti-collusion',
 'Pool/billiards runtime or physics and historic playable game files not established by this audit',
 'All eleven games are NOT playable: prototype/planned status is source-only',
 'AI Hall Pass purchase/lead intake and fulfillment are not a verified launch path',
 'SMS opt-in/STOP/HELP, consent proof, campaign delivery and telephony are not certified',
 'Remotion licensing and production rendering; XR, light-field display, splat capture and map tile provider remain separate gates',
 'Holo credits, Stripe real-money payout and international cross-border transfer are not certified by this report',
 'StreetVerse release, BJ skinned rig, cloud storage and mobile device acceptance gates are unresolved',
 ],
 thirdPartyReview:[
 {id:'gaussian-splats-3d',repository:'mkkellogg/GaussianSplats3D',installedByThisChange:false},
 {id:'looking-glass-core',repository:'Looking-Glass/LookingGlassCoreSDK',installedByThisChange:false},
 {id:'meta-immersive-web',repository:'meta/immersive-web-sdk',installedByThisChange:false},
 {id:'protomaps',repository:'maplibre-ext/protomaps-basemaps',installedByThisChange:false},
 {id:'splatour',repository:'Nyveon/Splatour',installedByThisChange:false},
 ],
 moneyBoundary:'All new game tests use deterministic practice outcomes and cannot award credits, authorize sales, transfer real money or pay prizes.'
}
const filename=process.argv[2]
if(filename){const out=path.resolve(filename);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n')}
process.stdout.write(JSON.stringify(report.summary)+'\n')
if(!sourcePass)process.exitCode=1
