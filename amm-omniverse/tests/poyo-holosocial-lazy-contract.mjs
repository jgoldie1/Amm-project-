import fs from 'node:fs'

const poyo=fs.readFileSync(new URL('../src/components/PoyoAIStudio.tsx',import.meta.url),'utf8')
const vite=fs.readFileSync(new URL('../vite.config.ts',import.meta.url),'utf8')

if(poyo.includes("import HoloSocialEngine from './HoloSocialEngine'"))throw new Error('Poyo must not statically import Holo Social because it pulls Three.js into the studio open path.')
if(!poyo.includes("const HoloSocialEngine=lazy(()=>import('./HoloSocialEngine'))"))throw new Error('Poyo must lazy-load Holo Social on demand.')
if(!poyo.includes('<Suspense fallback='))throw new Error('Poyo lazy Holo Social path needs an accessible loading fallback.')
if(!vite.includes("!dep.includes('vendor-three')"))throw new Error('Initial module preload graph must continue excluding vendor-three.')

console.log('Poyo lazy Holo Social contract: PASS (Three.js stays out of the Poyo open path until Holo Social is requested)')
