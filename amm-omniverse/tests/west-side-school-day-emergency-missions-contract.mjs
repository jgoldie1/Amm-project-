import fs from 'node:fs'
import assert from 'node:assert/strict'

const schoolLife=fs.readFileSync(new URL('../src/components/StreetVerseSchoolLifeWorld.tsx',import.meta.url),'utf8')
const director=fs.readFileSync(new URL('../src/components/StreetVerseWestSideMissionDirector.tsx',import.meta.url),'utf8')
const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const school=fs.readFileSync(new URL('../src/components/StreetVerseThomasJeffersonSchool.tsx',import.meta.url),'utf8')
const reel=fs.readFileSync(new URL('../src/runtime/StreetVerseReelCaptureRuntime.ts',import.meta.url),'utf8')
const overlays=fs.readFileSync(new URL('../src/components/StreetVerseFullWorldOverlays.tsx',import.meta.url),'utf8')

for(const token of [
  'streetverse-thomas-jefferson-school-life',
  'fictionalStudents:10',
  'staffNPCs:4',
  'noPrivateStudentRecords:true',
  'ARRIVAL','CLASS PERIOD 1','LIBRARY / LAB','LUNCH','GYM / ELECTIVES','DISMISSAL',
  'tryamm:school-bell'
])assert.ok(schoolLife.includes(token),'living school day missing '+token)

for(const token of [
  "type MissionId='school-day'|'fire-response'|'ems-crash'|'traffic-safety'",
  'Jefferson School Day','West Side Fire Response','Roosevelt Crash Response','Taylor/Roosevelt Traffic Safety',
  'tryamm:streetverse-rescue-incident-start',
  'tryamm:streetverse-emergency-response',
  'tryamm:west-side-mission-complete',
  'rewardStatus:\'pending\'',
  'verified:false',
  'ROUTE ME TO OBJECTIVE'
])assert.ok(director.includes(token),'West Side mission director missing '+token)

assert.ok(mobile.includes("['west-side','🏙 WEST SIDE JOBS']"),'mobile menu must expose West Side missions')
assert.ok(mobile.includes('tryamm:west-side-route-request'),'mobile world must support accessible objective routing')
assert.ok(mobile.includes('<StreetVerseSchoolLifeWorld/>'),'mobile world must mount living school day')
assert.ok(mobile.includes('<StreetVerseWestSideMissionDirector/>'),'mobile world must mount West Side mission director')
assert.ok(!mobile.includes('<StreetVerseEmergencyVehicles/>'),'old emergency picture-in-picture must not cover iPhone now real world fleet exists')

assert.ok(overlays.includes('<StreetVerseSchoolLifeWorld/>')&&overlays.includes('<StreetVerseWestSideMissionDirector/>'),'full world must mount school life and missions')

for(const token of ['active:privacyActive','reelCapture:!privacyActive','cameraCapture:!privacyActive'])assert.ok(school.includes(token),'school privacy zone must toggle capture authority '+token)
for(const token of ['privacyBlocked','school-privacy-zone','REEL CAPTURE OFF • privacy zone','REEL STOPPED • entered privacy zone'])assert.ok(reel.includes(token),'Reel privacy enforcement missing '+token)

console.log('WEST SIDE SCHOOL DAY + EMERGENCY MISSIONS + PRIVACY CONTRACT PASS')
