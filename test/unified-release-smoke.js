'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const {RELEASE_CHAIN}=require('../lib/unified-release-routes');

assert.deepStrictEqual(RELEASE_CHAIN,[
  'sign-in','passport','streetverse','mission','xp','get-paid-to-play','ledger',
  'reel-capture','green-screen-stickers','omni-box','share','creator-commerce',
  'stripe-purchase','server-verification','payable-balance'
]);

const root=path.join(__dirname,'..');
const preload=fs.readFileSync(path.join(root,'lib','content-engine-preload.js'),'utf8');
const durable=fs.readFileSync(path.join(root,'lib','durable-state-routes.js'),'utf8');
const rewards=fs.readFileSync(path.join(root,'lib','get-paid-to-play-routes.js'),'utf8');
const payments=fs.readFileSync(path.join(root,'lib','payment-routes.js'),'utf8');
const unified=fs.readFileSync(path.join(root,'lib','unified-release-routes.js'),'utf8');
const migration=fs.readFileSync(path.join(root,'supabase','migrations','014_unified_release_state.sql'),'utf8');

assert.ok(preload.includes("require('./unified-release-routes')"));
assert.ok(durable.includes("/api/streetverse/missions"));
assert.ok(durable.includes("/api/media/catalog"));
assert.ok(rewards.includes("/api/get-paid-to-play/claim"));
assert.ok(rewards.includes('idempotencyKey'));
assert.ok(payments.includes("/api/payments/verify-checkout"));
assert.ok(payments.includes("/api/creator/earnings"));
assert.ok(payments.includes('stripe_server_verified'));
assert.ok(unified.includes("/api/passport"));
assert.ok(unified.includes("/api/media/publish"));
assert.ok(unified.includes("/api/release/readiness"));
assert.ok(migration.includes('streetverse_mission_runs'));
assert.ok(migration.includes('media_catalog'));
assert.ok(migration.includes('media_publish_jobs'));
assert.ok(migration.includes('tryamm_bootstrap_user'));

console.log('unified-release-smoke: ok', {gates:RELEASE_CHAIN.length});
