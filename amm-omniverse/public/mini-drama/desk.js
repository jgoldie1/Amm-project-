import {installRenderDesk} from './render-ui.mjs'
import {productionFiles} from './editor.mjs'
import {templates} from './templates.mjs'
const fields = document.querySelector('#shots')
const title = document.querySelector('#title')
const status = document.querySelector('#status')
const requested=new URLSearchParams(location.search).get('template')
const name=Object.prototype.hasOwnProperty.call(templates,requested)?requested:'drama'
const original=templates[name].shots
title.value=templates[name].title
const key='tryamm.reveal.shotdesk.v1'+(name==='drama'?'':'.'+name)
let order=original.map((_,i)=>i)
const ordered=items=>order.map(i=>items[i])
let shots=original.map(shot=>({...shot}))
try {
  const saved=JSON.parse(localStorage.getItem(key))
  if(saved && typeof saved.title==='string' && Array.isArray(saved.shots) && saved.shots.length===original.length && saved.shots.every(s=>s && ['scene','shot','speaker','line'].every(k=>typeof s[k]==='string'))){
    productionFiles(saved.title,saved.shots)
    shots=saved.shots;title.value=saved.title
    if(Array.isArray(saved.order) && saved.order.length===shots.length &&
       saved.order.every(i=>Number.isInteger(i)&&i>=0&&i<shots.length) &&
       new Set(saved.order).size===shots.length)order=saved.order
  }
} catch {}
const cards=[]
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
  const controls=[[-1,'Move earlier'],[1,'Move later']].map(([delta,label])=>{
    const button=document.createElement('button')
    button.type='button';button.textContent=label
    button.onclick=()=>{
      const from=order.indexOf(index),to=from+delta
      if(to<0||to>=order.length)return
      order.splice(from,1);order.splice(to,0,index)
      arrange();update()
      ;(button.disabled?controls.find(b=>!b.disabled):button)?.focus()
    }
    group.append(button);return button
  })
  cards.push({group,legend,controls})
  fields.append(group)
}
function arrange(){
  order.forEach((id,pos)=>{
    const {group,legend,controls}=cards[id]
    legend.textContent='Shot '+(pos+1)+' · '+shots[id].scene
    controls[0].disabled=pos===0
    controls[1].disabled=pos===order.length-1
    fields.append(group)
  })
}
function update(){try{const out=productionFiles(title.value,ordered(shots));status.textContent=out.seconds+' seconds planned.';localStorage.setItem(key,JSON.stringify({title:title.value,shots,order}))}catch(e){status.textContent=e.message}}
title.oninput=update;update()
for(const button of document.querySelectorAll('[data-format]'))button.onclick=()=>{
  try{const format=button.dataset.format,content=productionFiles(title.value,ordered(shots))[format]
    const url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=(title.value.trim().replace(/[^\w-]+/g,'-')||'episode')+'.'+format;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000)
  }catch(e){status.textContent=e.message}
}

installRenderDesk(shots,title,document.getElementById('render-status'),ordered)
arrange()

