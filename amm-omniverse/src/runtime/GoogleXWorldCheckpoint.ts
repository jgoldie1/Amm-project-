export type WorldCheckpoint={id:string;worldVersion:string;saveSchema:number;playerId:string;progress:Record<string,string|number|boolean>;sourceCommit:string;createdAt:string}
export function assessRestore(current:WorldCheckpoint,previous:WorldCheckpoint,approved:boolean){
 const issues:string[]=[]
 if(!approved)issues.push('approval_required')
 if(current.playerId!==previous.playerId)issues.push('owner_mismatch')
 if(previous.saveSchema!==current.saveSchema)issues.push('migration_required')
 if(!previous.sourceCommit||!previous.worldVersion)issues.push('provenance_missing')
 return{canRestore:issues.length===0,issues,action:'preview_only' as const,preservesCurrentSave:true}
}
