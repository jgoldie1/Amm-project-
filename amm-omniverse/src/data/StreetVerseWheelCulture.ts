export type StreetVerseWheelStyle='factory'|'wire-spoke'|'chrome-spinner'|'deep-dish'|'turbine'|'big-rim'|'classic-steel'|'lowrider-spoke'

export type StreetVerseWheelPackage={
  id:string
  label:string
  style:StreetVerseWheelStyle
  visualSizeInches:number
  chrome:number
  spinnerVisual:boolean
  spokeCount:number
  handlingPenalty:number
  clearancePenalty:number
  showOnly:boolean
}

export const STREETVERSE_WHEEL_PACKAGES:StreetVerseWheelPackage[]=[
  {id:'factory-18',label:'Factory 18',style:'factory',visualSizeInches:18,chrome:.15,spinnerVisual:false,spokeCount:8,handlingPenalty:0,clearancePenalty:0,showOnly:false},
  {id:'wire-100',label:'100-Spoke Chrome',style:'wire-spoke',visualSizeInches:20,chrome:.95,spinnerVisual:false,spokeCount:100,handlingPenalty:.03,clearancePenalty:.02,showOnly:false},
  {id:'wire-72-low',label:'72-Spoke Lowrider',style:'lowrider-spoke',visualSizeInches:18,chrome:.9,spinnerVisual:false,spokeCount:72,handlingPenalty:.02,clearancePenalty:.01,showOnly:false},
  {id:'spinner-22',label:'22 Chrome Spinner',style:'chrome-spinner',visualSizeInches:22,chrome:1,spinnerVisual:true,spokeCount:5,handlingPenalty:.05,clearancePenalty:.04,showOnly:false},
  {id:'deep-dish-24',label:'24 Deep Dish',style:'deep-dish',visualSizeInches:24,chrome:.88,spinnerVisual:false,spokeCount:10,handlingPenalty:.07,clearancePenalty:.07,showOnly:false},
  {id:'turbine-22',label:'22 Turbine',style:'turbine',visualSizeInches:22,chrome:.72,spinnerVisual:false,spokeCount:18,handlingPenalty:.04,clearancePenalty:.03,showOnly:false},
  {id:'big-rim-28',label:'28 Show Rim',style:'big-rim',visualSizeInches:28,chrome:.96,spinnerVisual:false,spokeCount:12,handlingPenalty:.13,clearancePenalty:.14,showOnly:false},
  {id:'big-rim-32',label:'32 Show Rim',style:'big-rim',visualSizeInches:32,chrome:1,spinnerVisual:false,spokeCount:14,handlingPenalty:.19,clearancePenalty:.22,showOnly:true},
  {id:'steel-classic',label:'Classic Steel',style:'classic-steel',visualSizeInches:16,chrome:.2,spinnerVisual:false,spokeCount:5,handlingPenalty:0,clearancePenalty:0,showOnly:false},
]

export type StreetVerseWheelCultureVehicle={
  id:string
  label:string
  baseVehicle:string
  wheelPackageId:string
  trafficWeight:number
  notes:string
}

export const STREETVERSE_WHEEL_CULTURE_TRAFFIC:StreetVerseWheelCultureVehicle[]=[
  {id:'box-truck-spokes',label:'TRYAMM Boulevard Box Truck on Spokes',baseVehicle:'sv27-box-truck',wheelPackageId:'wire-100',trafficWeight:3,notes:'neighborhood business / moving / delivery truck'},
  {id:'box-truck-spinners',label:'TRYAMM Boulevard Box Truck on Spinners',baseVehicle:'sv27-box-truck',wheelPackageId:'spinner-22',trafficWeight:1,notes:'rare custom business/show truck'},
  {id:'sedan-spokes',label:'TRYAMM Full-Size Sedan on Spokes',baseVehicle:'sv27-fullsize-sedan',wheelPackageId:'wire-100',trafficWeight:8,notes:'everyday custom sedan'},
  {id:'sedan-spinners',label:'TRYAMM Full-Size Sedan on Spinners',baseVehicle:'sv27-fullsize-sedan',wheelPackageId:'spinner-22',trafficWeight:4,notes:'custom daily driver'},
  {id:'suv-big-rim',label:'TRYAMM Full-Size SUV on 28s',baseVehicle:'sv27-fullsize-suv',wheelPackageId:'big-rim-28',trafficWeight:5,notes:'custom SUV'},
  {id:'coupe-deep-dish',label:'TRYAMM Sport Coupe Deep Dish',baseVehicle:'sv27-sport-coupe',wheelPackageId:'deep-dish-24',trafficWeight:5,notes:'performance street style'},
  {id:'classic-spokes',label:'TRYAMM Old School Cruiser on 72-Spokes',baseVehicle:'sv64-soul-cruiser',wheelPackageId:'wire-72-low',trafficWeight:4,notes:'lowrider / cruise night'},
  {id:'classic-big-rim',label:'TRYAMM Box Luxury Sedan on 28s',baseVehicle:'sv80-box-lux',wheelPackageId:'big-rim-28',trafficWeight:3,notes:'old-school big-rim street style'},
]

export const STREETVERSE_WHEEL_CULTURE_POLICY={
  visualGameSimulationOnly:true,
  noRealWorldFitmentInstructions:true,
  spinnerPhysicsCosmeticOnly:true,
  oversizedRimsAffectGameHandling:true,
  showOnlyPackagesBlockedFromNormalTraffic:true,
  chromeAndSpokeCultureSupported:true,
  boxTrucksCanBeCustomized:true,
} as const

export function wheelPackage(id:string){return STREETVERSE_WHEEL_PACKAGES.find(x=>x.id===id)||STREETVERSE_WHEEL_PACKAGES[0]}
