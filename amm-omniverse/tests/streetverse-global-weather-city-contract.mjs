import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {STREETVERSE_WEATHER_LOCATIONS,publicStreetVerseWeatherLocations} from '../api/_lib/streetverse-weather-locations.js'

const publicLocations=publicStreetVerseWeatherLocations()
const cities=publicLocations.filter(item=>item.kind==='city')
assert.ok(cities.length>=30,'expected broad approved global city catalog')
for(const id of ['chicago','lagos','abuja','newYork','london','tokyo','sydney','toronto','saoPaulo','dubai','nairobi','singapore']){
  assert.ok(publicLocations.some(item=>item.id===id),'missing approved weather destination: '+id)
}
assert.equal(publicLocations.some(item=>'lat' in item||'lon' in item),false,'public city catalog must not expose coordinates')
assert.equal(STREETVERSE_WEATHER_LOCATIONS.lagos.country,'Nigeria')
assert.equal(STREETVERSE_WEATHER_LOCATIONS.tokyo.continent,'Asia')
assert.equal(STREETVERSE_WEATHER_LOCATIONS.sydney.continent,'Oceania')

const sync=fs.readFileSync(path.resolve('src/components/StreetVerseWeatherSync.tsx'),'utf8')
assert.match(sync,/DEST_KEY='tryamm\.streetverse\.weather-destination\.v1'/)
assert.match(sync,/tryamm:streetverse-weather-destination/)
assert.match(sync,/localStorage\.setItem\(DEST_KEY/)
assert.match(sync,/localStorage\.removeItem\(DEST_KEY/)
assert.match(sync,/const location=payload\?\.location\|\|\{\}/)
assert.match(sync,/regionLabel:String\(location\?\.label\|\|point\.label\)/)
assert.doesNotMatch(sync,/lat:number/)
assert.doesNotMatch(sync,/lon:number/)

const globalWorld=fs.readFileSync(path.resolve('public/streetverse-global-world.js'),'utf8')
assert.match(globalWorld,/GLOBAL WEATHER CITY/)
assert.match(globalWorld,/sv-weather-city-search/)
assert.match(globalWorld,/\/api\/intelligence\/global-weather\?action=status/)
assert.match(globalWorld,/tryamm:streetverse-weather-destination/)
assert.match(globalWorld,/weatherLocations=Array\.isArray\(payload\?\.locations\)/)
assert.match(globalWorld,/weatherLocations:\(\)=>weatherLocations\.map/)
assert.match(globalWorld,/function updateStatus\(\)/)
assert.match(globalWorld,/function syncWorld\(\)/)

const weatherCallbackStart=globalWorld.indexOf('const onWeather=event=>')
const weatherCallbackEnd=globalWorld.indexOf(';addEventListener(\'tryamm:streetverse-weather-state\'',weatherCallbackStart)
assert.ok(weatherCallbackStart>=0&&weatherCallbackEnd>weatherCallbackStart)
const weatherCallback=globalWorld.slice(weatherCallbackStart,weatherCallbackEnd)
assert.match(weatherCallback,/updateStatus\(\)/)
assert.doesNotMatch(weatherCallback,/syncWorld\(\)/,'weather updates must not re-emit world travel')

assert.doesNotMatch(globalWorld,/latitude/)
assert.doesNotMatch(globalWorld,/longitude/)

const mainHtml=fs.readFileSync(path.resolve('index.html'),'utf8')
const safeHtml=fs.readFileSync(path.resolve('streetverse-safe.html'),'utf8')
assert.match(mainHtml,/\/streetverse-global-world\.js/)
assert.match(safeHtml,/\/streetverse-global-world\.js/)

console.log('StreetVerse approved global weather city catalog and picker contract passed')
