import fs from 'node:fs'

const city=fs.readFileSync(new URL('../src/runtime/StreetVerseCitySimulationRuntime.ts',import.meta.url),'utf8')
const holo=fs.readFileSync(new URL('../src/runtime/StreetVerseHoloCityBridgeRuntime.ts',import.meta.url),'utf8')
const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))

const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE CITY SIM CONTRACT FAIL: '+msg)}

for(const token of [
  "'circle-park'","'roosevelt-square'","'taylor-street'","'pilsen'",
  'population','jobs','businesses','housingUnits','roadCapacity','roadConnectivity',
  'power','safety','fireCoverage','health','education','parks','cleanliness',
  'traffic','landValue','happiness','housingDemand','businessDemand',
  'treasury','taxRate','revenue','upkeep','netFlow','unemployment',
]) must(city.includes(token),'city state missing '+token)

for(const token of [
  'applyStreetVerseCityInvestment',
  'applyStreetVerseCityIncident',
  'evolveStreetVerseCityMonth',
  'tryamm:city-simulation-state',
  'tryamm:city-simulation-pulse',
  'tryamm:city-simulation-opportunity',
  'tryamm:city-investment',
  'tryamm:city-incident',
  'tryamm:streetverse-gameplay-action',
  'tryamm:streetverse-mission-complete',
  'tryamm:streetverse-structure-fire-state',
  'tryamm:circle-park-safety-incident',
  'tryamm:business-passport-created',
]) must(city.includes(token),'city simulation bridge missing '+token)

for(const token of [
  'Traffic Relief',
  'Public Safety Response',
  'Fire & Rescue Coverage',
  'Housing Build',
  'Business Growth',
]) must(city.includes(token),'dynamic opportunity missing '+token)

for(const token of [
  'tryamm:holo-city-state',
  'tryamm:omnifabric-job-request',
  'holo-city-digital-twin',
  'tryamm:quantum-lens-state',
  'tryamm:holo-scan-request',
  'webxrReady',
]) must(holo.includes(token),'holo city bridge missing '+token)

must(mobile.includes("installStreetVerseCitySimulation"),'StreetVerse mobile does not install city simulation')
must(mobile.includes("installStreetVerseHoloCityBridge"),'StreetVerse mobile does not install holo city bridge')
must(mobile.includes("citySimulation.dispose()"),'StreetVerse city simulation cleanup missing')
must(mobile.includes("holoCityBridgeDispose()"),'Holo city bridge cleanup missing')
must(mobile.includes("citySimulationActive:true"),'world-ready evidence missing city simulation flag')
must(mobile.includes("holoCityDigitalTwin:true"),'world-ready evidence missing holo digital twin flag')
must(String(pkg.scripts?.build||'').includes('streetverse-city-simulation-contract.mjs'),'production build does not run city simulation contract')

console.log('STREETVERSE CITY SIMULATION + HOLO DIGITAL TWIN CONTRACT PASS')
