import assert from 'node:assert/strict'
import {test} from 'node:test'
import {initialDeliveryState,assignDelivery,advanceDelivery,compareFulfillmentQuotes,estimateSellerPlan,validateInventorySync,nextReturnStage} from '../src/runtime/StreetVerseHoloDeliveryRuntime.ts'
import {mayReleaseRealShipment,mayApproveRealWarehouse} from '../src/runtime/StreetVerseFulfillmentProductionGate.ts'
import {initialFulfillmentState,addPartner,approvePartner,addSeller,approveSeller,createDemoOrder,advanceDemoOrder} from '../src/runtime/StreetVerseWarehousePartnerRuntime.ts'
test('partner and seller approval gates and unique orders',()=>{
 let s=initialFulfillmentState();s=addPartner(s,'Chicago 3PL','Chicago');s=addSeller(s,'Creator Store')
 const partner=s.partners[0].id,seller=s.sellers[0].id
 assert.equal(createDemoOrder(s,seller,partner,'shirt',1),s)
 s=approvePartner(s,partner);assert.equal(createDemoOrder(s,seller,partner,'shirt',1),s)
 s=approveSeller(s,seller);assert.equal(createDemoOrder(s,seller,partner,'shirt',0),s)
 s=createDemoOrder(s,seller,partner,'shirt',2);assert.equal(s.orders.length,1)
 assert.equal(s.orders[0].demo,true)
 assert.equal(advanceDemoOrder(s,s.orders[0].id,'','').orders[0].status,'accepted')
})
test('order stage order, shipment tracking required, no backward moves',()=>{
 let s=initialFulfillmentState();s=addPartner(s,'A','Chicago');s=addSeller(s,'B');s=approvePartner(s,s.partners[0].id);s=approveSeller(s,s.sellers[0].id)
 s=createDemoOrder(s,s.sellers[0].id,s.partners[0].id,'shirt',1)
 const id=s.orders[0].id
 for(const status of ['accepted','picked','packed']){s=advanceDemoOrder(s,id);assert.equal(s.orders[0].status,status)}
 assert.equal(advanceDemoOrder(s,id),s)
 s=advanceDemoOrder(s,id,'Sample carrier','DEMO123');assert.equal(s.orders[0].status,'shipped')
 s=advanceDemoOrder(s,id);assert.equal(s.orders[0].status,'delivered');assert.equal(advanceDemoOrder(s,id),s)
})
test('last mile requires eligible order, ordered transitions, and proof code',()=>{
 let d=initialDeliveryState();assert.equal(assignDelivery(d,'ORDER-1','BJ',false),d)
 d=assignDelivery(d,'ORDER-1','BJ',true);assert.equal(d.jobs.length,1)
 assert.equal(assignDelivery(d,'ORDER-1','Other',true),d)
 const id=d.jobs[0].id;assert.equal(advanceDelivery(d,id,'deliver','1234'),d)
 d=advanceDelivery(d,id,'pickup');assert.equal(d.jobs[0].stage,'picked-up')
 d=advanceDelivery(d,id,'depart');assert.equal(d.jobs[0].stage,'out-for-delivery')
 assert.equal(advanceDelivery(d,id,'deliver',''),d)
 d=advanceDelivery(d,id,'deliver','DEMO-1234');assert.equal(d.jobs[0].stage,'delivered')
 assert.equal(advanceDelivery(d,id,'fail'),d)
})
test('last-mile failure can be returned, not marked delivered',()=>{
 let d=assignDelivery(initialDeliveryState(),'ORDER-2','BJ',true),id=d.jobs[0].id
 d=advanceDelivery(d,id,'pickup');d=advanceDelivery(d,id,'depart');d=advanceDelivery(d,id,'fail')
 assert.equal(d.jobs[0].attempts,1);d=advanceDelivery(d,id,'return');assert.equal(d.jobs[0].stage,'returned')
})
test('rate quotes reject negative rates and compare total costs',()=>{
 const q=compareFulfillmentQuotes([{partnerId:'high',pickPack:3,storage:10,shipping:5,lastMile:4,returns:1},{partnerId:'low',pickPack:2,storage:5,shipping:3,lastMile:2,returns:1},{partnerId:'bad',pickPack:-1,storage:0,shipping:0,lastMile:0,returns:0}],10)
 assert.deepEqual(q.map(x=>x.partnerId),['low','high']);assert.equal(q[0].total,85)
})
test('plans and inventory sync reject invalid or stale updates',()=>{
 assert.equal(estimateSellerPlan('starter',10),0)
 assert.equal(estimateSellerPlan('starter',11),2.5)
 assert.equal(estimateSellerPlan('growth',101),50.5)
 assert.equal(validateInventorySync(3,4,5,false).accepted,false)
 assert.equal(validateInventorySync(3,3,5,true).accepted,false)
 assert.equal(validateInventorySync(3,4,-1,true).accepted,false)
 assert.equal(validateInventorySync(3,4,5,true).accepted,true)
})
test('returns follow strict order',()=>{
 assert.equal(nextReturnStage('requested','close'),null)
 assert.equal(nextReturnStage('requested','approve'),'approved')
 assert.equal(nextReturnStage('approved','receive'),'received')
 assert.equal(nextReturnStage('received','inspect'),'inspected')
 assert.equal(nextReturnStage('inspected','close'),'closed')
 assert.equal(nextReturnStage('closed','approve'),null)
})

test('creator merchandise and returns reject malformed demo requests',()=>{
 assert.equal(createCreatorMerchOrder('','shirt',1),null)
 assert.equal(createCreatorMerchOrder('creator','shirt',0),null)
 assert.deepEqual(createCreatorMerchOrder('creator','shirt',2),{creatorId:'creator',sku:'shirt',quantity:2,demo:true})
 assert.equal(requestDemoReturn('ORDER-1',''),null)
 assert.equal(requestDemoReturn('ORDER-1','damaged')?.status,'requested')
})

test('production policy fails closed for demos and unverified evidence',()=>{
 const auth={authenticated:true,role:'warehouse-staff',partnerId:'WH-1'}
 const evidence={demo:true,paymentVerified:true,agreementActive:true,inventoryConfirmed:true,carrierTrackingVerified:true,reconciled:true}
 assert.equal(mayReleaseRealShipment(auth,evidence),false)
 assert.equal(mayReleaseRealShipment({...auth,authenticated:false},{...evidence,demo:false}),false)
 assert.equal(mayReleaseRealShipment({...auth,role:'seller'},{...evidence,demo:false}),false)
 assert.equal(mayReleaseRealShipment(auth,{...evidence,demo:false,paymentVerified:false}),false)
 assert.equal(mayReleaseRealShipment(auth,{...evidence,demo:false,agreementActive:false}),false)
 assert.equal(mayReleaseRealShipment(auth,{...evidence,demo:false,carrierTrackingVerified:false}),false)
 assert.equal(mayReleaseRealShipment(auth,{...evidence,demo:false}),true)
 assert.equal(mayApproveRealWarehouse({authenticated:true,role:'seller'}),false)
 assert.equal(mayApproveRealWarehouse({authenticated:true,role:'admin'}),true)
})
