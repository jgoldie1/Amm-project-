import fs from 'node:fs'
import assert from 'node:assert/strict'

const school=fs.readFileSync(new URL('../src/components/StreetVerseThomasJeffersonSchool.tsx',import.meta.url),'utf8')
const fleet=fs.readFileSync(new URL('../src/components/StreetVerseEmergencyFleetWorld.tsx',import.meta.url),'utf8')
const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const overlays=fs.readFileSync(new URL('../src/components/StreetVerseFullWorldOverlays.tsx',import.meta.url),'utf8')
const roads=fs.readFileSync(new URL('../src/data/streetVerseNearWestRoadNetwork.ts',import.meta.url),'utf8')
const nearWest=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
const learning=fs.readFileSync(new URL('../src/components/StreetVerseSchoolLearningHUD.tsx',import.meta.url),'utf8')

for(const token of [
 'Thomas Jefferson School • Legacy Campus',
 '1522 W Fillmore St • Near West Side',
 "id:'classroom-101'","id:'classroom-102'","id:'classroom-201'",
 "id:'science-lab'","id:'library'","id:'computer-lab'","id:'music-art'","id:'cafeteria'",
 "id:'gym'","Gymnasium + Basketball Court","id:'locker-shower'","id:'nurse-office'",
 'privacySafeLockerShower:true','exactFloorplan:false','ELEVATOR • ACCESSIBLE'
])assert.ok(school.includes(token),'school campus missing '+token)

assert.ok(school.includes("tryamm:basketball-open"),'school gym must launch basketball activity')
assert.ok(school.includes("cameraCapture:false"),'locker/shower area must disable capture for privacy')
assert.ok(school.includes("tryamm:school-learning-activity"),'classrooms must launch learning activities')
for(const token of ['Reading Lab','Math Lab','Science Lab','Computer Lab','Chicago History Lab','Music + Art Studio','streetverse-school-class-complete'])assert.ok(learning.includes(token),'usable classroom HUD missing '+token)
assert.ok(school.includes("subscribeStreetVerseScene"),'school must be part of the live world scene')

for(const token of [
 'streetverse-world-police-car','streetverse-world-ambulance','streetverse-world-fire-truck',
 "kind='police'","kind='ambulance'","kind='fire'",
 'emergencyMissionVehicle=true','ladderRigTarget=true',
 'tryamm:streetverse-emergency-response','tryamm:streetverse-structure-fire-state',
 'tryamm:streetverse-emergency-unit-arrived'
])assert.ok(fleet.includes(token),'emergency world fleet missing '+token)

assert.ok(mobile.includes('registerStreetVerseScene'),'mobile world must expose its real Three.js scene to world layers')
assert.ok(mobile.includes('<StreetVerseEmergencyFleetWorld/>'),'mobile StreetVerse must mount actual emergency fleet')
assert.ok(mobile.includes('<StreetVerseThomasJeffersonSchool/>'),'mobile StreetVerse must mount the school campus')
assert.ok(mobile.includes("['school','🏫 SCHOOL']")&&mobile.includes("tryamm:school-route-request"),'phone quick menu must provide one-tap school routing')
assert.ok(mobile.includes('externalCollisionBoxes'),'school walls must participate in mobile player collision')
assert.ok(overlays.includes('<StreetVerseEmergencyFleetWorld/>')&&overlays.includes('<StreetVerseThomasJeffersonSchool/>'),'full world overlays must include school and emergency fleet')

for(const token of ['fillmore-jefferson','circle-park-ashland','Fillmore / Near West connector','Circle Park / Roosevelt connector','West Side neighborhood connector'])
 assert.ok(roads.includes(token),'Near West road expansion missing '+token)
assert.ok(nearWest.includes('JeffersonLegacyCampusMesh')&&nearWest.includes('CircleParkWestSideMarker'),'Near West 3D must visibly anchor Jefferson and Circle Park')

console.log('CIRCLE PARK + WEST SIDE + JEFFERSON SCHOOL + EMERGENCY FLEET CONTRACT PASS')
