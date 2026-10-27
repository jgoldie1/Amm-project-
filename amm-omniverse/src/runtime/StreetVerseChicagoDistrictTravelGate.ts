import {CHICAGO_DISTRICT_GRAPH} from './StreetVerseChicagoStreamingPlanner'
import type {CityDistrict} from './StreetVerseChicagoDistrictGenerator'
/** Pure transition requirements. It does not teleport players or mount a scene. */
export type DistrictTravelRequest={from:CityDistrict;to:CityDistrict;progressSaved:boolean;destinationReady:boolean;playerStopped:boolean;assetLicenseApproved:boolean}
export function planDistrictTravel(r:DistrictTravelRequest){
 const source=CHICAGO_DISTRICT_GRAPH.find(x=>x.id===r.from)
 if(!source||!source.neighbors.includes(r.to))return{allowed:false,reason:'not_directly_connected',transition:'none' as const}
 if(!r.progressSaved)return{allowed:false,reason:'progress_unsaved',transition:'none' as const}
 if(!r.assetLicenseApproved)return{allowed:false,reason:'assets_not_cleared',transition:'none' as const}
 if(!r.destinationReady)return{allowed:false,reason:'destination_not_ready',transition:'none' as const}
 if(!r.playerStopped)return{allowed:false,reason:'player_must_stop_safely',transition:'none' as const}
 return{allowed:true,reason:'ready_for_verified_scene_handoff',transition:'staged_handoff' as const}
}
export const CHICAGO_DATA_RULES=Object.freeze({allowGoogleMapsExtraction:false,allowStreetViewModelTracing:false,geographySource:'licensed-source-required',attributionRequired:true,scenesMountedAutomatically:false})
