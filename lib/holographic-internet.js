'use strict';

const crypto = require('crypto');
const NODE_TYPES = new Set(['web','academic','archive','community','tryamm','product','vehicle','person','business','image','video','audio','document','world3d','model3d','live']);
function text(v,max=1000){return String(v??'').replace(/\s+/g,' ').trim().slice(0,max)}
function id(v){return crypto.createHash('sha256').update(String(v)).digest('hex').slice(0,24)}
function clamp(n,min,max){return Math.max(min,Math.min(max,Number(n)||0))}
function makeSpatialNode(input={}){
 const type=text(input.type,30).toLowerCase(); if(!NODE_TYPES.has(type)) throw new Error('unsupported_holo_node_type');
 const label=text(input.label||input.title||type,240); const source=text(input.sourceUrl||input.url,2000);
 return {id:input.id||id(`${type}|${source}|${label}`),type,label,sourceUrl:source||null,summary:text(input.summary,2000),
  position:{x:clamp(input.x,-10000,10000),y:clamp(input.y,-10000,10000),z:clamp(input.z,-10000,10000)},
  scale:clamp(input.scale||1,.1,20),confidence:clamp(input.confidence??.5,0,1),freshness:clamp(input.freshness??.5,0,1),
  provenance:input.provenance&&typeof input.provenance==='object'?input.provenance:{},actions:Array.isArray(input.actions)?input.actions.slice(0,20):[],
  safety:input.safety&&typeof input.safety==='object'?input.safety:{status:'unreviewed'}};
}
function makeSpatialEdge(from,to,relation='related',weight=.5,evidence=[]){return {id:id(`${from}|${relation}|${to}`),from,to,relation:text(relation,80),weight:clamp(weight,0,1),evidence:Array.isArray(evidence)?evidence.slice(0,20):[]}}
function buildHoloScene({query='',nodes=[],edges=[],time='now',mode='explore'}={}){
 const safeNodes=nodes.map(makeSpatialNode).filter(n=>n.safety.status==='approved'||n.provenance.trusted===true);
 const ids=new Set(safeNodes.map(n=>n.id)); const safeEdges=edges.filter(e=>ids.has(e.from)&&ids.has(e.to));
 return {protocol:'tryamm-holo-internet/1.0',query:text(query,2000),mode:text(mode,40),time:text(time,80),generatedAt:new Date().toISOString(),nodes:safeNodes,edges:safeEdges,
  controls:{navigation:['orbit','walk','fly','zoom','voice','gesture','controller'],timeDial:true,compareMode:true,filterBubbleBreaker:true,provenanceOverlay:true},
  rendering:{fallback2D:true,webXRReady:true,deviceProfiles:['phone','desktop','tv','ar','vr','holographic-display']}};
}
function actionRequiresConfirmation(action={}){return ['purchase','book','send','pay','publish','delete','dispatch','sign','transfer','unlock'].includes(text(action.type,40).toLowerCase())}
module.exports={NODE_TYPES,makeSpatialNode,makeSpatialEdge,buildHoloScene,actionRequiresConfirmation};
