import {useEffect,useMemo,useState} from 'react'

type Activity={campusId:string;roomId:string;label:string;subject:string}
type Step='intro'|'activity'|'complete'

const LESSONS:Record<string,{title:string;task:string;choices:string[];answer:number}>={
  'reading + language arts':{title:'Reading Lab',task:'Which choice best describes a main idea?',choices:['A detail that supports the whole passage','The central point a text is mostly about','A character name'],answer:1},
  'math':{title:'Math Lab',task:'Solve 12 × 8.',choices:['86','96','108'],answer:1},
  'science + experiments':{title:'Science Lab',task:'Which state of matter keeps its own volume but takes the shape of its container?',choices:['Solid','Liquid','Gas'],answer:1},
  'reading + research':{title:'Library Research',task:'What should you do first when checking whether a source is trustworthy?',choices:['Check who published it and the evidence it uses','Share it immediately','Only read the headline'],answer:0},
  'coding + AI + digital literacy':{title:'Computer Lab',task:'Which sequence best describes a safe AI workflow?',choices:['Ask → verify → cite/use','Copy → post → never check','Share passwords → automate'],answer:0},
  'music + visual arts':{title:'Music + Art Studio',task:'Four quarter notes in 4/4 time fill how many beats?',choices:['2','4','8'],answer:1},
  'history + social studies':{title:'Chicago History Lab',task:'A primary source is best described as…',choices:['A firsthand record from the time being studied','Any modern summary','A fictional story only'],answer:0},
  'meals + community':{title:'Cafeteria Community Lab',task:'Choose the best community-lunch practice.',choices:['Respect food allergies and dietary needs','Ignore allergy information','Waste unused food'],answer:0},
  'wellness + support':{title:'Student Wellness',task:'If a student feels unwell during class, the safest first step is…',choices:['Tell a trusted adult or school health staff','Hide it all day','Leave campus alone'],answer:0},
}

export default function StreetVerseSchoolLearningHUD(){
  const [activity,setActivity]=useState<Activity|null>(null)
  const [step,setStep]=useState<Step>('intro')
  const [selected,setSelected]=useState<number|null>(null)
  const [message,setMessage]=useState('')

  useEffect(()=>{
    const open=(event:Event)=>{const d=(event as CustomEvent<Activity>).detail;if(!d?.roomId)return;setActivity(d);setStep('intro');setSelected(null);setMessage('')}
    addEventListener('tryamm:school-learning-activity',open)
    return()=>removeEventListener('tryamm:school-learning-activity',open)
  },[])

  const lesson=useMemo(()=>activity?LESSONS[activity.subject]||{title:activity.label,task:'Complete the room activity with your teacher or mission guide.',choices:['READY'],answer:0}:null,[activity])
  if(!activity||!lesson)return null
  const close=()=>{setActivity(null);setStep('intro');setSelected(null);setMessage('')}
  const submit=(index:number)=>{
    setSelected(index)
    if(index===lesson.answer){
      setMessage('✓ CORRECT • CLASS ACTIVITY COMPLETE')
      setStep('complete')
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-school-class-complete',{detail:{campusId:activity.campusId,roomId:activity.roomId,label:activity.label,subject:activity.subject,xp:100,rewardStatus:'pending',verified:false}}))
    }else setMessage('TRY AGAIN • use the lesson clue and choose another answer.')
  }

  return <div role="dialog" aria-modal="true" aria-label={activity.label+' class activity'} style={{position:'fixed',inset:0,zIndex:47000,display:'grid',placeItems:'center',padding:14,background:'#02070bd9',fontFamily:'system-ui',color:'#fff'}}>
    <section style={{width:'min(540px,96vw)',maxHeight:'88dvh',overflowY:'auto',border:'1px solid #d9c07888',borderRadius:20,background:'linear-gradient(160deg,#0b1720,#17120a)',padding:18,boxShadow:'0 28px 90px #000'}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:12}}>
        <div><div style={{fontSize:9,letterSpacing:2.2,color:'#ffe59b',fontWeight:950}}>THOMAS JEFFERSON SCHOOL • STREETVERSE CLASS</div><h2 style={{margin:'5px 0'}}>{lesson.title}</h2><div style={{fontSize:11,color:'#b9c5cb'}}>{activity.label} • {activity.subject}</div></div>
        <button aria-label="Close class activity" onClick={close} style={btn}>×</button>
      </header>
      {step==='intro'?<div style={{marginTop:16}}><p style={{lineHeight:1.55,color:'#d0d7dc'}}>You are inside a usable StreetVerse classroom. Start the lesson, answer the activity, and return to the school hallway when finished.</p><button onClick={()=>setStep('activity')} style={{...btn,width:'100%',minHeight:52}}>START CLASS ACTIVITY</button></div>:<div style={{marginTop:16}}>
        <div style={{padding:13,borderRadius:14,background:'#07131d',border:'1px solid #2b5268',fontWeight:800,lineHeight:1.45}}>{lesson.task}</div>
        <div style={{display:'grid',gap:8,marginTop:12}}>{lesson.choices.map((choice,i)=><button key={choice} onClick={()=>submit(i)} disabled={step==='complete'} style={{...btn,minHeight:50,textAlign:'left',borderColor:selected===i?'#ffe27a':'#38576a'}}>{String.fromCharCode(65+i)}. {choice}</button>)}</div>
        {message&&<div role="status" style={{marginTop:12,padding:10,borderRadius:12,background:step==='complete'?'#092016':'#20150a',color:step==='complete'?'#9dffc1':'#ffd194',fontSize:11,fontWeight:850}}>{message}</div>}
        {step==='complete'&&<button onClick={close} style={{...btn,width:'100%',minHeight:50,marginTop:12,borderColor:'#8effb7'}}>RETURN TO SCHOOL HALLWAY</button>}
      </div>}
      <div style={{marginTop:12,fontSize:9,color:'#7d929f'}}>Class XP is pending server verification. School learning activities never expose private student records.</div>
    </section>
  </div>
}
const btn:React.CSSProperties={minWidth:44,minHeight:44,border:'1px solid #38576a',borderRadius:12,background:'#091823',color:'#fff',padding:'9px 12px',fontWeight:900,touchAction:'manipulation'}
