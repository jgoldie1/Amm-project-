import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=(p)=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
test('existing business homepage and app install remain independent from StreetVerse',()=>{
 const vercel=JSON.parse(read('vercel.json'))
 const routes=vercel.routes
 assert.equal(routes.find(route=>route.src==='/')?.dest,'/business-app.html')
 assert.equal(routes.find(route=>route.src==='/(app|business-app|templates)/?')?.dest,'/business-app.html')
 assert.equal(JSON.parse(read('public/manifest.business.json')).start_url,'/app')
 assert.match(read('src/business-entry.tsx'),/TemplateGallery/)
 assert.match(read('src/main.tsx'),/StreetVerseCinematicMissions/)
 assert.match(read('src/components/StreetVerseMobileWorld.tsx'),/installStreetVerseVisibleForgeBridge/)
 assert.match(read('src/components/StreetVerseGeoSpawnBridge.tsx'),/tryamm:west-side-route-request/)
})
test('production build keeps credentials out of public assets and retains business entry',()=>{
 const vite=read('vite.config.ts')
 assert.match(vite,/assertSafePublicEnv/)
 assert.match(vite,/businessApp: fileURLToPath/)
 assert.match(vite,/streetverseSafe: fileURLToPath/)
 const entries=['business-app.html','index.html','streetverse-safe.html']
 entries.forEach(filename=>assert.ok(fs.statSync('dist/'+filename).size>0))
})
