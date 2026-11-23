import {productionFiles} from './editor.mjs'
import {original} from './story.mjs'
const fields = document.querySelector('#shots')
const title = document.querySelector('#title')
const status = document.querySelector('#status')
const key = 'tryamm.reveal.shotdesk.v1'
let shots=original.map(shot=>({...shot}))
try {
  const saved=JSON.parse(localStorage.getItem(key))
  if(saved && typeof saved.title==='string' && Array.isArray(saved.shots) && saved.shots.length===original.length && saved.shots.every(s=>s && ['scene','shot','speaker','line'].every(k=>typeof s[k]==='string'))){
    productionFiles(saved.title,saved.shots)
    shots=saved.shots;title.value=saved.title
  }
} catch {}
for(const [index,shot] of shots.entries()){
  const group=document.createElement('fieldset')
  const legend=document.createElement('legend');legend.textContent='Shot '+(index+1);group.append(legend)
  for(const [key,label] of Object.entries({seconds:'Duration in seconds',scene:'Scene heading',shot:'Camera and action',speaker:'Speaker',line:'Dialogue or caption'})){
    const l=document.createElement('label');l.textContent=label
    const input=document.createElement(key==='shot'||key==='line'?'textarea':'input')
    if(key==='seconds'){input.type='number';input.min=1;input.max=3600}
    input.value=shot[key];input.oninput=()=>{shot[key]=key==='seconds'?Number(input.value):input.value;update()}
    l.append(input);group.append(l)
  }
  fields.append(group)
}
function update(){try{const out=productionFiles(title.value,shots);status.textContent=out.seconds+' seconds planned.';localStorage.setItem(key,JSON.stringify({title:title.value,shots}))}catch(e){status.textContent=e.message}}
title.oninput=update;update()
for(const button of document.querySelectorAll('[data-format]'))button.onclick=()=>{
  try{const format=button.dataset.format,content=productionFiles(title.value,shots)[format]
    const url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=(title.value.trim().replace(/[^\w-]+/g,'-')||'episode')+'.'+format;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000)
  }catch(e){status.textContent=e.message}
}
