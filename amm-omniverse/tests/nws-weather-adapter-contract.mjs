import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {
  NWS_BASE,
  assertNwsUrl,
  fetchNwsAlerts,
  fetchNwsForecast,
  normalizeArea,
  normalizeCoordinates,
  nwsWeatherStatus
} from '../api/_lib/nws-weather.js'

const originalEnv={
  reviewed:process.env.NWS_PROVIDER_REVIEWED,
  enabled:process.env.NWS_WEATHER_ENABLED,
  production:process.env.NWS_PRODUCTION_VERIFIED,
  userAgent:process.env.NWS_USER_AGENT
}
const originalFetch=globalThis.fetch

try{
  process.env.NWS_PROVIDER_REVIEWED='false'
  process.env.NWS_WEATHER_ENABLED='false'
  process.env.NWS_PRODUCTION_VERIFIED='false'
  process.env.NWS_USER_AGENT='TRYAMM-Test/1.0 (https://tryamm.online)'

  assert.equal(NWS_BASE,'https://api.weather.gov')
  assert.equal(nwsWeatherStatus().adapterReady,false)
  assert.equal(nwsWeatherStatus().liveDataAllowed,false)
  assert.deepEqual(normalizeCoordinates('41.8781','-87.6298'),{lat:41.8781,lon:-87.6298})
  assert.throws(()=>normalizeCoordinates('91','0'),/NWS_COORDINATES_INVALID/)
  assert.throws(()=>normalizeCoordinates('x','0'),/NWS_COORDINATES_REQUIRED/)
  assert.equal(normalizeArea('il'),'IL')
  assert.throws(()=>normalizeArea('ILL'),/NWS_AREA_INVALID/)
  assert.equal(assertNwsUrl('/points/41.8781,-87.6298').origin,NWS_BASE)
  assert.throws(()=>assertNwsUrl('',{allowRelative:false}),/NWS_URL_REQUIRED/)
  assert.throws(()=>assertNwsUrl('/gridpoints/LOT/74,76/forecast',{allowRelative:false}),/NWS_ABSOLUTE_URL_REQUIRED/)
  assert.throws(()=>assertNwsUrl('https://example.com/forecast'),/NWS_ORIGIN_NOT_ALLOWED/)
  await assert.rejects(()=>fetchNwsForecast({lat:41.8781,lon:-87.6298}),/NWS_PROVIDER_NOT_ENABLED/)

  process.env.NWS_PROVIDER_REVIEWED='true'
  process.env.NWS_WEATHER_ENABLED='true'
  assert.equal(nwsWeatherStatus().adapterReady,false)
  assert.equal(nwsWeatherStatus().productionVerified,false)
  process.env.NWS_PRODUCTION_VERIFIED='true'
  assert.equal(nwsWeatherStatus().adapterReady,true)

  let calls=[]
  globalThis.fetch=async (url,options)=>{
    const value=String(url)
    calls.push({value,options})
    if(value.startsWith('https://api.weather.gov/points/')){
      return new Response(JSON.stringify({
        properties:{
          forecast:'https://api.weather.gov/gridpoints/LOT/74,76/forecast',
          gridId:'LOT',
          gridX:74,
          gridY:76,
          forecastOffice:'https://api.weather.gov/offices/LOT',
          timeZone:'America/Chicago'
        }
      }),{status:200,headers:{'content-type':'application/geo+json'}})
    }
    if(value==='https://api.weather.gov/gridpoints/LOT/74,76/forecast'){
      return new Response(JSON.stringify({
        properties:{
          updated:'2026-09-24T16:00:00Z',
          periods:[{
            number:1,name:'This Afternoon',startTime:'2026-09-24T16:00:00-05:00',endTime:'2026-09-24T18:00:00-05:00',
            isDaytime:true,temperature:72,temperatureUnit:'F',
            probabilityOfPrecipitation:{value:20},windSpeed:'10 mph',windDirection:'SW',
            shortForecast:'Partly Sunny',detailedForecast:'Partly sunny with a light southwest wind.'
          }]
        }
      }),{status:200,headers:{'content-type':'application/geo+json'}})
    }
    if(value==='https://api.weather.gov/alerts/active?area=IL'){
      return new Response(JSON.stringify({
        updated:'2026-09-24T16:05:00Z',
        features:[{
          id:'urn:oid:test-alert',
          properties:{
            event:'Test Weather Alert',headline:'Test headline',severity:'Moderate',urgency:'Expected',certainty:'Likely',
            areaDesc:'Cook County',sent:'2026-09-24T16:00:00Z',effective:'2026-09-24T16:00:00Z',
            onset:'2026-09-24T16:10:00Z',expires:'2026-09-24T18:00:00Z',status:'Actual',messageType:'Alert',
            category:['Met'],response:'Prepare',description:'Test alert description',instruction:'Follow official guidance.'
          }
        }]
      }),{status:200,headers:{'content-type':'application/geo+json'}})
    }
    throw new Error('unexpected_test_url:'+value)
  }

  const forecast=await fetchNwsForecast({lat:41.8781,lon:-87.6298})
  assert.equal(forecast.source.name,'National Weather Service')
  assert.equal(forecast.location.gridId,'LOT')
  assert.equal(forecast.periods.length,1)
  assert.equal(forecast.periods[0].temperature,72)
  assert.equal(calls.length,2)
  assert.equal(calls[0].options.redirect,'error')
  assert.match(String(calls[0].options.headers['user-agent']),/TRYAMM-Test/)

  const alerts=await fetchNwsAlerts({area:'il'})
  assert.equal(alerts.area,'IL')
  assert.equal(alerts.count,1)
  assert.equal(alerts.alerts[0].event,'Test Weather Alert')

  globalThis.fetch=async url=>{
    if(String(url).startsWith('https://api.weather.gov/points/')){
      return new Response(JSON.stringify({properties:{forecast:'https://evil.example/forecast'}}),{status:200})
    }
    throw new Error('unexpected')
  }
  await assert.rejects(()=>fetchNwsForecast({lat:41.8781,lon:-87.6298}),/NWS_ORIGIN_NOT_ALLOWED/)

  globalThis.fetch=async url=>{
    if(String(url).startsWith('https://api.weather.gov/points/')){
      return new Response(JSON.stringify({properties:{forecast:'/gridpoints/LOT/74,76/forecast'}}),{status:200})
    }
    throw new Error('unexpected')
  }
  await assert.rejects(()=>fetchNwsForecast({lat:41.8781,lon:-87.6298}),/NWS_ABSOLUTE_URL_REQUIRED/)

  const endpointSource=fs.readFileSync(path.resolve('api/intelligence/weather.js'),'utf8')
  assert.match(endpointSource,/action==='status'/)
  assert.match(endpointSource,/if\(!status\.adapterReady\)/)
  assert.match(endpointSource,/nws_provider_not_enabled/)
  assert.match(endpointSource,/fetchNwsForecast/)
  assert.match(endpointSource,/fetchNwsAlerts/)
}finally{
  if(originalEnv.reviewed===undefined)delete process.env.NWS_PROVIDER_REVIEWED;else process.env.NWS_PROVIDER_REVIEWED=originalEnv.reviewed
  if(originalEnv.enabled===undefined)delete process.env.NWS_WEATHER_ENABLED;else process.env.NWS_WEATHER_ENABLED=originalEnv.enabled
  if(originalEnv.production===undefined)delete process.env.NWS_PRODUCTION_VERIFIED;else process.env.NWS_PRODUCTION_VERIFIED=originalEnv.production
  if(originalEnv.userAgent===undefined)delete process.env.NWS_USER_AGENT;else process.env.NWS_USER_AGENT=originalEnv.userAgent
  globalThis.fetch=originalFetch
}

console.log('NWS weather adapter gate, origin, coordinate, alert and normalized forecast contract passed')
