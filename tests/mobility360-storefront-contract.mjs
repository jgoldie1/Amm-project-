import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = 'amm-omniverse/'
const page = readFileSync(root + 'public/mobility360.html','utf8')
function parseArray(name) {
  const match = page.match(new RegExp('const ' + name + '=(\\[[^\\n]*\\]);'))
  assert.ok(match, 'Expected embedded '+name+' data')
  return JSON.parse(match[1])
}
const products = parseArray('products')
const departments = parseArray('departments')

test('Mobility 360 offers 51 distinct preview product concepts across disabilities', () => {
  assert.equal(products.length,51)
  assert.equal(new Set(products.map(x=>x.id)).size,51)
  assert.equal(departments.length,11)
  assert.equal(products.filter(x=>x.gate==='sample').length,4)
  assert.ok(products.filter(x=>x.gate==='clinical').length>=6)
  for(const item of products) {
    assert.ok(item.id && item.name && item.category && item.description && item.gate)
    assert.ok(departments.includes(item.category), item.id)
    assert.ok(['sample','review','clinical'].includes(item.gate),item.id)
  }
})

test('the $100 launch is presented as proposed testing, not inventory or completed purchases', () => {
  assert.match(page,/Our \$100 first-sample plan tests four daily-living aids/)
  assert.match(page,/0 approved for sale/)
  assert.match(page,/Price pending verification/)
  assert.match(page,/No checkout available/)
  assert.doesNotMatch(page,/stripe\.redirectToCheckout|api\/checkout|\bAdd to cart\b/i)
})

test('small screen and accessible shopping flow contain search, filters and detail buttons', () => {
  for (const text of ['name="viewport"','id="search"','id="department"','id="categoryTiles"','id="productGrid"','aria-live="polite"','id="modalTitle"','role="dialog"','function render()','prefers-reduced-motion']) {
    assert.ok(page.includes(text),'Missing '+text)
  }
})

test('TRYAMM offers three routes into new store', () => {
  for(const path of ['src/App.tsx','src/components/TryAMMHome.tsx','src/components/AllAmericanOmnichannelCenter.tsx']) {
    assert.match(readFileSync(root+path,'utf8'),/\/mobility360\.html/, path)
  }
})

test('photo and captioned video support requires approved local media', () => {
  const manifest = JSON.parse(readFileSync(root + 'public/mobility360-media.json','utf8'))
  assert.equal(manifest.version, 1)
  assert.ok(Array.isArray(manifest.entries))
  for(const entry of manifest.entries) {
    assert.equal(entry.approved,true)
    assert.match(entry.imageSrc??'', /^\/mobility360-media\//)
    assert.ok(entry.imageAlt?.trim())
    if(entry.videoSrc) {
      assert.match(entry.videoSrc,/\.mp4$|\.webm$/i)
      assert.match(entry.captionsSrc??'',/\.vtt$/i)
    }
  }
  assert.match(page,/id="mediaGrid"/)
  assert.match(page,/Real pictures\. Helpful demonstrations\./)
  assert.match(page,/item\.approved!==true/)
  assert.match(page,/function safeMediaFile/)
  assert.match(page,/caption\.kind='captions'/)
  assert.match(page,/video\.controls=true/)
  assert.match(page,/video\.preload='none'/)
  assert.match(page,/No photos from third-party social advertisements are reused without permission/)
  assert.doesNotMatch(page,/\.autoplay\s*=\s*true/)
})
