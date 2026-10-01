import fs from 'node:fs'
const w=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const i=fs.readFileSync(new URL('../src/runtime/StreetVerseChicagoIdentityInteractionRuntime.ts',import.meta.url),'utf8')
for(const x of ['circle-park-swimming-pool','circle-park-tennis-court','circle-park-grill','circleParkActivityCounts','tryamm:circle-park-activity-progress','tryamm:reel-moment','circleParkAmenityCount:11'])if(!w.includes(x))throw new Error('missing '+x)
for(const x of ['circle-park-basketball','PLAY BALL','BARBECUE','SWIM','PLAY TENNIS','HANG OUT'])if(!i.includes(x))throw new Error('missing '+x)
console.log('Circle Park recreation activity contract: PASS')
