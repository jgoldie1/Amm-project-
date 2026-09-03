export type StreetVerseVehicleClassId='car'|'sport-bike'|'cruiser-bike'|'dirt-bike'|'scooter'|'atv'|'roadster-3w'|'go-kart'|'utility-4x4'

export type StreetVerseVehicleClass={
 id:StreetVerseVehicleClassId
 label:string
 wheels:2|3|4
 topSpeed:number
 accel:number
 brake:number
 steer:number
 grip:number
 bodyRoll:number
 lean:boolean
 wheelie:boolean
 offroad:boolean
 crashTolerance:number
}

export const STREETVERSE_VEHICLE_CLASSES:StreetVerseVehicleClass[]=[
 {id:'car',label:'Street Car',wheels:4,topSpeed:39,accel:25,brake:32,steer:1.62,grip:1,bodyRoll:.11,lean:false,wheelie:false,offroad:false,crashTolerance:1},
 {id:'sport-bike',label:'Sport Bike',wheels:2,topSpeed:46,accel:31,brake:34,steer:2.05,grip:.92,bodyRoll:.34,lean:true,wheelie:true,offroad:false,crashTolerance:.58},
 {id:'cruiser-bike',label:'Cruiser Bike',wheels:2,topSpeed:37,accel:24,brake:29,steer:1.55,grip:.96,bodyRoll:.26,lean:true,wheelie:false,offroad:false,crashTolerance:.68},
 {id:'dirt-bike',label:'Dirt Bike',wheels:2,topSpeed:34,accel:29,brake:28,steer:2.2,grip:.78,bodyRoll:.4,lean:true,wheelie:true,offroad:true,crashTolerance:.66},
 {id:'scooter',label:'Street Scooter',wheels:2,topSpeed:24,accel:19,brake:24,steer:2.3,grip:.95,bodyRoll:.3,lean:true,wheelie:false,offroad:false,crashTolerance:.52},
 {id:'atv',label:'ATV / 4-Wheeler',wheels:4,topSpeed:30,accel:27,brake:29,steer:1.9,grip:.88,bodyRoll:.23,lean:false,wheelie:true,offroad:true,crashTolerance:1.28},
 {id:'roadster-3w',label:'Three-Wheel Roadster',wheels:3,topSpeed:41,accel:28,brake:32,steer:1.78,grip:1.04,bodyRoll:.14,lean:false,wheelie:false,offroad:false,crashTolerance:1.04},
 {id:'go-kart',label:'Go-Kart',wheels:4,topSpeed:27,accel:30,brake:31,steer:2.35,grip:1.1,bodyRoll:.08,lean:false,wheelie:false,offroad:false,crashTolerance:.72},
 {id:'utility-4x4',label:'Utility 4x4',wheels:4,topSpeed:32,accel:22,brake:30,steer:1.38,grip:.92,bodyRoll:.2,lean:false,wheelie:false,offroad:true,crashTolerance:1.42},
]

export function getStreetVerseVehicleClass(id?:string){return STREETVERSE_VEHICLE_CLASSES.find(v=>v.id===id)||STREETVERSE_VEHICLE_CLASSES[0]}
