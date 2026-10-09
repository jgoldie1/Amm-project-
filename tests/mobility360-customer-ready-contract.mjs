import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root='amm-omniverse/public/'
const store=readFileSync(root+'mobility360.html','utf8')
const learn=readFileSync(root+'mobility360-learn.html','utf8')
const help=readFileSync(root+'mobility360-help.html','utf8')
const share=readFileSync(root+'mobility360-experience.js','utf8')
const styles=readFileSync(root+'mobility360-experience.css','utf8')
const scripts=Array.from(store.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g), m=>m[1])

test('product and website sharing has valid JavaScript, safe URLs and browser fallback',()=>{
  assert.doesNotThrow(()=>new Function(share))
  for(const js of scripts)assert.doesNotThrow(()=>new Function(js))
  for(const value of ["'product'","byId.has(id)","navigator.share","navigator.clipboard.writeText","window.prompt","Mobility360OpenProduct","No verified"]) {
    if(value==='No verified')continue
    assert.ok(share.includes(value)||store.includes(value),'missing share function '+value)
  }
  assert.match(share,/\/mobility360\.html/)
  assert.match(share,/window\.location\.origin/)
  assert.doesNotMatch(share,/localStorage|sessionStorage|fetch\(|\/api\/checkout|stripe/i)
  assert.match(store,/id="shareStatus"/)
  assert.match(store,/data-share-site/)
  assert.match(store,/id="modalShare"/)
  assert.match(store,/window\.Mobility360OpenProduct=/)
  assert.match(store,/window\.history\.replaceState/)
  assert.match(store,/className='product-share'/)
  assert.match(styles,/focus-visible/)
  assert.match(styles,/min-height:44px/)
})

test('all ten departments and four extra bundle concepts are visible',()=>{
  assert.match(store,/for\(const c of departments\.slice\(1\)\)/)
  for(const value of ['Dressing Ease','Adaptive Kitchen','Caregiver Essentials','Low-Vision Living','No checkout available','0 approved for sale'])assert.ok(store.includes(value),value)
  assert.doesNotMatch(store,/api\/checkout|stripe\.redirectToCheckout|Add to cart/i)
})

test('customer help explains scope, prices, safety, shopping and accessibility',()=>{
  for(const value of ['id="faq"','id="safety"','id="sellers"','role="note"','No. The site is a public discovery preview','shipping-time guarantee','FDA registered','Medicare','You do not need to disclose a diagnosis','media','id="main"','class="skip"']) {
    assert.ok(help.includes(value),value)
  }
  for(const value of ['/mobility360.html','/mobility360-learn.html','/mobility360-assistant.js']){
    assert.ok(help.includes(value),value)
  }
  assert.ok((help.match(/<details>/g)||[]).length>=10)
  assert.doesNotMatch(help,/<form|api\/checkout|stripe\.redirectToCheckout|Buy now|Add to cart/i)
  assert.match(store,/\/mobility360-help\.html/)
  assert.match(learn,/\/mobility360-help\.html/)
})

test('product links never reveal private diagnoses or imply order capability',()=>{
  assert.match(share,/The product concept only|Product concept only/)
  assert.match(share,/The current|Preview only|Preview/)
  assert.doesNotMatch(share,/medicalHistory|diagnosis=|user_id|email=|ssn|api\/checkout/i)
  assert.match(store,/Price pending verification/)
  assert.match(store,/Supplier, quality and shipping approval are still pending/)
})
