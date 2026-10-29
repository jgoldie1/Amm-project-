'use strict';const assert=require('node:assert/strict');const {archivePlan,safePublicUrl}=require('../lib/quantum-internet-memento');
assert.equal(archivePlan('https://example.com',2005).ok,true);
assert.equal(archivePlan('http://localhost/a',2005).ok,false);
assert.equal(archivePlan('http://127.0.0.1',2005).ok,false);
assert.equal(archivePlan('javascript:alert(1)',2005).ok,false);
assert.equal(archivePlan('https://example.com',1990).ok,false);
assert.equal(archivePlan('https://example.com',2005).archives.length,2);
console.log('Quantum Internet Memento link planning passed');