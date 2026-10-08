import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'

const base='amm-omniverse/public/'
const compare=readFileSync(base+'mobility360-compare.js','utf8')
const css=readFileSync(base+'mobility360-compare.css','utf8')
const page=readFileSync(base+'mobility360.html','utf8')

test('product ideas can be compared without commerce or medical fabrication',()=>{
 assert.doesNotThrow(()=>new Function(compare))
 for(const token of ['chosen.size<3','p.gate===','p.gate===\'clinical\'','Not available — supplier quote pending','No verified sale prices, stock or orders','toggle(id)','refresh:paintButtons']){
   assert.ok(compare.includes(token),'missing comparison safety token '+token)
 }
 assert.doesNotMatch(compare,/fetch\(|localStorage|sessionStorage|\/api\/checkout|stripe|addToCart/i)
})
test('accessible selection and comparison pane are wired',()=>{
 for(const token of ['id="comparePanel"','id="compareClear"','id="compareSummary"','aria-live="polite"','id="compareGrid"','className=\'compare-toggle\'','aria-pressed','window.Mobility360Compare?.toggle','/mobility360-compare.js','/mobility360-compare.css']){
   assert.ok(page.includes(token),'missing comparison UI '+token)
 }
 for(const token of ['focus-visible','min-height:44px','[aria-pressed=true]','[aria-pressed=true]']){
   assert.ok(css.includes(token),'missing CSS '+token)
 }
 assert.match(page,/51 planned items/)
 assert.match(page,/0 approved for sale/)
})
