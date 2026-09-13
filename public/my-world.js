'use strict';

const pipeline=['BOUNDARIES','ROADS + TERRAIN','BUILDING DATA','REFERENCE SLIDES','HOLO ASSET GENERATOR','NEIGHBORHOOD COMPILER','STREAMING + LOD','POPULATION + TRAFFIC','BUSINESSES + PROPERTIES','MISSIONS + SPORTS','DAY + AFTER DARK','ECONOMY + SUPPLY CHAIN','VALIDATION','CERTIFICATION'];
const areas=[
['Rogers Park','north'],['West Ridge','north'],['Uptown','north'],['Lincoln Square','north'],['North Center','north'],['Lake View','north'],['Lincoln Park','north'],['Near North Side','central'],['Edison Park','north'],['Norwood Park','north'],['Jefferson Park','north'],['Forest Glen','north'],['North Park','north'],['Albany Park','north'],['Portage Park','north'],['Irving Park','north'],['Dunning','north'],['Montclare','west'],['Belmont Cragin','west'],['Hermosa','west'],['Avondale','north'],['Logan Square','north'],['Humboldt Park','west'],['West Town','west'],['Austin','west'],['West Garfield Park','west'],['East Garfield Park','west'],['Near West Side','central'],['North Lawndale','west'],['South Lawndale','west'],['Lower West Side','west'],['The Loop','central'],['Near South Side','central'],['Armour Square','south'],['Douglas','south'],['Oakland','south'],['Fuller Park','south'],['Grand Boulevard','south'],['Kenwood','south'],['Washington Park','south'],['Hyde Park','south'],['Woodlawn','south'],['South Shore','south'],['Chatham','south'],['Avalon Park','south'],['South Chicago','south'],['Burnside','south'],['Calumet Heights','south'],['Roseland','south'],['Pullman','south'],['South Deering','south'],['East Side','south'],['West Pullman','south'],['Riverdale','south'],['Hegewisch','south'],['Garfield Ridge','south'],['Archer Heights','south'],['Brighton Park','south'],['McKinley Park','south'],['Bridgeport','south'],['New City','south'],['West Elsdon','south'],['Gage Park','south'],['Clearing','south'],['West Lawn','south'],['Chicago Lawn','south'],['West Englewood','south'],['Englewood','south'],['Greater Grand Crossing','south'],['Ashburn','south'],['Auburn Gresham','south'],['Beverly','south'],['Washington Heights','south'],['Mount Greenwood','south'],['Morgan Park','south'],["O'Hare",'north'],['Edgewater','north']
].map((entry,index)=>({number:index+1,name:entry[0],region:entry[1],status:entry[0]==='The Loop'?'CONSTRUCTING':'DATA READY'}));

const pipelineNode=document.querySelector('#pipeline');
const areasNode=document.querySelector('#areas');
pipelineNode.innerHTML=pipeline.map(step=>`<span>${step}</span>`).join('');

function render(filter='all'){
  const visible=filter==='all'?areas:areas.filter(area=>area.region===filter);
  areasNode.innerHTML=visible.map(area=>`<article class="area"><strong>${area.number}. ${area.name}</strong><small>${area.region.toUpperCase()} · ${area.status}</small></article>`).join('');
}

document.querySelector('.filters').addEventListener('click',event=>{
  const button=event.target.closest('button[data-filter]');
  if(!button)return;
  document.querySelectorAll('.filters button').forEach(item=>item.classList.toggle('active',item===button));
  render(button.dataset.filter);
});

render();
