export type TampaDistrict={id:string;label:string;x:number;z:number;kind:string;activity:string};
export const TAMPA_RIVERWALK_SCENE_STATUS:'PROTOTYPE_NOT_GEOSPATIAL_CERTIFIED';
export const TAMPA_RIVERWALK_DISTRICTS:readonly TampaDistrict[];
export function resolveTampaTravel(id:string):TampaDistrict|null;
export function clampTampaWalk(x:number,z:number):{x:number;z:number};
