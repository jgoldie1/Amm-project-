import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {
  fetchGlobalForecastForCertification,
  globalWeatherStatus
} from '../api/_lib/global-weather.js'
import {
  GLOBAL_WEATHER_CERTIFICATION_LOCATIONS,
  runGlobalWeatherCertification,
  validateGlobalWeatherCertificationForecast
} from '../api/_lib/global-weather-certification.js'

const originalEnv={
  enabled:process.env.GLOBAL_WEATHER_ENABLED,
  license:process.env.OPEN_METEO_COMMERCIAL_LICENSE_VERIFIED,
  production:process.env.OPEN_METEO_PRODUCTION_VERIFIED,
  key:process.env.OPEN_METEO_API_KEY
}
const originalFetch=globalThis.fetch

const payloadFor=()=>({
  latitude:41.88,
  longitude:-87.63,
  elevation:180,
  timezone:'America/Chicago',
  timezone_abbreviation:'CDT',
  utc_offset_seconds:-18000,
  current:{
    time:'2026-09-24T15:00',
    temperature_2m:23.4,
    apparent_temperature:24.1,
    relative_humidity_2m:54,
    precipitation:0,
    rain:0,
    snowfall:0,
    weather_code:1,
    cloud_cover:20,
    wind_speed_10m:14,
    wind_direction_10m:210,
    wind_gusts_10m:24
  },
  daily:{
    time:['2026-09-24','2026-09-25'],
    weather_code:[1,2],
    temperature_2m_max:[25,24],
    temperature_2m_min:[16,15],
    apparent_temperature_max:[26,25],
    apparent_temperature_min:[15,14],
    sunrise:['2026-09-24T06:42','2026-09-25T06:43'],
    sunset:['2026-09-24T18:46','2026-09-25T18:44'],
    precipitation_sum:[0,0.4],
    rain_sum:[0,0.4],
    snowfall_sum:[0,0],
    precipitation_probability_max:[5,20],
    wind_speed_10m_max:[18,20],
    wind_gusts_10m_max:[31,34]
  }
})

try{
  process.env.GLOBAL_WEATHER_ENABLED='true'
  process.env.OPEN_METEO_COMMERCIAL_LICENSE_VERIFIED='true'
  process.env.OPEN_METEO_PRODUCTION_VERIFIED='false'
  process.env.OPEN_METEO_API_KEY='   '
  assert.equal(globalWeatherStatus().configured,false)
  assert.equal(globalWeatherStatus().certificationReady,false)

  process.env.OPEN_METEO_API_KEY='certification-test-key'

  const preflight=globalWeatherStatus()
  assert.equal(preflight.configurationReady,true)
  assert.equal(preflight.certificationReady,true)
  assert.equal(preflight.productionVerified,false)
  assert.equal(preflight.adapterReady,false)
  assert.equal(preflight.liveDataAllowed,false)

  globalThis.fetch=async()=>new Response(JSON.stringify(payloadFor()),{status:200,headers:{'content-type':'application/json'}})
  const candidate=await fetchGlobalForecastForCertification({lat:41.8781,lon:-87.6298,days:2})
  assert.equal(candidate.current.temperature,23.4)
  assert.equal(candidate.days.length,2)
  assert.equal(JSON.stringify(candidate).includes('certification-test-key'),false)

  const validation=validateGlobalWeatherCertificationForecast(candidate)
  assert.equal(validation.pass,true)
  assert.equal(Object.values(validation.checks).every(Boolean),true)

  for(const field of ['temperature','weatherCode','windSpeed']){
    const broken=structuredClone(candidate)
    broken.current[field]=null
    assert.equal(validateGlobalWeatherCertificationForecast(broken).pass,false,'missing '+field+' must fail certification')
  }

  assert.deepEqual(
    GLOBAL_WEATHER_CERTIFICATION_LOCATIONS,
    ['chicago','lagos','abuja','london','tokyo','sydney']
  )

  const validForecast=async()=>candidate
  const passReport=await runGlobalWeatherCertification({fetchForecast:validForecast})
  assert.equal(passReport.requiredLocations,6)
  assert.equal(passReport.passed,6)
  assert.equal(passReport.failed,0)
  assert.equal(passReport.readyToVerify,true)
  assert.equal(JSON.stringify(passReport).includes('certification-test-key'),false)
  assert.equal(JSON.stringify(passReport).includes('"latitude"'),false)
  assert.equal(JSON.stringify(passReport).includes('"longitude"'),false)

  let calls=0
  const failOne=async()=>{
    calls+=1
    if(calls===3)throw new Error('GLOBAL_WEATHER_HTTP_503')
    return candidate
  }
  const failReport=await runGlobalWeatherCertification({fetchForecast:failOne})
  assert.equal(failReport.passed,5)
  assert.equal(failReport.failed,1)
  assert.equal(failReport.readyToVerify,false)

  const endpoint=fs.readFileSync(path.resolve('api/intelligence/global-weather.js'),'utf8')
  assert.match(endpoint,/allowed:\['status','forecast'\]/)
  assert.doesNotMatch(endpoint,/action==='certif/i,'public weather endpoint must not expose the certification runner')

  const runner=fs.readFileSync(path.resolve('scripts/certify-global-weather.mjs'),'utf8')
  assert.match(runner,/OPEN_METEO_PRODUCTION_VERIFIED may remain false during certification/)
  assert.match(runner,/Keep OPEN_METEO_PRODUCTION_VERIFIED=false/)
  assert.doesNotMatch(runner,/process\.env\.OPEN_METEO_PRODUCTION_VERIFIED\s*=/,'certification must never flip production verification itself')
}finally{
  if(originalEnv.enabled===undefined)delete process.env.GLOBAL_WEATHER_ENABLED;else process.env.GLOBAL_WEATHER_ENABLED=originalEnv.enabled
  if(originalEnv.license===undefined)delete process.env.OPEN_METEO_COMMERCIAL_LICENSE_VERIFIED;else process.env.OPEN_METEO_COMMERCIAL_LICENSE_VERIFIED=originalEnv.license
  if(originalEnv.production===undefined)delete process.env.OPEN_METEO_PRODUCTION_VERIFIED;else process.env.OPEN_METEO_PRODUCTION_VERIFIED=originalEnv.production
  if(originalEnv.key===undefined)delete process.env.OPEN_METEO_API_KEY;else process.env.OPEN_METEO_API_KEY=originalEnv.key
  globalThis.fetch=originalFetch
}

console.log('Global weather six-city pre-production certification gate contract passed')
