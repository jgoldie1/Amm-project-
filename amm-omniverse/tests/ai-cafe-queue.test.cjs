const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),ts=require('typescript');
test('same-clock assignments remain queued with unique IDs and honest execution policy',()=>{
 const events=[],listeners=new Map(),saved=new Map();let n=0;
 const window={addEventListener:(name,fn)=>listeners.set(name,fn),dispatchEvent:e=>{events.push(e);listeners.get(e.type)?.(e)}};
 const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname,'../src/runtime/AICafeMultiAgentRuntime.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2021}}).outputText,{exports,require:()=>({installStreetVerseInputRuntime(){},installGlobalDiasporaBusinessRuntime(){},installHoloAdsRevenueRuntime(){}}),window,localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},queueMicrotask:fn=>fn(),crypto:{randomUUID:()=>`uuid-${++n}`},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}},Date});
 exports.installAICafeMultiAgentRuntime();for(let i=0;i<2;i++)window.dispatchEvent({type:'tryamm:ai-cafe-task',detail:{workstream:'business',title:'Create website brief'}});
 const assignments=events.filter(e=>e.type==='tryamm:ai-cafe-assigned');assert.equal(assignments.length,2);assert.notEqual(assignments[0].detail.task.id,assignments[1].detail.task.id);
 const state=events.filter(e=>e.type==='tryamm:ai-cafe-state').at(-1).detail;assert(state.tasks.every(t=>t.status==='queued'));assert.equal(state.agents.find(a=>a.id==='business-builder').status,'queued');assert.match(state.policy.execution,/does not start/);
});
