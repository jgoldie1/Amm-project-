import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto'

const migration = name => readFileSync(new URL('../../supabase/migrations/' + name, import.meta.url), 'utf8')
const platform = migration('20261123000100_platform_internal_chain.sql')
const db = new PGlite({ extensions: { pgcrypto } })
const payload = 'ab'.repeat(32)
const resource = 'campus|delivery, "Chicago"'
const anchor = (id, kind = 'DELIVERY', digest = payload) => db.query(
  'select public.anchor_internal_chain_event($1,$2,$3,$4) as receipt', [id, kind, resource, digest]
).then(r => r.rows[0].receipt)
const attest = hash => db.query(
  "select public.anchor_set_apart_chain_event('community-1','EDUCATION','campus',$1,$2)", [payload, hash]
)
const auditSql = readFileSync(new URL('../../supabase/audits/platform_internal_chain.sql', import.meta.url), 'utf8')
const audit = () => db.query(auditSql)
try {
  await db.exec('create role anon; create role authenticated; create role service_role bypassrls; create schema extensions; create extension pgcrypto with schema extensions')
  await db.exec(migration('20260904195500_set_apart_kingdom_chain_layer.sql'))
  await db.transaction(tx => tx.exec(platform))
  await assert.rejects(db.transaction(tx => tx.exec(platform)), /requires schema and receipt comparison/)
  for (const role of ['anon', 'authenticated','service_role']) {
    await db.exec('set role ' + role)
    if (role !== 'service_role') await assert.rejects(anchor('denied'), { code: '42501' })
    for (const sql of ['select * from', 'delete from', 'truncate', 'update', 'insert into']) {
      const tail = sql === 'update' ? ' set event_type=event_type' : sql === 'insert into' ? ' default values' : ''
      await assert.rejects(db.exec(sql + ' public.internal_chain_blocks' + tail), { code: '42501' })
    }
    await db.exec('reset role')
  }
  await db.exec('set role service_role')
  for (const invalid of [null,'','wrong']) await assert.rejects(anchor('bad','DELIVERY',invalid), { code:'22023' })
  const first = await anchor('delivery-1')
  assert.equal(first.blockNumber,1)
  assert.equal(first.previousBlockHash,null)
  assert.deepEqual(await anchor(' delivery-1 ','DELIVERY',payload.toUpperCase()),first)
  await assert.rejects(anchor('delivery-1','OTHER'), /idempotency_conflict/)
  await db.exec('begin')
  await anchor('rolled-back')
  await db.exec('rollback')
  const second = await anchor('delivery-2')
  assert.equal(second.blockNumber,2)
  assert.equal(second.previousBlockHash,first.blockHash)
  await assert.rejects(attest('0'.repeat(64)), { code:'23503' })
  await attest(second.blockHash)
  await db.exec('reset role')
  // Independent digest using PostgreSQL json_build_array's comma-space separators.
  const utc = (await db.query("select to_char(created_at at time zone 'UTC','YYYY-MM-DD\"T\"HH24:MI:SS.US\"Z\"') as t from public.internal_chain_blocks where block_number=1")).rows[0].t
  const fields = ['tryamm-platform-v1',1,'delivery-1','DELIVERY',resource,payload,null,utc]
  const wire = '[' + fields.map(value => JSON.stringify(value)).join(', ') + ']'
  assert.equal(createHash('sha256').update(wire).digest('hex'),first.blockHash)
  await db.exec("set timezone='America/Chicago'")
  assert.deepEqual((await audit()).rows,[])
  await db.exec("update public.internal_chain_blocks set resource_ref='changed' where block_number=1")
  assert.equal((await audit()).rows.length,1)
  console.log('PASS platform database migration, existing-chain guard, role permissions, input validation, replay, conflict, rollback, hash linkage, independent SHA-256, timezone, cross-anchor and tamper detection')
} finally {
  await db.close()
}
