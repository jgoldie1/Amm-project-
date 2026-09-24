import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {
  GLOBAL_WEATHER_BASE,
  buildForecastUrl,
  fetchGlobalForecast,
  globalWeatherStatus,
  normalizeGlobalCoordinates
} from '../api/_lib/global-weather.js'
import {
  globalForecastToOracleSignals,
  globalWeatherOracleBridgeStatus
} from '../api/_lib/global-weather-oracle-bridge.js'

const originalEnv={
  enabled:process.env.GLOBAL_WEATHER_ENABLED,
  license:process.env.OPEN_METEO_COMMERCIAL_LICENSE_VERIFIED,
  production:process.env.OPEN_METEO_PRODUCTION_VERIFIED,
  key:process.env.OPEN_METEO_API_KEY
}
const originalFetch=globalThis.fetch

try{
  process.env.GLOBAL_WEATHER_ENABLED='false'
  process.env.OPEN_METEO_COMMERCIAL_LICENSE_VERIFIED='false'
  process.env.OPEN_METEO_PRODUCTION_VERIFIED='false'
  delete process.env.OPEN_METEO_API_KEY

  assert.equal(GLOBAL_WEATHER_BASE,'https://customer-api.open-meteo.com')
  assert.equal(globalWeatherStatus().adapterReady,false)
  assert.equal(globalWeatherStatus().liveDataAllowed,false)
  assert.equal(globalWeatherStatus().configured,false)

  assert.deepEqual(normalizeGlobalCoordinates('6.5244','3.3792'),{lat:6.5244,lon:3.3792})
  assert.deepEqual(normalizeGlobalCoordinates('-33.8688','151.2093'),{lat:-33.8688,lon:151.2093})
  assert.throws(()=>normalizeGlobalCoordinates('91','0'),/GLOBAL_WEATHER_COORDINATES_INVALID/)
  assert.throws(()=>normalizeGlobalCoordinates('x','0'),/GLOBAL_WEATHER_COORDINATES_REQUIRED/)

  assert.throws(()=>buildForecastUrl({lat:6.5,lon:3.3}),/GLOBAL_WEATHER_API_KEY_REQUIRED/)
}finally{
  process.env.OPEN_METEO_API_KEY='test-commercial-key'
}

