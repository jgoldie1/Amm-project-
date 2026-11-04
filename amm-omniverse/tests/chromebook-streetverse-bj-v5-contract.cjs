const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(new URL('../public/chromebook-streetverse-bj-v5-animated.html', 'file://'+__filename),'utf8');
const src=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert(src, 'Missing self-contained game controller');
let draws=0,frameCB=null,handlers={},storage=new Map();
const gl=new Proxy({getShaderParameter(){return true},getProgramParameter(){return true},getAttribLocation(_p,name){return name==='aPosition'?0:1},getShaderInfoLog(){return ''},getProgramInfoLog(){return ''},drawArrays(){draws++}}, {get(o,p){return Object.hasOwn(o,p)?o[p]:typeof p==='string'&&p.toUpperCase()===p?1:()=>{};}});
const nodes=new Map();class ClassList{constructor(){this.v=new Set()}add(s){this.v.add(s)}remove(s){this.v.delete(s)}toggle(s,b){if(b===false)this.v.delete(s);else if(b===true||!this.v.has(s))this.v.add(s);else this.v.delete(s)}contains(s){return this.v.has(s)}}
function el(id){if(!nodes.has(id))nodes.set(id,{id,style:{},dataset:{},clientWidth:820,clientHeight:600,handlers:{},classList:new ClassList(),files:[],textContent:'',value:'',addEventListener(ev,cb){this.handlers[ev]=cb},focus(){},setAttribute(){},setPointerCapture(){},getContext(){return gl}});return nodes.get(id)}
const buttons=['0,-1','-1,0','0,1','1,0'].map(s=>{const b=el('pad-'+s);b.dataset.move=s;return b});
const document={getElementById:el,querySelectorAll(sel){return sel==='[data-move]'?buttons:[]}};
const ctx={atob:(value)=>Buffer.from(value,'base64').toString('binary'),document,window:{addEventListener(k,cb){handlers[k]=cb},devicePixelRatio:1.3},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame(cb){frameCB=cb},console,TextDecoder,DataView,Float32Array,Uint8Array,Math,Number,Array};
const code=src.replace(/\}\)\(\);\s*$/,'globalThis.debug={parseLocalGLB,verifiedBjFilename,move,interact,enterBuilding,goUp,exitBuilding,getAnimated:()=>({parts:bjAnimated?.parts,clips:bjAnimated?.clipNames,selected:selectBJMotion(last)}),getState:()=>({stage,driving,inside,floor,xp,p:{...p}})};})();');
vm.runInNewContext(code,ctx);
let d=ctx.debug;assert(d,'debug functions exported');assert.strictEqual(d.getAnimated().parts,126,'animated BJ uses 126 meshes');assert.strictEqual(d.getAnimated().clips.length,6,'six actual GLB animation clips');assert(/BJ ARTICULATED ACTIVE/.test(el('assetMessage').textContent),'saved BJ prototype should load automatically');assert(d.verifiedBjFilename('BJ_STUBBS_V15_ACTING_FACE_LOOK_NOD.glb'));assert(d.verifiedBjFilename('SV_HERO_BJ_STUBBS_V7.glb'));assert(!d.verifiedBjFilename('SV_NPC_BLACK_MAN_ADULT_01.glb'));assert(!d.verifiedBjFilename('some_random_model.glb')); assert(frameCB,'frame scheduled');frameCB(16);assert(draws>100);assert(/repair kit/i.test(el('objective').textContent));
// Movement, car, NPC, indoor mission, elevator, stage 7.
d.move(1,0,.6);d.move(0,1,.2);assert.strictEqual(d.getState().stage,1,'repair kit');
d.move(1,0,1.3);d.move(0,1,.8);d.interact();assert.strictEqual(d.getState().stage,2,'car entry');assert(d.getState().driving);
d.move(1,0,1.85);d.move(0,1,1.1);assert.strictEqual(d.getState().stage,3,'Taylor checkpoint');d.interact();assert.strictEqual(d.getState().stage,4,'NPC talk');
d.move(0,1,1.0);d.enterBuilding();assert.strictEqual(d.getState().stage,5,'building enter');assert(d.getState().inside);
d.move(-1,0,1.0);d.move(0,-1,0.85);d.goUp('ELEVATOR');assert.strictEqual(d.getState().stage,6,'elevator');assert.strictEqual(d.getState().floor,2);
d.move(0,-1,1.7);assert.strictEqual(d.getState().stage,7,'finish');assert(d.getState().xp>=165);
frameCB(34);assert(draws>150,'indoor rendering should make draw calls');assert(storage.has('streetverse-chrome-3d-v2'));
// Minimum real glTF v2 GLB with a triangle in the embedded binary buffer.
function sampleGLB(){const positions=Buffer.alloc(36);[0,0,0,1,0,0,0,1,0].forEach((v,i)=>positions.writeFloatLE(v,i*4));const j={asset:{version:'2.0'},buffers:[{byteLength:36}],bufferViews:[{buffer:0,byteOffset:0,byteLength:36}],accessors:[{bufferView:0,componentType:5126,count:3,type:'VEC3'}],meshes:[{primitives:[{attributes:{POSITION:0}}]}],nodes:[{mesh:0}],scenes:[{nodes:[0]}],scene:0};let json=Buffer.from(JSON.stringify(j));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const buf=Buffer.alloc(12+8+json.length+8+positions.length);buf.writeUInt32LE(0x46546c67,0);buf.writeUInt32LE(2,4);buf.writeUInt32LE(buf.length,8);buf.writeUInt32LE(json.length,12);buf.writeUInt32LE(0x4e4f534a,16);json.copy(buf,20);let pos=20+json.length;buf.writeUInt32LE(positions.length,pos);buf.writeUInt32LE(0x004e4942,pos+4);positions.copy(buf,pos+8);return buf;}
const bin=sampleGLB();const ab=bin.buffer.slice(bin.byteOffset,bin.byteOffset+bin.byteLength);
const preview=d.parseLocalGLB(ab);assert.strictEqual(preview.triangles,1,'imported GLB triangle');assert.strictEqual(preview.data.length,18);
let rejected=false;try{d.parseLocalGLB(new ArrayBuffer(12))}catch(e){rejected=true}assert(rejected,'invalid GLB rejected');
assert(src.includes('BJ_ARTICULATED_V3_BASE64'), 'Own BJ prototype geometry must be embedded');assert(/BJ ARTICULATED ACTIVE/.test(el('assetMessage').textContent));
assert(!d.verifiedBjFilename('SV_NPC_BLACK_MAN_ADULT_01.glb'));assert(/not verified V15 portrait|not.*likeness/i.test(el('assetMessage').textContent),'BJ preview must disclose development-only status');
console.log(JSON.stringify({passed:true,scenario:'repair kit → car → drive → NPC → building → elevator → second-floor mission',state:d.getState(),rendererDrawCalls:draws,glbTriangleParsed:preview.triangles,checks:12}));
// Animation changes GPU transform matrices between genuine glTF keyframes.
const matrices=[];gl.uniformMatrix4fv=(_loc,_transpose,m)=>matrices.push(Array.from(m));
frameCB(1400);const first=matrices.slice(-126);matrices.length=0;
frameCB(1750);const next=matrices.slice(-126);let changed=0;
for(let i=0;i<Math.min(first.length,next.length);i++)if(first[i].some((x,j)=>Math.abs(x-next[i][j])>0.0001))changed++;
assert(changed>0,'BJ animation must change actual GPU transform matrices across time');
assert.equal(d.getAnimated().selected,'BJ_Talking_Gesture'); frameCB(4500); assert.equal(d.getAnimated().selected,'BJ_Idle_Breathing');
console.log(JSON.stringify({animationPassed:true,partCount:126,realClipCount:6,changedPartMatrices:changed,mode:d.getAnimated().selected}));