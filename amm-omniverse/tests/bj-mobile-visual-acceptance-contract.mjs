import fs from 'node:fs'

const foundry=fs.readFileSync(new URL('../scripts/tryamm-native-asset-foundry.mjs',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const photo=fs.readFileSync(new URL('../src/runtime/StreetVerseBJPhotoMatchRuntime.ts',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('BJ MOBILE VISUAL ACCEPTANCE CONTRACT FAIL: '+msg)}

must(foundry.includes("new THREE.CapsuleGeometry(.315,.50,8,20)"),'BJ fitted tee must be a rounded shell, not a rectangular box')
must(foundry.includes("bodySilhouette:'rounded-fitted-v5'"),'BJ rounded body silhouette marker missing')
must(foundry.includes("characterRealism:'bj-v5-natural-upper-arm'"),'BJ upper-arm smoothing missing')
must(foundry.includes("characterRealism:'bj-v5-natural-forearm'"),'BJ forearm smoothing missing')
must(foundry.includes("characterRealism:'bj-v5-tapered-waist'"),'BJ tapered waist missing')
must(!foundry.includes("const currentTee=addBox(spine,'bj-current-tee'"),'legacy box-shaped BJ shirt must not return')

must(world.includes("depthTest:true,depthWrite:false,opacity:.90"),'world labels must respect scene depth')
must(world.includes("THREE.MathUtils.clamp(4.8+text.length*.12,5.4,7.4)"),'world labels must remain compact on iPhone')
must(world.includes("seniorCommonsLabel.scale.set(6.8,1.25,1)"),'Senior Commons label must stay mobile-sized')
must(world.includes("addressLabel.scale.set(6.4,1.15,1)"),'Circle Park address label must stay mobile-sized')

must(photo.includes("version:'bj-approved-reference-shell-v2-front'"),'front-facing BJ photo-head version missing')
must(photo.includes("frontFacingReference:true"),'photo-head evidence must record front-facing authority')
must(photo.includes("emissiveIntensity:.10"),'photo-head must remain readable under mobile scene lighting')
must(photo.includes('featherPhotoTexture'),'approved photo must use feathered edge blending')
must(photo.includes('featheredPhotoBlend:true'),'photo-head readiness evidence must report feathered blend')

console.log('BJ MOBILE VISUAL ACCEPTANCE CONTRACT PASS: front-facing head + rounded body + non-blocking labels')
