(()=>{
  const VERSION='20260903-logistics-v1'
  const inboundStages=['asn-created','dock-scheduled','arrived','unloaded','scanned','inspected','discrepancy-review','quarantine','put-away','inventory-available']
  const outboundStages=['order-released','pick','pack','label','staged','carrier-handoff','in-transit','delivered','return-requested','returned']
  const importChecklist=['importer-of-record','commercial-invoice','packing-list','hts-classification','country-of-origin','customs-value','bond-if-required','agency-permits-if-required','broker-or-self-entry','release-status']
  const exportChecklist=['usppi','commercial-invoice','packing-list','schedule-b','eccn-or-ear99','restricted-party-screening','license-determination','aes-eei-if-required','itn-or-exemption','destination-end-use-check']
  const protections=['copyright-registration','trademark-search-and-filing','ip-assignment-from-contractors','nda-confidentiality','repo-2fa-and-least-privilege','secret-scanning','dependency-lock-and-sbom','signed-builds-and-release-provenance','database-rls','backup-and-export-plan','vendor-lock-in-exit-plan','terms-privacy-dpa','audit-logs','security-contact-and-disclosure-policy']
  const opportunities=[]
  const safe=n=>Number.isFinite(Number(n))?Number(n):0
  function scoreOpportunity(input={}){
    const volume=Math.min(100,safe(input.volumeScore)||0),margin=Math.min(100,safe(input.marginScore)||0),readiness=Math.min(100,safe(input.readinessScore)||0),fit=Math.min(100,safe(input.fitScore)||0),risk=Math.min(100,safe(input.riskScore)||0)
    const score=Math.round(volume*.25+margin*.25+readiness*.25+fit*.20-risk*.15)
    return {score,band:score>=70?'HOT':score>=45?'WARM':'NURTURE'}
  }
  function createOpportunity(input={}){
    const ranked=scoreOpportunity(input)
    const item={id:String(input.id||('OPP-'+Date.now())),buyer:String(input.buyer||''),supplier:String(input.supplier||''),product:String(input.product||''),geography:String(input.geography||''),moq:safe(input.moq),estimatedValue:safe(input.estimatedValue),status:'new',...ranked,createdAt:new Date().toISOString()}
    opportunities.push(item);return item
  }
  function shipment(input={}){
    return {id:String(input.id||('SHP-'+Date.now())),direction:input.direction==='outbound'?'outbound':'inbound',mode:String(input.mode||'unknown'),origin:String(input.origin||''),destination:String(input.destination||''),carrier:String(input.carrier||''),tracking:String(input.tracking||''),status:input.direction==='outbound'?outboundStages[0]:inboundStages[0],documents:{},events:[],verified:false}
  }
  function advance(shipment,next,detail={}){
    if(!shipment)return {ok:false,reason:'missing-shipment'}
    const stages=shipment.direction==='outbound'?outboundStages:inboundStages
    if(!stages.includes(next))return {ok:false,reason:'invalid-stage'}
    shipment.status=next;shipment.events.push({at:new Date().toISOString(),type:next,detail,source:String(detail.source||'operator')});return {ok:true,shipment}
  }
  function complianceGate(kind,answers={}){
    const list=kind==='export'?exportChecklist:importChecklist
    const missing=list.filter(k=>answers[k]!==true)
    return {kind,ready:missing.length===0,missing,note:'Workflow readiness only; licensed brokers, carriers, forwarders and government systems remain external/provider-gated.'}
  }
  function receivingDiscrepancy(expected,received){
    const exp=safe(expected),rec=safe(received),variance=rec-exp
    return {expected:exp,received:rec,variance,match:variance===0,action:variance===0?'accept':variance<0?'shortage-review':'overage-review'}
  }
  window.TRYAMMLogisticsOps={VERSION,inboundStages,outboundStages,importChecklist,exportChecklist,protections,shipment,advance,complianceGate,receivingDiscrepancy,scoreOpportunity,createOpportunity,opportunities:()=>JSON.parse(JSON.stringify(opportunities))}
  window.dispatchEvent(new CustomEvent('tryamm:logistics-ops-ready',{detail:{version:VERSION,inboundStages,outboundStages,importChecklist,exportChecklist,protections,truthBoundary:'TRYAMM can orchestrate workflows, documents, scans and status. It is not automatically a carrier, customs broker, ocean transportation intermediary, warehouse operator or government filing system.'}}))
})()
