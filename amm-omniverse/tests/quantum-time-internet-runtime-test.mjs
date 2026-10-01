import assert from 'node:assert/strict'
import {
  normalizeHistoricalUrl,
  archiveTimestampToIso,
  extractHistoricalPageSignals,
  evidenceDifference,
} from '../api/_lib/quantum-time-internet.js'

assert.equal(normalizeHistoricalUrl('example.com/path?utm_source=test'),'https://example.com/path')
assert.equal(archiveTimestampToIso('20040115123456'),'2004-01-15T12:34:56Z')
assert.throws(()=>normalizeHistoricalUrl('http://127.0.0.1/admin'))
assert.throws(()=>normalizeHistoricalUrl('http://192.168.1.2/'))
assert.throws(()=>normalizeHistoricalUrl('http://localhost:3000/'))

const page=extractHistoricalPageSignals(`<!doctype html><html><head><title>Winter Sale</title><meta name="description" content="Save 25% today"></head><body><h1>New offer</h1><p>Buy now and save 25% off.</p><script>ignore me</script></body></html>`)
assert.equal(page.title,'Winter Sale')
assert(page.description.includes('25%'))
assert(page.adSignals.some(x=>/sale|save|buy|offer/i.test(x)))
assert(!page.contentExcerpt.includes('ignore me'))
assert.equal(page.contentHash.length,64)

const diff=evidenceDifference(
  {title:'Old Campaign',description:'Save $10',adSignals:['Buy one get one free'],contentHash:'a'},
  {title:'New Campaign',description:'Save 20%',adSignals:['Limited time offer'],contentHash:'b'},
)
assert(diff.added.length>0)
assert(diff.removed.length>0)
assert.equal(diff.sameHash,false)
assert.match(diff.interpretation,/does not establish/i)

console.log('QUANTUM TIME INTERNET RUNTIME TEST PASS: URL safety + timestamps + ad signals + evidence comparison')
