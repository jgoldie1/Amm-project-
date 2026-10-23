'use strict';
// Standalone fictional StreetVerse Life prototype. Does not debit real money.
const key='streetverse-life-v1';
const state=(()=>{try{return {...{balance:400,job:null,home:null,items:[],days:0},...JSON.parse(localStorage.getItem(key)||'{}')}}catch{return {balance:400,job:null,home:null,items:[],days:0}}})();
const jobs=[{id:'cafe',name:'Café assistant',daily:65},{id:'studio',name:'HoloLab creative assistant',daily:90},{id:'delivery',name:'StreetVerse courier',daily:75},{id:'caption',name:'Accessible media captioner',daily:85}];
const homes=[{id:'studio',name:'Studio apartment',rent:110},{id:'onebed',name:'One-bedroom apartment',rent:170},{id:'loft',name:'Creator loft',rent:230}];
const furniture=[{id:'bed',name:'Bed',cost:55},{id:'sofa',name:'Sofa',cost:45},{id:'desk',name:'Desk',cost:30},{id:'lamp',name:'Lamp',cost:15},{id:'table',name:'Table',cost:25},{id:'plant',name:'Plant',cost:12}];
const save=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch{}};
function chooseJob(id){if(!jobs.some(j=>j.id===id))return false;state.job=id;save();return true}
function rentHome(id){const h=homes.find(x=>x.id===id);if(!h||state.home||state.balance<h.rent)return false;state.balance-=h.rent;state.home=id;state.items=[];save();return true}
function buyFurniture(id){const item=furniture.find(x=>x.id===id);if(!item||!state.home||state.balance<item.cost||state.items.includes(id))return false;state.balance-=item.cost;state.items.push(id);save();return true}
function workDay(){const job=jobs.find(x=>x.id===state.job);if(!job)return false;state.balance+=job.daily;state.days+=1;save();return true}
function payRent(){const home=homes.find(x=>x.id===state.home);if(!home||state.balance<home.rent)return false;state.balance-=home.rent;save();return true}
module.exports={state,jobs,homes,furniture,chooseJob,rentHome,buyFurniture,workDay,payRent,key};
