import fs from 'node:fs'
const cat=fs.readFileSync(new URL('../src/data/ElSaturnBusinessRevenueCatalog.ts',import.meta.url),'utf8')
const ui=fs.readFileSync(new URL('../src/components/ElSaturnBusinessRevenueCenter.tsx',import.meta.url),'utf8')
const app=fs.readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8')
for(const x of ['El Saturn Fintech Orchestration','Robotic Fabrication Cell Services','12D Fabrication Service','Distributed Print Swarm Network','Logistics + Fleet OS','AI Business OS'])if(!cat.includes(x))throw new Error('Revenue catalog missing '+x)
for(const x of ['subscription','managed-service','fintech-fee','fabrication-margin'])if(!cat.includes(x))throw new Error('Revenue model missing '+x)
if(!ui.includes('BUSINESS REVENUE CENTER'))throw new Error('Revenue center UI missing')
if(!app.includes('ElSaturnBusinessRevenueCenter'))throw new Error('Revenue center not mounted')
console.log('El Saturn business revenue packaging contract: PASS')