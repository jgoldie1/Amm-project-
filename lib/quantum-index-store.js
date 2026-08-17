'use strict';

const crypto = require('crypto');

function canonicalizeUrl(raw) {
  const u = new URL(raw);
  u.hash = '';
  ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'].forEach(k => u.searchParams.delete(k));
  u.hostname = u.hostname.toLowerCase();
  if ((u.protocol === 'https:' && u.port === '443') || (u.protocol === 'http:' && u.port === '80')) u.port = '';
  return u.toString();
}

function fingerprint(text) { return crypto.createHash('sha256').update(String(text || '')).digest('hex'); }

function makeIndexDocument(input) {
  const canonicalUrl = canonicalizeUrl(input.canonicalUrl || input.url);
  const body = String(input.text || '').trim();
  return {
    id: fingerprint(`${canonicalUrl}\n${body}`),
    url: input.url,
    canonicalUrl,
    title: input.title || canonicalUrl,
    text: body,
    language: input.language || 'und',
    sourceType: input.sourceType || 'quantum-crawl',
    capturedAt: input.capturedAt || new Date().toISOString(),
    indexedAt: new Date().toISOString(),
    contentHash: fingerprint(body),
    provenance: input.provenance || {},
    entities: Array.isArray(input.entities) ? input.entities : [],
    links: Array.isArray(input.links) ? input.links : [],
    safety: input.safety || { status: 'unreviewed' }
  };
}

function dedupeDocuments(documents) {
  const seenUrl = new Map();
  const seenContent = new Set();
  for (const raw of documents || []) {
    const doc = makeIndexDocument(raw);
    if (seenContent.has(doc.contentHash)) continue;
    const previous = seenUrl.get(doc.canonicalUrl);
    if (!previous || String(doc.capturedAt) > String(previous.capturedAt)) seenUrl.set(doc.canonicalUrl, doc);
    seenContent.add(doc.contentHash);
  }
  return [...seenUrl.values()];
}

function temporalVersions(documents, canonicalUrl) {
  const target = canonicalizeUrl(canonicalUrl);
  return (documents || []).map(makeIndexDocument).filter(d => d.canonicalUrl === target).sort((a,b) => String(b.capturedAt).localeCompare(String(a.capturedAt)));
}

module.exports = { canonicalizeUrl, fingerprint, makeIndexDocument, dedupeDocuments, temporalVersions };
