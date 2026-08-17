"use strict";
(() => {
  const canvas=document.querySelector("#game"),ctx=canvas.getContext("2d"),controls={left:false,right:false,thrust:false};
  const ui={phase:document.querySelector("#phase"),altitude:document.querySelector("#altitude"),vertical:document.querySelector("#vertical"),fuel:document.querySelector("#fuel"),score:document.querySelector("#score"),ai:document.querySelector("#aiMessage"),overlay:document.querySelector("#briefing"),overlayTitle:document.querySelector("#overlayTitle"),overlayText:document.querySelector("#overlayText"),start:document.querySelector("#startMission")};
  let state,previous=0,animation=0,paused=false,lastAdvice="",best=Number(localStorage.getItem("tryammMoonBest")||0);
  const stars=Array.from({length:90},(_,i)=>({x:(i*137)%960,y:(i*83)%350,s:i%4===0?2:1}));
  function reset(){state={phase:"briefing",altitude:1200,x:480,vx:0,vy:0,fuel:100,elapsed:0,score:0,astronautX:480,sampleX:735,sample:false};paused=false;ui.overlay.hidden=false;ui.overlayTitle.textContent="Land. Explore. Return.";ui.overlayText.textContent="Use thrust to control descent. Land on the cyan platform below 3 m/s, then collect the marked sample and return to the lander.";ui.start.textContent="Start Moon Mission";ui.ai.textContent="Mission briefing ready. Assisted flight is available.";updateUI();draw();}
  function begin(){state.phase="descent";ui.overlay.hidden=true;previous=performance.now();cancelAnimationFrame(animation);animation=requestAnimationFrame(loop);advise("Descent started. Hold thrust to slow your vertical speed.");}
  function advise(text){if(text!==lastAdvice){lastAdvice=text;ui.ai.textContent=text;}}
  function update(dt){
    if(state.phase==="descent"){
      state.elapsed+=dt;state.vy+=1.62*dt;
      if(controls.thrust&&state.fuel>0){state.vy-=4.6*dt;state.fuel=Math.max(0,state.fuel-7.5*dt);}
      if(controls.left&&state.fuel>0){state.vx-=1.35*dt;state.fuel=Math.max(0,state.fuel-1.7*dt);}
      if(controls.right&&state.fuel>0){state.vx+=1.35*dt;state.fuel=Math.max(0,state.fuel-1.7*dt);}
      if(document.querySelector("#assistMode").checked&&!controls.left&&!controls.right)state.vx*=Math.pow(.45,dt);
      state.x+=state.vx*13*dt;state.x=Math.max(38,Math.min(922,state.x));state.altitude-=state.vy*dt;
      if(state.altitude<280&&state.vy>4)advise("Warning: descent rate too high. Apply main thrust.");
      else if(state.x<415||state.x>545)advise("Move toward the cyan landing platform.");
      else if(state.altitude<180)advise("Landing zone aligned. Reduce speed below 3 meters per second.");
      if(state.altitude<=0){state.altitude=0;const safe=Math.abs(state.vy)<=3&&Math.abs(state.vx)<=2&&state.x>=420&&state.x<=540;if(safe)land();else crash();}
    } else if(state.phase==="eva"){
      state.elapsed+=dt;const speed=90*dt;if(controls.left)state.astronautX=Math.max(40,state.astronautX-speed);if(controls.right)state.astronautX=Math.min(920,state.astronautX+speed);
      if(!state.sample&&Math.abs(state.astronautX-state.sampleX)<30){state.sample=true;advise("Sample secured. Return to the lander.");}
      if(state.sample&&Math.abs(state.astronautX-480)<34)complete();
    }
    updateUI();
  }
  function land(){state.phase="eva";state.vy=0;state.vx=0;state.astronautX=500;state.score=Math.round(1200+state.fuel*12-Math.abs(state.x-480)*2-state.elapsed*3);advise("Touchdown confirmed. EVA active—walk right to collect the cyan sample.");}
  function crash(){state.phase="crashed";state.score=0;showResult("Mission unsuccessful","The lander exceeded safe speed or missed the platform. Retry and begin braking earlier.","Retry Mission");}
  function complete(){state.phase="complete";state.score=Math.max(0,Math.round(state.score+1200-state.elapsed*2));if(state.score>best){best=state.score;localStorage.setItem("tryammMoonBest",String(best));}showResult("Mission complete","Sample returned. Score: "+state.score+". Best: "+best+". Your mission result is saved on this device.","Fly Again");}
  function showResult(title,text,button){ui.overlayTitle.textContent=title;ui.overlayText.textContent=text;ui.start.textContent=button;ui.overlay.hidden=false;updateUI();}
  function updateUI(){ui.phase.textContent=state.phase.toUpperCase();ui.altitude.textContent=Math.max(0,Math.round(state.altitude)).toLocaleString()+" m";ui.vertical.textContent=state.vy.toFixed(1)+" m/s";ui.fuel.textContent=Math.round(state.fuel)+"%";ui.score.textContent=String(state.score);}
  function draw(){
    const gradient=ctx.createLinearGradient(0,0,0,540);gradient.addColorStop(0,"#02040e");gradient.addColorStop(1,"#101538");ctx.fillStyle=gradient;ctx.fillRect(0,0,960,540);
    ctx.fillStyle="#dcecff";for(const star of stars)ctx.fillRect(star.x,star.y,star.s,star.s);
    ctx.fillStyle="#7d8394";ctx.beginPath();ctx.arc(820,95,62,0,Math.PI*2);ctx.fill();ctx.fillStyle="#666c7c";ctx.beginPath();ctx.arc(800,78,12,0,Math.PI*2);ctx.arc(842,112,15,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#888997";ctx.beginPath();ctx.moveTo(0,455);for(let x=0;x<=960;x+=40)ctx.lineTo(x,445+18*Math.sin(x*.027)+9*Math.sin(x*.071));ctx.lineTo(960,540);ctx.lineTo(0,540);ctx.fill();
    ctx.fillStyle="#4fe3ff";ctx.fillRect(420,449,120,8);ctx.shadowColor="#4fe3ff";ctx.shadowBlur=22;ctx.fillRect(438,446,84,4);ctx.shadowBlur=0;
    if(state.phase==="descent"||state.phase==="briefing"){const y=440-Math.min(1200,state.altitude)/1200*340;drawLander(state.x,y,controls.thrust);}
    else{drawLander(480,415,false);if(state.phase==="eva"||state.phase==="complete"){drawAstronaut(state.astronautX,427);if(!state.sample){ctx.fillStyle="#4fe3ff";ctx.beginPath();ctx.arc(state.sampleX,435,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff";ctx.stroke();}}}
    ctx.fillStyle="#4fe3ff";ctx.font="700 14px system-ui";ctx.fillText("DIGITAL LUNAR SIMULATION",20,28);
  }
  function drawLander(x,y,thrust){ctx.save();ctx.translate(x,y);ctx.fillStyle="#d9dbe2";ctx.beginPath();ctx.moveTo(-24,0);ctx.lineTo(-15,-36);ctx.lineTo(15,-36);ctx.lineTo(24,0);ctx.closePath();ctx.fill();ctx.fillStyle="#e8b944";ctx.fillRect(-14,-27,28,14);ctx.strokeStyle="#d9dbe2";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-18,-2);ctx.lineTo(-32,18);ctx.lineTo(-40,18);ctx.moveTo(18,-2);ctx.lineTo(32,18);ctx.lineTo(40,18);ctx.stroke();if(thrust&&state.fuel>0){ctx.fillStyle="#4fe3ff";ctx.beginPath();ctx.moveTo(-9,3);ctx.lineTo(0,28+Math.random()*10);ctx.lineTo(9,3);ctx.fill();}ctx.restore();}
  function drawAstronaut(x,y){ctx.fillStyle="#f2f3f6";ctx.beginPath();ctx.arc(x,y-25,8,0,Math.PI*2);ctx.fill();ctx.fillRect(x-7,y-17,14,22);ctx.strokeStyle="#f2f3f6";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-4,y+4);ctx.lineTo(x-8,y+17);ctx.moveTo(x+4,y+4);ctx.lineTo(x+8,y+17);ctx.stroke();ctx.fillStyle="#4fe3ff";ctx.fillRect(x-5,y-27,10,5);}
  function loop(now){const dt=Math.min(.035,(now-previous)/1000||0);previous=now;if(!paused)update(dt);draw();if(["descent","eva"].includes(state.phase))animation=requestAnimationFrame(loop);}
  const keyMap={ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right",ArrowUp:"thrust",KeyW:"thrust",Space:"thrust"};
  addEventListener("keydown",event=>{const key=keyMap[event.code];if(key){event.preventDefault();controls[key]=true;}});
  addEventListener("keyup",event=>{const key=keyMap[event.code];if(key){event.preventDefault();controls[key]=false;}});
  document.querySelectorAll("[data-control]").forEach(button=>{const key=button.dataset.control;const on=event=>{event.preventDefault();controls[key]=true;button.classList.add("active");};const off=event=>{event.preventDefault();controls[key]=false;button.classList.remove("active");};button.addEventListener("pointerdown",on);button.addEventListener("pointerup",off);button.addEventListener("pointercancel",off);button.addEventListener("pointerleave",off);});
  ui.start.addEventListener("click",()=>{if(["crashed","complete"].includes(state.phase))reset();begin();});
  document.querySelector("#restartMission").addEventListener("click",()=>reset());
  document.querySelector("#pauseMission").addEventListener("click",event=>{if(!["descent","eva"].includes(state.phase))return;paused=!paused;event.currentTarget.textContent=paused?"Resume":"Pause";advise(paused?"Mission paused safely.":"Mission resumed.");if(!paused){previous=performance.now();animation=requestAnimationFrame(loop);}});
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&["descent","eva"].includes(state.phase)){paused=true;document.querySelector("#pauseMission").textContent="Resume";advise("Mission paused because the app moved to the background.");}});
  reset();
})();