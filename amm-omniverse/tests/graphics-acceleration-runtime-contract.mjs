import fs from 'node:fs'
const runtime=fs.readFileSync(new URL('../src/runtime/GraphicsAccelerationRuntime.ts',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')

for(const x of [
  "'webgpu'","'webgl2'","'safe'",
  'hardwareConcurrency','deviceMemory','prefers-reduced-motion',
  'tryamm:graphics-profile-ready','tryamm:performance-budget-request'
])if(!runtime.includes(x))throw new Error('graphics runtime missing '+x)

if(!main.includes('installTryammGraphicsAccelerationRuntime'))throw new Error('graphics runtime not installed')
console.log('TRYAMM graphics acceleration capability contract: PASS')
