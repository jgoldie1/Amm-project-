import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import type {Group,Object3D} from 'three';
import {createAvatarPerformance,inspectLoadedAvatar} from '../game/creator/StreetVerseAvatarRuntime';
import {auditAvatar} from '../game/creator/StreetVerseDeluxeStudio';
export type BJAvatarHandle={root:Object3D;update:(dt:number,moving:boolean)=>void;dispose:()=>void;report:{bones:number;clips:string[];warnings:string[]}};
export async function loadApprovedBJAvatar(url:string,signal?:AbortSignal):Promise<BJAvatarHandle>{
 const parsed=new URL(url,window.location.href);
 if(parsed.origin!==window.location.origin||!parsed.pathname.toLowerCase().endsWith('.glb'))throw new Error('BJ model must be an approved same-origin GLB');
 if(signal?.aborted)throw new Error('Avatar load cancelled');
 const gltf=await new GLTFLoader().loadAsync(parsed.toString());
 if(signal?.aborted)throw new Error('Avatar load cancelled');
 const root=gltf.scene;const report=inspectLoadedAvatar(root,gltf.animations);const readiness=auditAvatar(report);
 const performance=createAvatarPerformance(root,gltf.animations);
 const clips=report.animations;
 const walk=clips.find(x=>/walk|locomotion/i.test(x));
 const idle=clips.find(x=>/idle|stand/i.test(x));
 let current='';
 function update(dt:number,moving:boolean){const next=moving?walk:idle;if(next&&next!==current){performance.play(next);current=next}performance.update(dt)}
 return {root,update,dispose:()=>performance.stop(),report:{bones:report.bones.length,clips,warnings:readiness.warnings}};
}
export function getBJModelUrl():string|null{
 // Deliberately no guessed or remote model URL. Configure only after validating ownership and file integrity.
 const value=import.meta.env.VITE_STREETVERSE_BJ_GLB_URL;
 return typeof value==='string'&&value.trim()?value.trim():null;
}
