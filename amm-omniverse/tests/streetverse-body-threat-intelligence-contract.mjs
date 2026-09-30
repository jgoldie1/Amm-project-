import fs from 'node:fs'

const threatData=fs.readFileSync(new URL('../src/data/streetVerseThreatResponse.ts',import.meta.url),'utf8')
const threatRuntime=fs.readFileSync(new URL('../src/runtime/StreetVerseThreatResponseRuntime.ts',import.meta.url),'utf8')
const bodyData=fs.readFileSync(new URL('../src/data/streetVerseBodyNeeds.ts',import.meta.url),'utf8')
const bodyRuntime=fs.readFileSync(new URL('../src/runtime/StreetVerseBodyNeedsRuntime.ts',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')

for(const x of [
 "civiliansDoNotAutoEngage:true",
 "medicalAidAfterImmediateDanger:true",
 "trainedCharactersPrioritizeCivilianSafety:true",
 "defensiveForceRequiresMissionAuthorization:true",
 "noAutomaticPursuit:true",
 "role:'security'",
])if(!threatData.includes(x))throw new Error('Threat safety rule missing '+x)

for(const x of [
 "'gunfire'","'assault'","'robbery'",
 "'startle'","'seek-safety'","'flee'","'freeze'","'direct-civilians'","'render-first-aid'","'secure-scene'","'preserve-evidence'",
 "tryamm:streetverse-threat-event",
 "tryamm:streetverse-threat-action",
 "requestEmergencyHelp",
 "defensiveOnly:true",
])if(!threatRuntime.includes(x))throw new Error('Threat response runtime missing '+x)

for(const x of ["'hunger'","'thirst'","'fatigue'","'pain'","'stress'","'temperature'","'injury'","'stamina'"])if(!bodyData.includes(x))throw new Error('Body need missing '+x)

for(const x of [
 "movementScale",
 "sprintAllowed",
 "tryamm:pocket-dimension-context",
 "first-aid",
 "tryamm:character-body-state-change-request",
 "serverValidate:true",
])if(!bodyRuntime.includes(x))throw new Error('Body needs runtime missing '+x)

for(const x of [
 "installStreetVerseBodyNeedsRuntime",
 "installStreetVerseThreatResponseRuntime",
 "heroBodyMovementScale",
 "tryamm:streetverse-threat-action",
 "bjThreatResponseAI:true",
])if(!world.includes(x))throw new Error('StreetVerse body/threat mount missing '+x)

console.log('StreetVerse body needs + crime/shooting threat-response contract: PASS')
