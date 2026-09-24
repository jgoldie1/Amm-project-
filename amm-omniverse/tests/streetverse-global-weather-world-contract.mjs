import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {weatherKindFromCode,weatherVisualFromState,weatherBadge} from '../src/runtime/StreetVerseWeatherRuntime.ts'

const base={
  scope:'global',
  regionId:'westAfrica',
  regionLabel:'West Africa • Lagos',
  provider:'open-meteo-global-commercial',
  sourceTimestamp:'2026-09-24T16:00:00Z',
  retrievedAt:'2026-09-24T16:02:00Z',
  temperature:30,
  apparentTemperature:34,
  precipitation:0,
  rain:0,
  snowfall:0,
  weatherCode:0,
  cloudCover:10,
  windSpeed:12,
  windDirection:220,
  windGusts:24,
  current:true,
  simulated:false
}

assert.equal(weatherKindFromCode(0),'clear')
assert.equal(weatherKindFromCode(3),'clouds')
assert.equal(weatherKindFromCode(45),'fog')
assert.equal(weatherKindFromCode(61),'rain')
assert.equal(weatherKindFromCode(71),'snow')
assert.equal(weatherKindFromCode(95),'storm')

const rain=weatherVisualFromState({...base,weatherCode:63,precipitation:4,rain:4})
const snow=weatherVisualFromState({...base,weatherCode:75,precipitation:3,snowfall:3})
const fog=weatherVisualFromState({...base,weatherCode:45})
const storm=weatherVisualFromState({...base,weatherCode:95,precipitation:8,rain:8})

assert.equal(rain.kind,'rain')
assert.ok(rain.roadGripMultiplier<1)
assert.ok(rain.trafficSpeedMultiplier<1)
assert.ok(snow.roadGripMultiplier<rain.roadGripMultiplier)
assert.ok(storm.lightMultiplier<rain.lightMultiplier)
assert.ok(fog.fogDensity>rain.fogDensity)
assert.match(weatherBadge(base),/West Africa • Lagos/)
assert.match(weatherBadge(base),/LIVE/)

const sync=fs.readFileSync(path.resolve('src/components/StreetVerseWeatherSync.tsx'),'utf8')
assert.match(sync,/15\*60\*1000/)
assert.match(sync,/\/api\/intelligence\/global-weather/)
assert.match(sync,/tryamm:streetverse-global-region/)
assert.match(sync,/tryamm\.streetverse\.global-world\.v1/)
assert.match(sync,/weatherVisualFromState/)
assert.doesNotMatch(sync,/navigator\.geolocation/)
assert.doesNotMatch(sync,/getCurrentPosition/)
assert.doesNotMatch(sync,/watchPosition/)
assert.doesNotMatch(sync,/latitude:/)
assert.doesNotMatch(sync,/longitude:/)

for(const id of ['chicago','greatLakes','caribbean','mediterranean','westAfrica','eastAfrica','amazon','pacific','arctic','openOcean']){
  assert.ok(sync.includes(id+':'),'missing preset weather region: '+id)
}

const playable=fs.readFileSync(path.resolve('src/components/StreetVersePlayableWorld.tsx'),'utf8')
assert.match(playable,/StreetVerseWeatherSync/)
assert.match(playable,/if\(safe\)return <>\<StreetVerseWeatherSync\/>/)
assert.match(playable,/if\(mobile\)return <>\<StreetVerseWeatherSync\/>/)

const living=fs.readFileSync(path.resolve('src/components/StreetVerseLivingWorld.tsx'),'utf8')
assert.match(living,/createStreetVerseWeatherRenderer/)
assert.match(living,/tryamm:streetverse-weather-state/)
assert.match(living,/weatherGripMultiplier/)
assert.match(living,/weatherAccelMultiplier/)
assert.match(living,/weatherTrafficMultiplier/)
assert.match(living,/weatherRenderer\.tick\(dt,controlled\.position\)/)
assert.match(living,/WEATHER •/)

const mobile=fs.readFileSync(path.resolve('src/components/StreetVerseMobileWorld.tsx'),'utf8')
assert.match(mobile,/createStreetVerseWeatherRenderer/)
assert.match(mobile,/weatherDriveMultiplier/)
assert.match(mobile,/tryamm:streetverse-weather-state/)
assert.match(mobile,/weatherRenderer\.tick\(dt,focus\.position\)/)
assert.match(mobile,/WEATHER •/)

const safeGlobal=fs.readFileSync(path.resolve('public/streetverse-global-world.js'),'utf8')
assert.match(safeGlobal,/sv-weather-fx/)
assert.match(safeGlobal,/data-sv-weather/)
assert.match(safeGlobal,/tryamm:streetverse-weather-state/)
assert.match(safeGlobal,/sv-rain/)
assert.match(safeGlobal,/sv-snow/)

console.log('StreetVerse local/global live-weather visual, refresh, physics and privacy contract passed')
