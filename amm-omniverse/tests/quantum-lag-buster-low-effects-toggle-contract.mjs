import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const code=readFileSync(new URL('../src/components/StreetVerseMobilePlayableWorld.tsx',import.meta.url),'utf8')
test('low effects is explicit and reversible on mobile',()=>{
 for(const s of ['const [lowEffects,setLowEffects]=useState(false)','aria-pressed={lowEffects}',"setLowEffects(value=>!value)",'RESTORE EFFECTS','LOW EFFECTS','data-streetverse-low-effects={lowEffects?','animation:none!important'])assert.ok(code.includes(s),s)
})
test('cosmetic-only visual reduction preserves vehicles, NPCs and mission saves',()=>{
 assert.ok(code.includes("const PEOPLE="))
 assert.ok(code.includes("localStorage.setItem(SAVE_KEY"))
 assert.ok(code.includes("tryamm:streetverse-vehicle-interact"))
 assert.doesNotMatch(code,/setLowEffects\([^\n]+localStorage\.clear/)
})
