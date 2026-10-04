import fs from 'node:fs'
const runtime=fs.readFileSync(new URL('../src/runtime/QuantumHoloLensRuntime.ts',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
for(const x of ['micro','object','room','building','block','district','city','planet','space','tryamm:holo-scan-request','tryamm:reel-capture-request','tryamm:omnifabric-job-request','holo-cinema'])if(!runtime.includes(x))throw new Error('Quantum lens missing '+x)
if(!main.includes('installQuantumHoloLensRuntime'))throw new Error('Quantum lens not installed')
console.log('Quantum + Holographic lens runtime contract: PASS')
