import assert from 'node:assert/strict'
import fs from 'node:fs'
const page=fs.readFileSync(new URL('../public/holofon-preview.html',import.meta.url),'utf8')
const requirements=[
  ['storefront heading',/<h1>Holo FON<\/h1>/],
  ['device catalog preview',/data-demo="devices"/],
  ['service preview',/data-demo="service"/],
  ['billing preview',/data-demo="billing"/],
  ['AI Hall Pass preview',/data-demo="hall-pass"/],
  ['mobile viewport',/name="viewport"/],
  ['assistive announcement',/aria-live="polite"/],
  ['no live payment disclaimer',/No purchases, telephone calls, service activations, real bill payments/],
  ['no real customer record collection',/No bill amounts or customer records are loaded/],
]
for(const [name,pattern] of requirements){assert.match(page,pattern,name)}
assert.doesNotMatch(page,/<form\b/i,'Do not collect personal information in a demo')
assert.doesNotMatch(page,/https?:\/\//i,'Demo must not call any service provider or external billing endpoint')
console.log('HOLO FON PREVIEW PASS: '+requirements.length+' offline storefront and safety checks')
