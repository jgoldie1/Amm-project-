function clean(value,max=200){return String(value??'').trim().slice(0,max);}
function moneyMinor(value,alreadyMinor=false){const amount=Number(value)||0;return alreadyMinor?Math.round(amount):Math.round(amount*100);}
function normalizeProviderEvent(provider,event={}){
  const p=clean(provider,30).toLowerCase();
  const metadata=event.metadata||event.data?.metadata||event.data?.object?.metadata||event.data?.meta||{};
  if(p==='stripe'){
    const object=event.data?.object||{};
    return {eventType:['checkout.session.completed','invoice.paid','payment_intent.succeeded'].includes(event.type)?'paid-conversion':'provider-event',referralCode:clean(metadata.referralCode||metadata.referral_code),campaignId:clean(metadata.campaignId||metadata.campaign_id),country:clean(metadata.country||object.customer_details?.address?.country,2).toUpperCase(),platform:clean(metadata.platform||'stripe'),revenueMinor:Number(object.amount_total||object.amount_paid||object.amount_received||0),currency:clean(object.currency||'USD',3).toUpperCase(),providerReference:clean(object.id),providerEventId:clean(event.id),metadata:{provider:p,type:event.type,customer:object.customer||null,subscription:object.subscription||null}};
  }
  if(p==='paystack'){
    const data=event.data||{};
    return {eventType:event.event==='charge.success'?'paid-conversion':'provider-event',referralCode:clean(data.metadata?.referralCode||data.metadata?.referral_code),campaignId:clean(data.metadata?.campaignId||data.metadata?.campaign_id),country:clean(data.metadata?.country||'NG',2).toUpperCase(),platform:clean(data.metadata?.platform||'paystack'),revenueMinor:moneyMinor(data.amount,true),currency:clean(data.currency||'NGN',3).toUpperCase(),providerReference:clean(data.reference),providerEventId:clean(data.id),metadata:{provider:p,type:event.event,channel:data.channel||null,customer:data.customer?.email||null}};
  }
  if(p==='flutterwave'){
    const data=event.data||{};const meta=data.meta||{};
    return {eventType:(event.event==='charge.completed'&&data.status==='successful')?'paid-conversion':'provider-event',referralCode:clean(meta.referralCode||meta.referral_code),campaignId:clean(meta.campaignId||meta.campaign_id),country:clean(meta.country||'',2).toUpperCase(),platform:clean(meta.platform||'flutterwave'),revenueMinor:moneyMinor(data.amount),currency:clean(data.currency||'NGN',3).toUpperCase(),providerReference:clean(data.tx_ref||data.flw_ref),providerEventId:clean(data.id),metadata:{provider:p,type:event.event,paymentType:data.payment_type||null,customer:data.customer?.email||null}};
  }
  return {eventType:'provider-event',referralCode:clean(metadata.referralCode||metadata.referral_code),campaignId:clean(metadata.campaignId||metadata.campaign_id),country:clean(metadata.country,2).toUpperCase(),platform:p||'unknown',revenueMinor:0,currency:'USD',providerReference:'',providerEventId:'',metadata:{provider:p}};
}
function eligibleForAttribution(record){return Boolean(record.eventType==='paid-conversion'&&record.referralCode&&record.revenueMinor>=0&&record.providerReference);}
module.exports={normalizeProviderEvent,eligibleForAttribution};