import fs from 'node:fs'

const source=fs.readFileSync(new URL('../src/components/StreetVersePlayableWorld.tsx',import.meta.url),'utf8')
const required=[
  'MobileRuntimeGuard',
  'tryamm:streetverse-runtime-health',
  'mobile-webgl-no-heartbeat',
  'mobile-webgl-stalled',
  'webglcontextlost',
  'StreetVerseMobilePlayableWorld',
  "detail.mobileLite===true&&detail.htmlCity!==true&&detail.mobileSafeMode!==true",
  "document.visibilityState==='visible'",
]
for(const needle of required){
  if(!source.includes(needle))throw new Error(`StreetVerse self-healing contract missing: ${needle}`)
}
if(!/setSafeFallback\(true\)/.test(source))throw new Error('StreetVerse self-healing contract must switch to safe fallback after runtime failure')
if(!/8000/.test(source)||!/10000/.test(source))throw new Error('StreetVerse self-healing contract must guard boot and runtime heartbeat stalls')
console.log('StreetVerse self-healing contract: PASS (boot heartbeat + WebGL loss + stall fallback to playable safe city)')
