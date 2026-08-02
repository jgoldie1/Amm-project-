'use strict';

const assert = require('assert');
const fs = require('fs');

const registry = JSON.parse(fs.readFileSync('config/original-internet-archive.json', 'utf8'));
const runtime = fs.readFileSync('original-internet-archive.js', 'utf8');
const kernel = fs.readFileSync('platform-kernel.js', 'utf8');
const manifest = fs.readFileSync('docs/BUILD_PHASE_COMPLETION_MANIFEST.md', 'utf8');

assert(registry.eras.some(era => era.id === 'early-web'), 'early web era missing');
assert(registry.eras.some(era => era.id === 'ai-web'), 'AI web transition era missing');
assert(registry.formats.primaryArchiveFormat.includes('WARC'), 'WARC archive format missing');
assert(registry.collectionPolicy.honorRobotsTxtAndPublisherTerms, 'crawler policy compliance missing');
assert(registry.collectionPolicy.noPaywallBypass, 'paywall bypass protection missing');
assert(registry.collectionPolicy.noPrivateAccountCapture, 'private account protection missing');
assert(registry.aiPreservationBoundary.trainingPermissionNotImpliedByArchiving, 'AI training permission boundary missing');
assert(registry.aiPreservationBoundary.originalCaptureAlwaysAvailableBesideAISummary, 'original capture preservation missing');
assert(runtime.includes('/api/internet-archive/config'), 'archive config route missing');
assert(runtime.includes('/api/internet-archive/capture-requests'), 'capture request route missing');
assert(runtime.includes('/api/internet-archive/records/:recordId/provenance'), 'archive provenance route missing');
assert(runtime.includes('AITrainingPermissionImplied: false'), 'AI training boundary missing from provenance');
assert(kernel.includes("require('./original-internet-archive')"), 'archive runtime not wired into kernel');
assert(manifest.includes('HoloVerse Asset Registry'), 'asset completion rule missing');
assert(manifest.includes('verified pre-alpha / web-beta foundation'), 'release truth missing');

console.log('Original Internet preservation and build completion checks passed');
