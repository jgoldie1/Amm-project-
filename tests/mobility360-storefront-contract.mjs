import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = 'amm-omniverse/';
const page = readFileSync(base+'public/mobility360.html','utf8');
function arrayAfter(variable) {
  const match = page.match(new RegExp('const '+variable+'=(\\[[^\\n]*\\]);'));
  assert.ok(match, 'missing '+variable);
  return JSON.parse(match[1]);
}
const catalog = arrayAfter('catalog');
const categories = arrayAfter('categories');
const needs = arrayAfter('needs');

test('catalog has 26 distinct product concepts and defined risk gates', () => {
  assert.equal(catalog.length,26);
  assert.equal(new Set(catalog.map(item=>item.id)).size,catalog.length);
  assert.equal(categories.length,11);
  for(const item of catalog){
    assert.ok(item.name && item.note && item.gate, item.id);
    assert.ok(categories.includes(item.category),item.id);
    assert.ok(needs.includes(item.need),item.id);
  }
  assert.ok(catalog.filter(item=>item.gate==='Clinical review').length>=4);
});

test('preview cannot mislead customers into thinking they can buy', () => {
  assert.match(page,/Product discovery preview/);
  assert.match(page,/Checkout is intentionally unavailable/);
  assert.match(page,/Pricing pending supplier verification/);
  assert.doesNotMatch(page,/stripe\.redirectToCheckout|api\/checkout|add-to-cart/i);
});

test('accessible mobile catalogue has usable search and filter controls', () => {
  for(const value of ['name="viewport"','id="search"','id="category"','id="need"','aria-live="polite"','id="large"','function render()']){
    assert.ok(page.includes(value),'missing '+value);
  }
});

test('all three TRYAMM navigation surfaces link to storefront', () => {
  for(const path of ['src/App.tsx','src/components/TryAMMHome.tsx','src/components/AllAmericanOmnichannelCenter.tsx']){
    assert.ok(readFileSync(base+path,'utf8').includes('/mobility360.html'),'missing link in '+path);
  }
});
