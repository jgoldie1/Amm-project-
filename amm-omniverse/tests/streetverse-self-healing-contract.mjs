import fs from 'node:fs'

const source=fs.readFileSync(new URL('../src/components/StreetVersePlayableWorld.tsx',import.meta.url),'utf8')
const safeSource=fs.readFileSync(new URL('../src/components/StreetVerseSafeWorld.tsx',import.meta.url),'utf8')
const required=[
  'MobileRuntimeGuard',
  'tryamm:streetverse-runtime-health',
  'mobile-boot-grace',
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
console.log('StreetVerse self-healing contract: PASS (tolerant mobile boot + explicit WebGL loss recovery without false safe fallback)')
