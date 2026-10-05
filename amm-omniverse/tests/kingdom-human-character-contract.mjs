import fs from 'node:fs'
const people=fs.readFileSync(new URL('../public/streetverse-kingdom/02-physics-traffic.js',import.meta.url),'utf8')
const spawn=fs.readFileSync(new URL('../public/streetverse-kingdom/03-spawn-phone.js',import.meta.url),'utf8')
const index=fs.readFileSync(new URL('../public/streetverse-kingdom/index.html',import.meta.url),'utf8')
for(const x of ['SphereGeometry','CylinderGeometry','headPivot','elbowL','kneeL','KINGDOM_HUMAN_ASSETS','attachProductionHuman'])if(!people.includes(x))throw new Error('Kingdom human character system missing '+x)
for(const x of ['attachProductionHuman(player','attachProductionHuman(p,k)'])if(!spawn.includes(x))throw new Error('Kingdom spawn missing human upgrade '+x)
if(!index.includes('GLTFLoader.js'))throw new Error('Kingdom GLTF loader missing')
if(/const pGeo = \{[\s\S]{0,400}BoxGeometry/.test(people))throw new Error('Legacy block-person geometry still present')
console.log('Kingdom human character regression contract: PASS')
