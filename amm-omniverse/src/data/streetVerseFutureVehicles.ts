export type StreetVerseFutureVehicleKind='hypercar'|'ring-bike'|'armored-utility'|'cyber-shuttle'
export type StreetVerseFutureVehicle=Readonly<{id:string;name:string;kind:StreetVerseFutureVehicleKind;spawn:{x:number;y:number;z:number};speed:number;handling:number;seats:number;missionHooks:readonly string[];visual:{body:string;accent:string;wheel:string}}>
/** Original TRYAMM vehicles derived from broad visual themes in user-supplied references; do not copy third-party logos/trade dress. */
export const STREETVERSE_FUTURE_VEHICLES:readonly StreetVerseFutureVehicle[]=[
 {id:'sv-aurora-hyper-01',name:'Aurora Hyper',kind:'hypercar',spawn:{x:-500,y:0,z:710},speed:48,handling:.9,seats:2,missionHooks:['future-ride-intro','chicago-night-run'],visual:{body:'#eee9df',accent:'#d6a94c',wheel:'#3b3027'}},
 {id:'sv-orbit-bike-01',name:'Orbit Ring Bike',kind:'ring-bike',spawn:{x:-610,y:0,z:690},speed:55,handling:.96,seats:1,missionHooks:['orbit-bike-trial','holo-courier'],visual:{body:'#111820',accent:'#78e7ff',wheel:'#15242b'}},
 {id:'sv-guardian-utility-01',name:'Guardian Utility',kind:'armored-utility',spawn:{x:-400,y:0,z:720},speed:31,handling:.62,seats:4,missionHooks:['utility-rescue','storm-supply-run'],visual:{body:'#514b3e',accent:'#59d7e8',wheel:'#171717'}},
 {id:'sv-vector-shuttle-01',name:'Vector Cyber Shuttle',kind:'cyber-shuttle',spawn:{x:-300,y:0,z:700},speed:39,handling:.78,seats:4,missionHooks:['future-taxi','campus-shuttle'],visual:{body:'#c7a57e',accent:'#e45454',wheel:'#171717'}},
]


export type StreetVerseVehicleListing=Readonly<{vehicleId:string;price:number;currency:'SV_CREDITS';stock:number;dealer:'tryamm-future-mobility';delivery:'player-garage';tradable:boolean}>
export const STREETVERSE_FUTURE_VEHICLE_LISTINGS:readonly StreetVerseVehicleListing[]=[
 {vehicleId:'sv-aurora-hyper-01',price:185000,currency:'SV_CREDITS',stock:8,dealer:'tryamm-future-mobility',delivery:'player-garage',tradable:true},
 {vehicleId:'sv-orbit-bike-01',price:72000,currency:'SV_CREDITS',stock:12,dealer:'tryamm-future-mobility',delivery:'player-garage',tradable:true},
 {vehicleId:'sv-guardian-utility-01',price:128000,currency:'SV_CREDITS',stock:10,dealer:'tryamm-future-mobility',delivery:'player-garage',tradable:true},
 {vehicleId:'sv-vector-shuttle-01',price:110000,currency:'SV_CREDITS',stock:10,dealer:'tryamm-future-mobility',delivery:'player-garage',tradable:true},
]
/** Client requests only. Server must validate listing, authoritative price, balance, stock and ownership before ledger debit + garage grant. */
export const requestFutureVehiclePurchase=(vehicleId:string)=>window.dispatchEvent(new CustomEvent('tryamm:vehicle-purchase-request',{detail:{vehicleId,dealer:'tryamm-future-mobility'}}))
