export type MultiMediumVehicleKind='helicopter'|'airplane'|'jet'|'flyingCar'|'boat'|'yacht'|'ship'
export type MultiMediumVehicleState={
 kind:MultiMediumVehicleKind
 medium:'air'|'water'|'hybrid'
 x:number
 y:number
 z:number
 heading:number
 pitch:number
 roll:number
 speed:number
 verticalSpeed:number
 throttle:number
 distance:number
 airborne:boolean
 afloat:boolean
 flightMode?:'ground'|'transition-up'|'flight'|'transition-down'
 transition?:number
}
export type MultiMediumInput={
 throttle?:number
 brake?:number
 yaw?:number
 pitch?:number
 roll?:number
 vertical?:number
 flightMode?:'ground'|'flight'
 takeoff?:boolean
 land?:boolean
}
export declare const PROFILES:Readonly<Record<MultiMediumVehicleKind,Readonly<Record<string,number|string|boolean>>>>
export declare function createMultiMediumVehicleState(kind?:MultiMediumVehicleKind):MultiMediumVehicleState
export declare function stepMultiMediumVehicle(original:MultiMediumVehicleState,input?:MultiMediumInput,dt?:number):MultiMediumVehicleState
export declare function safeMultiMediumTelemetry(state:MultiMediumVehicleState):{
 kind:MultiMediumVehicleKind
 medium:'air'|'water'|'hybrid'
 speedKmh:number
 altitudeMeters:number
 verticalSpeedMps:number
 headingRadians:number
 pitchRadians:number
 rollRadians:number
 distanceMeters:number
 airborne:boolean
 afloat:boolean
 flightMode:string|null
 transition:number
 simplifiedGameplayPhysics:boolean
 rapierCollisionIntegrated:boolean
 fullAerodynamicsVerified:boolean
 fullBuoyancyVerified:boolean
}
