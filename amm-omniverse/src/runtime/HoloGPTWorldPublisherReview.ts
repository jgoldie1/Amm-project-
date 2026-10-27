export type Surface='streetverse'|'holoverse'|'website'|'holo-ads'
export type Draft={assetId:string;sourceRevision:string;rightsApproved:boolean;surfaces:Surface[];approvals:Partial<Record<Surface,boolean>>}
export function assessWorldPublish(d:Draft){
 const missing=d.surfaces.filter(s=>!d.approvals[s])
 return{readyForManualPublish:d.rightsApproved&&!!d.assetId&&!!d.sourceRevision&&missing.length===0,missingApprovals:missing,automaticallyPublish:false,requiresPerSurfaceApproval:true}
}
