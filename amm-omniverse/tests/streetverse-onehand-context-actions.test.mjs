import assert from 'node:assert/strict'
import { test } from 'node:test'
import { adaptOneHandInput } from '../src/runtime/OneHandInputAdapter.ts'

test('one-handed action dispatches interaction for vehicle EXIT', () => {
  const frame = adaptOneHandInput({context:'VEHICLE',actionPressed:true})
  assert.equal(frame.interact,true)
  assert.equal(frame.jump,false)
  assert.equal(frame.brake,false)
})
test('one-handed action dispatches interaction for dialogue SELECT', () => {
  const frame = adaptOneHandInput({context:'DIALOGUE',actionPressed:true})
  assert.equal(frame.interact,true)
  assert.equal(frame.jump,false)
})
test('action remains inactive when not pressed', () => {
  for (const context of ['ON_FOOT','VEHICLE','DIALOGUE','COMBAT']) {
    assert.equal(adaptOneHandInput({context}).interact,false)
  }
})
test('combat action never triggers world interaction', () => {
  const frame = adaptOneHandInput({context:'COMBAT',actionPressed:true})
  assert.equal(frame.interact,false)
  assert.equal(frame.secondary,true)
})