try{
  assert.equal(JSON.stringify(globalWeatherStatus()).includes('test-commercial-key'),false)
  const built=buildForecastUrl({lat:6.5244,lon:3.3792,days:20})
  assert.equal(built.url.origin,GLOBAL_WEATHER_BASE)
  assert.equal(built.url.pathname,'/v1/forecast')
  assert.equal(built.forecastDays,16)
  assert.equal(built.url.searchParams.get('apikey'),'test-commercial-key')
  assert.equal(built.url.searchParams.get('timezone'),'auto')
  assert.ok(String(built.url.searchParams.get('current')).includes('temperature_2m'))
  assert.ok(String(built.url.searchParams.get('daily')).includes('temperature_2m_max'))

  await assert.rejects(
    ()=>fetchGlobalForecast({lat:6.5244,lon:3.3792}),
    /GLOBAL_WEATHER_PROVIDER_NOT_ENABLED/
  )

  process.env.GLOBAL_WEATHER_ENABLED='true'
  process.env.OPEN_METEO_COMMERCIAL_LICENSE_VERIFIED='true'
  process.env.OPEN_METEO_PRODUCTION_VERIFIED='false'
  assert.equal(globalWeatherStatus().adapterReady,false)

  process.env.OPEN_METEO_PRODUCTION_VERIFIED='true'
  assert.equal(globalWeatherStatus().adapterReady,true)

  let requestedUrl=''
  globalThis.fetch=async (url,options)=>{
    requestedUrl=String(url)
    assert.equal(new URL(requestedUrl).origin,'https://customer-api.open-meteo.com')
    assert.equal(options.redirect,'error')
    return new Response(JSON.stringify({
      latitude:6.5,
      longitude:3.4,
      elevation:12,
      timezone:'Africa/Lagos',
      timezone_abbreviation:'WAT',
      utc_offset_seconds:3600,
      current:{
        time:'2026-09-24T17:00',
        temperature_2m:30.1,
        apparent_temperature:34.2,
        relative_humidity_2m:78,
        precipitation:0,
        rain:0,
        snowfall:0,
        weather_code:2,
        cloud_cover:62,
        wind_speed_10m:13.4,
        wind_direction_10m:220,
        wind_gusts_10m:24
      },
      daily:{
        time:['2026-09-24','2026-09-25'],
        weather_code:[2,61],
        temperature_2m_max:[31,29],
        temperature_2m_min:[25,24],
        apparent_temperature_max:[35,33],
        apparent_temperature_min:[27,26],
        sunrise:['2026-09-24T06:30','2026-09-25T06:30'],
        sunset:['2026-09-24T18:36','2026-09-25T18:35'],
        precipitation_sum:[1.2,7.4],
        rain_sum:[1.2,7.4],
        snowfall_sum:[0,0],
        precipitation_probability_max:[35,80],
        wind_speed_10m_max:[18,22],
        wind_gusts_10m_max:[30,36]
      }
    }),{status:200,headers:{'content-type':'application/json'}})
  }

  const forecast=await fetchGlobalForecast({lat:6.5244,lon:3.3792,days:7})
  assert.match(requestedUrl,/customer-api\.open-meteo\.com/)
  assert.match(requestedUrl,/apikey=test-commercial-key/)
  assert.equal(forecast.source.name,'Open-Meteo')
  assert.equal(forecast.location.timezone,'Africa/Lagos')
  assert.equal(forecast.current.temperature,30.1)
  assert.equal(forecast.days.length,2)
  assert.equal(JSON.stringify(forecast).includes('test-commercial-key'),false)

  const signals=globalForecastToOracleSignals(forecast,{region:'Lagos, Nigeria'})
  assert.ok(signals.length>=3)
  for(const signal of signals){
    assert.equal(signal.live,false)
    assert.equal(signal.publishAuthority,false)
    assert.equal(signal.missionAuthority,false)
    assert.equal(signal.routingStatus,'candidate_only')
    assert.equal(signal.requiresRoutingReview,true)
    assert.equal(signal.provider,'open-meteo-global-commercial')
    assert.equal(signal.region,'Lagos, Nigeria')
    assert.equal('geo' in signal,false,'global Oracle signals must not persist precise query coordinates')
    assert.equal(JSON.stringify(signal).includes('test-commercial-key'),false)
  }

  const bridge=globalWeatherOracleBridgeStatus()
  assert.equal(bridge.live,false)
  assert.equal(bridge.publishAuthority,false)
  assert.equal(bridge.missionAuthority,false)

  const endpoint=fs.readFileSync(path.resolve('api/intelligence/global-weather.js'),'utf8')
  assert.match(endpoint,/global_weather_provider_not_enabled/)
  assert.match(endpoint,/format==='oracle'/)
  assert.match(endpoint,/globalForecastToOracleSignals/)
  assert.match(endpoint,/globalWeatherOracleBridgeStatus/)

  const moduleSource=fs.readFileSync(path.resolve('api/_lib/global-weather.js'),'utf8')
  assert.match(moduleSource,/https:\/\/customer-api\.open-meteo\.com/)
  assert.doesNotMatch(moduleSource,/https:\/\/api\.open-meteo\.com['"]/)
}finally{
  if(originalEnv.enabled===undefined)delete process.env.GLOBAL_WEATHER_ENABLED;else process.env.GLOBAL_WEATHER_ENABLED=originalEnv.enabled
  if(originalEnv.license===undefined)delete process.env.OPEN_METEO_COMMERCIAL_LICENSE_VERIFIED;else process.env.OPEN_METEO_COMMERCIAL_LICENSE_VERIFIED=originalEnv.license
  if(originalEnv.production===undefined)delete process.env.OPEN_METEO_PRODUCTION_VERIFIED;else process.env.OPEN_METEO_PRODUCTION_VERIFIED=originalEnv.production
  if(originalEnv.key===undefined)delete process.env.OPEN_METEO_API_KEY;else process.env.OPEN_METEO_API_KEY=originalEnv.key
  globalThis.fetch=originalFetch
}

console.log('Global weather commercial endpoint, gating, secret redaction and Oracle non-authority contract passed')
