import fs from 'node:fs'

const actions=fs.readFileSync(new URL('../src/components/StreetVerseActionCarousel.tsx',import.meta.url),'utf8')
const creator=fs.readFileSync(new URL('../src/components/StreetVerseCreatorEarnDock.tsx',import.meta.url),'utf8')
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))
const must=(ok,msg)=>{if(!ok)throw new Error('MOBILE PLAY-FIRST CONTRACT FAIL: '+msg)}

for(const token of [
  "window.matchMedia('(max-width: 700px)').matches",
  "const [open,setOpen]=useState(()=>!mobile)",
  "if(mobile&&!open)return <button",
  "ctx.broken?'🔧 REPAIR':'⚡ ACTIONS'",
  "🎮 PLAY",
  "🎭 RP / GENII",
  "(!mobile||rpOpen)",
  "tryamm:streetverse-play-focus",
  "tryamm:streetverse-player-position",
  "tryamm:streetverse-vehicle-input",
]) must(actions.includes(token),'actions missing '+token)

must(actions.includes("{(!mobile||rpOpen)&&<><StreetVerseRPActionSearch compact/><StreetVerseRPOmnibar compact/></>}"),'RP stack is not conditionally hidden on mobile')
must(creator.includes("tryamm:streetverse-play-focus"),'creator dock does not obey Play Mode')
must(creator.includes("if(e.target===e.currentTarget)close()"),'creator backdrop cannot dismiss drawer')
must(String(pkg.scripts?.build||'').includes('streetverse-mobile-play-first-contract.mjs'),'production build does not run mobile play-first contract')

console.log('STREETVERSE MOBILE PLAY-FIRST CONTRACT PASS')
