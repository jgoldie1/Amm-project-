import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

function runGuard(mounted) {
  const node = () => ({style: {}, children: [], appendChild(child) {this.children.push(child)}})
  const canary = {...node(), isConnected: !mounted}
  let timeout
  const document = {
    createElement: node,
    getElementById: id => id === 'tryamm-bootstrap-canary' ? (mounted ? null : canary) : canary.children.find(child => child.id === id),
  }
  vm.runInNewContext(fs.readFileSync(new URL('../public/tryamm-startup-guard.js', import.meta.url), 'utf8'), {
    document, URL, Date,
    location: {href: 'https://tryamm.online/streetverse?district=west#bj'},
    window: {setTimeout: callback => {timeout = callback}, clearTimeout() {}, addEventListener() {}},
  })
  assert.equal(typeof timeout, 'function', 'Recovery cannot depend on DOMContentLoaded or app modules')
  timeout()
  return {canary, timeout}
}
const stalled = runGuard(false)
const links = stalled.canary.children[0].children
assert.equal(links.length, 3)
assert.match(links[0].href, /district=west&startup_retry=/)
assert.ok(links[0].href.endsWith('#bj'), 'Retry must preserve route context')
assert.equal(links[1].href, '/streetverse-safe.html')
stalled.timeout()
assert.equal(stalled.canary.children.length, 1, 'Recovery must not duplicate controls')
assert.equal(runGuard(true).canary.children.length, 0, 'A mounted app must never be replaced')
for (const file of ['tryamm-retail-world.js', 'tryamm-immersive-store.js']) {
  const events = []
  vm.runInNewContext(fs.readFileSync(new URL('../public/' + file, import.meta.url), 'utf8'), {
    location: {pathname: '/streetverse'},
    window: {addEventListener: name => events.push(name)},
    document: {createElement() {throw new Error('Shop mounted during bootstrap')}},
  })
  assert.ok(events.includes('tryamm:streetverse-enter'))
}
console.log('PASS: stalled startup recovery, successful mount preserved, route-preserving retry, shops wait for game entry')
