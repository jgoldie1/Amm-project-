function centsToAmount(v){ return Math.round(Number(v||0))/100 }

async function upsertEntry(supabase, entry){
  const row={
    entity_key:entry.entityKey||'tryamm', entry_type:entry.entryType, source_system:entry.sourceSystem, source_ref:entry.sourceRef,
    description:entry.description||'', gross_amount:Number(entry.grossAmount||0), currency:String(entry.currency||'USD').toUpperCase(),
    debit:Number(entry.debit||0), credit:Number(entry.credit||0), metadata:entry.metadata||{},
  }
  const { error }=await supabase.from('omni_treasury_ledger').upsert(row,{onConflict:'source_system,source_ref,entry_type'})
  if(error) throw error
}

async function postBalancedJournal(supabase,{sourceSystem,sourceRef,journalType,currency,description,metadata,entries}){
  const { data,error }=await supabase.rpc('post_omnicash_journal',{
    p_source_system:sourceSystem,p_source_ref:String(sourceRef),p_journal_type:journalType,p_currency:String(currency||'USD').toUpperCase(),
    p_description:description||'',p_metadata:metadata||{},p_entries:entries,
  })
  if(error) throw error
  return data
}

async function upsertOrder(supabase,{userId,creatorUserId=null,providerSessionId=null,providerPaymentIntentId=null,orderType,status='paid',currency='USD',grossAmount=0,platformAmount=0,creatorAmount=0,metadata={}}){
  const row={ user_id:userId||null,creator_user_id:creatorUserId||null,provider:'stripe',provider_session_id:providerSessionId||null,
    provider_payment_intent_id:providerPaymentIntentId||null,order_type:orderType||'purchase',status,currency:String(currency||'USD').toUpperCase(),
    gross_amount:Number(grossAmount||0),platform_amount:Number(platformAmount||0),creator_amount:Number(creatorAmount||0),metadata,updated_at:new Date().toISOString() }
  const { error }=await supabase.from('commerce_orders').upsert(row,{onConflict:'provider,provider_session_id'})
  if(error) throw error
}

async function getStripeSettlement(stripe, object){
  const result={ fee:null, net:null, balanceTransactionId:null, exact:false }
  const paymentIntent=object?.payment_intent || object?.payment_intent_id
  if(!stripe||!paymentIntent) return result
  try{
    const pi=await stripe.paymentIntents.retrieve(paymentIntent,{expand:['latest_charge.balance_transaction']})
    const bt=pi?.latest_charge?.balance_transaction
    if(bt&&typeof bt==='object'){ result.fee=centsToAmount(bt.fee); result.net=centsToAmount(bt.net); result.balanceTransactionId=bt.id||null; result.exact=true }
  }catch(_){ }
  return result
}

function splitBps(amount,bps){ return Math.round(amount*Number(bps||0))/10000 }

async function findOrderForPayment(supabase,paymentIntent){
  if(!paymentIntent) return null
  const {data,error}=await supabase.from('commerce_orders').select('*').eq('provider','stripe').eq('provider_payment_intent_id',String(paymentIntent)).maybeSingle()
  if(error) throw error
  return data||null
}

async function applyOrderReversal({supabase,paymentIntent,amount,kind}){
  const order=await findOrderForPayment(supabase,paymentIntent)
  if(!order) return null
  const gross=Math.max(Number(order.gross_amount||0),0)
  const reversal=Math.min(Math.max(Number(amount||0),0),gross)
  if(reversal<=0) return order
  const creatorOriginal=Math.max(Number(order.creator_amount||0),0)
  const proportionalCreator=gross>0?Math.round((creatorOriginal*(reversal/gross))*100)/100:0
  const currentRefunded=Math.max(Number(order.refunded_amount||0),0)
  const currentDispute=Math.max(Number(order.dispute_amount||0),0)
  const currentCreatorReversed=Math.max(Number(order.creator_reversed_amount||0),0)
  const nextRefunded=kind==='refund'?Math.min(gross,currentRefunded+reversal):currentRefunded
  const nextDispute=kind==='dispute'?Math.min(gross,currentDispute+reversal):currentDispute
  const nextTotalReversed=Math.min(gross,nextRefunded+nextDispute)
  const nextCreatorReversed=Math.min(creatorOriginal,Math.max(currentCreatorReversed,Math.round((creatorOriginal*(nextTotalReversed/gross))*100)/100 || proportionalCreator))
  const status=nextTotalReversed>=gross?(kind==='dispute'?'disputed':'refunded'):(nextTotalReversed>0?'partially_reversed':order.status)
  const {error}=await supabase.from('commerce_orders').update({
    status,refunded_amount:nextRefunded,dispute_amount:nextDispute,creator_reversed_amount:nextCreatorReversed,updated_at:new Date().toISOString(),
  }).eq('id',order.id)
  if(error) throw error
  return {...order,status,refunded_amount:nextRefunded,dispute_amount:nextDispute,creator_reversed_amount:nextCreatorReversed}
}

