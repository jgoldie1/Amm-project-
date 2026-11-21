import assert from 'node:assert/strict';
import {PARAMS,makeBuilding,toAsciiSTL,validateDesign} from './quantum-forge-core.mjs';
assert.equal(PARAMS.length,12);
const b=makeBuilding();assert.equal(b.vertices.length,8);assert.equal(b.triangles.length,12);
assert.equal((toAsciiSTL(b).match(/facet normal/g)||[]).length,12);
assert.throws(()=>validateDesign({width:-1}));
assert.throws(()=>validateDesign({levels:1.5}));
console.log('Quantum Forge 8.0 procedural core tests passed');
