import fs from 'node:fs'
const data=fs.readFileSync(new URL('../src/data/campusVerseIllinoisUniversityNetwork.ts',import.meta.url),'utf8')
for(const x of ['University of Illinois Chicago','University of Illinois Urbana-Champaign','Southern Illinois University Carbondale','Southern Illinois University Edwardsville','Columbia College Chicago','Loyola University Chicago','Northwestern University','Greenville University'])if(!data.includes(x))throw new Error('missing '+x)
const scene=fs.readFileSync(new URL('../src/components/GreenvilleCampusVerseScene.tsx',import.meta.url),'utf8')
if(!scene.includes('IllinoisCampusVerseNetwork'))throw new Error('network not mounted')
console.log('Illinois CampusVerse network contract: PASS')
