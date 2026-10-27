export type MemoryKind='npc'|'building'|'business'|'music'|'mission'|'ad'|'asset'
export type MemoryNode={id:string;kind:MemoryKind;version:string;source:string;sha256:string;scope:string}
export type MemoryEdge={from:string;to:string;relation:string}
export function validateMemoryGraph(nodes:MemoryNode[],edges:MemoryEdge[],scope:string){
 const errors:string[]=[];const map=new Map<string,MemoryNode>()
 for(const n of nodes){if(!n.id||map.has(n.id)||!n.version||!n.source||!n.sha256||n.scope!==scope)errors.push('invalid_or_duplicate_node:'+n.id);map.set(n.id,n)}
 for(const e of edges)if(!map.has(e.from)||!map.has(e.to)||!e.relation)errors.push('unresolved_edge')
 return{valid:errors.length===0,errors,nodeCount:nodes.length,edgeCount:edges.length}
}
export function neighbors(nodes:MemoryNode[],edges:MemoryEdge[],id:string,scope:string){
 const ids=new Set(edges.filter(e=>e.from===id||e.to===id).flatMap(e=>[e.from,e.to]))
 return nodes.filter(n=>n.scope===scope&&n.id!==id&&ids.has(n.id))
}
