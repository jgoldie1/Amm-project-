import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {
  nwsAlertsToOracleSignals,
  nwsForecastToOracleSignals,
  nwsOracleBridgeStatus
} from '../api/_lib/nws-oracle-bridge.js'

const forecast={
  source:{
    id:'nws-weather-us',
    name:'National Weather Service',
    providerUpdatedAt:'2026-09-24T16:00:00Z',
    retrievedAt:'2026-09-24T16:02:00Z'
  },
  location:{gridId:'LOT',gridX:74,gridY:76},
  periods:[{
    name:'Tonight',
    startTime:'2026-09-24T18:00:00-05:00',
    endTime:'2026-09-25T06:00:00-05:00',
    temperature:62,
    temperatureUnit:'F',
    probabilityOfPrecipitation:30,
    windSpeed:'5 to 10 mph',
    windDirection:'SW',
    shortForecast:'Chance Showers',
    detailedForecast:'A chance of showers overnight.'
  }]
}

const forecastSignals=nwsForecastToOracleSignals(forecast,{region:'Chicago'})
assert.equal(forecastSignals.length,1)
assert.equal(forecastSignals[0].lane,'weather_environment')
assert.equal(forecastSignals[0].desk,'weather')
assert.equal(forecastSignals[0].verification,'official')
assert.equal(forecastSignals[0].sourceType,'official_feed')
assert.equal(forecastSignals[0].region,'Chicago')
assert.equal(forecastSignals[0].live,false)
assert.equal(forecastSignals[0].publishAuthority,false)
assert.equal(forecastSignals[0].missionAuthority,false)
assert.equal(forecastSignals[0].routingStatus,'candidate_only')
assert.equal(forecastSignals[0].requiresRoutingReview,true)
assert.ok(forecastSignals[0].purposes.includes('sparrow_map'))
assert.ok(forecastSignals[0].purposes.includes('environment_context'))
assert.equal('geo' in forecastSignals[0],false,'weather bridge must not infer or persist user precise coordinates')

const alerts={
  source:{
    id:'nws-weather-us',
    name:'National Weather Service',
    providerUpdatedAt:'2026-09-24T16:05:00Z',
    retrievedAt:'2026-09-24T16:06:00Z'
  },
  area:'IL',
  alerts:[{
    id:'urn:oid:test-alert',
    event:'Severe Thunderstorm Warning',
    headline:'Severe Thunderstorm Warning issued',
    severity:'Severe',
    urgency:'Immediate',
    certainty:'Observed',
    areaDesc:'Cook County',
    sent:'2026-09-24T16:05:00Z',
    effective:'2026-09-24T16:05:00Z',
    onset:'2026-09-24T16:05:00Z',
    expires:'2026-09-24T17:00:00Z',
    description:'Official test alert description.',
    instruction:'Follow official safety guidance.',
    web:'https://www.weather.gov/'
  }]
}

const alertSignals=nwsAlertsToOracleSignals(alerts)
assert.equal(alertSignals.length,1)
assert.equal(alertSignals[0].verification,'official')
assert.equal(alertSignals[0].region,'IL')
assert.ok(alertSignals[0].purposes.includes('public_alert'))
assert.ok(alertSignals[0].purposes.includes('streetverse_mission'))
assert.equal(alertSignals[0].live,false)
assert.equal(alertSignals[0].publishAuthority,false)
assert.equal(alertSignals[0].missionAuthority,false)
assert.equal(alertSignals[0].routingStatus,'candidate_only')
assert.equal(alertSignals[0].alert.severity,'Severe')

const status=nwsOracleBridgeStatus()
assert.equal(status.live,false)
assert.equal(status.publishAuthority,false)
assert.equal(status.missionAuthority,false)
assert.match(status.note,/does not grant TRYAMM publication or StreetVerse mission authority/)

const endpoint=fs.readFileSync(path.resolve('api/intelligence/weather.js'),'utf8')
assert.match(endpoint,/format==='oracle'/)
assert.match(endpoint,/nwsForecastToOracleSignals/)
assert.match(endpoint,/nwsAlertsToOracleSignals/)
assert.match(endpoint,/nwsOracleBridgeStatus/)
assert.match(endpoint,/unsupported_format/)

console.log('NWS Oracle bridge official-source but non-authoritative publish/mission routing contract passed')
