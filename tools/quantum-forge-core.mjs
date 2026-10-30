// Quantum Forge 8.0 foundation: deterministic, offline-safe procedural geometry.
// 12D denotes twelve editable design parameters, not twelve physical dimensions.
export const PARAMS=['width','depth','height','levels','roofPitch','doorWidth','windowCount','roughness','metalness','daylight','interaction','printScale'];
export function validateDesign(input={}){
 const defaults={width:8,depth:10,height:3,levels:2,roofPitch:0.2,doorWidth:1,windowCount:4,roughness:0.7,metalness:0,daylight:0.8,interaction:1,printScale:0.01};
 const out={};for(const key of PARAMS){const v=input[key]??defaults[key];if(typeof v!=='number'||!Number.isFinite(v))throw Error('Invalid '+key);out[key]=v;}
 for(const k of ['width','depth','height','doorWidth','printScale'])if(out[k]<=0)throw Error(k+' must be positive');
 if(!Number.isInteger(out.levels)||out.levels<1||out.levels>100)throw Error('Invalid levels');
 if(!Number.isInteger(out.windowCount)||out.windowCount<0||out.windowCount>1000)throw Error('Invalid window count');
 if(out.doorWidth>=out.width)throw Error('Door must be narrower than building');
 return out;
}
export function makeBuilding(input={}){
 const p=validateDesign(input),h=p.height*p.levels,w=p.width,d=p.depth;
 // Triangle soup, meters, right-handed Y-up. Includes six closed faces.
 const v=[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,h,-d/2],[-w/2,h,-d/2],[-w/2,0,d/2],[w/2,0,d/2],[w/2,h,d/2],[-w/2,h,d/2]];
 const faces=[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,4,7],[0,7,3],[1,2,6],[1,6,5],[3,7,6],[3,6,2],[0,1,5],[0,5,4]];
 return {name:'Quantum Forge Building',parameters:p,vertices:v,triangles:faces,units:'meters',warning:'Doors/windows are metadata only; mesh is a closed printable building mass, not an enterable interior'};
}
export function toAsciiSTL(model){
 const {vertices,triangles}=model;const sub=(a,b)=>a.map((v,i)=>v-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const lines=['solid quantum_forge'];for(const face of triangles){const [a,b,c]=face.map(i=>vertices[i]);const n=cross(sub(b,a),sub(c,a)),len=Math.hypot(...n)||1;lines.push('facet normal '+n.map(x=>x/len).join(' '),'outer loop',...face.map(i=>'vertex '+vertices[i].join(' ')),'endloop','endfacet');}return lines.concat('endsolid quantum_forge').join('\n')+'\n';
}
