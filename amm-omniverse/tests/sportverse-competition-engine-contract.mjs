import fs from 'node:fs'
const e=fs.readFileSync(new URL('../src/runtime/SportVerseCompetitionEngine.ts',import.meta.url),'utf8')
for(const x of ['training','tryamm:sportverse-competition-start-request','tryamm:sportverse-result-request','tryamm:sportverse-medal-validation-request','antiCheat:true','gold','silver','bronze','tryamm:reel-moment'])if(!e.includes(x))throw new Error('missing '+x)
console.log('SportVerse competition engine contract: PASS')
