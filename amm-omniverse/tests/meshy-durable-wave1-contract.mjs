import fs from 'node:fs'

const slots=fs.readFileSync(new URL('../src/data/streetVerseMeshyCharacterSlots.ts',import.meta.url),'utf8')
const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyCharacterRuntime.ts',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('MESHY DURABLE WAVE1 CONTRACT FAIL: '+msg)}

must(slots.includes("STREETVERSE_MESHY_DURABLE_WAVE1_BASE"),'durable Wave 1 storage base missing')
must(slots.includes("'sv-black-man-adult-01'"),'male adult durable override missing')
must(slots.includes("'sv-black-woman-adult-01'"),'female adult durable override missing')
must(slots.includes('streetverse-assets/characters/static-wave1'),'Wave 1 must resolve from durable StreetVerse storage')
must(slots.includes('STREETVERSE_MESHY_DURABLE_OVERRIDES[slot.id]'),'runtime URL resolver must prefer durable overrides')
must(runtime.includes('staticMeshyReady'),'character runtime must probe resolved static/durable Meshy URL before native fallback')
must(runtime.includes("`${staticStem}.walk.glb`"),'durable/static Meshy walk companion lookup missing')
must(runtime.includes("`${staticStem}.run.glb`"),'durable/static Meshy run companion lookup missing')

console.log('MESHY DURABLE WAVE1 CONTRACT PASS')
