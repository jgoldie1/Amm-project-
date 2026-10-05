import fs from 'node:fs'

const slots=fs.readFileSync(new URL('../src/data/streetVerseMeshyCharacterSlots.ts',import.meta.url),'utf8')
const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const forge=fs.readFileSync(new URL('../scripts/forge-streetverse-residents-wave2.mjs',import.meta.url),'utf8')
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))
const meshy=fs.readFileSync(new URL('../api/_lib/meshy.js',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('MESHY DURABLE WAVE2 CONTRACT FAIL: '+msg)}

must(slots.includes("STREETVERSE_MESHY_DURABLE_WAVE2_BASE"),'durable Wave 2 storage base missing')
must(slots.includes("characters/static-wave2"),'Wave 2 storage path missing')
must(slots.includes("'sv-black-man-youngadult-01':`${STREETVERSE_MESHY_DURABLE_WAVE2_BASE}/SV_NPC_BLACK_MAN_YOUNGADULT_01.glb`"),'young-adult man durable override missing')
must(slots.includes("'sv-black-woman-youngadult-01':`${STREETVERSE_MESHY_DURABLE_WAVE2_BASE}/SV_NPC_BLACK_WOMAN_YOUNGADULT_01.glb`"),'young-adult woman durable override missing')
must(mobile.includes("'sv-black-man-youngadult-01','sv-black-woman-youngadult-01','sv-black-man-adult-01','sv-black-woman-adult-01'"),'Circle Park must request all four Meshy residents')
must(forge.includes("TRIGGER='streetverse-wave2-20261005'"),'Wave 2 must remain one-time gated')
must(forge.includes("preserve-streetverse-wave2"),'Wave 2 persistence endpoint missing')
must(forge.includes("characters/static-wave2/"),'Wave 2 forge must persist to durable storage')
must(!forge.includes("ai_model:'meshy-6'"),'Wave 2 must not force Meshy 6 with Meshy-7-only geometry options')
must(meshy.includes("if(model.startsWith('meshy-7'))"),'Meshy helper must gate geometry_resolution by model family')
must(meshy.includes('delete body.geometry_resolution'),'Meshy helper must remove incompatible geometry_resolution for non-Meshy-7 text models')
must(String(pkg.scripts?.build||'').includes('meshy:forge:wave2'),'production build must invoke Wave 2 gate')
must(String(pkg.scripts?.['meshy:forge:wave2']||'').includes('forge-streetverse-residents-wave2.mjs'),'Wave 2 npm script missing')

console.log('MESHY DURABLE WAVE2 CONTRACT PASS')
