import assert from 'node:assert/strict';
import {textTo3D,imageTo3D,inspectRig,validateForPrinting,exportPrototypeSTL,xrCapabilities} from './quantum-forge-pipeline.mjs';
const m=textTo3D('A mansion');assert.equal(m.parameters.levels,3);assert.equal(validateForPrinting(m).watertight,true);assert.match(exportPrototypeSTL(m),/solid quantum_forge/);
const i=imageTo3D({width:2,height:2,pixels:[0,100,200,255]});assert.equal(i.triangles.length,2);assert.equal(validateForPrinting(i).watertight,false);
assert.equal(inspectRig({skins:[{joints:[0,1]}],animations:[{name:'Walk'}]}).joints,2);assert.equal(xrCapabilities().webXR,false);
assert.throws(()=>imageTo3D({width:2,height:2,pixels:[0]}));console.log('Quantum Forge pipeline tests passed');
