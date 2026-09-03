(()=>{
 if(!location.pathname.startsWith('/streetverse'))return
 const names=['Niko','Eleni','Darius','Maya','Theo','Zoe','Andreas']
 const replies={
  happening:[['Η πόλη είναι γεμάτη ενέργεια απόψε.','The city is full of energy tonight.'],['Έχει Creator Pop-Up και Race Night.','There is a Creator Pop-Up and Race Night.']],
  going:[['Πηγαίνω στην αγορά.','I’m heading to the market.'],['Πάω στο 64 Track Studio.','I’m going to 64 Track Studio.'],['Θα δω την κούρσα.','I’m going to watch the race.']],
  mission:[['Ψάξε τα φωτεινά σημεία αποστολών.','Look for the glowing mission beacons.'],['Το Creator Stage χρειάζεται βοήθεια.','The Creator Stage could use some help.'],['Πέρνα από το All American Marketplace.','Stop by the All American Marketplace.']],
  hello:[['Χαίρομαι που σε βλέπω.','Good to see you.'],['Καλώς ήρθες στο StreetVerse.','Welcome to StreetVerse.']],
  goodbye:[['Τα λέμε!','See you!'],['Καλή συνέχεια!','Take care!']]
 }
 let active=null,voiceOn=localStorage.getItem('tryamm.streetverse.npc-greek-voice')==='on'
 const css=`
 #tryamm-npc-talk{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:18100;width:min(92vw,390px);padding:12px;border-radius:16px;background:#020713f4;border:1px solid #7be9ff88;color:#fff;font-family:system-ui;box-shadow:0 16px 44px #000c;display:none}
 #tryamm-npc-talk.open{display:block}
 #tryamm-npc-talk h3{margin:0 0 4px;font-size:15px}#tryamm-npc-talk .meta{font-size:10px;color:#8effb7;margin-bottom:8px}#tryamm-npc-talk .line{min-height:44px;padding:8px;border-radius:10px;background:#071522;border:1px solid #28465d;font-size:12px;line-height:1.35;margin-bottom:9px}
 #tryamm-npc-talk .choices{display:grid;grid-template-columns:1fr 1fr;gap:7px}#tryamm-npc-talk button{min-height:44px;border-radius:11px;border:1px solid #4f7893;background:#0a1b2a;color:#fff;font-weight:800;padding:6px}
 #tryamm-npc-talk .close{position:absolute;right:8px;top:8px;width:44px;height:44px}
 #tryamm-mobile-life .sv-person{pointer-events:auto;cursor:pointer;min-width:28px;min-height:42px}
 #tryamm-mobile-life .sv-person:focus{outline:3px solid #fff;outline-offset:3px}
 `
 function pick(kind,index){const pool=replies[kind]||replies.hello;return pool[index%pool.length]}
 function speak(text){if(!voiceOn||!('speechSynthesis'in window))return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='el-GR';u.rate=.93;const vs=speechSynthesis.getVoices();const v=vs.find(x=>String(x.lang).toLowerCase().startsWith('el'));if(v)u.voice=v;speechSynthesis.speak(u)}catch{}}
 function ensurePanel(){
  let panel=document.getElementById('tryamm-npc-talk');if(panel)return panel
  const style=document.createElement('style');style.id='tryamm-npc-talk-style';style.textContent=css;document.head.appendChild(style)
  panel=document.createElement('section');panel.id='tryamm-npc-talk';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');panel.setAttribute('aria-label','StreetVerse NPC conversation')
  panel.innerHTML='<button class="close" aria-label="Close conversation">×</button><h3></h3><div class="meta"></div><div class="line"></div><div class="choices"><button data-q="hello">Say hello</button><button data-q="happening">What’s happening?</button><button data-q="going">Where are you going?</button><button data-q="mission">Any missions?</button><button data-q="goodbye">Goodbye</button><button data-q="voice">Voice on/off</button></div>'
  document.body.appendChild(panel)
  panel.querySelector('.close').addEventListener('click',()=>close())
  panel.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>respond(b.dataset.q)))
  return panel
 }
 function open(person,index){
  active={person,index};const panel=ensurePanel();const name=names[index%names.length];const state=person.dataset.state||'walk';const dest=person.dataset.destination||'City Block'
  panel.querySelector('h3').textContent=`${name} • StreetVerse NPC`
  panel.querySelector('.meta').textContent=`Mood: ${state.toUpperCase()} • Location: ${dest}`
  const line=pick('hello',index);panel.querySelector('.line').textContent=`${line[0]} — ${line[1]}`;panel.classList.add('open');speak(line[0])
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-npc-conversation-open',{detail:{npcOnly:true,name,state,destination:dest}}))
 }
 function respond(kind){
  if(!active)return;const panel=ensurePanel();if(kind==='voice'){voiceOn=!voiceOn;localStorage.setItem('tryamm.streetverse.npc-greek-voice',voiceOn?'on':'off');panel.querySelector('.line').textContent=`NPC voice ${voiceOn?'on':'off'}.`;return}
  const line=pick(kind,active.index+Math.floor(Date.now()/10000));panel.querySelector('.line').textContent=`${line[0]} — ${line[1]}`;speak(line[0])
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-npc-conversation',{detail:{npcOnly:true,question:kind,greek:line[0],english:line[1]}}))
  if(kind==='mission')window.dispatchEvent(new CustomEvent('tryamm:streetverse-npc-mission-hint',{detail:{source:'npc-conversation',npcOnly:true,hint:line[1]}}))
  if(kind==='goodbye')setTimeout(close,600)
 }
 function close(){const p=document.getElementById('tryamm-npc-talk');p?.classList.remove('open');active=null}
 function bind(){document.querySelectorAll('#tryamm-mobile-life .sv-person').forEach((p,i)=>{if(p.dataset.talkBound)return;p.dataset.talkBound='1';p.tabIndex=0;p.setAttribute('role','button');p.setAttribute('aria-label',`Talk to ${names[i%names.length]}, StreetVerse NPC`);p.addEventListener('click',()=>open(p,i));p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(p,i)}})})}
 const ob=new MutationObserver(bind);ob.observe(document.documentElement,{subtree:true,childList:true});bind();addEventListener('pagehide',()=>ob.disconnect(),{once:true})
})()
