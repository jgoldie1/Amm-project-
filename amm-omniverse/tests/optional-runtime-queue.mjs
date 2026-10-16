import assert from 'node:assert/strict'
import { createOptionalRuntimeQueue } from '../src/runtime/OptionalRuntimeQueue.ts'

const turns = [], pending = [], started = []
const enqueue = createOptionalRuntimeQueue(run => turns.push(run))
for (let i = 0; i < 5; i++) enqueue(() => {
  started.push(i)
  return new Promise(resolve => pending.push(resolve))
})
const flush = () => new Promise(resolve => setImmediate(resolve))
assert.deepEqual(started, [], 'Enqueuing must not run imports before first paint')
turns.shift()(); await flush()
assert.deepEqual(started, [0], 'Only one import may start per browser turn')
turns.shift()(); await flush()
assert.deepEqual(started, [0, 1])
assert.equal(turns.length, 0, 'Two active imports must cap the download burst')
pending.shift()(); await flush()
turns.shift()(); await flush()
assert.deepEqual(started, [0, 1, 2], 'Completion releases the next queued import')
while (pending.length || turns.length) {
  while (pending.length) pending.shift()()
  await flush()
  if (turns.length) turns.shift()()
  await flush()
}
assert.deepEqual(started, [0, 1, 2, 3, 4], 'All features remain available')
const recovered = [], retryTurns = []
const retryQueue = createOptionalRuntimeQueue(run => retryTurns.push(run))
const warn = console.warn; console.warn = () => {}
try {
  retryQueue(() => { throw new Error('broken optional module') })
  retryQueue(async () => recovered.push('next'))
  while (retryTurns.length) { retryTurns.shift()(); await flush() }
  assert.deepEqual(recovered, ['next'], 'An optional failure must not stall the queue')
} finally { console.warn = warn }
console.log('PASS: deferred imports, concurrency cap, completion and failure recovery')