async function postCheckoutToTreasury({supabase,stripe,session}){
  const metadata=session.metadata||{}
  const gross=centsToAmount(session.amount_total)
  const currency=String(session.currency||'usd').toUpperCase()
  const sourceRef=String(session.id)
  const settlement=await getStripeSettlement(stripe,session)

  await upsertEntry(supabase,{ entryType:'revenue',sourceSystem:'stripe-checkout',sourceRef,grossAmount:gross,credit:gross,currency,
    description:`Stripe checkout ${metadata.type||'purchase'} ${metadata.plan||''}`.trim(),metadata:{userId:metadata.userId||null,type:metadata.type||null,plan:metadata.plan||null,paymentIntent:session.payment_intent||null} })
  await postBalancedJournal(supabase,{sourceSystem:'stripe-checkout',sourceRef,journalType:'sale',currency,
    description:`Stripe checkout ${metadata.type||'purchase'} ${metadata.plan||''}`.trim(),metadata:{userId:metadata.userId||null,type:metadata.type||null,plan:metadata.plan||null,paymentIntent:session.payment_intent||null},
    entries:[{accountCode:'STRIPE_CLEARING',debit:gross,credit:0,metadata:{paymentIntent:session.payment_intent||null}},{accountCode:'SALES_REVENUE',debit:0,credit:gross,metadata:{type:metadata.type||null,plan:metadata.plan||null}}]})

  if(settlement.fee!=null&&settlement.fee>0){
    await upsertEntry(supabase,{entryType:'provider_fee',sourceSystem:'stripe-checkout',sourceRef,grossAmount:gross,debit:settlement.fee,currency,description:'Stripe processing fee',metadata:{exact:settlement.exact,balanceTransactionId:settlement.balanceTransactionId}})
    await postBalancedJournal(supabase,{sourceSystem:'stripe-checkout',sourceRef,journalType:'provider-fee',currency,description:'Stripe processing fee',metadata:{exact:settlement.exact,balanceTransactionId:settlement.balanceTransactionId},entries:[{accountCode:'PAYMENT_PROCESSING_EXPENSE',debit:settlement.fee,credit:0},{accountCode:'STRIPE_CLEARING',debit:0,credit:settlement.fee}]})
  }

  let creatorAmount=0; let platformAmount=gross
  const splits=[['creator_payable','creatorShareBps','creatorUserId'],['talent_payable','talentShareBps','talentUserId'],['royalty_payable','royaltyShareBps','royaltyPartyId']]
  for(const [entryType,bpsKey,partyKey] of splits){
    const bps=Math.max(0,Math.min(10000,Number(metadata[bpsKey]||0))); const party=metadata[partyKey]
    if(bps>0&&party){ const amount=splitBps(gross,bps); if(amount>0){
      await upsertEntry(supabase,{entryType,sourceSystem:'stripe-checkout',sourceRef,grossAmount:gross,debit:amount,currency,description:`Contractual ${entryType.replace('_',' ')}`,metadata:{partyId:party,bps,contractRef:metadata.contractRef||null,productionRef:metadata.productionRef||null}})
      await postBalancedJournal(supabase,{sourceSystem:'stripe-checkout',sourceRef,journalType:`allocation-${entryType}`,currency,description:`Contractual ${entryType.replace('_',' ')}`,metadata:{partyId:party,bps,contractRef:metadata.contractRef||null,productionRef:metadata.productionRef||null},entries:[{accountCode:'CREATOR_ROYALTY_EXPENSE',partyUserId:party,debit:amount,credit:0},{accountCode:'CREATOR_PAYABLE',partyUserId:party,debit:0,credit:amount}]})
      if(entryType==='creator_payable'){creatorAmount+=amount;platformAmount=Math.max(0,platformAmount-amount)}
    }}
  }
  await upsertOrder(supabase,{userId:metadata.userId||null,creatorUserId:metadata.creatorUserId||null,providerSessionId:session.id,
    providerPaymentIntentId:typeof session.payment_intent==='string'?session.payment_intent:session.payment_intent?.id||null,orderType:metadata.type||'purchase',status:'paid',currency,grossAmount:gross,platformAmount,creatorAmount,
    metadata:{plan:metadata.plan||null,contractRef:metadata.contractRef||null,productionRef:metadata.productionRef||null}})
  return {gross,currency,settlement}
}

