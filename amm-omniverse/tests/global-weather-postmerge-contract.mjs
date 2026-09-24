import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {nullableNumber} from '../api/_lib/global-weather.js'
import {getStreetVerseWeatherLocation,publicStreetVerseWeatherLocations} from '../api/_lib/streetverse-weather-locations.js'

assert.equal(nullableNumber(null),null)
assert.equal(nullableNumber(undefined),null)
assert.equal(nullableNumber(''),null)
assert.equal(nullableNumber(0),0)
assert.equal(nullableNumber('0'),0)
assert.equal(nullableNumber('12.5'),12.5)
assert.equal(nullableNumber('not-a-number'),null)

const chicago=getStreetVerseWeatherLocation('chicago')
assert.equal(chicago.id,'chicago')
assert.equal(chicago.scope,'local')
assert.equal(typeof chicago.lat,'number')
assert.equal(typeof chicago.lon,'number')
assert.throws(()=>getStreetVerseWeatherLocation('arbitrary-user-coordinate'),/GLOBAL_WEATHER_LOCATION_NOT_APPROVED/)

const publicLocations=publicStreetVerseWeatherLocations()
assert.ok(publicLocations.length>=10)
assert.equal(publicLocations.some(item=>'lat' in item||'lon' in item),false,'public location catalog must not expose coordinates')

const endpoint=fs.readFileSync(path.resolve('api/intelligence/global-weather.js'),'utf8')
assert.match(endpoint,/getStreetVerseWeatherLocation/)
assert.match(endpoint,/publicStreetVerseWeatherLocations/)
assert.match(endpoint,/GLOBAL_WEATHER_LOCATION_NOT_APPROVED/)
assert.match(endpoint,/global_weather_direct_coordinates_prohibited/)
assert.match(endpoint,/req\.query\?\.lat!==undefined/)
assert.match(endpoint,/req\.query\?\.lon!==undefined/)
assert.match(endpoint,/CACHE_TTL_MS=10\*60\*1000/)
assert.match(endpoint,/forecastCache=new Map/)
assert.match(endpoint,/inflight=new Map/)
assert.match(endpoint,/s-maxage=600/)
assert.match(endpoint,/stale-while-revalidate=300/)
assert.match(endpoint,/fetchGlobalForecast\(\{lat:location\.lat,lon:location\.lon,days:2\}\)/)

const sync=fs.readFileSync(path.resolve('src/components/StreetVerseWeatherSync.tsx'),'utf8')
assert.match(sync,/new URLSearchParams\(\{action:'forecast',location:point\.id\}\)/)
assert.doesNotMatch(sync,/lat:String\(point\.lat\)/)
assert.doesNotMatch(sync,/lon:String\(point\.lon\)/)
assert.doesNotMatch(sync,/lat:number/)
assert.doesNotMatch(sync,/lon:number/)

const refreshStart=sync.indexOf('export async function refreshStreetVerseWeather')
const refreshEnd=sync.indexOf('export default function StreetVerseWeatherSync')
assert.ok(refreshStart>=0&&refreshEnd>refreshStart)
const refreshBody=sync.slice(refreshStart,refreshEnd)
assert.doesNotMatch(refreshBody,/dispatch\(/,'async weather fetch helper must be side-effect-free')
assert.match(sync,/if\(disposed\|\|id!==requestId\)return\s+dispatch\(state\)/)

const safeEntry=fs.readFileSync(path.resolve('src/streetverse-safe.tsx'),'utf8')
assert.match(safeEntry,/StreetVerseWeatherSync/)
assert.match(safeEntry,/<StreetVerseWeatherSync \/>/)

const safeHtml=fs.readFileSync(path.resolve('streetverse-safe.html'),'utf8')
assert.match(safeHtml,/\/streetverse-global-world\.js/)
assert.match(safeHtml,/\/src\/streetverse-safe\.tsx/)

console.log('Global weather post-merge quota, null, stale-response and canonical safe-entry contract passed')
