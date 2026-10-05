import fs from 'node:fs'
const recording=fs.readFileSync(new URL('../src/components/RecordingStudio.tsx',import.meta.url),'utf8')
const creator=fs.readFileSync(new URL('../src/components/MusicCreatorStudio.tsx',import.meta.url),'utf8')
const studio=fs.readFileSync(new URL('../src/components/Aniyah64TrackStudio.tsx',import.meta.url),'utf8')
const business=fs.readFileSync(new URL('../src/data/Aniyah64TrackBusiness.ts',import.meta.url),'utf8')
const checkout=fs.readFileSync(new URL('../api/commerce/checkout.js',import.meta.url),'utf8')
const app=fs.readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8')
const block=recording.slice(recording.indexOf('const TRACK_NAMES = ['),recording.indexOf(']\n\nconst GUITAR_PRESETS'))
const trackCount=(block.match(/\{ name:'/g)||[]).length
if(trackCount!==64)throw new Error('Engineer Mode must have exactly 64 tracks; found '+trackCount)
if(recording.includes('62-track')||recording.includes('All 62'))throw new Error('Legacy 62-track labeling remains')
if(!creator.includes('64-track production system'))throw new Error('AI Create Mode is not the 64-track production system')
for(const x of ['AI Create Mode + full 64-track Engineer Mode','BUY / BOOK','FAMILY SUPPORT','REVENUE CHANNELS'])if(!studio.includes(x))throw new Error('Unified studio missing '+x)
for(const x of ['sellerShareBasisPoints:8500','tryammShareBasisPoints:1500','automaticCashTransfer:false','requiresOwnerOrGuardianApproval:true'])if(!business.includes(x))throw new Error('Business revenue guardrail missing '+x)
for(const id of ['aniyah-30d-pass','aniyah-ai-session','aniyah-engineer-session','aniyah-remote-record','aniyah-mix-master','aniyah-soundtrack-package']){if(!checkout.includes(id))throw new Error('Checkout missing '+id)}
if(!checkout.includes("seller:'aniyah-64-track-studio'")||!checkout.includes('platformBasisPoints:1500'))throw new Error('Aniyah/TRYAMM split not server-priced')
for(const x of ['Aniyah64TrackStudio','showAniyahStudio','ANIYAH 64-TRACK','__showAniyah64TrackStudio'])if(!app.includes(x))throw new Error('App mount missing '+x)
console.log('Aniyah 64-track business convergence contract: PASS')