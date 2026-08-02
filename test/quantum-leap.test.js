'use strict';
const assert=require('assert');
const fs=require('fs');

const loader=fs.readFileSync('src/worlds/world-loader.js','utf8');
const client=fs.readFileSync('public/world-runtime-client.js','utf8');
const bridge=fs.readFileSync('public/living-city-world-bridge.js','utf8');
const effects=fs.readFileSync('public/quantum-leap-effects.js','utf8');

assert(loader.includes('beforeTransition'), 'loader must call beforeTransition');
assert(loader.includes('afterDispose'), 'loader must call afterDispose');
assert(loader.includes('afterMount'), 'loader must call afterMount');
assert(loader.includes('transitionEffects?.fail'), 'loader must report transition failures');
assert(client.includes('transitionEffects'), 'browser runtime must pass transition effects');
assert(bridge.includes('TryAMMQuantumLeapEffects'), 'Living City bridge must create Quantum Leap effects');
assert(!effects.includes('new THREE.WebGLRenderer'), 'effects must not create a duplicate renderer');
assert(effects.includes('prefers-reduced-motion'), 'effects must support reduced motion');
assert(effects.includes("aria-live"), 'effects must announce transition status accessibly');

console.log('Quantum Leap transition contract passed.');
