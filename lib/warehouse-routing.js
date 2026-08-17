'use strict';
const {normalizeWarehouse,quoteWarehouse,rankWarehouses}=require('./warehouse-network');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
function demandCenter(input={}){return {region:String(input.region||'').slice(0,80),country:String(input.country||'US').slice(0,2).toUpperCase(),share:clamp(input.share,0,1)}}
function allocateInventory({warehouses=[],demand=[],units=0,requirements={},platformFeeBps=500}={}){
 const ranked=rankWarehouses(warehouses,requirements); if(!ranked.length)return {allocations:[],unallocated:units,reason:'no_verified_warehouse_match'};
 const centers=demand.map(demandCenter).filter(d=>d.share>0); const totalShare=centers.reduce((s,d)=>s+d.share,0)||1;
 let remaining=Math.max(0,Math.floor(Number(units)||0)); const allocations=[];
 centers.forEach((d,i)=>{if(!remaining)return; const candidates=ranked.filter(w=>!d.country||w.country===d.country); const w=(candidates.length?candidates:ranked)[i%Math.max(1,(candidates.length?candidates:ranked).length)]; const qty=i===centers.length-1?remaining:Math.min(remaining,Math.round(units*(d.share/totalShare))); remaining-=qty; const quote=quoteWarehouse({warehouse:w,units:qty,months:1,receivingUnits:qty,orders:0,platformFeeBps}); allocations.push({warehouseId:w.id,name:w.name,region:w.region,country:w.country,units:qty,score:w.score,estimatedFirstMonth:quote});});
 if(remaining&&ranked[0]){const w=ranked[0];const quote=quoteWarehouse({warehouse:w,units:remaining,months:1,receivingUnits:remaining,platformFeeBps});allocations.push({warehouseId:w.id,name:w.name,region:w.region,country:w.country,units:remaining,score:w.score,estimatedFirstMonth:quote});remaining=0;}
 return {allocations,unallocated:remaining,policy:{verifiedOnly:true,platformFeeBps}};
}
function ownershipTrigger({annualPartnerSpend=0,annualVolumeUnits=0,marketRevenue=0,estimatedOwnedAnnualCost=0,minSavingsPct=15,minVolumeUnits=100000}={}){
 const partner=clamp(annualPartnerSpend,0,1e12),owned=clamp(estimatedOwnedAnnualCost,0,1e12),volume=clamp(annualVolumeUnits,0,1e12); const savings=partner>0?((partner-owned)/partner)*100:0;
 return {considerOwnedFacility:volume>=minVolumeUnits&&owned>0&&savings>=minSavingsPct,annualPartnerSpend:partner,estimatedOwnedAnnualCost:owned,estimatedSavingsPct:Number(savings.toFixed(2)),annualVolumeUnits:volume,marketRevenue:clamp(marketRevenue,0,1e12),thresholds:{minSavingsPct,minVolumeUnits},note:'Decision support only; require finance, legal, real-estate, insurance and operations review before lease or purchase.'};
}
module.exports={demandCenter,allocateInventory,ownershipTrigger};
