import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true }, appType: 'custom' })
try {
  const runtime = await server.ssrLoadModule('/src/runtime/StreetVerseAbracadabraGeniiRuntime.ts')
  const bus = new EventTarget()
  globalThis.window = bus
  globalThis.addEventListener = bus.addEventListener.bind(bus)
  globalThis.removeEventListener = bus.removeEventListener.bind(bus)
  const receipts = []
  bus.addEventListener('tryamm:rp-genii-result', event => receipts.push(event.detail))
  const wish = (query, requestId) => bus.dispatchEvent(new CustomEvent('tryamm:rp-genii-request', {detail:{query,requestId}}))
  const game = runtime.installStreetVerseAbracadabraGeniiRuntime()
  const panel = runtime.installStreetVerseAbracadabraGeniiRuntime()
  wish('wave','first')
  assert.equal(receipts.length,1)
  assert.equal(receipts[0].wish.requestId,'first')
  assert.ok(receipts[0].plan.actionIds.length)
  game()
  game()
  wish('church bell','second')
  assert.ok(receipts[1].plan.soundKeys.includes('church_bell'))
  panel()
  wish('wave','closed')
  assert.equal(receipts.length,2)
  const reopened = runtime.installStreetVerseAbracadabraGeniiRuntime()
  wish('   ','empty')
  wish('wave','reopened')
  assert.deepEqual(receipts.map(r => r.wish.requestId),['first','second','reopened'])
  reopened()
} finally {
  await server.close()
}
