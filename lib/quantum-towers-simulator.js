'use strict';
// No-cost topology planner. Simulation only: no radio hardware or measured performance.
function simulateTowerNetwork(nodes=[],links=[]){
 if(!Array.isArray(nodes)||!Array.isArray(links)||nodes.length>25||links.length>100)return {ok:false,error:'invalid_size'};
 const ids=new Set();
 for(const n of nodes){if(typeof n?.id!=='string'||!/^[a-z0-9-]{1,32}$/.test(n.id)||ids.has(n.id))return {ok:false,error:'invalid_node'};ids.add(n.id)}
 const edges=new Map([...ids].map(id=>[id,[]]));
 for(const link of links){if(!ids.has(link?.from)||!ids.has(link?.to)||link.from===link.to)return {ok:false,error:'invalid_link'};edges.get(link.from).push(link.to);edges.get(link.to).push(link.from)}
 const reached=new Set(),groups=[];
 for(const id of ids){if(reached.has(id))continue;const queue=[id],group=[];reached.add(id);for(let i=0;i<queue.length;i++){const at=queue[i];group.push(at);for(const n of edges.get(at))if(!reached.has(n)){reached.add(n);queue.push(n)}}groups.push(group)}
 const isolated=nodes.filter(n=>edges.get(n.id).length===0).map(n=>n.id);
 return {ok:true,nodes:nodes.length,links:links.length,connected:groups.length<=1,components:groups,isolated,
     physicalDeployment:false,latencyMeasured:false,throughputMeasured:false,
     notice:'Topology-only planning; does not establish signal coverage, uptime, capacity, spectrum rights or installed towers.'};
}
module.exports={simulateTowerNetwork};
