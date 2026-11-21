// Asset manifest for existing preserved NPC GLBs. No files are modified.
const base='https://fxluchtdfpediivhoksl.supabase.co/storage/v1/object/public/streetverse-assets/';
export const RECOVERED_CHARACTERS=Object.freeze([
 {id:'adult-man',name:'Adult man NPC',path:'characters/static-wave1/SV_NPC_BLACK_MAN_ADULT_01',bytes:[12445832,12425808,12415192]},
 {id:'adult-woman',name:'Adult woman NPC',path:'characters/static-wave1/SV_NPC_BLACK_WOMAN_ADULT_01',bytes:[13389964,13369976,13359352]},
 {id:'young-man',name:'Young adult man NPC',path:'characters/static-wave2/SV_NPC_BLACK_MAN_YOUNGADULT_01',bytes:[12701232,12681392,12670800]},
 {id:'young-woman',name:'Young adult woman NPC',path:'characters/static-wave2/SV_NPC_BLACK_WOMAN_YOUNGADULT_01',bytes:[11742224,11722240,11711604]}
].map(c=>({...c,clips:{idle:base+c.path+'.glb',walk:base+c.path+'.walk.glb',run:base+c.path+'.run.glb'}})));
export function chooseRecoveredCharacter(id){const c=RECOVERED_CHARACTERS.find(c=>c.id===id);if(!c)throw Error('Unknown recovered character');return c;}
export async function loadRecoveredCharacter({THREE,GLTFLoader,characterId,clip='idle',fetchImpl=fetch}){
 const c=chooseRecoveredCharacter(characterId);if(!['idle','walk','run'].includes(clip))throw Error('Unsupported clip');
 const index=['idle','walk','run'].indexOf(clip),url=c.clips[clip];
 const response=await fetchImpl(url,{mode:'cors'});if(!response.ok)throw Error('Asset unavailable: HTTP '+response.status);
 const buffer=await response.arrayBuffer();if(buffer.byteLength!==c.bytes[index])throw Error('Preserved asset size mismatch; refusing to load');
 if(new DataView(buffer).getUint32(0,true)!==0x46546c67)throw Error('Invalid GLB header');
 const loader=new GLTFLoader(),gltf=await new Promise((resolve,reject)=>loader.parse(buffer,'',resolve,reject));
 if(!gltf.scene)throw Error('Missing scene');const mixer=new THREE.AnimationMixer(gltf.scene),actions=gltf.animations.map(a=>mixer.clipAction(a));if(actions.length)actions[0].play();
 return {scene:gltf.scene,mixer,actions,clip,assetName:c.name,warning:actions.length?'Animation playing from preserved GLB':'No embedded animation clip; static mesh only',dispose(){mixer.stopAllAction();gltf.scene.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material].filter(Boolean))m.dispose?.()})}};
}
