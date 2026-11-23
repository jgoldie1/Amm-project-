import {PGlite} from '@electric-sql/pglite'
import {readFile} from 'node:fs/promises'
import assert from 'node:assert/strict'
import test from 'node:test'

test('only approved accounts can claim within their cumulative allowance', async () => {
  const db = new PGlite()
  const user = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
  const approve = limit => db.query('select approve_drama_creator_pass($1,$2,$1)', [user,limit])
  const claim = reference => db.query('select claim_drama_creator_render($1,$2) as receipt', [user,'drama-pass:'+reference])
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      create schema auth;
      create table auth.users(id uuid primary key);
      create table tryamm_credit_entitlements(user_id uuid,item_id text,entitlement_type text,source_id text,metadata jsonb,unique(user_id,source_id));
      create table tryamm_credit_wallets(user_id uuid,status text,play_refund_debt_units int);
    `)
    const migration = new URL('../supabase/migrations/20261123000500_drama_creator_pass.sql',import.meta.url)
    await db.exec(await readFile(migration,'utf8'))
    await db.query('insert into auth.users values($1)',[user])
    await assert.rejects(claim('a'),/inactive/)
    await approve(80)
    const first = await claim('a')
    assert.equal(first.rows[0].receipt.remainingUnits,40)
    assert.equal(first.rows[0].receipt.walletDebit,0)
    assert.deepEqual(await claim('a'),first)
    const competing = await Promise.allSettled([claim('b'),claim('c')])
    assert.equal(competing.filter(x=>x.status==='fulfilled').length,1)
    await approve(80)
    await assert.rejects(claim('d'),/limit/)
    await approve(0)
    await assert.rejects(claim('a'),/inactive/)
    await assert.rejects(approve(401))
    await db.exec('set role authenticated')
    await assert.rejects(approve(80),/permission denied/)
    await assert.rejects(claim('e'),/permission denied/)
  } finally {await db.close()}
})
