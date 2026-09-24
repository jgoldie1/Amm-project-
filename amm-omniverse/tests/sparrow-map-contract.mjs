import fs from 'node:fs'
import path from 'node:path'

const componentPath=path.resolve('src/components/SparrowMapCenter.tsx')
const appPath=path.resolve('src/App.tsx')
const routePath=path.resolve('src/navigation/routeRegistry.ts')

for(const file of [componentPath,appPath,routePath]){
  if(!fs.existsSync(file))throw new Error(`Required Sparrow integration file is missing: ${file}`)
}

const component=fs.readFileSync(componentPath,'utf8')
const app=fs.readFileSync(appPath,'utf8')
const routes=fs.readFileSync(routePath,'utf8')

for(const layer of ['business','mobility','environment','missions','infrastructure','alerts']){
  if(!component.includes(`id:'${layer}'`))throw new Error(`Sparrow layer missing: ${layer}`)
}

for(const token of [
  'role="dialog"',
  'aria-modal="true"',
  'aria-label="TRYAMM Sparrow Map"',
  'Public, consented or simulated situational data only.',
  'No private-person tracking',
  'no live law-enforcement or camera-avoidance feed',
  'VITE_SPARROW_MAP_STYLE_URL',
  'maplibre-gl',
]){
  if(!component.includes(token))throw new Error(`Sparrow safety/accessibility contract missing: ${token}`)
}

if(!app.includes("const SparrowMapCenter = lazy(() => import('./components/SparrowMapCenter'))")){
  throw new Error('Sparrow map must remain lazy-loaded')
}
if(!app.includes("(window as any).__showSparrowMap = () => setShowSparrowMap(true)")){
  throw new Error('Sparrow map opener must remain available to the route coordinator')
}
if(!app.includes("['MAP','SPARROW MAP',()=>setShowSparrowMap(true),'BETA']")){
  throw new Error('Sparrow map must remain visible in Command Nexus as BETA')
}
if(!routes.includes("{ id:'sparrow-map', path:'/sparrow-map', label:'Sparrow Situational Map', kind:'overlay', opener:'__showSparrowMap', readiness:'beta' }")){
  throw new Error('Sparrow /sparrow-map route must remain registered as beta')
}

console.log('Sparrow situational map route, layers, accessibility and privacy-first data boundary contract passed')
