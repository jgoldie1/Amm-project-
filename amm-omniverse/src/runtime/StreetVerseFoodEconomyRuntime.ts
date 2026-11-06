/** Fictional, local-only StreetVerse food economy. No real-money charges. */
export type StreetVerseFoodId='burger'|'ribs'|'pop'|'beer'|'water'|'salad'
export type StreetVerseNeeds={health:number;stamina:number;hunger:number;hydration:number;impaired:boolean;severeInjury:boolean}
export type StreetVerseFoodPlayer={wallet:number;ageVerifiedAdult:boolean;needs:StreetVerseNeeds}
export const STREETVERSE_FOOD_MENU:Record<StreetVerseFoodId,{label:string;price:number;hunger:number;hydration:number;stamina:number;minorHealth:number;adultOnly:boolean}>={
 burger:{label:'Burger & fries',price:12,hunger:38,hydration:-5,stamina:15,minorHealth:5,adultOnly:false},
 ribs:{label:'BBQ ribs dinner',price:22,hunger:55,hydration:-8,stamina:22,minorHealth:6,adultOnly:false},
 pop:{label:'Pop / soda',price:3,hunger:0,hydration:18,stamina:8,minorHealth:0,adultOnly:false},
 beer:{label:'Beer',price:6,hunger:0,hydration:-8,stamina:-5,minorHealth:0,adultOnly:true},
 water:{label:'Water',price:2,hunger:0,hydration:35,stamina:5,minorHealth:0,adultOnly:false},
 salad:{label:'Fresh meal',price:10,hunger:28,hydration:8,stamina:12,minorHealth:4,adultOnly:false},
}
const clamp=(value:number)=>Math.max(0,Math.min(100,value))
export function buyStreetVerseFood(player:StreetVerseFoodPlayer,id:StreetVerseFoodId):{ok:boolean;reason?:string;player:StreetVerseFoodPlayer}{
 const item=STREETVERSE_FOOD_MENU[id]
 if(!item)return {ok:false,reason:'Item unavailable',player}
 if(item.adultOnly&&!player.ageVerifiedAdult)return {ok:false,reason:'Adult verification required',player}
 if(player.wallet<item.price)return {ok:false,reason:'Not enough fictional currency',player}
 const n=player.needs
 return {ok:true,player:{
  wallet:player.wallet-item.price,ageVerifiedAdult:player.ageVerifiedAdult,
  needs:{...n,hunger:clamp(n.hunger+item.hunger),hydration:clamp(n.hydration+item.hydration),
   stamina:clamp(n.stamina+item.stamina),health:clamp(n.health+(n.severeInjury?0:item.minorHealth)),
   impaired:n.impaired||id==='beer'}
 }}
}
export const canDriveAfterFood=(player:StreetVerseFoodPlayer)=>!player.needs.impaired
