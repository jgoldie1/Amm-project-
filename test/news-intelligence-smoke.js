'use strict';

const assert = require('assert');
const fs = require('fs');

const registry = JSON.parse(fs.readFileSync('config/news-media.json', 'utf8'));
const runtime = fs.readFileSync('news-intelligence.js', 'utf8');
const kernel = fs.readFileSync('platform-kernel.js', 'utf8');

assert(registry.coverage.includes('neighborhood'), 'local news coverage missing');
assert(registry.coverage.includes('national'), 'national news coverage missing');
assert(registry.coverage.includes('global'), 'global news coverage missing');
assert(registry.ingestion.scraperRules.honorRobotsTxt, 'robots.txt compliance missing');
assert(registry.ingestion.scraperRules.noPaywallBypass, 'paywall protection missing');
assert(registry.editorial.noSecretGovernmentOrSponsorSuppression, 'editorial independence rule missing');
assert(registry.editorial.sponsoredContentMustBeLabeled, 'sponsor labeling missing');
assert(registry.editorial.aiGeneratedContentMustBeLabeled, 'AI labeling missing');
assert(registry.oracleLayer.minimumEvidence.includes('content-hash'), 'oracle content hash missing');
assert(registry.accessibility.translation, 'news translation missing');
assert(runtime.includes('/api/news/feed'), 'news feed route missing');
assert(runtime.includes('/api/admin/news/sources/validate'), 'source validation route missing');
assert(runtime.includes('/api/admin/news/oracle/attest'), 'oracle attestation route missing');
assert(runtime.includes('/api/news/articles/:articleId/provenance'), 'provenance route missing');
assert(runtime.includes('paywall-bypass-prohibited'), 'paywall bypass blocker missing');
assert(kernel.includes("require('./news-intelligence')"), 'news intelligence not wired into kernel');

console.log('News, media, scraper governance and oracle smoke checks passed');
