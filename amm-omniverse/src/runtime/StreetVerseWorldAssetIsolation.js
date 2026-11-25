const GREENVILLE_ASSETS=new Set(['tree','bench','streetLamp','holoWayfinder'])

export function nativePlacementsForWorld(greenville,greenvillePlacements,chicagoPlacements){
  if(!greenville)return chicagoPlacements
  return greenvillePlacements.filter(placement=>
    Boolean(placement.label?.startsWith('greenville-'))&&GREENVILLE_ASSETS.has(placement.asset),
  )
}
