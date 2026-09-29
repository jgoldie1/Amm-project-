'use strict'
const assert=require('node:assert/strict')
const {sanitizeCapabilities,hashInstall,JOB_CLASSES}=require('../routes/edge-node')

const cap=sanitizeCapabilities({
  nodeClass:'pocket',online:true,hardwareConcurrency:12,deviceMemoryGB:8,webGPU:true,webCodecs:true,
  batteryLevel:.6,charging:false,safeWork:['cache-sync','light-ai','not-real'],maxParallel:99,
})
assert.equal(cap.nodeClass,'pocket')
assert.equal(cap.maxParallel,2)
assert.deepEqual(cap.safeWork,['cache-sync','light-ai'])
assert.equal(cap.thermalState,'unknown')
assert.ok(JOB_CLASSES.has('offline-reconcile'))
assert.equal(hashInstall('installation-123456').length,64)
assert.equal(hashInstall('installation-123456').includes('installation-123456'),false)

const constrained=sanitizeCapabilities({nodeClass:'bad',hardwareConcurrency:999,deviceMemoryGB:999,safeWork:['payment-secret']})
assert.equal(constrained.nodeClass,'pocket')
assert.equal(constrained.hardwareConcurrency,128)
assert.equal(constrained.deviceMemoryGB,256)
assert.deepEqual(constrained.safeWork,[])
console.log('TRYAMM Edge Node route contract: PASS')
