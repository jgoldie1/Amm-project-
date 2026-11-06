/** Restricted operations pilot. No real shipment release or financial transactions.
 * Node 24+. Requires TRYAMM_OPS_TOKEN and webhook secrets.
 * Data is in memory: use a transactional database before production.
 */
import {createServer} from 'node:http'
import {createHmac,timingSafeEqual,randomUUID} from 'node:crypto'
const port=Number(process.env.PORT||4318)
const adminToken=process.env.TRYAMM_OPS_TOKEN||''
const paymentSecret=process.env.TRYAMM_PAYMENT_WEBHOOK_SECRET||''
const carrierSecret=process.env.TRYAMM_CARRIER_WEBHOOK_SECRET||''
if(!adminToken||adminToken.length<32)throw Error('Set TRYAMM_OPS_TOKEN to at least 32 characters')
const partners=new Map(),sellers=new Map(),orders=new Map(),seen=new Set()
const send=(res,status,payload)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(payload))}
const constantEqual=(a,b)=>{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)}
const signed=(body,signature,secret)=>Boolean(secret)&&constantEqual('sha256='+createHmac('sha256',secret).update(body).digest('hex'),signature||'')
const readBody=async req=>{let bytes=0,chunks=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>65536)throw Error('Request too large');chunks.push(chunk)}return Buffer.concat(chunks)}
const valid=(s,max=150)=>typeof s==='string'&&s.trim().length>0&&s.length<=max
const requireAdmin=req=>constantEqual(req.headers.authorization||'','Bearer '+adminToken)
const sanitizeOrder=o=>({id:o.id,sellerId:o.sellerId,partnerId:o.partnerId,status:o.status,paymentVerified:o.paymentVerified,carrierVerified:o.carrierVerified,delivered:o.delivered,tracking:o.tracking||null,realShipmentReleased:false})
export function createPilotServer(){
 return createServer(async(req,res)=>{
  try{
   const path=new URL(req.url||'/', 'http://localhost').pathname
   if(req.method==='GET'&&path==='/health')return send(res,200,{status:'pilot',productionReady:false})
   if(req.method==='POST'&&path==='/webhooks/payment'){
    const body=await readBody(req)
    if(!signed(body,req.headers['x-tryamm-signature'],paymentSecret))return send(res,401,{error:'Invalid signature'})
    const event=JSON.parse(body.toString('utf8'))
    if(!valid(event.id)||!valid(event.orderId)||event.type!=='payment.confirmed'||!valid(event.paymentReference))return send(res,422,{error:'Invalid payment event'})
    if(seen.has('payment:'+event.id))return send(res,200,{duplicate:true})
    const order=orders.get(event.orderId);if(!order)return send(res,404,{error:'Unknown order'})
    seen.add('payment:'+event.id);order.paymentVerified=true;order.paymentReference=event.paymentReference
    return send(res,200,{accepted:true})
   }
   if(req.method==='POST'&&path==='/webhooks/carrier'){
    const body=await readBody(req)
    if(!signed(body,req.headers['x-tryamm-signature'],carrierSecret))return send(res,401,{error:'Invalid signature'})
    const event=JSON.parse(body.toString('utf8'))
    if(!valid(event.id)||!valid(event.orderId)||!valid(event.tracking)||!['in_transit','delivered','exception'].includes(event.status))return send(res,422,{error:'Invalid carrier event'})
    if(seen.has('carrier:'+event.id))return send(res,200,{duplicate:true})
    const order=orders.get(event.orderId);if(!order)return send(res,404,{error:'Unknown order'})
    if(order.tracking&&order.tracking!==event.tracking)return send(res,409,{error:'Tracking mismatch'})
    seen.add('carrier:'+event.id);order.tracking=event.tracking;order.carrierVerified=true;order.delivered=event.status==='delivered';order.status=event.status
    return send(res,200,{accepted:true})
   }
   if(!requireAdmin(req))return send(res,401,{error:'Staff authentication required'})
   if(req.method==='GET'&&path==='/ops')return send(res,200,{mode:'restricted-pilot',partners:[...partners.values()],sellers:[...sellers.values()],orders:[...orders.values()].map(sanitizeOrder)})
   if(req.method==='POST'&&path==='/ops/partner'){
    const body=JSON.parse((await readBody(req)).toString('utf8'))
    if(!valid(body.name)||!valid(body.region)||!valid(body.agreementReference))return send(res,422,{error:'Partner name, region and agreement reference required'})
    const id=randomUUID();partners.set(id,{id,name:body.name,region:body.region,agreementReference:body.agreementReference,verified:false});return send(res,201,{id})
   }
   if(req.method==='POST'&&path==='/ops/seller'){
    const body=JSON.parse((await readBody(req)).toString('utf8'))
    if(!valid(body.name)||!valid(body.identityReference))return send(res,422,{error:'Seller name and identity reference required'})
    const id=randomUUID();sellers.set(id,{id,name:body.name,identityReference:body.identityReference,verified:false});return send(res,201,{id})
   }
   if(req.method==='POST'&&path==='/ops/order'){
    const body=JSON.parse((await readBody(req)).toString('utf8'))
    if(!partners.get(body.partnerId)?.verified||!sellers.get(body.sellerId)?.verified)return send(res,403,{error:'Partner and seller verification required'})
    if(!valid(body.sku)||!Number.isSafeInteger(body.quantity)||body.quantity<1||body.quantity>100)return send(res,422,{error:'Invalid SKU or quantity'})
    const id=randomUUID();orders.set(id,{id,partnerId:body.partnerId,sellerId:body.sellerId,sku:body.sku,quantity:body.quantity,status:'awaiting-payment',paymentVerified:false,carrierVerified:false,delivered:false});return send(res,201,{id})
   }
   // No endpoint approves an identity/contract or releases a real shipment.
   // Human due diligence and a separate durable, audited approval workflow must be implemented first.
   return send(res,404,{error:'Not found'})
  }catch(error){return send(res,error?.message==='Request too large'?413:400,{error:'Invalid request'})}
 })
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href)createPilotServer().listen(port,'127.0.0.1',()=>console.log('TRYAMM restricted pilot listening on 127.0.0.1:'+port))
