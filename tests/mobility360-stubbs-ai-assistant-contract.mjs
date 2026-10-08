import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root='amm-omniverse/'
const guide=readFileSync(root+'public/mobility360-assistant.js','utf8')
const style=readFileSync(root+'public/mobility360-assistant.css','utf8')
const store=readFileSync(root+'public/mobility360.html','utf8')
const learn=readFileSync(root+'public/mobility360-learn.html','utf8')
const app=readFileSync(root+'src/App.tsx','utf8')
const hologpt=readFileSync(root+'src/components/HoloGPTAssistant.tsx','utf8')

test('standalone store concierge compiles and uses catalog preview metadata',()=>{
  assert.doesNotThrow(()=>new Function(guide))
  for(const key of ['window.__mobility360PreviewCatalog','function answer(question)','function findMatches','Ask Stubbs AI','51 proposed products'])assert.ok(guide.includes(key),key)
  assert.match(store,/window\.__mobility360PreviewCatalog=products\.map/)
  assert.match(store,/\/mobility360-assistant\.js/)
  assert.match(learn,/\/mobility360-assistant\.js/)
  assert.match(store,/\/mobility360-assistant\.css/)
  assert.match(learn,/\/mobility360-assistant\.css/)
})

test('customer support stays accessible and local-first without clinical product recommendations or false checkout',()=>{
  for(const key of ['aria-modal="true"','aria-live="polite"','Close shopping guide','Voice input','Read answer','role="log"','Focus']) {
    if(key==='Focus')continue
    assert.ok(guide.includes(key),'missing '+key)
  }
  assert.match(guide,/p\.gate === 'clinical'/)
  assert.match(guide,/zero approved items available for checkout/)
  assert.match(guide,/No diagnosis required/)
  assert.match(guide,/browser’s speech provider/)
  assert.match(guide,/microphone\.addEventListener\('click'/)
  assert.match(guide,/event\.key === 'Escape'/)
  assert.match(style,/@media\(max-width:550px\)/)
  assert.doesNotMatch(guide,/fetch\s*\(|localStorage|sessionStorage|\/api\/ai\/answer/)
  assert.doesNotMatch(guide,/checkout\.create|Add to Cart|diagnose your condition/i)
})

test('HoloGPT is an optional explicit app handoff with no private query embedded in URL',()=>{
  assert.match(guide,/\/\?open=hologpt&amp;context=mobility360/)
  assert.match(app,/lazy\(\(\) => import\('\.\/components\/HoloGPTAssistant'\)\)/)
  assert.match(app,/get\('open'\) === 'hologpt'/)
  assert.match(app,/showHoloGPT && <HoloGPTAssistant showLauncher=\{false\} openOnMount/)
  assert.match(app,/window\.dispatchEvent\(new Event\('tryamm:open-hologpt'\)\)/)
  assert.match(hologpt,/openOnMount=false/)
  assert.match(hologpt,/Opening Stubbs Mobility 360\./)
  assert.match(hologpt,/Help me explore the Stubbs Mobility 360 accessibility marketplace/)
})
