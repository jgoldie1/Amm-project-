import fs from 'node:fs'

const factoryLib=fs.readFileSync(new URL('../api/_lib/meshy-factory.js',import.meta.url),'utf8')
const factoryRoute=fs.readFileSync(new URL('../api/meshy/factory.js',import.meta.url),'utf8')
const tasks=fs.readFileSync(new URL('../api/meshy/tasks.js',import.meta.url),'utf8')
const intent=fs.readFileSync(new URL('../api/meshy/upload-intent.js',import.meta.url),'utf8')
const finalize=fs.readFileSync(new URL('../api/meshy/upload-finalize.js',import.meta.url),'utf8')
const panel=fs.readFileSync(new URL('../src/components/MeshyFactoryControlPanel.tsx',import.meta.url),'utf8')
const manifest=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyAssetManifest.ts',import.meta.url),'utf8')
const hero=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts',import.meta.url),'utf8')

const must=(ok,msg)=>{if(!ok)throw new Error('MESHY END-TO-END IMPORT CONTRACT FAIL: '+msg)}

must(factoryLib.includes('export async function importExistingMeshyTask'),'existing Meshy task import missing')
must(factoryLib.includes('reusedGenerationCredits:true'),'existing generation credits must be reused')
must(factoryLib.includes("stage:'rig-submitting'"),'existing generation must enter rig pipeline')
must(factoryRoute.includes("action==='import-existing'"),'factory route import action missing')
must(factoryRoute.includes('importExistingMeshyTask'),'factory route must call import helper')
must(tasks.includes("'text-to-3d'"),'recent task listing must include text-to-3D')

must(intent.includes('createSignedUploadUrl'),'signed direct upload intent missing')
must(intent.includes('requireFactoryAuthority(user)'),'manual upload must require factory authority')
must(intent.includes('MAX_GLB_BYTES'),'manual upload must enforce GLB size limit')
must(intent.includes('keyExposed:false'),'upload intent must not expose secrets')
must(finalize.includes('downloadGlb(url)'),'finalize must validate actual GLB bytes')
must(finalize.includes("stage:'ready'"),'validated manual upload must enter ready manifest state')
must(finalize.includes('generationCreditsSpent:0'),'manual downloaded asset must not spend generation credits')
must(finalize.includes('manualUpload:true'),'manual upload evidence missing')

must(panel.includes('REUSE EXISTING MESHY MODELS'),'founder import UI missing')
must(panel.includes("action:'import-existing'"),'founder UI must import an existing task')
must(panel.includes('UPLOAD DOWNLOADED MESHY GLB'),'iPhone GLB upload UI missing')
must(panel.includes('uploadToSignedUrl'),'browser must upload using signed token')
must(panel.includes("accept=\".glb,model/gltf-binary,application/octet-stream\""),'GLB file picker restriction missing')

must(manifest.includes('/api/meshy/asset-manifest'),'runtime manifest bridge missing')
must(hero.includes("resolvePublishedMeshyAsset('sv-bj-stubbs-v6'"),'BJ runtime must resolve durable Meshy manifest asset')
must(hero.includes("const candidateUrls=[BJ_MESHY_V6_ASSET.premiumUrl,published?.url,BJ_MESHY_V6_ASSET.productionUrl,BJ_MESHY_V6_ASSET.legacyProductionUrl,BJ_MESHY_V6_ASSET.url]"),'BJ must prioritize the owned V15 model over stale published versions, with Meshy, V12, V7 and V6 fallbacks')
must(hero.includes('publishedOverrideActive:externalPublished'),'BJ must report when the durable published Meshy fallback actually loads')
must(hero.includes('modelVersion:loadedModelVersion'),'BJ must report the model that actually loaded, rather than assume an asset version')
must(hero.includes("premiumUrl:'/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V15.glb'"),'BJ runtime must expose distinct owned V15 premium fallback')
must(hero.includes("productionUrl:'/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V12.glb'"),'BJ runtime must expose the owned V12 production fallback')
must(hero.includes("legacyProductionUrl:'/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V7.glb'"),'BJ runtime must preserve the owned V7 compatibility fallback')
must(hero.includes("url:'/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V6.glb'"),'BJ runtime must preserve the V6 compatibility fallback')

console.log('MESHY END-TO-END IMPORT CONTRACT PASS: API import + iPhone upload + manifest + owned V15 -> published Meshy -> V12 -> V7 -> V6 fallback order')
