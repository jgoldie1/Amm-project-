// Mycelium mission bridge: fictional event projection only. Never creates real inventory/settlement authority.
export const MYCELIUM_MISSION_SOURCE='streetverse-mycelium-warehouse';
const order=['accept','inspect','verify','load','deliver','receipt'];
export function projectWarehouseCheckpoint(detail){
 if(!detail||detail.source!=='tryamm-warehouse-demo'||detail.authoritative!==false||detail.realMoney!==false)return null;
 const checkpoint=String(detail.checkpoint||'');
 const stage=order.indexOf(checkpoint);
 if(stage<0||detail.missionId!=='all-american-merch-route-001'||detail.completed!==(stage===5))return null;
 return Object.freeze({
  eventId:`mycelium:warehouse:all-american-merch-route-001:${checkpoint}`,
  network:'StreetVerse Mycelium Engine',
  missionId:detail.missionId,
  branch:'chicago:warehouse:demo',
  timeline:'fictional',
  checkpoint,
  stage:stage+1,
  links:Object.freeze(['streetverse','all-american-records','virtual-warehouse','chicago-storefront',...(stage>=4?['musicverse']:[])]),
  authoritative:false,realMoney:false,affectsInventory:false,createsBlockchainAnchor:false,
  narrative:stage===5?'Fictional merchandise delivery complete; storefront NPC follow-up available.':'Fictional warehouse-delivery chapter advanced.'
 });
}
export function installWarehouseMyceliumBridge(target){
 const handler=e=>{
  const projected=projectWarehouseCheckpoint(e.detail);
  if(!projected)return;
  target.dispatchEvent(new CustomEvent('tryamm:mycelium-mission-projection',{detail:projected}));
 };
 target.addEventListener('tryamm:warehouse-mission-progress',handler);
 return()=>target.removeEventListener('tryamm:warehouse-mission-progress',handler);
}
