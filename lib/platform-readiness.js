'use strict';
function envConfigured(env,names){return names.every(n=>String(env[n]||'').trim().length>0)}
function evaluatePlatformReadiness({env=process.env,migrationsApplied=false,oauthProvidersTested=false,stripeWebhookVerified=false,turnConnectivityTested=false,marketplaceUsesPersistentDb=false,holoUsesPersistentDb=false,regulatedFeaturesApproved=false,e2ePassed=false,observabilityConfigured=false,backupRestoreTested=false,securityScansPassed=false,rateLimitsVerified=false,wafVerified=false,incidentDrillPassed=false,secretsRotationTested=false,legacySessionMigrationComplete=false}={}){
 const checks=[
  {key:'supabase_credentials',critical:true,ok:envConfigured(env,['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'])},
  {key:'migrations_applied',critical:true,ok:!!migrationsApplied},
  {key:'oauth_google_apple_sms_tested',critical:true,ok:!!oauthProvidersTested},
  {key:'stripe_secret',critical:true,ok:envConfigured(env,['STRIPE_SECRET_KEY'])},
  {key:'stripe_webhook_verified',critical:true,ok:!!stripeWebhookVerified},
  {key:'marketplace_persistent_database',critical:true,ok:!!marketplaceUsesPersistentDb},
  {key:'holo_persistent_database',critical:false,ok:!!holoUsesPersistentDb},
  {key:'turn_configured',critical:false,ok:envConfigured(env,['HOLO_TURN_URL','HOLO_TURN_USERNAME','HOLO_TURN_CREDENTIAL'])},
  {key:'turn_connectivity_tested',critical:false,ok:!!turnConnectivityTested},
  {key:'regulated_features_approved',critical:true,ok:!!regulatedFeaturesApproved},
  {key:'end_to_end_tests',critical:true,ok:!!e2ePassed},
  {key:'observability',critical:true,ok:!!observabilityConfigured},
  {key:'backup_restore_test',critical:true,ok:!!backupRestoreTested},
  {key:'security_scans',critical:true,ok:!!securityScansPassed},
  {key:'rate_limits_verified',critical:true,ok:!!rateLimitsVerified},
  {key:'waf_verified',critical:true,ok:!!wafVerified},
  {key:'incident_drill',critical:true,ok:!!incidentDrillPassed},
  {key:'secrets_rotation_test',critical:true,ok:!!secretsRotationTested},
  {key:'legacy_session_migration',critical:true,ok:!!legacySessionMigrationComplete}
 ];
 const criticalFailures=checks.filter(x=>x.critical&&!x.ok),warnings=checks.filter(x=>!x.critical&&!x.ok);
 const color=criticalFailures.length?'red':warnings.length?'yellow':'green';
 return {protocol:'tryamm-platform-readiness/1.1',color,publicLaunchReady:color==='green',betaReady:criticalFailures.filter(x=>!['stripe_secret','stripe_webhook_verified','regulated_features_approved','waf_verified','legacy_session_migration'].includes(x.key)).length===0,checks,criticalFailures:criticalFailures.map(x=>x.key),warnings:warnings.map(x=>x.key),generatedAt:new Date().toISOString(),rule:'Never market a RED or YELLOW environment as fully production-ready. Security evidence is required, not assumed.'};
}
function deploymentTruth(input={}){const r=evaluatePlatformReadiness(input);return {status:r.color==='green'?'PRODUCTION_READY':r.betaReady?'CONTROLLED_BETA_ONLY':'NOT_READY',...r};}
module.exports={envConfigured,evaluatePlatformReadiness,deploymentTruth};
