import fs from 'node:fs'
const catalog=fs.readFileSync(new URL('../src/data/StreetVerse2027FleetCatalog.ts',import.meta.url),'utf8')
const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerse2027FleetRuntime.ts',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE 2027 FLEET CONTRACT FAIL: '+msg)}
for(const type of ['Micro Hatch','Midsize Sedan','Three-Row SUV','Electric Pickup','Cargo Van','Super Coupe','Sport Motorcycle','Electric City Bus','Sanitation Truck','Police Cruiser','News Helicopter','Light Utility Plane','eVTOL Air Taxi','Flying Coupe'])must(catalog.includes(type),'missing fleet segment '+type)
must(catalog.includes("'experimental-air':.15"),'flying vehicles must stay a small percentage')
must(catalog.includes('motorcycle:5'),'motorcycles must remain a minority of ambient traffic')
must(catalog.includes('realBrandTradeDressCopied:false'),'original-design/trade-dress boundary missing')
must(runtime.includes('buildChicago2027Fleet'),'Chicago fleet generator missing')
must(runtime.includes("domain==='air'||domain==='experimental-air'"),'aircraft altitude separation missing')
console.log('STREETVERSE 2027 FLEET CONTRACT PASS: broad original 2027 road fleet + minority motorcycles + rare aircraft/flying cars')
