import fs from 'node:fs'
import assert from 'node:assert/strict'
import path from 'node:path'

const root=process.cwd()
const read=p=>fs.readFileSync(path.join(root,p),'utf8')
const clip=read('src/holo/holoClip2.ts')
const app=read('src/App.tsx')
const main=read('src/main.tsx')
const social=read('src/components/HoloSocialEngine.tsx')
const carousel=read('src/components/HoloClipScreenLayer.tsx')
const launcher=read('src/components/HoloExperienceLauncher.tsx')
const faith=read('src/components/EthiopianBibleMetaverse.tsx')
const reader=read('src/components/FaithScriptureReader.tsx')
const holobook=read('src/components/FaithHoloBook.tsx')
const study=read('src/data/FaithVerseStudyLibrary.ts')
const holoLab=read('src/components/HoloLabGateway.tsx')
const ministry=read('src/components/ServantsOfChristMinistry.tsx')
const timeMachine=read('src/runtime/StreetVerseChicagoTimeMachineMissionsRuntime.ts')
const street=read('src/components/StreetVerseMobileWorld.tsx')
const shell=read('src/components/StreetVerseMobileGameShell.tsx')
const characters=read('src/components/MeetTheStubbsWorldDistrict.tsx')

const entries=[...clip.matchAll(/\{id:'([^']+)',label:'([^']+)',route:'([^']+)',status:'([^']+)',purpose:'([^']+)'\}/g)]
  .map(m=>({id:m[1],label:m[2],route:m[3],status:m[4],purpose:m[5]}))

assert.ok(entries.length>=23,`Verse directory shrank unexpectedly: ${entries.length}`)
assert.equal(new Set(entries.map(x=>x.id)).size,entries.length,'Verse IDs must be unique')
assert.equal(new Set(entries.map(x=>x.route)).size,entries.length,'Verse routes must be unique')
const routeOwners=app+'\n'+main
for(const verse of entries){
  assert.ok(verse.purpose.trim().length>=18,`${verse.id} purpose is too thin`)
  assert.match(verse.route,/^\//,`${verse.id} must have an absolute app route`)
  if(verse.status!=='PLANNED'){
    assert.ok(routeOwners.includes(verse.route),`${verse.id} is ${verse.status} but its route ${verse.route} is not owned by App/main`)
  }
}
const live=entries.filter(x=>x.status==='LIVE').map(x=>x.id)
assert.ok(live.includes('STREETVERSE')&&live.includes('OMNIVERSE'),'Core LIVE verses disappeared')

assert.match(social,/TRYAMM_VERSE_DIRECTORY\.map/,'Verse directory must render from the canonical registry')
assert.match(social,/openVerse\(verse\.route,verse\.label\)/,'Every rendered Verse card must have a launch CTA')
assert.match(carousel,/onLaunch\?\.\(panel\)/,'Focused Holo carousel card must execute its launch CTA')
for(const panel of ['FAITHVERSE','CHARACTERS','MISSIONS','LIVE','PK','REELS','STREETVERSE_WORLD','VERSE_DIRECTORY','TIME_MACHINE','WORLD_DATA','CREATOR_COMMERCE','BENNY_HOLOGPT','RELEASE_CENTER']){
  assert.ok(clip.includes(`'${panel}'`),`Carousel panel missing: ${panel}`)
  assert.ok(launcher.includes(panel),`Carousel launcher has no handler token for: ${panel}`)
}

for(const faithRoute of ["'/ethiopian-bible'","'/ethiopian-bible/'","'/faithverse'","'/faithverse/'"]){
  assert.ok(main.includes(faithRoute),'FaithVerse route must resolve directly to Ethiopian Bible: '+faithRoute)
}
assert.ok(main.includes('else if(isEthiopianBible)routeContent=<Suspense fallback={routeFallback}><EthiopianBibleMetaverse /></Suspense>'),'FaithVerse route owner must render Ethiopian Bible Metaverse')
for(const token of ['FaithScriptureReader','FaithHoloBook','FaithChronoLauncher','SERVANTS OF CHRIST','STRONG’S CONCORDANCE','HEBREW SCHOOL']){
  assert.ok(faith.includes(token),`FaithVerse surface missing ${token}`)
}
for(const token of ['LOAD CHAPTER','PREVIOUS','NEXT','READ ALOUD','bible-api.com']){
  assert.ok(reader.includes(token),`FaithVerse reader CTA/data path missing ${token}`)
}
for(const token of ['ETHIOPIAN CANON • 81','TRYAMM CURRICULUM • 88',"STRONG'S",'HEBREW / PALEO SCRIPT','OPEN HOLO LAB','OPEN SERVANTS OF CHRIST']){
  assert.ok(holobook.includes(token),`Faith HoloBook task missing ${token}`)
}
for(const token of ['ETHIOPIAN_ORTHODOX_CANON_81','total:81','TRYAMM_88_BOOK_CURRICULUM','PALEO_HEBREW_ALPHABET','STRONGS_STUDY']){
  assert.ok(study.includes(token),`Faith study library missing ${token}`)
}
assert.ok(holoLab.includes("route':'/ethiopian-bible'")||holoLab.includes("route:'/ethiopian-bible'"),'Holo Lab must open Faith Chrono/Bible')
assert.ok(ministry.includes('OPEN BIBLE STUDY'),'Servants of Christ must have a direct Bible-study CTA')

for(const token of ['Chicago Time Machine','ENTER ERA','COMPLETE TIME OBJECTIVE','tryamm:time-machine-enter','tryamm:mission-completed']){
  assert.ok(timeMachine.includes(token),`Time Machine task path missing ${token}`)
}

for(const token of ['StreetVerse always visible joystick','Drive nearest StreetVerse vehicle','DRIVING • USE JOYSTICK','REEL']){
  assert.ok(shell.includes(token),`StreetVerse phone task missing ${token}`)
}
for(const token of ['streetverse-circle-park-reality-layer-v2',"vehicleTraversal:'road-aware-v2'","circleParkRealityLayer:true","nativeHumanoidRigAnimation:true"]){
  assert.ok(street.includes(token),`StreetVerse visible/runtime completion marker missing ${token}`)
}
for(const token of ['nativeCharacterVisualAuthority:true','nativeCharacterAnimationAuthority:true']){
  assert.ok(characters.includes(token),`Meet the Stubbs character authority missing ${token}`)
}

const sourcePending=(study.match(/source-not-yet-assigned/g)||[]).length
const building=entries.filter(x=>x.status==='BUILDING').length
const planned=entries.filter(x=>x.status==='PLANNED').length
console.log(JSON.stringify({
  verseCount:entries.length,
  live:entries.filter(x=>x.status==='LIVE').length,
  building,
  planned,
  faithOfficialCanonBooks:81,
  tryamm88SourcePendingSlots:sourcePending,
  criticalTasks:{
    carouselCTA:'PASS',
    faithReader:'PASS',
    faithHoloBook:'PASS',
    timeMachine:'PASS',
    streetverseMobile:'PASS',
    circlePark:'PASS',
    characterAuthority:'PASS'
  }
},null,2))
console.log('TRYAMM verse completion audit: PASS')
