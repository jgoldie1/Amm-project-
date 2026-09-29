export type VintageEra='1940s'|'1950s'|'1960s'|'1970s'|'1980s'|'1990s'
export type VintageStyle='stock-classic'|'restomod'|'lowrider'|'hot-rod'|'luxury-cruiser'|'muscle'|'custom'

export type StreetVerseVintageVehicle={
  id:string
  label:string
  era:VintageEra
  year:number
  body:string
  style:VintageStyle
  seats:number
  hydraulicEligible:boolean
  rarity:'common'|'uncommon'|'rare'|'collector'
  referenceNote?:string
  productionRule:'original-tryamm-body'
}

export const STREETVERSE_VINTAGE_REFERENCE_NOTES=[
  {
    reference:'1948 Nash Ambassador',
    use:'historical proportion/era study only',
    productionReplacement:'TRYAMM 1948 Ambassador-Era Streamliner',
    exactBodyCopy:false,
  },
  {
    reference:'1948 Chevrolet Fleetmaster / Fleetline / Stylemaster era',
    use:'historical proportion/era study only',
    productionReplacement:'TRYAMM 1948 Boulevard Fleet Coupe / Sedan',
    exactBodyCopy:false,
  },
] as const

export const STREETVERSE_VINTAGE_LOW_RIDER_FLEET:StreetVerseVintageVehicle[]=[
  {id:'sv48-ambassador-era-streamliner',label:'TRYAMM 1948 Ambassador-Era Streamliner',era:'1940s',year:1948,body:'four-door-streamline-sedan',style:'stock-classic',seats:6,hydraulicEligible:true,rarity:'collector',referenceNote:'1948 American Ambassador-era luxury sedan proportions; original TRYAMM production body',productionRule:'original-tryamm-body'},
  {id:'sv48-boulevard-fleet-coupe',label:'TRYAMM 1948 Boulevard Fleet Coupe',era:'1940s',year:1948,body:'fastback-coupe',style:'lowrider',seats:5,hydraulicEligible:true,rarity:'collector',referenceNote:'1948 American Chevrolet Fleetmaster/Fleetline/Stylemaster era study; original TRYAMM production body',productionRule:'original-tryamm-body'},
  {id:'sv49-club-sedan',label:'TRYAMM 1949 Club Sedan',era:'1940s',year:1949,body:'club-sedan',style:'restomod',seats:5,hydraulicEligible:true,rarity:'rare',productionRule:'original-tryamm-body'},

  {id:'sv53-chrome-cruiser',label:'TRYAMM 1953 Chrome Cruiser',era:'1950s',year:1953,body:'two-door-coupe',style:'lowrider',seats:5,hydraulicEligible:true,rarity:'rare',productionRule:'original-tryamm-body'},
  {id:'sv55-belvedere-cruiser',label:'TRYAMM 1955 Boulevard Cruiser',era:'1950s',year:1955,body:'hardtop-coupe',style:'restomod',seats:5,hydraulicEligible:true,rarity:'rare',productionRule:'original-tryamm-body'},
  {id:'sv57-tailfin-deluxe',label:'TRYAMM 1957 Tailfin Deluxe',era:'1950s',year:1957,body:'hardtop-sedan',style:'custom',seats:6,hydraulicEligible:true,rarity:'collector',productionRule:'original-tryamm-body'},
  {id:'sv59-long-fin',label:'TRYAMM 1959 Long-Fin Cruiser',era:'1950s',year:1959,body:'long-wheelbase-coupe',style:'lowrider',seats:6,hydraulicEligible:true,rarity:'collector',productionRule:'original-tryamm-body'},

  {id:'sv61-boulevard-low',label:'TRYAMM 1961 Boulevard Low',era:'1960s',year:1961,body:'full-size-coupe',style:'lowrider',seats:6,hydraulicEligible:true,rarity:'rare',productionRule:'original-tryamm-body'},
  {id:'sv63-three-wheel',label:'TRYAMM 1963 Three-Wheel Special',era:'1960s',year:1963,body:'two-door-hardtop',style:'lowrider',seats:5,hydraulicEligible:true,rarity:'rare',productionRule:'original-tryamm-body'},
  {id:'sv64-soul-cruiser',label:'TRYAMM 1964 Soul Cruiser',era:'1960s',year:1964,body:'full-size-coupe',style:'lowrider',seats:5,hydraulicEligible:true,rarity:'uncommon',productionRule:'original-tryamm-body'},
  {id:'sv67-muscle-cruiser',label:'TRYAMM 1967 Muscle Cruiser',era:'1960s',year:1967,body:'muscle-coupe',style:'muscle',seats:4,hydraulicEligible:false,rarity:'rare',productionRule:'original-tryamm-body'},
  {id:'sv69-street-machine',label:'TRYAMM 1969 Street Machine',era:'1960s',year:1969,body:'muscle-fastback',style:'restomod',seats:4,hydraulicEligible:false,rarity:'rare',productionRule:'original-tryamm-body'},

  {id:'sv70-long-body',label:'TRYAMM 1970 Long-Body Cruiser',era:'1970s',year:1970,body:'full-size-coupe',style:'lowrider',seats:6,hydraulicEligible:true,rarity:'uncommon',productionRule:'original-tryamm-body'},
  {id:'sv72-luxury-brougham',label:'TRYAMM 1972 Luxury Brougham',era:'1970s',year:1972,body:'luxury-sedan',style:'luxury-cruiser',seats:6,hydraulicEligible:true,rarity:'uncommon',productionRule:'original-tryamm-body'},
  {id:'sv75-land-yacht',label:'TRYAMM 1975 Land Yacht',era:'1970s',year:1975,body:'long-wheelbase-sedan',style:'custom',seats:6,hydraulicEligible:true,rarity:'rare',productionRule:'original-tryamm-body'},
  {id:'sv78-glasshouse',label:'TRYAMM 1978 Glasshouse Coupe',era:'1970s',year:1978,body:'luxury-coupe',style:'lowrider',seats:5,hydraulicEligible:true,rarity:'rare',productionRule:'original-tryamm-body'},

  {id:'sv80-box-lux',label:'TRYAMM 1980 Box Luxury Sedan',era:'1980s',year:1980,body:'box-sedan',style:'lowrider',seats:6,hydraulicEligible:true,rarity:'uncommon',productionRule:'original-tryamm-body'},
  {id:'sv84-aero-coupe',label:'TRYAMM 1984 Aero Coupe',era:'1980s',year:1984,body:'coupe',style:'custom',seats:5,hydraulicEligible:true,rarity:'uncommon',productionRule:'original-tryamm-body'},
  {id:'sv87-grand-cruiser',label:'TRYAMM 1987 Grand Cruiser',era:'1980s',year:1987,body:'luxury-coupe',style:'lowrider',seats:5,hydraulicEligible:true,rarity:'uncommon',productionRule:'original-tryamm-body'},

  {id:'sv90-euro-low',label:'TRYAMM 1990 Euro Low',era:'1990s',year:1990,body:'sport-sedan',style:'custom',seats:5,hydraulicEligible:true,rarity:'uncommon',productionRule:'original-tryamm-body'},
  {id:'sv94-boulevard-coupe',label:'TRYAMM 1994 Boulevard Coupe',era:'1990s',year:1994,body:'personal-luxury-coupe',style:'lowrider',seats:5,hydraulicEligible:true,rarity:'uncommon',productionRule:'original-tryamm-body'},
  {id:'sv96-impulse-sedan',label:'TRYAMM 1996 Impulse Sedan',era:'1990s',year:1996,body:'full-size-sedan',style:'custom',seats:6,hydraulicEligible:true,rarity:'uncommon',productionRule:'original-tryamm-body'},
] 

export const STREETVERSE_VINTAGE_CULTURE_POLICY={
  exactLicensedBrandModels:false,
  historicalReferenceAllowed:true,
  originalProductionBodies:true,
  restorationMissions:true,
  carShows:true,
  cruiseNights:true,
  hydraulicCompetitions:true,
  carClubs:true,
  paintAndInteriorCustomization:true,
  wireWheelStyle:true,
  periodAudioCustomization:true,
  streetRacingNotRequired:true,
} as const

export function vintageByEra(era:VintageEra){return STREETVERSE_VINTAGE_LOW_RIDER_FLEET.filter(v=>v.era===era)}
export function hydraulicEligibleVintage(){return STREETVERSE_VINTAGE_LOW_RIDER_FLEET.filter(v=>v.hydraulicEligible)}
