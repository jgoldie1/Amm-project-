function centsToAmount(v){ return Math.round(Number(v||0))/100 }

async function upsertEntry(supabase, entry){
  const row={
    entity_key:entry.entityKey||'tryamm',
    entry_type:entry.entryType,
    source_system:entry.sourceSystem,
    source_ref:entry.sourceRef,
    description:entry.description||'',
    gross_amount:Number(entry.grossAmount||0),
    currency:String(entry.currency||'USD').toUpperCase(),
    debit:Number(entry.debit||0),
    credit:Number(entry.credit||0),
    metadata:entry.metadata||{},
  }
  const { error }=await supabase.from('omni_treasury_ledger').upsert(row,{onConflict:'source_system,source_ref,entry_type'})
  if(error) throw error
}

async function getStripeSettlement(stripe, object){
  const result={ fee:null, net:null, balanceTransactionId:null, exact:false }
  const paymentIntent=object?.payment_intent || object?.payment_intent_id
  if(!stripe||!paymentIntent) return result
  try{
    const pi=await stripe.paymentIntents.retrieve(paymentIntent,{expand:['latest_charge.balance_transaction']})
    const bt=pi?.latest_charge?.balance_transaction
    if(bt&&typeof bt==='object'){
      result.fee=centsToAmount(bt.fee)
      result.net=centsToAmount(bt.net)
      result.balanceTransactionId=bt.id||null
      result.exact=true
    }
  }catch(_){ /* reconciliation can fill fee later */ }
  return result
}

function splitBps(amount,bps){ return Math.round(amount*Number(bps||0))/10000 }

async function postCheckoutToTreasury({supabase,stripe,session}){
  const metadata=session.metadata||{}
  const gross=centsToAmount(session.amount_total)
  const currency=String(session.currency||'usd').toUpperCase()
  const sourceRef=String(session.id)
  const settlement=await getStripeSettlement(stripe,session)

  await upsertEntry(supabase,{ entryType:'revenue',sourceSystem:'stripe-checkout',sourceRef,grossAmount:gross,credit:gross,currency,
    description:`Stripe checkout ${metadata.type||'purchase'} ${metadata.plan||''}`.trim(),metadata:{userId:metadata.userId||null,type:metadata.type||null,plan:metadata.plan||null,paymentIntent:session.payment_intent||null} })

  if(settlement.fee!=null&&settlement.fee>0){
    await upsertEntry(supabase,{ entryType:'provider_fee',sourceSystem:'stripe-checkout',sourceRef,grossAmount:gross,debit:settlement.fee,currency,
      description:'Stripe processing fee',metadata:{exact:settlement.exact,balanceTransactionId:settlement.balanceTransactionId} })
  }

  const splits=[['creator_payable','creatorShareBps','creatorUserId'],['talent_payable','talentShareBps','talentUserId'],['royalty_payable','royaltyShareBps','royaltyPartyId']]
  for(const [entryType,bpsKey,partyKey] of splits){
    const bps=Math.max(0,Math.min(10000,Number(metadata[bpsKey]||0)))
    const party=metadata[partyKey]
    if(bps>0&&party){
      const amount=splitBps(gross,bps)
      if(amount>0) await upsertEntry(supabase,{ entryType,sourceSystem:'stripe-checkout',sourceRef,grossAmount:gross,debit:amount,currency,
        description:`Contractual ${entryType.replace('_',' ')}`,metadata:{partyId:party,bps,contractRef:metadata.contractRef||null,productionRef:metadata.productionRef||null} })
    }
  }
  return {gross,currency,settlement}
}

async function postInvoiceToTreasury({supabase,stripe,invoice}){
  const gross=centsToAmount(invoice.amount_paid||invoice.total||0)
  if(gross<=0) return
  const currency=String(invoice.currency||'usd').toUpperCase()
  const sourceRef=String(invoice.id)
  const paymentIntent=typeof invoice.payment_intent==='string'?invoice.payment_intent:invoice.payment_intent?.id
  const settlement=await getStripeSettlement(stripe,{payment_intent:paymentIntent})
  await upsertEntry(supabase,{ entryType:'revenue',sourceSystem:'stripe-invoice',sourceRef,grossAmount:gross,credit:gross,currency,
    description:'Recurring subscription invoice paid',metadata:{customer:invoice.customer||null,subscription:invoice.subscription||null,paymentIntent:paymentIntent||null} })
  if(settlement.fee!=null&&settlement.fee>0){
    await upsertEntry(supabase,{ entryType:'provider_fee',sourceSystem:'stripe-invoice',sourceRef,grossAmount:gross,debit:settlement.fee,currency,
      description:'Stripe recurring-payment fee',metadata:{exact:settlement.exact,balanceTransactionId:settlement.balanceTransactionId} })
  }
}

async function postRefundToTreasury({supabase,eventObject,eventId}){
  const amount=centsToAmount(eventObject.amount||eventObject.amount_refunded||0)
  if(amount<=0) return
  await upsertEntry(supabase,{ entryType:'refund',sourceSystem:'stripe-refund',sourceRef:String(eventId),grossAmount:amount,debit:amount,
    currency:String(eventObject.currency||'usd').toUpperCase(),description:'Stripe refund/credit adjustment',metadata:{paymentIntent:eventObject.payment_intent||null,charge:eventObject.charge||eventObject.id||null} })
}

async function postDisputeToTreasury({supabase,dispute,eventId}){
  const amount=centsToAmount(dispute.amount)
  if(amount<=0) return
  await upsertEntry(supabase,{ entryType:'chargeback',sourceSystem:'stripe-dispute',sourceRef:String(eventId),grossAmount:amount,debit:amount,
    currency:String(dispute.currency||'usd').toUpperCase(),description:'Stripe dispute/chargeback',metadata:{disputeId:dispute.id,status:dispute.status} })
}

module.exports={postCheckoutToTreasury,postInvoiceToTreasury,postRefundToTreasury,postDisputeToTreasury}
