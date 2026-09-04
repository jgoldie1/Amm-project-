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
 let active=null,lastTrigger=null,voiceOn=localStorage.getItem('tryamm.streetverse.npc-greek-voice')==='on'
 const css=`
 #tryamm-npc-talk{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:18120;width:min(92vw,390px);padding:12px;border-radius:16px;background:#020713f4;border:1px solid #7be9ff88;color:#fff;font-family:system-ui;box-shadow:0 16px 44px #000c;display:none}
 #tryamm-npc-talk.open{display:block}
 #tryamm-npc-talk h3{margin:0 52px 4px 0;font-size:15px}#tryamm-npc-talk .meta{font-size:10px;color:#8effb7;margin-bottom:8px}#tryamm-npc-talk .line{min-height:44px;padding:8px;border-radius:10px;background:#071522;border:1px solid #28465d;font-size:12px;line-height:1.35;margin-bottom:9px}
 #tryamm-npc-talk .choices{display:grid;grid-template-columns:1fr 1fr;gap:7px}#tryamm-npc-talk button{min-height:44px;border-radius:11px;border:1px solid #4f7893;background:#0a1b2a;color:#fff;font-weight:800;padding:6px}
 #tryamm-npc-talk .close{position:absolute;right:8px;top:8px;width:44px;height:44px}
 #tryamm-npc-talk-launcher{position:fixed;right:12px;top:176px;z-index:18110;min-height:44px;max-width:150px;padding:0 12px;border-radius:12px;border:2px solid #79ffad;background:#041b18f2;color:#d9ffe8;font:900 10px/1.15 system-ui;box-shadow:0 8px 24px #000a;white-space:normal;text-align:center}
 #tryamm-npc-talk-launcher:focus,#tryamm-npc-talk button:focus{outline:3px solid #fff;outline-offset:3px}
 #tryamm-mobile-life .sv-person{pointer-events:auto;cursor:pointer;min-width:44px;min-height:44px;margin-left:-15px;margin-top:-6px;padding-top:6px;border-radius:12px}
 #tryamm-mobile-life .sv-person:focus{outline:3px solid #fff;outline-offset:3px;background:#7be9ff22}
 @media(max-height:620px){#tryamm-npc-talk-launcher{top:128px;right:68px}#tryamm-npc-talk{bottom:6px;max-height:76vh;overflow:auto}}
 `
 function ensureStyle(){if(document.getElementById('tryamm-npc-talk-style'))return;const style=document.createElement('style');style.id='tryamm-npc-talk-style';style.textContent=css;document.head.appendChild(style)}
 function pick(kind,index){const pool=replies[kind]||replies.hello;return pool[index%pool.length]}
 function speak(text){if(!voiceOn||!('speechSynthesis'in window))return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='el-GR';u.rate=.93;const vs=speechSynthesis.getVoices();const v=vs.find(x=>String(x.lang).toLowerCase().startsWith('el'));if(v)u.voice=v;speechSynthesis.speak(u)}catch{}}
 function ensurePanel(){
  let panel=document.getElementById('tryamm-npc-talk');if(panel)return panel
  ensureStyle()
  panel=document.createElement('section');panel.id='tryamm-npc-talk';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');panel.setAttribute('aria-label','StreetVerse resident conversation')
  panel.innerHTML='<button class="close" aria-label="Close conversation">×</button><h3></h3><div class="meta"></div><div class="line" role="status" aria-live="polite"></div><div class="choices"><button data-q="hello">Say hello</button><button data-q="happening">What’s happening?</button><button data-q="going">Where are you going?</button><button data-q="mission">Any missions?</button><button data-q="goodbye">Goodbye</button><button data-q="voice">Voice on/off</button></div>'
  document.body.appendChild(panel)
  panel.querySelector('.close').addEventListener('click',()=>close())
  panel.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>respond(b.dataset.q)))
  return panel
 }
 function availableResidents(){return [...document.querySelectorAll('#tryamm-mobile-life .sv-person')]}
 function open(person,index,trigger){
  if(!person)return
  lastTrigger=trigger||document.activeElement
  const resolvedIndex=Number.isFinite(Number(person.dataset.npcIndex))?Number(person.dataset.npcIndex):index
  active={person,index:resolvedIndex};const panel=ensurePanel();const name=names[resolvedIndex%names.length];const state=person.dataset.state||'walk';const dest=person.dataset.destination||'City Block'
  panel.querySelector('h3').textContent=`${name} • StreetVerse resident`
  panel.querySelector('.meta').textContent=`Mood: ${state.toUpperCase()} • Location: ${dest}`
  const line=pick('hello',resolvedIndex);panel.querySelector('.line').textContent=`${line[0]} — ${line[1]}`;panel.classList.add('open');speak(line[0])
  const launcher=document.getElementById('tryamm-npc-talk-launcher');if(launcher)launcher.textContent=`TALKING • ${name.toUpperCase()}`
  panel.querySelector('[data-q="hello"]')?.focus()
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-npc-conversation-open',{detail:{npcOnly:true,scriptedDialogue:true,name,state,destination:dest,mobileSafeMode:true,htmlCity:true}}))
 }
 function respond(kind){
  if(!active)return;const panel=ensurePanel();if(kind==='voice'){voiceOn=!voiceOn;localStorage.setItem('tryamm.streetverse.npc-greek-voice',voiceOn?'on':'off');panel.querySelector('.line').textContent=`Resident voice ${voiceOn?'on':'off'}.`;return}
  const line=pick(kind,active.index+Math.floor(Date.now()/10000));panel.querySelector('.line').textContent=`${line[0]} — ${line[1]}`;speak(line[0])
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-npc-conversation',{detail:{npcOnly:true,scriptedDialogue:true,question:kind,greek:line[0],english:line[1],mobileSafeMode:true,htmlCity:true}}))
  if(kind==='mission')window.dispatchEvent(new CustomEvent('tryamm:streetverse-npc-mission-hint',{detail:{source:'npc-conversation',npcOnly:true,scriptedDialogue:true,hint:line[1],mobileSafeMode:true,htmlCity:true}}))
  if(kind==='goodbye')setTimeout(close,600)
 }
 function close(){const p=document.getElementById('tryamm-npc-talk');p?.classList.remove('open');active=null;const launcher=document.getElementById('tryamm-npc-talk-launcher');if(launcher)launcher.textContent='TALK TO RESIDENT';const target=lastTrigger;lastTrigger=null;if(target instanceof HTMLElement)target.focus()}
 function ensureLauncher(){
  if(document.getElementById('tryamm-npc-talk-launcher'))return
  ensureStyle();const button=document.createElement('button');button.id='tryamm-npc-talk-launcher';button.type='button';button.textContent='TALK TO RESIDENT';button.setAttribute('aria-label','Talk to a StreetVerse resident');document.body.appendChild(button)
  button.addEventListener('click',()=>{const residents=availableResidents();const person=residents.find(p=>p.dataset.state==='talk')||residents[0];if(!person){window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'StreetVerse residents are still entering the block.'}}));return}open(person,Number(person.dataset.npcIndex||0),button)})
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-npc-talk-ready',{detail:{mobileSafeMode:true,htmlCity:true,residents:availableResidents().length,scriptedDialogue:true,bilingual:true}}))
 }
 function bind(){const residents=availableResidents();residents.forEach((p,i)=>{if(p.dataset.talkBound)return;p.dataset.talkBound='1';p.dataset.npcIndex=String(i);p.tabIndex=0;p.setAttribute('role','button');p.setAttribute('aria-label',`Talk to ${names[i%names.length]}, StreetVerse resident`);p.addEventListener('click',e=>open(p,i,e.currentTarget));p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(p,i,e.currentTarget)}})});if(residents.length)ensureLauncher()}
 const ob=new MutationObserver(bind);ob.observe(document.documentElement,{subtree:true,childList:true});bind();addEventListener('pagehide',()=>{ob.disconnect();document.getElementById('tryamm-npc-talk-launcher')?.remove();document.getElementById('tryamm-npc-talk')?.remove()},{once:true})
})()