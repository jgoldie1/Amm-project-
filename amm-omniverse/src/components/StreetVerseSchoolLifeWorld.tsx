import {useEffect,useRef} from 'react'
import * as THREE from 'three'
import {subscribeStreetVerseScene} from '../game/streetverseSceneRegistry'
import {normalizeStreetVerseHumanHeight,STREETVERSE_HUMAN_HEIGHT_METERS} from '../runtime/StreetVerseHumanScale'

type Lane='student'|'teacher'|'coach'|'support'
type Person={id:string;lane:Lane;group:THREE.Group;route:Array<{x:number;z:number;label:string}>;index:number;phase:number}

const SCHOOL_POINTS={
  entrance:{x:-47,z:56,label:'Main Entrance'},
  classA:{x:-62,z:61,label:'Classroom 101'},
  classB:{x:-62,z:71,label:'Classroom 102'},
  library:{x:-49,z:61,label:'Library'},
  cafeteria:{x:-49,z:71,label:'Cafeteria'},
  lab:{x:-35,z:70,label:'Computer Lab'},
  gym:{x:-22,z:68,label:'Gym'},
  support:{x:-35,z:78,label:'Student Support'},
} as const

const mat=(color:number)=>new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.04})
function makePerson(lane:Lane,seed:number){
  const g=new THREE.Group()
  const skin=[0x5a321f,0x74472e,0x925b3e,0xb87955,0xd09b76,0xe0b494][seed%6]
  const top=lane==='teacher'?0x315d77:lane==='coach'?0x7a3d35:lane==='support'?0x4f6746:[0x7551a8,0x2f6e87,0x8a5a35,0x3f734d][seed%4]
  const pants=[0x202936,0x34313d,0x1f3340][seed%3]
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(lane==='student'?.34:.40,lane==='student'?.78:.95,4,8),mat(top));torso.position.y=lane==='student'?1.35:1.5;torso.castShadow=true;g.add(torso)
  const head=new THREE.Mesh(new THREE.SphereGeometry(lane==='student'?.28:.32,10,8),mat(skin));head.position.y=lane==='student'?2.32:2.58;head.castShadow=true;g.add(head)
  const hair=new THREE.Mesh(new THREE.SphereGeometry(lane==='student'?.29:.33,10,8,0,Math.PI*2,0,Math.PI*.48),mat([0x17110f,0x2a1c15,0x4b3426][seed%3]));hair.position.y=head.position.y+.10;g.add(hair)
  for(const side of [-1,1]){
    const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.09,lane==='student'?.52:.62,3,6),mat(skin));arm.position.set(side*(lane==='student'?.42:.48),lane==='student'?1.35:1.5,0);g.add(arm)
    const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.11,lane==='student'?.58:.68,3,6),mat(pants));leg.position.set(side*.15,lane==='student'?.44:.5,0);g.add(leg)
  }
  if(lane==='student'){
    const bag=new THREE.Mesh(new THREE.BoxGeometry(.48,.6,.22),mat(0x273a52));bag.position.set(0,1.3,-.3);g.add(bag)
    normalizeStreetVerseHumanHeight(g,1.48+(seed%4)*.05)
  }else normalizeStreetVerseHumanHeight(g,STREETVERSE_HUMAN_HEIGHT_METERS.adultResident)
  g.userData={schoolLifeNPC:true,lane,fictional:true,noPrivateStudentRecord:true}
  return g
}

const studentRoute=(offset:number)=>[
  SCHOOL_POINTS.entrance,
  offset%2?SCHOOL_POINTS.classA:SCHOOL_POINTS.classB,
  SCHOOL_POINTS.library,
  SCHOOL_POINTS.cafeteria,
  offset%3?SCHOOL_POINTS.lab:SCHOOL_POINTS.gym,
  SCHOOL_POINTS.entrance,
]
const staffRoute=(lane:Lane)=>lane==='coach'
  ?[SCHOOL_POINTS.entrance,SCHOOL_POINTS.gym,SCHOOL_POINTS.cafeteria,SCHOOL_POINTS.gym,SCHOOL_POINTS.entrance]
  :lane==='support'
    ?[SCHOOL_POINTS.entrance,SCHOOL_POINTS.support,SCHOOL_POINTS.cafeteria,SCHOOL_POINTS.support,SCHOOL_POINTS.entrance]
    :[SCHOOL_POINTS.entrance,SCHOOL_POINTS.classA,SCHOOL_POINTS.classB,SCHOOL_POINTS.library,SCHOOL_POINTS.entrance]

export default function StreetVerseSchoolLifeWorld(){
  const raf=useRef(0)
  useEffect(()=>{
    let scene:THREE.Scene|null=null,root:THREE.Group|null=null,last=performance.now(),bell=-1
    const people:Person[]=[]
    const unsub=subscribeStreetVerseScene(handle=>{
      if(root&&scene)scene.remove(root)
      people.splice(0,people.length);scene=handle?.scene||null;root=null
      if(!scene)return
      root=new THREE.Group();root.name='streetverse-thomas-jefferson-school-life';scene.add(root)
      for(let i=0;i<10;i++){
        const group=makePerson('student',i),route=studentRoute(i);const p=route[0];group.position.set(p.x+(i%3-1)*.65,0,p.z+Math.floor(i/3)*.35);root.add(group)
        people.push({id:'tj-student-'+String(i+1).padStart(2,'0'),lane:'student',group,route,index:0,phase:i*.7})
      }
      for(const [i,lane] of (['teacher','teacher','coach','support'] as Lane[]).entries()){
        const group=makePerson(lane,20+i),route=staffRoute(lane);const p=route[0];group.position.set(p.x+(i-1.5)*.7,0,p.z-.9);root.add(group)
        people.push({id:'tj-'+lane+'-'+(i+1),lane,group,route,index:0,phase:i*1.1})
      }
      window.dispatchEvent(new CustomEvent('tryamm:school-life-ready',{detail:{campusId:'thomas-jefferson-legacy-campus',fictionalStudents:10,staffNPCs:4,noPrivateStudentRecords:true}}))
    })

    const tick=(now:number)=>{
      const dt=Math.min(.05,(now-last)/1000);last=now
      const schoolMinute=Math.floor((now/1000)/18)%6
      if(schoolMinute!==bell){
        bell=schoolMinute
        const labels=['ARRIVAL','CLASS PERIOD 1','LIBRARY / LAB','LUNCH','GYM / ELECTIVES','DISMISSAL']
        window.dispatchEvent(new CustomEvent('tryamm:school-bell',{detail:{campusId:'thomas-jefferson-legacy-campus',period:schoolMinute,label:labels[schoolMinute],gameplayClock:true}}))
      }
      for(const person of people){
        const targetIndex=schoolMinute%person.route.length
        person.index=targetIndex
        const target=person.route[targetIndex]
        const dx=target.x-person.group.position.x,dz=target.z-person.group.position.z,dist=Math.hypot(dx,dz)
        if(dist>.25){
          const speed=(person.lane==='student'?2.0:1.7)*dt
          const step=Math.min(dist,speed)
          person.group.position.x+=dx/dist*step;person.group.position.z+=dz/dist*step
          person.group.rotation.y=Math.atan2(dx,dz)
          person.group.position.y=Math.sin(now*.008+person.phase)*.025
        }
      }
      raf.current=requestAnimationFrame(tick)
    }
    raf.current=requestAnimationFrame(tick)
    return()=>{cancelAnimationFrame(raf.current);unsub();if(root&&scene)scene.remove(root)}
  },[])
  return null
}
