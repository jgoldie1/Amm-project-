import * as THREE from 'three'
/** Plays only animation clips actually present in BJ's loaded GLB. Never invents skeletal tracks. */
const clipNames:Record<string,RegExp[]>={eat:[/eat/i,/chew/i],drink:[/drink/i,/sip/i],sleep:[/sleep/i,/lie.?down/i],sit:[/sit/i,/seated/i],cook:[/cook/i,/stir/i],limp:[/limp/i,/injur/i],recover:[/recover/i,/stand.?up/i],dance:[/dance/i]}
export function playStreetVerseLifeClip(mixer:THREE.AnimationMixer|null,clips:readonly THREE.AnimationClip[],action:string):{played:boolean;clip?:string}{
 const clip=clips.find(c=>(clipNames[action.toLowerCase()]||[]).some(pattern=>pattern.test(c.name)))
 if(!mixer||!clip)return {played:false}
 const motion=mixer.clipAction(clip)
 motion.reset().setLoop(THREE.LoopOnce,1).play()
 motion.clampWhenFinished=true
 return {played:true,clip:clip.name}
}
