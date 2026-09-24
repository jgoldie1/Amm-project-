import assert from 'node:assert/strict'
import {ORACLE_PROVIDER_CATALOG,providerCatalogSummary} from '../api/_lib/oracle-provider-catalog.js'

assert.ok(Array.isArray(ORACLE_PROVIDER_CATALOG))
assert.ok(ORACLE_PROVIDER_CATALOG.length>=8)

for(const provider of ORACLE_PROVIDER_CATALOG){
  assert.equal(provider.live,false,`${provider.id} must not be live from catalog metadata alone`)
  assert.equal(provider.activationAllowed,false,`${provider.id} must require explicit activation review`)
  assert.ok(Array.isArray(provider.releaseGates)&&provider.releaseGates.length>0,`${provider.id} needs release gates`)
  assert.ok(Array.isArray(provider.lanes)&&provider.lanes.length>0,`${provider.id} needs intelligence lanes`)
  assert.ok(Array.isArray(provider.desks)&&provider.desks.length>0,`${provider.id} needs newsroom desks`)
  assert.ok(Array.isArray(provider.purposes)&&provider.purposes.length>0,`${provider.id} needs product purposes`)
}

const nws=ORACLE_PROVIDER_CATALOG.find(x=>x.id==='nws-weather-us')
assert.ok(nws)
assert.equal(nws.providerClass,'official_open_api')
assert.equal(nws.ingestionMode,'official_feed')
assert.equal(nws.baseUrl,'https://api.weather.gov')
assert.ok(nws.desks.includes('weather'))
assert.ok(nws.purposes.includes('public_alert'))

const chicago=ORACLE_PROVIDER_CATALOG.find(x=>x.id==='chicago-open-data')
assert.ok(chicago)
assert.equal(chicago.status,'candidate_dataset_terms_required')
assert.match(chicago.notes,/Each dataset must be reviewed individually/)

for(const id of ['local-news-licensed','national-news-licensed','international-news-licensed','entertainment-licensed']){
  const provider=ORACLE_PROVIDER_CATALOG.find(x=>x.id===id)
  assert.ok(provider)
  assert.equal(provider.status,'provider_selection_required')
  assert.equal(provider.baseUrl,null)
}

const soundThinking=ORACLE_PROVIDER_CATALOG.find(x=>x.id==='soundthinking-shotspotter')
assert.ok(soundThinking)
assert.equal(soundThinking.ingestionMode,'partner_push_only')
assert.match(soundThinking.notes,/No scraping/)
assert.equal(soundThinking.live,false)

const summary=providerCatalogSummary()
assert.equal(summary.live,0)
assert.equal(summary.activationAllowed,0)
assert.ok(summary.officialCandidates>=2)
assert.match(summary.policy,/do not authorize ingestion or live publication/)

console.log('Oracle provider catalog non-activation, provider-selection, official-source and SoundThinking partner-gate contract passed')
