export type GoogloplexCatalogRecord={
 id:string;kind:string;title:string;tags:string[];status:'ready'|'optimize'|'review'|'quarantine'|'reference'
 rights:string;source?:string;creatorId?:string;city?:string;skeletonFamily?:string
 assetPointer?:string;thumbnailPointer?:string;relationships?:string[];updatedAt:string
}
const records=new Map<string,GoogloplexCatalogRecord>()
export function rememberCatalogRecord(r:GoogloplexCatalogRecord){records.set(r.id,{...r,tags:[...new Set(r.tags.map(x=>x.toLowerCase()))]});return records.get(r.id)!}
export function forgetCatalogRecord(id:string){return records.delete(id)}
export function searchGoogloplexCatalog(q:string){const s=q.trim().toLowerCase();return [...records.values()].filter(r=>!s||[r.id,r.title,r.kind,r.status,r.rights,r.city,...r.tags].some(v=>String(v||'').toLowerCase().includes(s)))}
export function catalogStats(){return [...records.values()].reduce((m,r)=>{m.total++;m.byStatus[r.status]=(m.byStatus[r.status]||0)+1;m.byKind[r.kind]=(m.byKind[r.kind]||0)+1;return m},{total:0,byStatus:{} as Record<string,number>,byKind:{} as Record<string,number>})}
