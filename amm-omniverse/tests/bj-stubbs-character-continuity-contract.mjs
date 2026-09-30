import fs from 'node:fs'
const w=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const r=fs.readFileSync(new URL('../src/data/streetVerseNamedCharacterRegistry.ts',import.meta.url),'utf8')
const b=fs.readFileSync(new URL('../src/data/streetVerseBJStubbsCharacter.ts',import.meta.url),'utf8')
for(const x of ['STREETVERSE_HERO_CHARACTER_ID','announceStreetVerseCharacterReady','characterId:STREETVERSE_HERO_CHARACTER_ID',"displayName:'BJ Stubbs'","identityContinuityKey:STREETVERSE_HERO_CHARACTER_ID","namedHeroCharacter:'BJ Stubbs'"])if(!w.includes(x))throw new Error('missing BJ mobile runtime binding '+x)
for(const x of ["'bj-stubbs':BJ_STUBBS_CHARACTER","tryamm:streetverse-character-ready",'identityContinuityKey:character.id'])if(!r.includes(x))throw new Error('missing named-character registry '+x)
for(const x of ["id:'bj-stubbs'","status:'REFERENCE_LOCKED'","photoMatchedHeadRequiredForCertifiedLikeness:true"])if(!b.includes(x))throw new Error('missing BJ identity passport '+x)
console.log('BJ Stubbs named-character continuity contract: PASS')
