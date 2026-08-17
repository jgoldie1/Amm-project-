'use strict';
(()=>{
  const splash=document.querySelector('#appSplash'),video=document.querySelector('#splashVideo'),start=document.querySelector('#splashStart'),skip=document.querySelector('#splashSkip'),replay=document.querySelector('#splashReplay'),status=document.querySelector('#splashStatus'),progress=document.querySelector('#splashProgress'),progressBar=document.querySelector('.splash-progress');
  if(!splash||!video||!start||!skip||!replay||!status||!progress||!progressBar)return;
  const FAILSAFE_MS=12000,STALL_MS=4000,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,saveData=Boolean(navigator.connection&&navigator.connection.saveData);
  let failsafeTimer,stallTimer,closed=false;
  const setStatus=text=>{status.textContent=text;};
  const setProgress=value=>{const percent=Math.max(0,Math.min(100,Math.round(value)));progress.style.width=percent+'%';progressBar.setAttribute('aria-valuenow',String(percent));};
  function unlockPage(){document.querySelectorAll('body > header, body > main, body > footer').forEach(element=>element.removeAttribute('inert'));}
  function lockPage(){document.querySelectorAll('body > header, body > main, body > footer').forEach(element=>element.setAttribute('inert',''));}
  function clearTimers(){clearTimeout(failsafeTimer);clearTimeout(stallTimer);}
  function close(){if(closed)return;closed=true;clearTimers();video.pause();splash.classList.add('closing');start.hidden=true;unlockPage();replay.hidden=false;window.dispatchEvent(new Event('tryamm:splash-closed'));setTimeout(()=>{splash.hidden=true;splash.classList.remove('closing');},reduced?0:280);}
  function armFailsafe(){clearTimeout(failsafeTimer);failsafeTimer=setTimeout(()=>{setStatus('Intro closed automatically so TRYAMM stays responsive.');close();},FAILSAFE_MS);}
  function armStall(){clearTimeout(stallTimer);stallTimer=setTimeout(()=>{if(video.readyState<3&&!closed){start.hidden=false;start.textContent='Retry Judah intro';setStatus('The intro is taking longer than expected. Retry or skip safely.');start.focus();}},STALL_MS);}
  function updateProgress(){if(Number.isFinite(video.duration)&&video.duration>0)setProgress(video.currentTime/video.duration*100);}
  async function begin({gesture=false}={}){closed=false;clearTimers();splash.hidden=false;splash.classList.remove('closing');replay.hidden=true;start.hidden=true;lockPage();video.currentTime=0;video.muted=false;setProgress(0);setStatus('Preparing the Judah experience…');armFailsafe();armStall();try{await video.play();clearTimeout(stallTimer);setStatus('Judah intro playing'+(video.muted?' without sound.':' with sound.'));}catch(error){start.hidden=false;start.textContent='Enter TRYAMM with sound';setStatus(saveData?'Data Saver is on. Tap to play the intro with sound.':'Tap to begin the Judah intro and jingle.');if(gesture)setStatus('Press the button again or skip safely.');start.focus();}}
  if(reduced){splash.hidden=true;replay.hidden=false;unlockPage();}else if(saveData){lockPage();video.preload='metadata';start.hidden=false;start.textContent='Play Judah intro with sound';setStatus('Data Saver is on. The intro will play only when you choose.');setProgress(100);start.focus();armFailsafe();}else{begin();}
  video.addEventListener('loadedmetadata',()=>{setStatus('Judah intro ready.');setProgress(5);});
  video.addEventListener('canplay',()=>{clearTimeout(stallTimer);setStatus('Judah intro ready to play.');});
  video.addEventListener('timeupdate',updateProgress);
  video.addEventListener('ended',()=>{setProgress(100);setStatus('Welcome to TRYAMM.');close();});
  video.addEventListener('waiting',()=>{setStatus('Loading the Judah experience…');armStall();});
  video.addEventListener('stalled',()=>{setStatus('Connection slowed. Retry or skip safely.');armStall();});
  video.addEventListener('error',()=>{clearTimers();start.hidden=false;start.textContent='Retry Judah intro';setStatus('The video could not load. Retry or enter TRYAMM with Skip.');start.focus();});
  start.addEventListener('click',()=>begin({gesture:true}));
  skip.addEventListener('click',close);
  replay.addEventListener('click',()=>begin({gesture:true}));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!splash.hidden)close();});
})();