import fs from 'node:fs'
const vr=fs.readFileSync(new URL('../src/runtime/OmniverseAfterDarkVRLoveSceneRuntime.ts',import.meta.url),'utf8')
const studio=fs.readFileSync(new URL('../src/components/OmniverseAfterDarkRPOmnibar.tsx',import.meta.url),'utf8')
const after=fs.readFileSync(new URL('../src/components/StreetVerseAfterDarkAlpha.tsx',import.meta.url),'utf8')
for(const x of ['after-dark-vr-age-assurance-required','after-dark-vr-consent-required','fade-to-black if the story implies sexual intimacy','no explicit sex-act animation','VR_MR','TV_EPISODE'])if(!vr.includes(x))throw new Error('VR love runtime missing '+x)
for(const x of ['VR LOVE SCENE','tryamm:after-dark-vr-love-scene-request'])if(!studio.includes(x))throw new Error('After Dark studio missing '+x)
for(const x of ['installOmniverseAfterDarkVRLoveSceneRuntime','installStreetVerseQuestImmersiveRuntime'])if(!after.includes(x))throw new Error('After Dark lane missing '+x)
if(!after.includes('state.ageVerified&&state.consentAccepted'))throw new Error('After Dark studio lost adult/consent gate')
console.log('After Dark VR love scene contract: PASS')