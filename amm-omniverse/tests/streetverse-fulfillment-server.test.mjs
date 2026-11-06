import {test} from 'node:test'
import assert from 'node:assert/strict'
import {createHmac} from 'node:crypto'
process.env.TRYAMM_OPS_TOKEN='a'.repeat(48)
process.env.TRYAMM_PAYMENT_WEBHOOK_SECRET='payment-test-secret'
process.env.TRYAMM_CARRIER_WEBHOOK_SECRET='carrier-test-secret'
const {createPilotServer}=await import('../server/tryamm-fulfillment-pilot.mjs')
test('server refuses unauthorized operations and unsigned webhook events',async()=>{
 const server=createPilotServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
 const base='http://127.0.0.1:'+server.address().port
 try{
  const health=await fetch(base+'/health');assert.equal((await health.json()).productionReady,false)
  assert.equal((await fetch(base+'/ops')).status,401)
  const auth={authorization:'Bearer '+process.env.TRYAMM_OPS_TOKEN,'content-type':'application/json'}
  const partner=await fetch(base+'/ops/partner',{method:'POST',headers:auth,body:JSON.stringify({name:'Sample Warehouse',region:'Chicago',agreementReference:'DEMO-AGREEMENT'})})
  assert.equal(partner.status,201);const partnerId=(await partner.json()).id
  const seller=await fetch(base+'/ops/seller',{method:'POST',headers:auth,body:JSON.stringify({name:'Demo Creator',identityReference:'DEMO-ID'})})
  assert.equal(seller.status,201);const sellerId=(await seller.json()).id
  const order=await fetch(base+'/ops/order',{method:'POST',headers:auth,body:JSON.stringify({partnerId,sellerId,sku:'shirt',quantity:1})})
  assert.equal(order.status,403)
  const payload=JSON.stringify({id:'evt-1',orderId:'unknown',type:'payment.confirmed',paymentReference:'pay-1'})
  assert.equal((await fetch(base+'/webhooks/payment',{method:'POST',body:payload})).status,401)
  const signature='sha256='+createHmac('sha256',process.env.TRYAMM_PAYMENT_WEBHOOK_SECRET).update(payload).digest('hex')
  assert.equal((await fetch(base+'/webhooks/payment',{method:'POST',headers:{'x-tryamm-signature':signature},body:payload})).status,404)
  assert.equal((await fetch(base+'/ops/release',{method:'POST',headers:auth})).status,404)
  const ops=await (await fetch(base+'/ops',{headers:auth})).json()
  assert.equal(ops.orders.length,0);assert.equal(ops.partners[0].verified,false)
 }finally{await new Promise(resolve=>server.close(resolve))}
})
