'use strict';
// JARVIS Genie: deterministic, read-only intent planner.
// The output is never an authorization or execution instruction.
const CATALOG=Object.freeze([
 {id:'sales',label:'AI Café sales',patterns:[/\b(sales?|leads?|quotes?|customers?|revenue|orders?)\b/i],route:'/api/ai-cafe/dashboard',scope:'owner',effect:'read'},
 {id:'streetverse',label:'StreetVerse',patterns:[/\b(streetverse|game|missions?|car|avatar)\b/i],route:'/api/health',scope:'owner',effect:'read'},
 {id:'broadcast',label:'TRYAMM broadcast',patterns:[/\b(radio|broadcast|live|tv|channel)\b/i],route:'/api/health',scope:'owner',effect:'read'},
 {id:'finance',label:'Billing review',patterns:[/\b(bills?|invoices?|expenses?|subscriptions?|costs?)\b/i],route:null,scope:'owner',effect:'review'},
 {id:'marketing',label:'Marketing proposal',patterns:[/\b(advertis(e|ing|ements?)|campaigns?|post|reels?|promot(e|ion))\b/i],route:null,scope:'owner',effect:'draft'},
 {id:'translation',label:'Language support',patterns:[/\b(translate|translation|spanish|french|portuguese|languages?)\b/i],route:null,scope:'owner',effect:'draft'}
]);
const RISKY=/\b(pay|purchase|buy|charge|refund|transfer|publish|send|delete|deploy|activate|turn on|unlock|approve|change)\b/i;
function planIntent(raw,{locale='en'}={}){
 const request=String(raw||'').trim().slice(0,600);
 if(!request)return {ok:false,code:'EMPTY_INTENT'};
 const matches=CATALOG.filter(x=>x.patterns.some(p=>p.test(request)));
 if(!matches.length)return {ok:true,intent:request,mode:'DISCOVER',target:null,action:'clarify',status:'NO_ACTION',message:'No verified service adapter matches this request. Nothing was executed.'};
 if(matches.length>1)return {ok:true,intent:request,mode:'DISCOVER',candidates:matches.map(x=>x.id),action:'choose-target',status:'NO_ACTION',message:'Multiple services matched. Choose one before continuing.'};
 const service=matches[0],highRisk=RISKY.test(request);
 return {ok:true,intent:request,locale,mode:highRisk?'VERIFY':'PREVIEW',target:service.id,service:service.label,action:service.effect==='read'&&!highRisk?'show-existing-route':'draft-for-review',route:service.route,status:'NO_ACTION',requiresOwnerApproval:highRisk||service.effect!=='read',message:'This is a plan only. No external command, spending, publication or service change occurred.'};
}
module.exports={planIntent,CATALOG};
