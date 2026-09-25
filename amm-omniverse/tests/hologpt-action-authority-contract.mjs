import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../api/ai/action.js',import.meta.url),'utf8');
for(const token of [
  "requireUser,consumeStepUp,recentlyAuthenticated,audit",
  "SELF_ESCALATION_DENIED",
  "DEDICATED_FINANCIAL_FLOW_REQUIRED",
  "STEP_UP_REQUIRED",
  "hologpt-action:",
  "HOLOGPT_ACTION_EXECUTOR_URL",
  "HOLOGPT_ACTION_EXECUTOR_SECRET",
  "AUTHORIZED_NOT_EXECUTED",
  "ACTION_EXECUTOR_NOT_CONNECTED",
  "result.verified===true&&result.observed===true",
  "executionEvidence.length>0&&observationEvidence.length>0&&verificationEvidence.length>0",
  "hologpt_action_verified"
]) assert.ok(source.includes(token),`HoloGPT action authority missing: ${token}`);

assert.match(source,/const user=await requireUser\(req,res\);if\(!user\)return;/,'action gateway must require a real authenticated user');
assert.match(source,/if\(risk==='PRIVILEGE_CHANGE'\|\|risk==='SELF_MODIFICATION'\)/,'self escalation must be denied regardless of client input');
assert.match(source,/if\(risk==='FINANCIAL'\)/,'HoloGPT direct money movement must stay outside the general action gateway');
assert.match(source,/consumeStepUp\(user\.id,stepUpToken,scope\)/,'protected actions must consume a server-validated one-time step-up token');
assert.match(source,/if\(!endpoint\|\|!secret\|\|!\/\^https:/,'executor must fail closed unless an HTTPS endpoint and server secret are configured');

console.log('HoloGPT Vercel action authority contract: PASS');
