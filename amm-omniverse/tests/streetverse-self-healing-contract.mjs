import fs from 'node:fs'

const source=fs.readFileSync(new URL('../src/components/StreetVersePlayableWorld.tsx',import.meta.url),'utf8')
const safeSource=fs.readFileSync(new URL('../src/components/StreetVerseSafeWorld.tsx',import.meta.url),'utf8')
const required=[
  'MobileRuntimeGuard',
  'tryamm:streetverse-runtime-health',
  '3D startup remains unverified',
  'mobile-heartbeat-delayed',
  'webglcontextlost',
  'StreetVerseSafeWorld',
  "detail.mobileLite===true&&detail.htmlCity!==true&&detail.mobileSafeMode!==true",
  "document.visibilityState==='visible'",
]
for(const needle of required){if(!source.includes(needle))throw new Error(`StreetVerse self-healing contract missing: ${needle}`)}
if(!safeSource.includes('StreetVerseMobilePlayableWorld'))throw new Error('Safe world must retain a generic emergency renderer')
if(!safeSource.includes('StreetVerseHydeParkMobileWorld'))throw new Error('Safe world must retain Hyde Park emergency rendering')
if(!/setSafeFallback\(true\)/.test(source))throw new Error('StreetVerse must retain explicit WebGL context-loss recovery')
if(!/20000/.test(source)||!/30000/.test(source))throw new Error('StreetVerse must use tolerant mobile boot and heartbeat windows')
if(source.includes("fail('mobile-webgl-no-heartbeat')")||source.includes("fail('mobile-webgl-stalled')"))throw new Error('Slow mobile startup/heartbeat must not force the legacy safe interface')
if(source.includes("report('healthy','mobile-boot-grace')"))throw new Error('3D health must require a real renderer-ready event')
if(!safeSource.includes('data-streetverse-restore-3d')||!safeSource.includes("url.searchParams.delete('safe')"))throw new Error('HTML CITY MODE must offer an accessible real 3D retry path')
console.log('StreetVerse self-healing contract: PASS (real 3D health evidence + mobile fallback recovery)')
