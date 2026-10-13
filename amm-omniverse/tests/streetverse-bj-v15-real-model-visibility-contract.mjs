import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const loader=read('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts')
const mobile=read('../src/components/StreetVerseMobileWorld.tsx')
const nearWest=read('../src/components/StreetVerseNearWestCinematicCast.tsx')

const required=(contains,why)=>assert.ok(contains,why)

// Asset is real user-created V15 from the 2026-10-12 character production run;
// do not mark it certified likeness or a finished MetaHuman.
required(loader.includes('BJ_STUBBS_V15_ACTING_FACE_LOOK_NOD.glb'),'must identify the real V15 artifact')

required(loader.includes('const published=v15PreviewUrl?null:await Promise.race('),'V15 must start without waiting for online Meshy manifest')
required(loader.includes('response.arrayBuffer()'),'V15 fetch must be network bounded and explicit')
required(loader.includes('new AbortController()'),'iPhone GLB download must be abortable')
required(loader.includes('parseAsync(bytes,basePath)'),'V15 must decode fetched GLB without duplicate GET')
required(loader.includes('BJ GLB decode timed out'),'decoder must fail rather than spin forever')
required(mobile.includes("bjLoadStatus==='downloading'?'BJ DOWNLOADING…'"),'show the download stage')
required(mobile.includes("bjLoadStatus==='decoding'?'BJ PREPARING…'"),'show the GPU/GLB preparation stage')
required(mobile.includes('},36000)'),'iPhone hero attempt must not hang forever')
required(mobile.includes("setMessage('BJ V15 TIMED OUT • tap RETRY BJ')"),'time-out must expose user retry')

required(loader.includes('daa5234c-5fbf-4b52-9c45-e82e36156153.glb'),'stable externally hosted asset')
required(loader.includes("get('bj')==='legacy'"),'V15 is default with explicit original-hero escape hatch')
required(loader.includes('BJ_MESHY_V6_ASSET.productionUrl'),'preserve older working fallback')
required(loader.includes("candidate===metaHumanPreviewUrl)&&!await assetExists(candidate)"),'external V15 should not be discarded by a short HEAD request')
required(mobile.includes('Toggle BJ Stubbs V15 face portrait view'),'always-visible face inspection button')
required(mobile.includes('setBjFaceViewPinned(bjShowcasePinned)'),'portrait camera can be pinned and dismissed')
required(mobile.includes('bjShowcasePinned?Number.POSITIVE_INFINITY:0'),'close-up is not limited to eight seconds')
required(mobile.includes('cameraBack=portraitClearView?4.25:6.6'),'mobile gameplay camera is genuinely closer')

required(loader.includes("faceNames.has('eyeBlinkLeft')&&faceNames.has('jawOpen')"),'validate facial animation')
required(loader.includes("node.scale.lengthSq()<1e-12"),'prune invisible old skinned geometry')
required(loader.includes("prunedInvisibleV15Meshes++"),'zero-scale cleanup must be counted')
required(loader.includes('bjV15RealGlbPreview:usingV15Preview'),'expose actual model identity')
required(loader.includes('certifiedLikeness:usingV15Preview||usingMetaHumanPreview?false:verifiedPhotoMatch'),'no false likeness claims')

required(mobile.includes("['bj-upgrade',bjRenderedVersion==='V15'"),'visible one-hand V15 action')
required(mobile.includes('tryamm:streetverse-bj-v15-preview'),'actual model refresh event')
required(mobile.includes('request!==bjHeroLoadEpoch'),'prevent slow previous request from overwriting V15')
required(mobile.includes('nativeLayer.add(handle.object)'),'actual game scene replaces avatar')
required(mobile.includes('nativeHeroFallback!.visible=false'),'old player geometry hidden')
required(mobile.includes('nativeHeroRig=isV15?null:nativeHumanoidRig(nativeHero)'),'do not double animate V15 bones')
required(mobile.includes("setBJRenderedVersion(isV15?'V15':null)"),'only claim V15 after mounting real GLB')
required(mobile.includes('data-bj-active-version={bjRenderedVersion'),'surface real model version in UI')
required(mobile.includes('tryamm:streetverse-bj-showcase'),'show visible in-world close-up')
required(mobile.includes("data-bj-load-state={bjLoadStatus}"),'HUD must expose loading, fallback and error states')
required(mobile.includes("'↻ RETRY BJ V15'"),'one-hand retry must remain visible if image fails to load')
required(mobile.includes("'BJ V15 LOADING…'"),'loading must be explicit instead of a false success badge')
required(mobile.includes('data-streetverse-release={document.documentElement.dataset.tryammRelease||"unknown"}'),'release marker must use current worker generation instead of a stale date')

required(mobile.includes('tryamm:streetverse-bj-hero-mounted'),'proof event fires after nativeLayer.add')
required(mobile.includes("window.removeEventListener('tryamm:streetverse-bj-v15-preview'"),'remove event when world unmounts')
required(nearWest.includes('!loaded.object.userData.bjV15RealGlbPreview'),'do not hide new face with legacy overlay')

console.log('BJ V15 REAL GAME CHARACTER integration PASS: actual file, one-tap swap, animation, bounds repair, provenance, fallback, scene mount')
