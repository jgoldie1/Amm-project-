'use strict'
const assert=require('node:assert/strict')
const {createMiddleWearIdempotency,requestKey}=require('../lib/middlewear-idempotency')

function builder(store,table){
  let filters=[]
  const api={
    insert(row){
      if(table!=='middlewear_idempotency_keys')throw new Error('unexpected table')
      const duplicate=store.rows.find(x=>x.user_id===row.user_id&&x.operation===row.operation&&x.key_hash===row.key_hash)
      if(duplicate)return{select:()=>({maybeSingle:async()=>({data:null,error:{code:'23505'}})})}
      const data={id:'idem-'+(store.rows.length+1),...row,updated_at:new Date().toISOString()}
      store.rows.push(data)
      return{select:()=>({maybeSingle:async()=>({data,error:null})})}
    },
    select(){return api},
    eq(k,v){filters.push([k,v]);return api},
    gt(){return api},
    async maybeSingle(){
      const data=store.rows.find(row=>filters.every(([k,v])=>row[k]===v))||null
      filters=[]
      return{data,error:null}
    },
    update(patch){
      const updater={eq(k,v){for(const row of store.rows)if(row[k]===v)Object.assign(row,patch);return Promise.resolve({error:null})}}
      return updater
    },
  }
  return api
}

async function run(){
  const store={rows:[]}
  const supabase={from:table=>builder(store,table)}
  const idem=createMiddleWearIdempotency({supabase,now:()=>1000})
  const req={headers:{'idempotency-key':'0123456789abcdef'},body:{routeKey:'workforce-to-commerce',taskSummary:'same task',riskBand:'orange'}}
  const first=await idem.acquire(req,'user-1')
  assert.equal(first.acquired,true)
  await idem.complete(first.row.id,'handoff-1')
  const second=await idem.acquire(req,'user-1')
  assert.equal(second.acquired,false)
  assert.equal(second.replay,true)
  assert.equal(second.resourceId,'handoff-1')
  assert.equal(requestKey(req,'user-1').length,64)
  assert.equal(JSON.stringify(store.rows).includes('0123456789abcdef'),false,'raw idempotency key must not persist')
  console.log('TRYAMM MiddleWear distributed idempotency contract: PASS')
}
run().catch(e=>{console.error(e);process.exit(1)})
