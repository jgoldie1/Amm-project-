// Shared narrative follow-up options. Fictional dialogue only; not an actual NPC/commerce service.
export const MYCELIUM_BRANCH_KEY='tryamm.streetverse.mycelium-choice.v1';
export const MYCELIUM_SCENES=Object.freeze({
 'storefront-community':{label:'Storefront Community',speaker:'Chicago shopkeeper',dialogue:'The package arrived! Our neighborhood needs more local deliveries. Would you help us plan the next storefront route?',mission:'Community delivery route unlocked (story preview).'},
 'musicverse-showcase':{label:'MusicVerse Showcase',speaker:'All American Records promoter',dialogue:'Our merchandise is here. Now we can plan a Chicago artist showcase and invite the neighborhood.',mission:'MusicVerse concert promotion unlocked (story preview).'},
 'warehouse-training':{label:'Warehouse Training',speaker:'Virtual warehouse supervisor',dialogue:'Good work completing the delivery. Your next lesson is scanning stock, checking returns, and keeping records accurate.',mission:'Warehouse logistics training unlocked (story preview).'}
});
export function selectMyceliumScene(storage,key,missionComplete){
 if(!missionComplete||!Object.hasOwn(MYCELIUM_SCENES,key))return null;
 storage.setItem(MYCELIUM_BRANCH_KEY,key);
 return {...MYCELIUM_SCENES[key],branch:key,simulated:true,authoritative:false,realMoney:false};
}
export function readMyceliumScene(storage,missionComplete){
 if(!missionComplete)return null;
 const key=storage.getItem(MYCELIUM_BRANCH_KEY);
 return Object.hasOwn(MYCELIUM_SCENES,key)?{...MYCELIUM_SCENES[key],branch:key,simulated:true,authoritative:false,realMoney:false}:null;
}
export function resetMyceliumScene(storage){storage.removeItem(MYCELIUM_BRANCH_KEY);}
