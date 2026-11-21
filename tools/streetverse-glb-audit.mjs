#!/usr/bin/env node
// Read-only GLB structural audit. No dependencies or network calls.
import fs from 'node:fs';
import path from 'node:path';
const roots=process.argv.slice(2);
if(!roots.length){console.error('Usage: node tools/streetverse-glb-audit.mjs <file.glb|directory> [...]');process.exitCode=2;}
const files=[];
function walk(p){if(!fs.existsSync(p))return;const s=fs.statSync(p);if(s.isDirectory()){for(const name of fs.readdirSync(p))if(!['node_modules','.git','dist','.next'].includes(name))walk(path.join(p,name));}else if(p.toLowerCase().endsWith('.glb'))files.push(p);}
for(const root of roots)walk(root);
function audit(file){const b=fs.readFileSync(file);if(b.length<20||b.toString('ascii',0,4)!=='glTF')throw Error('Invalid GLB header');const version=b.readUInt32LE(4),length=b.readUInt32LE(8);if(version!==2||length!==b.length)throw Error('Invalid GLB version/length');let pos=12,json=null;while(pos+8<=b.length){const size=b.readUInt32LE(pos),type=b.readUInt32LE(pos+4);pos+=8;if(pos+size>b.length)throw Error('Invalid GLB chunk');if(type===0x4e4f534a)json=JSON.parse(b.toString('utf8',pos,pos+size).trim());pos+=size;}if(!json)throw Error('Missing JSON chunk');const arr=k=>Array.isArray(json[k])?json[k]:[];const nodes=arr('nodes');const skins=arr('skins');const animations=arr('animations');return {file,bytes:b.length,meshes:arr('meshes').length,nodes:nodes.length,skins:skins.length,joints:skins.reduce((n,s)=>n+(s.joints?.length||0),0),animations:animations.map(a=>({name:a.name||'(unnamed)',channels:a.channels?.length||0})),materials:arr('materials').length,textures:arr('textures').length,images:arr('images').length,scenes:arr('scenes').length,warnings:[...(!skins.length?['No skin: may be a static model']:[]),...(!animations.length?['No embedded animations: external clips/retargeting may be needed']:[]),...(!arr('meshes').length?['No mesh geometry']:[])]};}
const results=files.map(file=>{try{return audit(file)}catch(e){return {file,error:e.message}}});
console.log(JSON.stringify({scanned:files.length,results},null,2));
if(results.some(x=>x.error))process.exitCode=1;
