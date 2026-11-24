/* Greenville student mission progress: local-only, never an enrollment record. */
(()=>{
'use strict';
const root=document.querySelector('[data-greenville-progress]');
if(!root)return;
const key='tryamm.greenville.birthday.stage.v2';
const labels=['Campus Arrival','Jacobie Mansion and Suite 01','Fraternity House','Sorority Residence','Academic Hall and Student Union','Athletics and Sports','Birthday Courtyard','Birthday HoloReel'];
const count=root.querySelector('[data-progress-count]');
const bar=root.querySelector('progress');
const list=root.querySelector('[data-progress-list]');
const status=root.querySelector('[data-progress-status]');
const resume=root.querySelector('[data-progress-resume]');
const refresh=root.querySelector('[data-progress-refresh]');
if(!count||!bar||!list||!resume||!refresh||!status)return;
const read=()=>{
 let n=0;
 try{n=Number(localStorage.getItem(key)||0)}catch{}
 return Number.isFinite(n)?Math.min(labels.length,Math.max(0,Math.floor(n))):0;
};
const render=()=>{
 const n=read();count.textContent=n+' of '+labels.length+' checkpoints';
 bar.value=n;bar.max=labels.length;
 list.replaceChildren();
 labels.forEach((label,i)=>{
  const li=document.createElement('li');
  li.textContent=(i<n?'✓ ':i===n?'→ ':'○ ')+label;
  if(i===n)li.setAttribute('aria-current','step');
  list.appendChild(li);
 });
 status.textContent=n===labels.length?'Birthday chapter complete in this browser.':n===0?'No birthday checkpoint saved in this browser yet.':'Your next location: '+labels[n]+'.';
 resume.textContent=n===labels.length?'Replay Greenville campus':'Continue birthday mission';
};
render();
refresh.addEventListener('click',render);
window.addEventListener('storage',event=>{if(event.key===key)render()});
window.addEventListener('pageshow',render);
resume.addEventListener('click',()=>{window.location.assign('/streetverse?core=1&character=jacobie&world=greenville&graphics=character&resume=1')});
})();