async function postInvoiceToTreasury({supabase,stripe,invoice}){
  const gross=centsToAmount(invoice.amount_paid||invoice.total||0); if(gross<=0) return
  const currency=String(invoice.currency||'usd').toUpperCase(); const sourceRef=String(invoice.id)
  const paymentIntent=typeof invoice.payment_intent==='string'?invoice.payment_intent:invoice.payment_intent?.id
  const settlement=await getStripeSettlement(stripe,{payment_intent:paymentIntent})
  await upsertEntry(supabase,{entryType:'revenue',sourceSystem:'stripe-invoice',sourceRef,grossAmount:gross,credit:gross,currency,description:'Recurring subscription invoice paid',metadata:{customer:invoice.customer||null,subscription:invoice.subscription||null,paymentIntent:paymentIntent||null}})
  await postBalancedJournal(supabase,{sourceSystem:'stripe-invoice',sourceRef,journalType:'subscription-revenue',currency,description:'Recurring subscription invoice paid',metadata:{customer:invoice.customer||null,subscription:invoice.subscription||null,paymentIntent:paymentIntent||null},entries:[{accountCode:'STRIPE_CLEARING',debit:gross,credit:0},{accountCode:'SUBSCRIPTION_REVENUE',debit:0,credit:gross}]})
  if(settlement.fee!=null&&settlement.fee>0){
    await upsertEntry(supabase,{entryType:'provider_fee',sourceSystem:'stripe-invoice',sourceRef,grossAmount:gross,debit:settlement.fee,currency,description:'Stripe recurring-payment fee',metadata:{exact:settlement.exact,balanceTransactionId:settlement.balanceTransactionId}})
    await postBalancedJournal(supabase,{sourceSystem:'stripe-invoice',sourceRef,journalType:'provider-fee',currency,description:'Stripe recurring-payment fee',metadata:{exact:settlement.exact,balanceTransactionId:settlement.balanceTransactionId},entries:[{accountCode:'PAYMENT_PROCESSING_EXPENSE',debit:settlement.fee,credit:0},{accountCode:'STRIPE_CLEARING',debit:0,credit:settlement.fee}]})
  }
}

async function postRefundToTreasury({supabase,eventObject,eventId}){
  const amount=centsToAmount(eventObject.amount||eventObject.amount_refunded||0); if(amount<=0) return
  const currency=String(eventObject.currency||'usd').toUpperCase(); const paymentIntent=eventObject.payment_intent||null
  await upsertEntry(supabase,{entryType:'refund',sourceSystem:'stripe-refund',sourceRef:String(eventId),grossAmount:amount,debit:amount,currency,description:'Stripe refund/credit adjustment',metadata:{paymentIntent,charge:eventObject.charge||eventObject.id||null}})
  await postBalancedJournal(supabase,{sourceSystem:'stripe-refund',sourceRef:String(eventId),journalType:'refund',currency,description:'Stripe refund/credit adjustment',metadata:{paymentIntent,charge:eventObject.charge||eventObject.id||null},entries:[{accountCode:'SALES_RETURNS',debit:amount,credit:0},{accountCode:'STRIPE_CLEARING',debit:0,credit:amount}]})
  await applyOrderReversal({supabase,paymentIntent,amount,kind:'refund'})
}

async function postDisputeToTreasury({supabase,dispute,eventId}){
  const amount=centsToAmount(dispute.amount); if(amount<=0) return
  const currency=String(dispute.currency||'usd').toUpperCase(); const paymentIntent=dispute.payment_intent||null
  await upsertEntry(supabase,{entryType:'chargeback',sourceSystem:'stripe-dispute',sourceRef:String(eventId),grossAmount:amount,debit:amount,currency,description:'Stripe dispute/chargeback',metadata:{disputeId:dispute.id,status:dispute.status,paymentIntent}})
  await postBalancedJournal(supabase,{sourceSystem:'stripe-dispute',sourceRef:String(eventId),journalType:'chargeback',currency,description:'Stripe dispute/chargeback',metadata:{disputeId:dispute.id,status:dispute.status,paymentIntent},entries:[{accountCode:'CHARGEBACK_EXPENSE',debit:amount,credit:0},{accountCode:'STRIPE_CLEARING',debit:0,credit:amount}]})
  await applyOrderReversal({supabase,paymentIntent,amount,kind:'dispute'})
}

module.exports={postCheckoutToTreasury,postInvoiceToTreasury,postRefundToTreasury,postDisputeToTreasury}
