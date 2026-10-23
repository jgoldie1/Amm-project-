import fs from 'node:fs'

const actions=fs.readFileSync(new URL('../src/components/StreetVerseActionCarousel.tsx',import.meta.url),'utf8')
const creator=fs.readFileSync(new URL('../src/components/StreetVerseCreatorEarnDock.tsx',import.meta.url),'utf8')
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))
const must=(ok,msg)=>{if(!ok)throw new Error('MOBILE PLAY-FIRST CONTRACT FAIL: '+msg)}

for(const token of [
  "window.matchMedia('(max-width: 700px)').matches",
  "const [open,setOpen]=useState(()=>!mobile||startInRP)",
  "const [rpOpen,setRpOpen]=useState(startInRP)",
  "if(mobile&&!open)return <div",
  "Open StreetVerse RP RPG emoji and GIF actions",
  "🎮 PLAY",
  "🎭 RP / GENII",
  "(!mobile||rpOpen)",
  "tryamm:streetverse-play-focus",
  "tryamm:streetverse-player-position",
  "tryamm:streetverse-vehicle-input",
]) must(actions.includes(token),'actions missing '+token)

must(/ctx\\.broken\\s*\\?\\s*'🔧 REPAIR'\\s*:\\s*'[^']*ACTIONS[^']*'/.test(actions),'launcher must show repair state and an actions label')
must(actions.includes('aria-label="Open in-game action carousel"'),'mobile launcher must have accessible name')
must(actions.includes('aria-label="Open StreetVerse RP RPG emoji and GIF actions"'),'RP launcher must have accessible name')
must(actions.includes('{(!mobile||rpOpen)&&<><div')&&actions.includes('<StreetVerseRPActionSearch compact/><StreetVerseRPOmnibar compact/></>}'),'RP stack is not conditionally hidden on mobile')
must(actions.includes("get('open')==='rp'"),'RP URL must be an explicit opt-in; normal mobile play starts compact')
must(actions.includes("event.type==='tryamm:streetverse-player-position'&&Number(detail.speed||0)<0.1"),'idle world telemetry must not close RP/GIF browser')
must(creator.includes("tryamm:streetverse-play-focus"),'creator dock does not obey Play Mode')
must(creator.includes("if(e.target===e.currentTarget)close()"),'creator backdrop cannot dismiss drawer')
must(String(pkg.scripts?.build||'').includes('streetverse-mobile-play-first-contract.mjs'),'production build does not run mobile play-first contract')

console.log('STREETVERSE MOBILE PLAY-FIRST CONTRACT PASS')
