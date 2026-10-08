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

test('Shop Learn Watch hub is connected, accessible and clearly preview-only', () => {
  const hub = readFileSync(root + 'public/mobility360-learn.html', 'utf8')
  assert.match(page,/\/mobility360-learn\.html/)
  for (const anchor of ['id="learn"','id="watch"','id="community"','href="\/mobility360.html#products"','name="viewport"','class="skip"']) {
    assert.ok(hub.includes(anchor),'Missing hub anchor/control: '+anchor)
  }
  for (const value of ['No samples have been purchased','no instructional product videos are published','No checkout','filming planned','media', 'faith-friendly', 'Caregiver', 'Disability-owned']) {
    assert.ok(hub.toLowerCase().includes(value.toLowerCase()),'Missing hub disclosure: '+value)
  }
  assert.doesNotMatch(hub,/stripe\.redirectToCheckout|api\/checkout|<form\b/i)
})

test('outreach templates and reels pack are created without falsely claiming permission', () => {
  const rights = readFileSync(root + 'docs/STUBBS_MOBILITY360_SUPPLIER_PERMISSION_PACK.md', 'utf8')
  const scripts = readFileSync(root + 'docs/STUBBS_MOBILITY360_BRAND_REELS_AND_STORY_PACK.md', 'utf8')
  const roadmap = readFileSync(root + 'docs/STUBBS_MOBILITY360_COMPLETE_EXPANSION_BLUEPRINT.md', 'utf8')
  assert.match(rights,/Not sent/)
  assert.match(rights,/No contacts were messaged/)
  assert.match(rights,/Photo/i)
  for (const name of ['Folding reacher','Button and zipper','No-tie laces','One-hand jar opener']) {
    assert.ok(scripts.toLowerCase().includes(name.toLowerCase()),name)
  }
  assert.match(scripts,/founder approval/i)
  assert.match(roadmap,/15 founder-requested/i)
  assert.match(roadmap,/No mandatory diagnostic questions/i)
})
