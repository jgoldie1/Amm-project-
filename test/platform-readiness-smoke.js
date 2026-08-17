'use strict';
const assert=require('assert');
const {deploymentTruth}=require('../lib/platform-readiness');
const env={SUPABASE_URL:'x',SUPABASE_SERVICE_ROLE_KEY:'y',STRIPE_SECRET_KEY:'z',HOLO_TURN_URL:'turn:x',HOLO_TURN_USERNAME:'u',HOLO_TURN_CREDENTIAL:'p'};
const red=deploymentTruth({env});assert.equal(red.status,'NOT_READY');assert(red.criticalFailures.includes('migrations_applied'));
const green=deploymentTruth({env,migrationsApplied:true,oauthProvidersTested:true,stripeWebhookVerified:true,turnConnectivityTested:true,marketplaceUsesPersistentDb:true,holoUsesPersistentDb:true,regulatedFeaturesApproved:true,e2ePassed:true,observabilityConfigured:true,backupRestoreTested:true});assert.equal(green.status,'PRODUCTION_READY');assert(green.publicLaunchReady);
console.log('platform readiness smoke: PASS');
