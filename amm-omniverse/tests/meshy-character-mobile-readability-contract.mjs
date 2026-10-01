import fs from 'node:fs'

const slots=fs.readFileSync(new URL('../src/data/streetVerseMeshyCharacterSlots.ts',import.meta.url),'utf8')
const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyCharacterRuntime.ts',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('MESHY + MOBILE READABILITY CONTRACT FAIL: '+msg)}

for(const name of [
 'SV_NPC_BLACK_MAN_YOUNGADULT_01.glb',
 'SV_NPC_BLACK_WOMAN_ADULT_01.glb',
 'SV_NPC_WHITE_WOMAN_YOUNGADULT_01.glb',
 'SV_NPC_LATINO_MAN_ADULT_01.glb',
 'SV_NPC_EAST_ASIAN_YOUNGADULT_01.glb',
 'SV_NPC_SOUTH_ASIAN_ADULT_01.glb',
 'SV_NPC_MENA_ADULT_01.glb',
 'SV_NPC_MULTIRACIAL_YOUNGADULT_01.glb',
 'SV_NPC_CHILD_01.glb',
 'SV_NPC_TEEN_01.glb',
])must(slots.includes(name),'character slot missing '+name)

must(slots.includes("childAndTeenAdultLaneBlocked:true"),'child/teen adult-lane block missing')
must(slots.includes("childAndTeenAfterDarkBlocked:true"),'child/teen After Dark block missing')
must(runtime.includes("method:'HEAD'"),'Meshy loader must verify optional asset exists before loading')
must(runtime.includes('normalizeStreetVerseHumanHeight(object,slot.targetHeightMeters)'),'Meshy loader must normalize human height')
must(runtime.includes("tryamm:meshy-character-ready"),'Meshy ready event missing')
must(runtime.includes("tryamm:meshy-character-fallback"),'Meshy fallback event missing')

must(world.includes("nearFadeDistance:10"),'world labels must advertise near-camera fade behavior')
must(world.includes("mobileWorldLabels.forEach"),'world labels must fade near the camera')
must(world.includes("weatherStatus.includes('UNAVAILABLE')?'☁ WEATHER'"),'unavailable weather must collapse to compact badge')
must(world.includes("replace('CHICAGO ALIVE V6','CHICAGO')"),'city status must stay compact on iPhone')

console.log('MESHY + MOBILE READABILITY CONTRACT PASS')
