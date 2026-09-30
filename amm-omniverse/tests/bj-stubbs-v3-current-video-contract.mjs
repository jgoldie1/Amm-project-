import fs from 'node:fs'

const profile=fs.readFileSync(new URL('../src/data/streetVerseBJStubbsCharacter.ts',import.meta.url),'utf8')
const factory=fs.readFileSync(new URL('../src/data/streetVerseCharacterFactory.ts',import.meta.url),'utf8')
const foundry=fs.readFileSync(new URL('../scripts/tryamm-native-asset-foundry.mjs',import.meta.url),'utf8')

for(const x of [
 "source:'user-authorized current-era walking video'",
 "silhouette:'lean mature Black man with long pulled-back locs and salt-and-pepper beard'",
 "grayHairAmount:.48",
 "shoulderScale:1.015",
 "torsoScale:.965",
 "headScale:[.93,1.07,.90]",
 "fitted black ONLY YAHAVAH CAN JUDGE ME tee",
 "excludedFromDefault:['beanie','eyeglasses','bulky tactical backpack','oversized tactical jacket']",
])if(!profile.includes(x))throw new Error('BJ current reference lock missing: '+x)

for(const x of [
 "assetVersion:'bj-realism-v3'",
 "likenessState:'REFERENCE_LOCKED_PROCEDURAL_V3_VIDEO'",
 "hairstyle:'long-pulled-back-locs'",
 "facialHair:'gray-forward-salt-and-pepper-beard'",
 "wardrobe:'current-video-black-tee-small-gold-pendant'",
 "referenceSource:'user-authorized-current-walking-video'",
 "tacticalOutfitDefault:false",
 "bj-current-tee",
 "bj-gray-chin-panel",
 "bj-gray-beard-side-left",
 "outfitSlot:'tactical-backpack'",
 "equippedByDefault:false",
])if(!foundry.includes(x))throw new Error('BJ V3 foundry missing: '+x)

if(!factory.includes("templateVersion:'bj-realism-v3'"))throw new Error('Character Factory did not promote BJ V3')
console.log('BJ V3 current-video realism contract: PASS')
