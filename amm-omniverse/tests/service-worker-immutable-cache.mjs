import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

const listeners = {}, saved = new Map(), network = []
const cache = {match: async request => saved.get(request.url), put: async (request, response) => saved.set(request.url, response)}
vm.runInNewContext(fs.readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8'), {
  URL, Response,
  self: {location: {origin: 'https://tryamm.online'}, addEventListener: (name, handler) => {listeners[name] = handler}},
  caches: {open: async () => cache, match: cache.match},
  fetch: async (request, options) => {network.push({url: request.url, options}); return new Response('new', {headers: {'content-type': 'application/javascript'}})},
})
async function load(path, mode = 'cors') {
  let result
  listeners.fetch({request: {url: 'https://tryamm.online' + path, method: 'GET', mode}, respondWith: promise => {result = promise}})
  return result
}
saved.set('https://tryamm.online/assets/main-ABCDEFG1.js', new Response('saved', {headers: {'content-type': 'application/javascript'}}))
assert.equal(await (await load('/assets/main-ABCDEFG1.js')).text(), 'saved')
assert.equal(network.length, 0, 'An unchanged hashed bundle must not redownload')
await load('/assets/main-ABCDEFG2.js')
assert.equal(network.length, 1, 'A new release hash must fetch the new bundle')
await load('/', 'navigate')
assert.equal(network.length, 2, 'Navigation must still fetch current HTML')
await load('/assets/main.js')
assert.equal(network.length, 3, 'Unversioned assets must still use the network')
saved.set('https://tryamm.online/assets/bad-ABCDEFG1.js', new Response('<html/>', {headers: {'content-type': 'text/html'}}))
await load('/assets/bad-ABCDEFG1.js')
assert.equal(network.length, 4, 'Cached HTML must never be returned as a JS module')
console.log('PASS: cached hashed JS reused; new hashes, navigation, unversioned assets and invalid MIME fetch fresh')
