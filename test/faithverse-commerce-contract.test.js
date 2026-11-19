'use strict'
const assert=require('node:assert/strict')
const {registerFaithVerseCommerce,readOffers,configured,crmConfigured}=require('../lib/faithverse-commerce-routes')
function response(){
 return {statusCode:200,body:null,status(n){this.statusCode=n;return this},json(v){this.body=v;return this}}
}
async function invoke(routes,method,path,{body={},headers={},user=null,rawBody=undefined}={}){
 const route=routes[method+' '+path];assert.ok(route,'Route missing '+method+' '+path)
 const req={body,headers,user,rawBody},res=response();
 for(const handler of route){if(res.body!==null)break;await handler(req,res,()=>{})}
 return res
}
async function main(){
 const routes={};const store={},emails=[],calls=[];
 const app={get:(path,...handlers)=>routes['GET '+path]=handlers,post:(path,...handlers)=>routes['POST '+path]=handlers}
 const auth=(req,res,next)=>req.user?next():res.status(401).json({code:'SIGN_IN_REQUIRED'})
 const stripe={checkout:{sessions:{
  create:async request=>{calls.push(request);return{id:'cs_test_123',url:'https://checkout.stripe.com/c/pay/cs_test_123'}},
  listLineItems:async()=>({data:[{price:{id:'price_Allowed123'},quantity:1}]})
 }},webhooks:{constructEvent:(raw,signature)=>{if(signature!=='fake_signature'||!raw?.length)throw Error('Bad signature');return {id:'evt_123',type:'checkout.session.completed',data:{object:{id:'cs_test_123',mode:'payment',payment_status:'paid',currency:'usd',amount_total:2400,metadata:{tryammProduct:'faithverse',offerId:'faithcourse',orderId:store.faithverseOrders?.[0]?.id,userId:'user_123'}}}}}}}
 registerFaithVerseCommerce({app,auth,getStore:()=>store,saveStore:async()=>{},makeStripe:()=>stripe,sendEmail:async mail=>emails.push(mail)})
 const user={id:'user_123',email:'verified@example.org'}
 delete process.env.FAITHVERSE_CRM_ENABLED;delete process.env.FAITHVERSE_COMMERCE_ENABLED;
 assert.equal((await invoke(routes,'GET','/api/faithverse/readiness')).body.crmEnabled,false)
 assert.equal((await invoke(routes,'POST','/api/faithverse/enroll',{user,body:{interest:'Bible Reading',consent:true,policyVersion:'faithverse-marketing-v1'}})).statusCode,503)
 assert.equal((await invoke(routes,'POST','/api/faithverse/checkout',{user,body:{offerId:'faithcourse'}})).statusCode,503)
 Object.assign(process.env,{FAITHVERSE_CRM_ENABLED:'true',FAITHVERSE_COMMERCE_ENABLED:'true',FAITHVERSE_DURABLE_STORE_CONFIRMED:'true',FAITHVERSE_LEGAL_APPROVED:'true',
  RESEND_API_KEY:'dummy',FAITHVERSE_FROM_EMAIL:'study@example.org',APP_URL:'https://tryamm.example.org',STRIPE_SECRET_KEY:'sk_test_fake',FAITHVERSE_STRIPE_WEBHOOK_SECRET:'whsec_fake',
  FAITHVERSE_APPROVED_OFFERS_JSON:JSON.stringify([{id:'faithcourse',title:'Kingdoms Press teaching course',stripePriceId:'price_Allowed123',published:true,ownerApproved:true,rightsReviewed:true,refundPolicyApproved:true,refundPolicyUrl:'https://tryamm.example.org/refunds',kind:'course',mode:'payment',description:'Example approved course'}])})
 assert.equal(crmConfigured(),true);assert.equal(configured(),true);assert.equal(readOffers().length,1)
 let reply=await invoke(routes,'POST','/api/faithverse/enroll',{user,body:{interest:'Bible Reading',consent:false,policyVersion:'faithverse-marketing-v1'}})
 assert.equal(reply.statusCode,422)
 reply=await invoke(routes,'POST','/api/faithverse/enroll',{user,body:{interest:'Bible Reading',consent:true,policyVersion:'faithverse-marketing-v1',email:'attacker@evil.example'}})
 assert.equal(reply.statusCode,202);assert.equal(emails[0].to,user.email)
 assert.equal(store.faithverseEnrollments[0].status,'pending_email_confirmation')
 assert.equal((await invoke(routes,'POST','/api/faithverse/enroll',{user,body:{interest:'Bible Reading',consent:true,policyVersion:'faithverse-marketing-v1'}})).statusCode,429)
 const token=/verify=([^"&]+)/.exec(emails[0].html)?.[1]
 assert.ok(token)
 assert.equal((await invoke(routes,'POST','/api/faithverse/confirm',{body:{token}})).body.status,'confirmed')
 assert.equal((await invoke(routes,'POST','/api/faithverse/confirm',{body:{token}})).statusCode,400)
 assert.equal((await invoke(routes,'POST','/api/faithverse/unsubscribe',{user})).body.status,'unsubscribed')
 assert.equal((await invoke(routes,'POST','/api/faithverse/checkout',{user,body:{offerId:'unapproved'}})).statusCode,422)
 reply=await invoke(routes,'POST','/api/faithverse/checkout',{user,body:{offerId:'faithcourse'}})
 assert.equal(reply.statusCode,201);assert.equal(reply.body.status,'pending_verified_payment')
 assert.equal(calls[0].line_items[0].price,'price_Allowed123')
 assert.equal(store.faithverseOrders[0].status,'pending_verified_payment')
 assert.equal((await invoke(routes,'POST','/api/faithverse/stripe/webhook',{headers:{'stripe-signature':'bad'},rawBody:Buffer.from('{}')})).statusCode,400)
 assert.equal(store.faithverseOrders[0].status,'pending_verified_payment')
 reply=await invoke(routes,'POST','/api/faithverse/stripe/webhook',{headers:{'stripe-signature':'fake_signature'},rawBody:Buffer.from('{}')})
 assert.equal(reply.statusCode,200);assert.equal(reply.body.verified,true)
 assert.equal(store.faithverseOrders[0].status,'paid_verified');assert.equal(store.faithverseOrders[0].amountMinor,2400)
 reply=await invoke(routes,'POST','/api/faithverse/stripe/webhook',{headers:{'stripe-signature':'fake_signature'},rawBody:Buffer.from('{}')})
 assert.equal(reply.body.duplicate,true)
 console.log('FaithVerse CRM double opt-in, unsubscribe, approved checkout, and signed webhook checks passed')
}
main().catch(e=>{console.error(e);process.exitCode=1})
