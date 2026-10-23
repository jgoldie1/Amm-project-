'use strict';
/* Data-driven city and region travel registry. No unverified world is playable. */
const {getEarthRegistry}=require('./streetverse-earth-registry');
const destinations=[
{id:'us-ga-savannah',name:'Savannah',region:'Georgia',latitude:32.0809,longitude:-81.0912,starter:["Historic District","Starland","River Street"]},
{id:'us-ga-augusta',name:'Augusta',region:'Georgia',latitude:33.4735,longitude:-82.0105,starter:["Downtown","Summerville","Riverwalk"]},
{id:'us-ga-macon',name:'Macon',region:'Georgia',latitude:32.8407,longitude:-83.6324,starter:["Downtown","College Hill","Ingleside"]},
{id:'us-ga-athens',name:'Athens',region:'Georgia',latitude:33.9519,longitude:-83.3576,starter:["Downtown","Five Points","Normaltown"]},
{id:'us-ga-columbus',name:'Columbus',region:'Georgia',latitude:32.461,longitude:-84.9877,starter:["Uptown","Midtown","Riverwalk"]},

{id:'us-tx-houston',name:'Houston',region:'US',latitude:29.7604,longitude:-95.3698,starter:["Downtown","Midtown","Third Ward"]},
{id:'us-tx-dallas',name:'Dallas',region:'US',latitude:32.7767,longitude:-96.797,starter:["Downtown","Deep Ellum","Oak Cliff"]},
{id:'us-tx-austin',name:'Austin',region:'US',latitude:30.2672,longitude:-97.7431,starter:["Downtown","East Austin","South Congress"]},
{id:'us-tx-san-antonio',name:'San Antonio',region:'US',latitude:29.4241,longitude:-98.4936,starter:["Downtown","Pearl District","West Side"]},
{id:'us-tx-fort-worth',name:'Fort Worth',region:'US',latitude:32.7555,longitude:-97.3308,starter:["Downtown","Stockyards","Cultural District"]},
{id:'us-tx-el-paso',name:'El Paso',region:'US',latitude:31.7619,longitude:-106.485,starter:["Downtown","Mission Valley","West Side"]},
{id:'us-ny-buffalo',name:'Buffalo',region:'US',latitude:42.8864,longitude:-78.8784,starter:["Downtown","Allentown","Elmwood Village"]},
{id:'us-ca-los-angeles',name:'Los Angeles',region:'US',latitude:34.0522,longitude:-118.2437,starter:["Downtown","Hollywood","South LA"]},
{id:'us-fl-miami',name:'Miami',region:'US',latitude:25.7617,longitude:-80.1918,starter:["Downtown","Wynwood","Little Havana"]},
{id:'gh-aa-accra',name:'Accra',region:'GH',latitude:5.6037,longitude:-0.187,starter:["Central","Osu","East Legon"]},
{id:'ke-na-nairobi',name:'Nairobi',region:'KE',latitude:-1.2921,longitude:36.8219,starter:["CBD","Westlands","Kilimani"]},
{id:'za-gp-johannesburg',name:'Johannesburg',region:'ZA',latitude:-26.2041,longitude:28.0473,starter:["CBD","Sandton","Soweto"]},
{id:'et-aa-addis-ababa',name:'Addis Ababa',region:'ET',latitude:9.03,longitude:38.74,starter:["Bole","Piassa","Mexico Square"]},
{id:'gb-eng-london',name:'London',region:'GB',latitude:51.5074,longitude:-0.1278,starter:["West End","Camden","South Bank"]},
{id:'jp-13-tokyo',name:'Tokyo',region:'JP',latitude:35.6762,longitude:139.6503,starter:["Shibuya","Shinjuku","Akihabara"]},

{id:'us-ca-san-diego',name:'San Diego',region:'California',latitude:32.7157,longitude:-117.1611,starter:['Downtown','Gaslamp Quarter','Balboa Park']},
{id:'us-fl-tampa',name:'Tampa',region:'Florida',latitude:27.9506,longitude:-82.4572,starter:['Downtown','Ybor City','Channelside']},
{id:'us-mi-detroit',name:'Detroit',region:'Michigan',latitude:42.3314,longitude:-83.0458,starter:['Downtown','Midtown','Corktown']},
{id:'us-nv-las-vegas',name:'Las Vegas',region:'Nevada',latitude:36.1699,longitude:-115.1398,starter:['Downtown','Arts District','The Strip']},
{id:'us-ga-atlanta',name:'Atlanta',region:'Georgia',latitude:33.7490,longitude:-84.3880,starter:['Downtown','Midtown','Old Fourth Ward']},
{id:'us-pa-philadelphia',name:'Philadelphia',region:'Pennsylvania',latitude:39.9526,longitude:-75.1636,starter:['Center City','Old City','University City']},
{id:'us-ny-new-york-city',name:'New York City',region:'New York',latitude:40.7128,longitude:-74.0060,starter:['Manhattan','Brooklyn','Queens','The Bronx','Staten Island']}
];
function getExpansionDestinations(){const registry=getEarthRegistry();return destinations.map(city=>({...city,registered:registry.regions.some(x=>x.id===city.id),status:'planned',playable:false}));}
function planFlight(from,to){const allowed=new Set(getEarthRegistry().regions.map(x=>x.id));if(!allowed.has(from)||!allowed.has(to)||from===to)throw Error('Invalid flight endpoints');return {from,to,mode:'fly-in',status:'planned',durationSeconds:null,travelEnabled:false,reason:'Destination scene and flight transition not yet certified'};}
module.exports={getExpansionDestinations,planFlight};
