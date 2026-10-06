import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const studio=read('src/components/AllAmericanNetworkControlRoom.tsx')
const runtime=read('src/runtime/BroadcastStudioRuntime.ts')
const network=read('src/components/AllAmericanNetworkHub.tsx')
const tv=read('src/components/TryammTvHome.tsx')
const main=read('src/main.tsx')
const pkg=JSON.parse(read('package.json'))

const must=(ok,msg)=>{if(!ok)throw new Error('ALL AMERICAN NETWORK STUDIO CONTRACT FAIL: '+msg)}

for(const token of [
  'Powered by Stubbs AI + HoloGPT',
  'HOLOGPT AI PRODUCER',
  'HoloGPTAssistant',
  'tryamm:hologpt-study-context',
  "['cam-a','CAM A'",
  "['audio','AUDIO MIXER'",
  "['switcher','VISION SWITCHER'",
  "['prompter','TELEPROMPTER'",
  "['graphics','GRAPHICS'",
  "['captions','CAPTIONS'",
  "['chroma','VIRTUAL SET'",
  "['guest','REMOTE GUESTS'",
  "['playback','PLAYBACK'",
  "['record','RECORDER'",
  "WHO'S ONLINE",
  'broadcast-invite',
  'SCHEDULE SHOW',
  'TAKE LIVE',
  'CLIP TO REELS',
  'SAVE TO OMNIBOX',
]) must(studio.includes(token),'studio missing '+token)

for(const token of [
  'stubbs-ai',
  'hologpt-producer',
  'tryamm:all-american-network-program',
  'tryamm:live-session',
  'tryamm:live-session-end',
  "poweredBy:'Stubbs AI + HoloGPT'",
]) must(runtime.includes(token),'broadcast runtime missing '+token)

must(network.includes('/network/studio'),'All American Network does not expose Studio Control Room')
must(tv.includes('tryamm:all-american-network-program'),'TRYAMM TV does not receive live network program state')
must(tv.includes('/network/studio'),'TRYAMM TV does not link to Studio Control Room')
must(main.includes("AllAmericanNetworkControlRoom"),'Studio Control Room route component missing')
must(main.includes("'/network/studio'"),'Studio route missing')
must(String(pkg.scripts?.build||'').includes('all-american-network-studio-contract.mjs'),'production build does not run network studio contract')

console.log('ALL AMERICAN NETWORK + STUBBS AI + HOLOGPT STUDIO CONTRACT PASS')
