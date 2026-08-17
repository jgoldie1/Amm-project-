'use strict';
(()=>{
  const splash=document.querySelector('#appSplash'),video=document.querySelector('#splashVideo'),start=document.querySelector('#splashStart'),skip=document.querySelector('#splashSkip'),replay=document.querySelector('#splashReplay');
  if(!splash||!video||!start||!skip||!replay)return;
  const FAILSAFE_MS=10000;
  let timer;
  function close(){clearTimeout(timer);video.pause();splash.hidden=true;start.hidden=true;replay.hidden=false;}
  function failsafe(){clearTimeout(timer);timer=setTimeout(close,FAILSAFE_MS);}
  function begin(){splash.hidden=false;replay.hidden=true;start.hidden=true;video.currentTime=0;failsafe();video.play().then(()=>{start.hidden=true;}).catch(()=>{start.hidden=false;});}
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){splash.hidden=true;replay.hidden=false;}else{begin();}
  video.addEventListener('ended',close);
  video.addEventListener('error',()=>{start.hidden=false;});
  start.addEventListener('click',begin);
  skip.addEventListener('click',close);
  replay.addEventListener('click',begin);
})();
