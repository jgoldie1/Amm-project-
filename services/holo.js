const crypto=require('crypto');
function id(prefix){return `${prefix}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;}
function money(value){const n=Number(value);if(!Number.isFinite(n)||n<0)throw new Error('Invalid amount.');return Math.round(n*100)/100;}
function createRide(input={}){return{id:id('ride'),status:'requested',pickup:String(input.pickup||''),destination:String(input.destination||''),riderId:String(input.riderId||'demo-rider'),vehicleType:String(input.vehicleType||'standard'),estimatedFare:money(input.estimatedFare||0),currency:String(input.currency||'USD').toUpperCase(),createdAt:new Date().toISOString(),provider:process.env.MAPS_PROVIDER||'mock',requiresLicensedOperator:true};}
function createDelivery(input={}){return{id:id('delivery'),status:'requested',pickup:String(input.pickup||''),dropoff:String(input.dropoff||''),customerId:String(input.customerId||'demo-customer'),packageType:String(input.packageType||'standard'),estimatedFee:money(input.estimatedFee||0),currency:String(input.currency||'USD').toUpperCase(),createdAt:new Date().toISOString(),provider:process.env.MAPS_PROVIDER||'mock',requiresLicensedCourier:true};}
function searchHolo({query='',scope='all',catalog=[],games=[]}){const q=String(query).trim().toLowerCase();if(!q)return[];const all=[...catalog.map(x=>({...x,source:'content'})),...games.map(x=>({...x,source:'game'}))];return all.filter(item=>{if(scope!=='all'&&item.source!==scope&&item.type!==scope&&item.genre!==scope)return false;return JSON.stringify(item).toLowerCase().includes(q);}).slice(0,30);}
function menu(){return[
{id:'hologpt',title:'HoloGPT',route:'/',status:'wired'},
{id:'search',title:'Holo Search',route:'/holo.html#search',status:'wired'},
{id:'yogihoo',title:'Play Yogihoo Arena',route:'/yogihoo.html',status:'playable-slice'},
{id:'music',title:'Holo Music',route:'/holo.html#music',status:'prototype'},
{id:'games',title:'11 Holo Games',route:'/holo.html#games',status:'prototype'},
{id:'arena',title:'Holo Arena',route:'/holo.html#arena',status:'prototype'},
{id:'ride',title:'Holo Rideshare',route:'/holo.html#ride',status:'mock-safe'},
{id:'delivery',title:'Holo Delivery',route:'/holo.html#delivery',status:'mock-safe'},
{id:'reels',title:'Reels',route:'/platform.html',status:'draft-api'},
{id:'drama',title:'Drama',route:'/platform.html',status:'draft-api'},
{id:'ads',title:'Holo Ads',route:'/platform.html',status:'draft-api'}
];}
module.exports={createRide,createDelivery,searchHolo,menu};