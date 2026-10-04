import fs from 'node:fs'

const read=(path)=>fs.readFileSync(new URL(path,import.meta.url),'utf8')
const assert=(condition,message)=>{if(!condition)throw new Error(message)}
const includesAll=(source,needles,label)=>{
  for(const needle of needles)assert(source.includes(needle),`${label}: missing ${needle}`)
}

const circle=read('../src/data/CircleParkChicagoCompletion.ts')
includesAll(circle,[
  "Circle Park → Roosevelt → Taylor → Pilsen",
  "Roosevelt Road",
  "Taylor Street",
  "Pilsen Gateway",
  "oneHandAccessible:true",
  "totalMissionXP:750",
],'Circle Park completion')

const builder=read('../src/components/StreetVerseWestSideWorldBuilder.tsx')
includesAll(builder,[
  "STREETVERSE WORLD BUILDER",
  "Circle Park",
  "Taylor",
  "Pilsen",
  "UIC",
  "Malcolm X",
  "campuses",
  "ILLINOIS_CAMPUSVERSE_NETWORK",
  "UIC_ALL_CAMPUS_HUBS",
  "ILLINOIS • STATEWIDE EXPANSION",
  "ILLINOIS CAMPUSVERSE NETWORK",
],'West Side World Builder')

const greenville=read('../src/components/GreenvilleCampusVerseScene.tsx')
includesAll(greenville,[
  "CAMPUSVERSE • GREENVILLE UNIVERSITY",
  "JACOBIE CAMPUS CHAPTER",
  "GreenvilleWalkableCampus",
  "IllinoisCampusVerseNetwork",
  "tryamm:campusverse-mission-open",
  "tryamm:streetverse-mission-complete",
  "Greenville movement controls",
],'Greenville CampusVerse')

const greenvilleWorld=read('../src/components/GreenvilleWalkableCampus.tsx')
includesAll(greenvilleWorld,[
  "Student Union",
  "Hogue Lawn",
  "Burritt Hall",
  "Tower / Blankenship",
  "Scott Field",
  "onPointer",
],'Greenville walkable world')

const illinois=read('../src/data/campusVerseIllinoisUniversityNetwork.ts')
includesAll(illinois,[
  "University of Illinois Chicago",
  "University of Illinois Urbana-Champaign",
  "University of Illinois Springfield",
  "Greenville University",
  "Southern Illinois University Carbondale",
  "Southern Illinois University Edwardsville",
  "id:'u-of-i-system',nodes:['uic','uiuc','uis']",
  "id:'siu-system',nodes:['siuc','siue','siu-medicine-springfield','siue-dental-alton','siue-east-st-louis']",
  "id:'illinois-statewide-college-network',nodes:['uic','uiuc','uis','malcolm-x','siuc','siue','greenville']",
  "id:'jacobie-collegebook-network'",
],'Illinois CampusVerse brackets')

const playable=read('../src/components/IllinoisCampusVersePlayableScene.tsx')
includesAll(playable,[
  "uiuc:[",
  "uis:[",
  "siuc:[",
  "siue:[",
  "Campus movement controls",
  "tryamm:campusverse-checkpoint",
  "tryamm:streetverse-mission-complete",
],'Illinois playable campus scenes')

const gateway=read('../src/data/campusVerseUicGreenvilleBridge.ts')
includesAll(gateway,[
  "uic-greenville-collegebook",
  "Greenville University",
  "Jacobie Vision Cybersecurity Lab Book",
  "CrossVerse PK",
  "Middleverse Jobs",
],'UIC Greenville bridge')

const westEmergency=read('../tests/circle-park-west-side-jefferson-emergency-contract.mjs')
assert(westEmergency.length>100,'West Side / Jefferson emergency contract missing or empty')

console.log('West Side + Circle Park + Greenville + Illinois CampusVerse 11AM convergence contract: PASS')
