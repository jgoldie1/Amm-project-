'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const {SENSES,CAPABILITIES,normalizeObservation,fuseSensoryFrame}=require('../lib/hologpt-sensory-fusion');

assert.deepStrictEqual(SENSES,['vision','hearing','touch','smell','taste']);
assert.strictEqual(CAPABILITIES.smell.hardwareRequired,true);
assert.strictEqual(CAPABILITIES.taste.hardwareRequired,true);
assert.throws(()=>normalizeObservation({sense:'smell',sourceType:'camera',value:'coffee'}),/cannot_be_inferred_from_camera/);
assert.throws(()=>normalizeObservation({sense:'taste',sourceType:'camera',value:'sweet'}),/cannot_be_inferred_from_camera/);

const frame=fuseSensoryFrame([
  {sense:'vision',sourceType:'camera',value:'person standing near a table',confidence:.9},
  {sense:'hearing',sourceType:'microphone',value:'speech detected',confidence:.8},
  {sense:'touch',sourceType:'controller',value:'trigger pressed',confidence:1},
  {sense:'smell',sourceType:'e-nose',value:'ethanol pattern',units:'sensor-array',confidence:.7},
  {sense:'taste',sourceType:'e-tongue',value:'sweetness pattern',units:'sensor-array',confidence:.68}
]);
assert.strictEqual(frame.readiness.fullFiveSense,true);
assert.strictEqual(frame.externalSensorNeeded.length,0);

const root=path.join(__dirname,'..');
const routes=fs.readFileSync(path.join(root,'lib/stubbs-ai-routes.js'),'utf8');
assert(routes.includes('/api/hologpt/senses/fuse'),'five-sense fusion API missing');
assert(routes.includes('sensoryAccepted'),'sensory chat acknowledgement missing');
assert(routes.includes('rememberSensoryFrame'),'sensory memory integration missing');

console.log('HOLOGPT FIVE-SENSE FOUNDATION PASS',JSON.stringify(frame.readiness));
