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
  "ctx.broken?'🔧 REPAIR':'⚡ ACTIONS'",
  "🎮 PLAY",
  "🎭 RP / GENII",
  "(!mobile||rpOpen)",
  "tryamm:streetverse-play-focus",
  "tryamm:streetverse-vehicle-controlled",
  "tryamm:streetverse-vehicle-denied",
  "tryamm:streetverse-vehicle-interact",
]) must(actions.includes(token),'actions missing '+token)

must(actions.includes('{(!mobile||rpOpen)&&<><div')&&actions.includes('<StreetVerseRPActionSearch compact/><StreetVerseRPOmnibar compact/></>}'),'RP stack is not conditionally hidden on mobile')
must(actions.includes("get('open')==='rp'"),'RP URL must be an explicit opt-in; normal mobile play starts compact')
must(!actions.includes("addEventListener('tryamm:streetverse-player-position'"),'movement telemetry must not auto-close RP/GIF browser')
must(!actions.includes("addEventListener('tryamm:streetverse-vehicle-input'"),'drive controls must not auto-close actions')
must(actions.includes("if(d.entered){setOpen(false);setRpOpen(false)}"),'close only after confirmed vehicle entry')
must(creator.includes("tryamm:streetverse-play-focus"),'creator dock does not obey Play Mode')
must(creator.includes("if(e.target===e.currentTarget)close()"),'creator backdrop cannot dismiss drawer')
must(String(pkg.scripts?.build||'').includes('streetverse-mobile-play-first-contract.mjs'),'production build does not run mobile play-first contract')

console.log('STREETVERSE MOBILE PLAY-FIRST CONTRACT PASS')
