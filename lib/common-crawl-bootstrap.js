'use strict';

const DEFAULT_COLLECTIONS_URL = 'https://index.commoncrawl.org/collinfo.json';

function safeDomain(value) {
  try { return new URL(value.includes('://') ? value : `https://${value}`).hostname; } catch { return null; }
}

async function latestCollection(fetchImpl = fetch) {
  const response = await fetchImpl(DEFAULT_COLLECTIONS_URL, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`Common Crawl collections failed: ${response.status}`);
  const collections = await response.json();
  if (!Array.isArray(collections) || !collections.length) throw new Error('No Common Crawl collections returned');
  return collections[0];
}

async function queryCaptures({ url, collection, limit = 10, fetchImpl = fetch }) {
  const domain = safeDomain(url);
  if (!domain) throw new Error('Invalid Common Crawl query URL');
  const chosen = collection || await latestCollection(fetchImpl);
  const api = chosen['cdx-api'] || chosen.cdxApi || `https://index.commoncrawl.org/${chosen.id}-index`;
  const params = new URLSearchParams({ url, output: 'json', filter: 'status:200', limit: String(Math.min(Math.max(limit, 1), 50)) });
  const response = await fetchImpl(`${api}?${params}`, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`Common Crawl CDX query failed: ${response.status}`);
  const text = await response.text();
  const rows = text.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
  return { collection: chosen.id, domain, captures: rows.map(row => ({
    url: row.url, timestamp: row.timestamp, mime: row.mime, status: Number(row.status || 0), digest: row.digest,
    length: Number(row.length || 0), offset: Number(row.offset || 0), filename: row.filename,
    language: row.languages || null, encoding: row.encoding || null,
    sourceType: 'common-crawl', provenance: { collection: chosen.id, digest: row.digest, filename: row.filename, offset: row.offset, length: row.length }
  })) };
}

function warcRangeRequest(capture) {
  if (!capture?.filename || !Number.isFinite(capture.offset) || !Number.isFinite(capture.length)) throw new Error('Capture lacks WARC range metadata');
  return {
    url: `https://data.commoncrawl.org/${capture.filename}`,
    headers: { Range: `bytes=${capture.offset}-${capture.offset + capture.length - 1}` }
  };
}

function toQuantumSeed(capture) {
  return {
    url: capture.url,
    sourceType: 'common-crawl',
    capturedAt: capture.timestamp,
    language: capture.language,
    digest: capture.digest,
    provenance: capture.provenance,
    crawlPriority: 0.55,
    requiresFreshCrawl: true
  };
}

module.exports = { latestCollection, queryCaptures, warcRangeRequest, toQuantumSeed };
