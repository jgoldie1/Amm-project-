import fs from 'node:fs'

const profile=fs.readFileSync(new URL('../src/data/streetVerseBJStubbsCharacter.ts',import.meta.url),'utf8')
const factory=fs.readFileSync(new URL('../src/data/streetVerseCharacterFactory.ts',import.meta.url),'utf8')
const foundry=fs.readFileSync(new URL('../scripts/tryamm-native-asset-foundry.mjs',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')

for(const x of [
 "currentProceduralVersion:'bj-realism-v4'",
 "mobileFallbackVersion:'bj-v4-mobile'",
 "conversationRealism:true",
 "outfitIdentitySeparated:true",
])if(!profile.includes(x))throw new Error('BJ V4 profile missing '+x)

for(const x of [
 "assetVersion:'bj-realism-v4'",
 "likenessState:'REFERENCE_LOCKED_PROCEDURAL_V4_VIDEO'",
 "handDetailPass:'five-finger-v1'",
 "clothingFitPass:'current-tee-v2'",
 "locDetailPass:'long-locs-v2'",
 "beardBlendPass:'salt-pepper-v2'",
 "bj-v4-tee-neckline",
 "bj-v4-finger",
 "bj-v4-thumb",
 "bj-v4-shoulder-loc",
 "bj-under-eye-left",
 "bj-beard-blend-left",
])if(!foundry.includes(x))throw new Error('BJ V4 foundry missing '+x)

for(const x of [
 "templateVersion:'bj-realism-v4'",
 "photoMatchCanReplaceHeadWithoutResettingGameplay:true",
])if(!factory.includes(x))throw new Error('BJ V4 factory missing '+x)

for(const x of [
 "bjCharacterRealismV4:true",
 "bjFallbackRealismV4:true",
 "bjConversationFaceMotion:true",
 "bjConversationCamera:true",
 "bjEyeFocus:true",
 "tryamm:bj-v4-conversation-state",
 "heroConversationUntil",
 "fallbackRealism:'bj-v4-mobile'",
 "hero-loc",
 "hero-beard-gray",
])if(!world.includes(x))throw new Error('BJ V4 mobile runtime missing '+x)

if(world.includes("outfitMat=mat(0x34c8eb)"))throw new Error('legacy blue BJ fallback still present')
console.log('BJ Stubbs V4 realism + conversation + fallback contract: PASS')
