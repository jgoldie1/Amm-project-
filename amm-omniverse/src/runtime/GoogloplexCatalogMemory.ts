export type GoogloplexCatalogRecord={
 id:string;kind:string;title:string;tags:string[];status:'ready'|'optimize'|'review'|'quarantine'|'reference'
 rights:string;source?:string;creatorId?:string;city?:string;skeletonFamily?:string
 assetPointer?:string;thumbnailPointer?:string;relationships?:string[];updatedAt:string
}
const records=new Map<string,GoogloplexCatalogRecord>()
export function rememberCatalogRecord(r:GoogloplexCatalogRecord){
 if(!r||!['id','title','kind','rights','updatedAt'].every(k=>typeof (r as any)[k]==='string'&&(r as any)[k].length<=2000)||!Array.isArray(r.tags)||r.tags.length>50||!r.tags.every(v=>typeof v==='string'&&v.length<=200))throw new Error('Invalid catalog record')
 if(!records.has(r.id)&&records.size>=500)throw new Error('Catalog limit: 500 records')
 const clean:GoogloplexCatalogRecord={id:r.id,kind:r.kind,title:r.title,rights:r.rights,updatedAt:r.updatedAt,status:['ready','optimize','review','quarantine','reference'].includes(r.status)?r.status:'review',tags:[...new Set(r.tags.map(x=>x.toLowerCase()))]}
 for(const k of ['source','creatorId','city','skeletonFamily','assetPointer','thumbnailPointer'] as const)if(typeof r[k]==='string')clean[k]=r[k]!.slice(0,2000)
 if(Array.isArray(r.relationships))clean.relationships=r.relationships.filter(v=>typeof v==='string').slice(0,100).map(v=>v.slice(0,200))
 records.set(r.id,clean);return clean
}
export function forgetCatalogRecord(id:string){return records.delete(id)}
export function searchGoogloplexCatalog(q:string){const s=q.trim().toLowerCase();return [...records.values()].filter(r=>!s||[r.id,r.title,r.kind,r.status,r.rights,r.city,...r.tags].some(v=>String(v||'').toLowerCase().includes(s)))}
export function catalogStats(){return [...records.values()].reduce((m,r)=>{m.total++;m.byStatus[r.status]=(m.byStatus[r.status]||0)+1;m.byKind[r.kind]=(m.byKind[r.kind]||0)+1;return m},{total:0,byStatus:{} as Record<string,number>,byKind:{} as Record<string,number>})}

// Explicit saves preserve the existing synchronous catalog/search API.
import {getSupabaseClient} from '../services/supabaseClient'
import {PrivateMemorySession} from './PrivateMemorySession'
let installed=false
const client=getSupabaseClient()
export const catalogMemory=new PrivateMemorySession('catalog',client)
export const businessMemory=new PrivateMemorySession('business',client)
let memoryNotice='Sign in to load private memory.'
const changed=()=>{if(typeof window!=='undefined')window.dispatchEvent(new Event('tryamm:catalog-memory-changed'))}
export function catalogMemoryNotice(){return memoryNotice}
function applyCatalog(payload:unknown){
 records.clear()
 if(!Array.isArray(payload))return
 for(const r of payload.slice(0,500)){
  if(r&&typeof r.id==='string'&&typeof r.title==='string'&&typeof r.kind==='string'&&Array.isArray(r.tags)&&r.tags.every((v:unknown)=>typeof v==='string')&&['ready','optimize','review','quarantine','reference'].includes(r.status)){try{rememberCatalogRecord(r)}catch{/* Skip malformed stored records. */}}
 }
}
export async function reloadCatalogMemory(){
 const generation=catalogMemory.generation
 const [catalog]=await Promise.all([catalogMemory.load(),businessMemory.load()])
 if(generation!==catalogMemory.generation)return
 applyCatalog(catalog?.payload);memoryNotice='Private memory loaded.';changed()
}
export function installCatalogMemory(){
 if(installed||!client)return
 installed=true
 client.auth.onAuthStateChange((event,session)=>{
  const owner=session?.user.id||null
  if(owner===catalogMemory.owner&&event!=='INITIAL_SESSION')return
  catalogMemory.switchOwner(owner);businessMemory.switchOwner(owner);records.clear()
  memoryNotice=owner?'Loading private memory…':'Sign in to load private memory.';changed()
  if(!owner)return
  const generation=catalogMemory.generation
  setTimeout(()=>{void reloadCatalogMemory().catch(()=>{
   if(generation!==catalogMemory.generation)return
   memoryNotice='Memory unavailable. Saved records have not been replaced.';changed()
  })},0)
 })
}
export async function saveCatalogMemory(){
 const result=await catalogMemory.save([...records.values()])
 if(result){memoryNotice='Catalog saved privately.';changed()}
}
export async function restoreCatalogMemory(){
 const previous=catalogMemory.row?.previous_payload
 if(!previous)throw new Error('No previous catalog revision is available.')
 const row=await catalogMemory.save(previous)
 if(row){applyCatalog(row.payload);changed()}
}
export async function deleteCatalogMemory(){
 if(await catalogMemory.remove()){records.clear();memoryNotice='Saved catalog and its previous revision deleted.';changed()}
}
