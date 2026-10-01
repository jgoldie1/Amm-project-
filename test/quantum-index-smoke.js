'use strict';
const assert = require('assert');
const { canonicalizeUrl, makeIndexDocument, dedupeDocuments, temporalVersions } = require('../lib/quantum-index-store');
const { warcRangeRequest, toQuantumSeed } = require('../lib/common-crawl-bootstrap');

assert.equal(canonicalizeUrl('https://Example.com/page?utm_source=x&a=1#top'), 'https://example.com/page?a=1');
const d = makeIndexDocument({ url:'https://example.com/a', title:'A', text:'hello world', capturedAt:'2026-01-01T00:00:00Z' });
assert.equal(d.contentHash.length, 64);
assert.equal(d.id.length, 64);
const deduped = dedupeDocuments([
 { url:'https://example.com/a', text:'same', capturedAt:'2025-01-01T00:00:00Z' },
 { url:'https://example.com/a?utm_source=x', text:'new', capturedAt:'2026-01-01T00:00:00Z' },
 { url:'https://mirror.example/a', text:'same', capturedAt:'2025-01-01T00:00:00Z' }
]);
assert.equal(deduped.length, 1);
const versions = temporalVersions([
 { url:'https://example.com/a', text:'old', capturedAt:'2025-01-01T00:00:00Z' },
 { url:'https://example.com/a', text:'new', capturedAt:'2026-01-01T00:00:00Z' }
], 'https://example.com/a');
assert.equal(versions[0].text, 'new');
const req = warcRangeRequest({ filename:'crawl-data/x/file.warc.gz', offset:100, length:50 });
assert.equal(req.headers.Range, 'bytes=100-149');
assert.equal(toQuantumSeed({url:'https://example.com', timestamp:'20260101', digest:'abc', provenance:{}}).requiresFreshCrawl, true);
console.log('QUANTUM INDEX SMOKE: PASS');
