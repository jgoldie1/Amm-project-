'use strict';
const crypto=require('crypto');
const clean=(v,m=2000)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,m);
const id=p=>`${p}_${crypto.randomBytes(8).toString('hex')}`;
const DAY=86400000;
function portfolioRecord({invention,priority='P2',jurisdictions=['US'],estimatedBudget=0,ownerEntity=null}={}){
 if(!invention?.id)throw new Error('invention_required');
 return {id:id('ipr'),inventionId:invention.id,title:invention.title,priority:['P0','P1','P2','P3'].includes(priority)?priority:'P2',ownerEntity:clean(ownerEntity,160)||null,jurisdictions:Array.isArray(jurisdictions)?jurisdictions.map(x=>clean(x,12)).filter(Boolean).slice(0,50):['US'],estimatedBudget:Math.max(0,Number(estimatedBudget)||0),filings:[],evidence:[],licenses:[],royalties:[],disclosures:[],legalReview:{required:true,status:'not-started'},createdAt:new Date().toISOString()};
}
function addDisclosure(record,event={}){const when=event.date?new Date(event.date):new Date();if(Number.isNaN(when.getTime()))throw new Error('invalid_disclosure_date');record.disclosures.push({id:id('disc'),date:when.toISOString(),type:clean(event.type||'unknown',80),audience:clean(event.audience||'unknown',160),confidential:event.confidential===true,evidenceRef:clean(event.evidenceRef,1000)||null});return record;}
function disclosureRisk(record,now=new Date()){
 const publicEvents=(record.disclosures||[]).filter(x=>!x.confidential);if(!publicEvents.length)return {level:'none-known',action:'keep confidential until IP review'};
 const first=publicEvents.slice().sort((a,b)=>new Date(a.date)-new Date(b.date))[0];const days=Math.floor((now-new Date(first.date))/DAY);
 return {level:'urgent',firstPublicDisclosure:first.date,daysSinceFirstPublicDisclosure:days,action:'obtain patent counsel review immediately; U.S. and foreign rights can differ and deadlines may apply'};
}
function provisionalDocket({record,filingDate,applicationNumber=null}={}){if(!record?.id)throw new Error('record_required');const filed=new Date(filingDate);if(Number.isNaN(filed.getTime()))throw new Error('filing_date_required');const deadline=new Date(filed);deadline.setUTCFullYear(deadline.getUTCFullYear()+1);const filing={id:id('fil'),kind:'US-provisional',filingDate:filed.toISOString(),applicationNumber:clean(applicationNumber,80)||null,nonprovisionalTargetDate:deadline.toISOString(),status:'filed',warning:'Provisional is not examined and does not itself become a patent; review conversion/priority strategy with qualified counsel.'};record.filings.push(filing);return filing;}
function licensingScenario({units=0,revenue=0,royaltyRatePct=0,minimumGuarantee=0,upfrontFee=0}={}){const base=Math.max(0,Number(revenue)||0);const rate=Math.max(0,Math.min(100,Number(royaltyRatePct)||0));const royalty=Math.max(Math.max(0,Number(minimumGuarantee)||0),base*rate/100);return {units:Math.max(0,Number(units)||0),revenue:base,royaltyRatePct:rate,royalty:Number(royalty.toFixed(2)),upfrontFee:Math.max(0,Number(upfrontFee)||0),totalPotential:Number((royalty+Math.max(0,Number(upfrontFee)||0)).toFixed(2)),note:'Scenario only, not a valuation or earnings forecast.'};}
function publicReleaseGate({record,invention,legalApproved=false}={}){const risk=disclosureRisk(record);if(invention?.controls?.publicMarketingAllowed!==true)return {allowed:false,reason:'invention_marketing_locked',risk};if(!legalApproved)return {allowed:false,reason:'legal_approval_required',risk};return {allowed:true,risk};}
module.exports={portfolioRecord,addDisclosure,disclosureRisk,provisionalDocket,licensingScenario,publicReleaseGate};
