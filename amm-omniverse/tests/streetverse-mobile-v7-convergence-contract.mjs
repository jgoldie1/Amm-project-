import fs from 'node:fs'

const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const css=fs.readFileSync(new URL('../src/components/streetverse-mobile-layout.css',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE MOBILE V7 CONVERGENCE CONTRACT FAIL: '+msg)}

// Lighting: key must dominate fill, and the per-frame weather scaling must use the same constants.
const key=Number((world.match(/MOBILE_SUN_KEY=([\d.]+)/)||[])[1]),fill=Number((world.match(/MOBILE_HEMI_FILL=([\d.]+)/)||[])[1])
must(key>0&&fill>0,'lighting constants missing')
must(key/fill>=1.8,`key/fill ratio ${key}/${fill} too flat (need >=1.8)`)
must(world.includes('sun.intensity=MOBILE_SUN_KEY*weatherVisual.lightMultiplier'),'weather loop must scale the V7 key light, not a hard-coded value')
must(world.includes('hemi.intensity=MOBILE_HEMI_FILL*weatherVisual.lightMultiplier'),'weather loop must scale the V7 fill light')
must(!/renderer\.shadowMap\.enabled=true/.test(world),'phone shadow maps must stay disabled')

// Camera framing: portrait FOV widening bounded so it never fish-eyes.
must(world.includes('camera.aspect<1?THREE.MathUtils.clamp('),'portrait FOV adaptation missing')
must(/,62,72\):62;camera\.updateProjectionMatrix/.test(world),'portrait FOV must be clamped to 62..72')

// HUD: every right-column control gets a distinct slot.
const slots=['#sv-store-open','#sv-retail-open','[data-streetverse-create-earn]','[aria-label="Open Universal Mission Director"]','[aria-label="Open repair actions"]']
const block=css.slice(css.indexOf("portrait-stack-v7"))
must(block.length>20,'V7 portrait HUD block missing')
const bottoms=slots.map(sel=>{const i=block.indexOf(sel);must(i>=0,'slot missing for '+sel);const m=block.slice(i).match(/bottom: calc\(env\(safe-area-inset-bottom\) \+ (\d+)px\)/);must(m,'bottom slot missing for '+sel);return Number(m[1])})
const heights=[38,38,44,42,44]
for(let i=1;i<bottoms.length;i++)must(bottoms[i]>=bottoms[i-1]+heights[i-1],`${slots[i]} overlaps ${slots[i-1]}`)
must(block.includes('[aria-label="Start StreetVerse Reel recording"]'),'reel button must be separated from live mic')

for(const token of ["mobileLightingPass:'key-fill-depth-v7'","mobileHudLayoutPass:'portrait-stack-v7'","mobileCameraFramingPass:'portrait-fov-v7'"])must(world.includes(token),'world-ready proof missing '+token)

console.log('STREETVERSE MOBILE V7 CONVERGENCE CONTRACT PASS: key/fill '+key+'/'+fill+' • portrait FOV 62..72 • right-column HUD slots '+bottoms.join('/'))
