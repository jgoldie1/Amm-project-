'use strict';const assert=require('node:assert/strict');const {simulateTowerNetwork}=require('../lib/quantum-towers-simulator');
const n=[{id:'a'},{id:'b'},{id:'c'}];
assert.equal(simulateTowerNetwork(n,[{from:'a',to:'b'}]).connected,false);
assert.deepEqual(simulateTowerNetwork(n,[{from:'a',to:'b'}]).isolated,['c']);
assert.equal(simulateTowerNetwork(n,[{from:'a',to:'b'},{from:'b',to:'c'}]).connected,true);
assert.equal(simulateTowerNetwork(n,[{from:'a',to:'unknown'}]).error,'invalid_link');
assert.equal(simulateTowerNetwork(n,[{from:'a',to:'a'}]).ok,false);
console.log('Quantum Towers topology tests passed');