import {useState} from 'react'
type Topic={name:string;keywords:string[];answer:string}
export const HOLOGPT_COMMUNITY_KNOWLEDGE:Topic[]=[
 {name:'StreetVerse controls',keywords:['move','walk','drive','control','chromebook'],answer:'Use WASD or arrow keys, gamepad or the on-screen directional controls. For a stuck mission, return to Chicago and report the exact step in #streetverse-playtests.'},
 {name:'Sculptify missions',keywords:['sculptify','kitchen','cook','restaurant'],answer:'Enter the Sculptify Kitchen portal in Chicago. Complete its business mission steps in order. These are demo tasks, not paid work.'},
 {name:'Aniyah Cross Borders',keywords:['aniyah','cross border','currency','payment','financial'],answer:'Open ANIYAH MISSIONS in Chicago. The exchange-rate comparison is educational and simulated. No real funds are transferred.'},
 {name:'Private beta',keywords:['whitelist','beta','access','invite'],answer:'Use REQUEST ACCESS in the Chicago game to save a local request draft. Access is not approved or granted automatically; staff review requires a future secure backend.'},
 {name:'Discord community',keywords:['discord','channel','server'],answer:'Use QUANTUM DISCORD to open the owner-provided invite. Proposed channels include #streetverse-playtests, #sculptify-businessverse and #aniyah-cross-borders; creation on Discord is not confirmed.'},
 {name:'Camera troubleshooting',keywords:['camera','photo','picture'],answer:'Open ANIYAH MISSIONS and select the camera. Chrome may require camera permission and HTTPS. You can choose a local photo if camera access is unavailable.'},
 {name:'Safety and privacy',keywords:['password','secret','scam','safety','privacy'],answer:'Never share passwords, payment credentials, recovery codes or personal identity documents in Discord or this assistant. Report abuse to server moderators.'}
]
export function answerHoloCommunityQuestion(question:string):{topic:string;answer:string}{
 const q=question.toLowerCase().slice(0,500)
 const topic=HOLOGPT_COMMUNITY_KNOWLEDGE.find(t=>t.keywords.some(k=>q.includes(k)))
 return topic?{topic:topic.name,answer:topic.answer}:{topic:'General help',answer:'I can guide you through StreetVerse controls, Sculptify, Aniyah missions, beta access, Discord and camera troubleshooting. For other issues, share a non-sensitive bug description with a moderator.'}
}
export default function HoloGPTCommunityGuide(){
 const [question,setQuestion]=useState(''),[response,setResponse]=useState<{topic:string;answer:string}|null>(null)
 return <section aria-label="HoloGPT community help" style={{padding:14,marginTop:16,border:'1px solid #5a83b5',borderRadius:12,background:'#111d36'}}>
 <h3>HoloGPT · Community Assistant</h3>
 <p>This working offline help assistant answers from reviewed StreetVerse guidance. Live generative AI, Discord chat, account access and external tools are not connected.</p>
 <label htmlFor="hologpt-community-question">Ask about missions, camera, controls or Discord</label>
 <textarea id="hologpt-community-question" maxLength={500} value={question} onChange={e=>setQuestion(e.target.value)} style={{display:'block',width:'100%',maxWidth:600,minHeight:72,padding:10,margin:'8px 0',borderRadius:8}}/>
 <button type="button" disabled={!question.trim()} onClick={()=>setResponse(answerHoloCommunityQuestion(question))} style={{minHeight:44,padding:12,background:'#294f88',color:'white',border:'1px solid #8cb1ed',borderRadius:8}}>Ask HoloGPT</button>
 {response&&<div role="status" aria-live="polite"><h4>{response.topic}</h4><p>{response.answer}</p></div>}
 </section>
}
