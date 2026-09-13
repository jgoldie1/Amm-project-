const fs=require('fs')
const path=require('path')
const root=path.resolve(__dirname,'..')
const read=p=>fs.readFileSync(path.join(root,p),'utf8')

const config=read('amm-omniverse/src/config/streetverseCommunitySlices.ts')
const mobile=read('amm-omniverse/src/components/StreetVerseHydeParkMobileWorld.tsx')
const safe=read('amm-omniverse/src/components/StreetVerseSafeWorld.tsx')

for(const needle of [
 "communityAreaNumber:'41'",
 "name:'Hyde Park'",
 "status:'BUILDING'",
 '53rd Street Creator District',
 '53rd Street Business District',
 'Lake Park & 53rd Transit Stop',
 'Hyde Park Lakefront Creator Stage',
]) if(!config.includes(needle))throw new Error(`Missing Hyde Park slice contract: ${needle}`)

for(const needle of [
 'STREETVERSE • HYDE PARK',
 'COMMUNITY AREA 41',
 'tryamm:streetverse-checkpoint',
 'tryamm:streetverse-mission-complete',
 'district-01-mobile-safe',
 'tryamm:open-reel-creator',
]) if(!mobile.includes(needle))throw new Error(`Missing Hyde Park mobile contract: ${needle}`)

if(!safe.includes("slice?.communityAreaNumber==='41'"))throw new Error('Safe world does not route community area 41')
if(!safe.includes('StreetVerseHydeParkMobileWorld'))throw new Error('Hyde Park mobile slice is not mounted in safe world')
console.log('Hyde Park geographic mobile slice smoke: OK')
