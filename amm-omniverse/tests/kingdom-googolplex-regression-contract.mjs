import fs from 'node:fs'
const required=[
 '../public/streetverse-kingdom/index.html',
 '../public/streetverse-kingdom/style.css',
 '../public/streetverse-kingdom/01-core-world.js',
 '../public/streetverse-kingdom/02-physics-traffic.js',
 '../public/streetverse-kingdom/03-spawn-phone.js',
 '../public/streetverse-kingdom/04-radial-input.js',
 '../public/streetverse-kingdom/05-player-camera-hud.js',
 '../public/streetverse-kingdom/06-loop.js',
 '../public/streetverse-kingdom/tryamm-bridge.js',
 '../src/components/KingdomDistrictRoute.tsx',
 '../src/runtime/KingdomStreetVerseBridge.ts',
]
for(const p of required)if(!fs.existsSync(new URL(p,import.meta.url)))throw new Error('Missing Kingdom canonical asset '+p)
const index=fs.readFileSync(new URL('../public/streetverse-kingdom/index.html',import.meta.url),'utf8')
for(const x of ['Kingdom District','Crown Heights','KD 5G','01-core-world.js','06-loop.js','tryamm-bridge.js'])if(!index.includes(x))throw new Error('Kingdom shell missing '+x)
const route=fs.readFileSync(new URL('../src/components/KingdomDistrictRoute.tsx',import.meta.url),'utf8')
if(!route.includes('/streetverse-kingdom/index.html')||!route.includes('data-tryamm-kingdom-canonical'))throw new Error('Kingdom route is not canonical')
const bridge=fs.readFileSync(new URL('../src/runtime/KingdomStreetVerseBridge.ts',import.meta.url),'utf8')
if(!bridge.includes('event.origin!==window.location.origin'))throw new Error('Kingdom bridge lacks same-origin validation')
console.log('Kingdom canonical + Googolplex regression contract: PASS')
