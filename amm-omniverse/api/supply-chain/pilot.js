import {adminRest,json} from '../_lib/supabase-admin.js';
import {requireUser,audit} from '../_lib/security.js';

const TABLES={
  suppliers:'global_trade_suppliers',rfqs:'global_trade_rfqs',quotes:'global_trade_quotes',
  purchaseOrders:'global_trade_purchase_orders',shipments:'global_trade_shipments',inventory:'global_trade_inventory'
};
const clean=(v,max=180)=>String(v??'').trim().slice(0,max);
const num=v=>Number.isFinite(Number(v))?Number(v):null;
const int=v=>Number.isFinite(Number(v))?Math.trunc(Number(v)):null;
const queryFor=userId=>({owner_user_id:`eq.${userId}`,order:'created_at.desc',limit:100});

async function snapshot(userId){
  const out={};
  for(const [key,table] of Object.entries(TABLES)){
    out[key]=await adminRest(table,{query:queryFor(userId)})||[];
  }
  out.counts=Object.fromEntries(Object.entries(TABLES).map(([key])=>[key,out[key].length]));
  return out;
}

async function createSupplier(user,body){
  const name=clean(body.name,120);if(!name)throw Object.assign(new Error('Supplier name required'),{status:400});
  return (await adminRest(TABLES.suppliers,{method:'POST',body:{owner_user_id:user.id,name,country_code:clean(body.countryCode,2).toUpperCase()||null,supplier_type:clean(body.supplierType,60)||'prospect',status:'prospect',risk_level:'unverified',metadata:{pilot:true,nda_status:clean(body.ndaStatus,40)||'not_recorded',moq:num(body.moq),lead_time_days:int(body.leadTimeDays),contact_name:clean(body.contactName,100),contact_email:clean(body.contactEmail,160)}}}))?.[0];
}
async function createRfq(user,body){
  const title=clean(body.title,140),quantity=num(body.quantity);if(!title||!quantity||quantity<=0)throw Object.assign(new Error('RFQ title and positive quantity required'),{status:400});
  return (await adminRest(TABLES.rfqs,{method:'POST',body:{owner_user_id:user.id,title,description:clean(body.description,1000)||null,sku:clean(body.sku,80)||null,quantity,unit:clean(body.unit,30)||'unit',currency:clean(body.currency,3).toUpperCase()||'USD',target_price:num(body.targetPrice),delivery_country:clean(body.deliveryCountry,2).toUpperCase()||null,delivery_by:clean(body.deliveryBy,10)||null,status:'draft',requirements:{pilot:true,low_moq:Boolean(body.lowMoq),nda_required:Boolean(body.ndaRequired),quality_notes:clean(body.qualityNotes,500)}}}))?.[0];
}
async function createQuote(user,body){
  const rfqId=clean(body.rfqId,80),amount=num(body.amount);if(!rfqId||amount===null||amount<0)throw Object.assign(new Error('RFQ and quote amount required'),{status:400});
  return (await adminRest(TABLES.quotes,{method:'POST',body:{owner_user_id:user.id,rfq_id:rfqId,supplier_id:clean(body.supplierId,80)||null,amount,currency:clean(body.currency,3).toUpperCase()||'USD',lead_time_days:int(body.leadTimeDays),incoterm:clean(body.incoterm,20)||null,terms:{pilot:true,moq:num(body.moq),notes:clean(body.notes,500)},status:'received'}}))?.[0];
}
async function createPo(user,body){
  const total=num(body.total);if(total===null||total<0)throw Object.assign(new Error('PO total required'),{status:400});
  const poNumber=clean(body.poNumber,80)||`TRY-PO-${Date.now().toString(36).toUpperCase()}`;
  return (await adminRest(TABLES.purchaseOrders,{method:'POST',body:{owner_user_id:user.id,supplier_id:clean(body.supplierId,80)||null,quote_id:clean(body.quoteId,80)||null,po_number:poNumber,currency:clean(body.currency,3).toUpperCase()||'USD',subtotal:num(body.subtotal)??total,total,status:'draft',line_items:Array.isArray(body.lineItems)?body.lineItems.slice(0,50):[],ship_to:typeof body.shipTo==='object'&&body.shipTo?body.shipTo:{},terms:{pilot:true,notes:clean(body.notes,500)}}}))?.[0];
}
async function createShipment(user,body){
  const reference=clean(body.reference,100);if(!reference)throw Object.assign(new Error('Shipment reference required'),{status:400});
  return (await adminRest(TABLES.shipments,{method:'POST',body:{owner_user_id:user.id,reference,origin_facility_id:null,destination_facility_id:null,mode:clean(body.mode,30)||'ocean',status:'planned',carrier_name:clean(body.carrierName,120)||null,eta:clean(body.eta,40)||null,metadata:{pilot:true,tracking_number:clean(body.trackingNumber,140),verified_provider:false}}}))?.[0];
}
async function createInventory(user,body){
  const sku=clean(body.sku,80),name=clean(body.name,140),quantity=num(body.quantity);if(!sku||!name||quantity===null||quantity<0)throw Object.assign(new Error('SKU, item name and quantity required'),{status:400});
  return (await adminRest(TABLES.inventory,{method:'POST',body:{owner_user_id:user.id,facility_id:null,sku,name,quantity,unit:clean(body.unit,30)||'unit',reorder_point:num(body.reorderPoint)??0,lot_code:clean(body.lotCode,100)||null,serial_code:clean(body.serialCode,100)||null,metadata:{pilot:true,virtual_warehouse:true}}}))?.[0];
}

export default async function handler(req,res){
  const user=await requireUser(req,res);if(!user)return;
  try{
    if(req.method==='GET')return json(res,200,{ok:true,userId:user.id,...await snapshot(user.id)});
    if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
    const action=clean(req.body?.action,40);let record;
    if(action==='create_supplier')record=await createSupplier(user,req.body||{});
    else if(action==='create_rfq')record=await createRfq(user,req.body||{});
    else if(action==='record_quote')record=await createQuote(user,req.body||{});
    else if(action==='create_po')record=await createPo(user,req.body||{});
    else if(action==='create_shipment')record=await createShipment(user,req.body||{});
    else if(action==='create_inventory')record=await createInventory(user,req.body||{});
    else return json(res,400,{error:'Unknown pilot action'});
    await audit(user.id,'supply_chain_pilot_action','info',{action,recordId:record?.id||null});
    return json(res,201,{ok:true,action,record,snapshot:await snapshot(user.id)});
  }catch(error){
    await audit(user.id,'supply_chain_pilot_error','medium',{error:String(error?.message||error)});
    return json(res,error?.status||500,{error:error?.message||'Supply-chain pilot action failed'});
  }
}
