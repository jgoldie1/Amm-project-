import fs from 'node:fs'
import assert from 'node:assert/strict'

const engine=fs.readFileSync(new URL('../src/ai/holoForgeGameEngine.ts',import.meta.url),'utf8')
const panel=fs.readFileSync(new URL('../src/components/HoloForgeGameFactoryPanel.tsx',import.meta.url),'utf8')
const poyo=fs.readFileSync(new URL('../src/components/PoyoAIStudio.tsx',import.meta.url),'utf8')

for(const stage of ['HOLOGPT DESIGN BRIEF','REFERENCE + RIGHTS GATE','CONCEPT / KEYFRAMES','3D / WORLD BUILD','MATERIAL + TEXTURE PASS','RIG / PHYSICS / GAMEPLAY','LOD + PERFORMANCE LAB','AI + SIMULATION QA','HOLO FORGE PACKAGE','WORLD INGEST'])assert.ok(engine.includes(stage),`missing Holo Forge stage: ${stage}`)
for(const cell of ['WORLD COMPOSER','HOLO FORGE','NPC / AGENT STUDIO','MISSION GRAPH','SIMULATION LAB','PERFORMANCE LAB','HOLO DIRECTOR','BUILD + RELEASE FARM'])assert.ok(engine.includes(cell),`missing game development cell: ${cell}`)
assert.ok(engine.includes("outputFormat:'glb+manifest'"),'Holo Forge must package GLB + manifest')
assert.ok(engine.includes('rightsConfirmed'),'Holo Forge must keep a rights/provenance gate')
assert.ok(engine.includes('mobileFallbackRequired'),'Holo Forge must define mobile fallback budgets')
assert.ok(panel.includes('/api/ai-factory/health'),'Holo Forge UI must consume real AI Factory health')
assert.ok(panel.includes('COMPILE HOLO FORGE PRODUCTION PLAN'),'Holo Forge UI must expose a visible compile action')
assert.ok(poyo.includes('<HoloForgeGameFactoryPanel />'),'Poyo AI Studio must surface Holo Forge')
console.log('Holo Forge game-production contract: PASS (10 forge stages + 8 engine cells + Poyo integration)')
