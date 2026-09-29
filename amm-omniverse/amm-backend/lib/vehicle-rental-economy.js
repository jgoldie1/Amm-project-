'use strict'

const RATES={
  car:{hourly:299,daily:999,deposit:500,credential:'street-driver',selfDrive:true,passenger:true},
  'classic-car':{hourly:499,daily:1499,deposit:1000,credential:'street-driver',selfDrive:true,passenger:true},
  lowrider:{hourly:599,daily:1799,deposit:1000,credential:'street-driver',selfDrive:true,passenger:true},
  motorcycle:{hourly:399,daily:1199,deposit:800,credential:'powersports-rider',selfDrive:true,passenger:false},
  'box-truck':{hourly:699,daily:2499,deposit:2000,credential:'commercial-driver',selfDrive:true,passenger:true},
  'flying-bike':{hourly:999,daily:2999,deposit:2500,credential:'future-air-mobility',selfDrive:true,passenger:false,plasmaShield:true},
  'flying-car':{hourly:1299,daily:3999,deposit:3500,credential:'future-air-mobility',selfDrive:true,passenger:true,plasmaShield:true},
  evtol:{hourly:1799,daily:5499,deposit:5000,credential:'future-air-mobility',selfDrive:true,passenger:true,plasmaShield:true},
  'business-helicopter':{hourly:2499,daily:7999,deposit:7500,credential:'rotorcraft-pilot',selfDrive:true,passenger:true},
  'light-plane':{hourly:3499,daily:11999,deposit:10000,credential:'fixed-wing-pilot',selfDrive:true,passenger:true},
}

function quoteRental(vehicleClass,hours){
  const rate=RATES[vehicleClass]
  if(!rate)throw Object.assign(new Error('VEHICLE_NOT_RENTABLE'),{statusCode:400})
  const h=Math.max(1,Math.min(24*30,Math.ceil(Number(hours)||1)))
  const days=Math.floor(h/24),rest=h%24
  const rentalCents=days*rate.daily+(rest?Math.min(rate.daily,rest*rate.hourly):0)
  return{vehicleClass,hours:h,rentalCents,depositCents:rate.deposit,totalAuthorizationCents:rentalCents+rate.deposit,...rate}
}

function rentalSplit(grossCents,ownerType='tryamm'){
  const gross=Math.max(0,Math.round(Number(grossCents)||0))
  if(ownerType==='tryamm'||ownerType==='founder'){
    const reserve=Math.floor(gross*.10)
    return{gross,vehicleOwner:0,tryamm:gross-reserve,reserve}
  }
  const vehicleOwner=Math.floor(gross*.70),tryamm=Math.floor(gross*.20)
  return{gross,vehicleOwner,tryamm,reserve:gross-vehicleOwner-tryamm}
}

module.exports={RATES,quoteRental,rentalSplit}
