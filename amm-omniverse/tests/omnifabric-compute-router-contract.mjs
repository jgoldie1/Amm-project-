import fs from 'node:fs'
const runtime=fs.readFileSync(new URL('../src/runtime/OmniFabricComputeRouter.ts',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
for(const x of ['render','physics','ai','world-sim','media','commerce','accessibility','remote-omnifabric','local-webgpu','VITE_OMNIFABRIC_API_URL','server-ledger','physicalSiliconRequired:false'])if(!runtime.includes(x))throw new Error('OmniFabric runtime missing '+x)
if(!main.includes('installOmniFabricComputeRouter'))throw new Error('OmniFabric router not installed')
console.log('OmniFabric compute routing contract: PASS')
