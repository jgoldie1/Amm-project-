/* Greenville University campus guide: offline-safe, no external AI service or personal data collection. */
(()=>{
'use strict';
const roots=document.querySelectorAll('[data-greenville-guide]');
const campus={
 housing:{title:'Housing and dorms',message:'Explore the Residence Hall, Fraternity House, and Sorority Residence in CampusVerse. These are fictional game locations; real admissions, room assignments and housing applications are not active.',url:'#campus'},
 mansion:{title:'Jacobie Mansion',message:'The Greenville campus estate includes Jacobie Mansion, Suite 01 and an outdoor birthday courtyard. Enter the 3D world and use the birthday checkpoints.',url:'#birthday'},
 sport:{title:'Athletics',message:'The campus scene includes an athletics field, end zones, track and bleachers. Sports are preview features, not an organized university league.',url:'#campus'},
 class:{title:'Academics',message:'Academic Hall and Student Union are represented in the game. Classes, grades, credits and accredited enrollment are not available through this preview.',url:'#campus'},
 birthday:{title:'Birthday missions',message:'Jacobie’s eight-stage mission visits arrival, mansion, fraternity, sorority, school, sports, birthday courtyard and HoloReel. Reach each location before completing its checkpoint. Progress is stored locally in your browser.',url:'#birthday'},
 creator:{title:'Creator studio',message:'Visit the HoloReel stage in the game to access the existing creator flow. Publishing, revenue payouts and live broadcasting require separate production verification.',url:'#play'},
 access:{title:'Accessibility and controls',message:'The game includes one-hand control work and graphics fallbacks. Final Chromebook and mobile acceptance is still pending. Use the large Enter 3D Campus button to launch.',url:'#play'},
 start:{title:'Start playing',message:'Open Greenville in StreetVerse using the Enter 3D Campus button. This preview can contain incomplete character rendering and controls.',url:'/streetverse?core=1&character=jacobie&world=greenville&graphics=character'}
};
const intents=[
[/dorm|housing|resident|frat|soror|room|suite/i,'housing'],
[/mansion|estate|home/i,'mansion'],
[/sport|field|football|basketball|athlet|track|stadium/i,'sport'],
[/school|class|course|degree|academic|enroll|student|union|tuition/i,'class'],
[/birthday|party|mission|quest|checkpoint|celebrat/i,'birthday'],
[/record|video|reel|creator|studio|stream|film/i,'creator'],
[/accessible|accessibility|joystick|keyboard|phone|chromebook|control/i,'access'],
[/play|start|enter|launch|game|world/i,'start']
];
function reply(prompt){const words=prompt.trim();if(!words)return null;const found=intents.find(([rule])=>rule.test(words));return campus[found?found[1]:'start']}
function el(tag,txt,cls){const n=document.createElement(tag);if(txt)n.textContent=txt;if(cls)n.className=cls;return n}
for(const host of roots){
 const input=host.querySelector('input');const form=host.querySelector('form');const output=host.querySelector('[data-guide-answer]');const chips=host.querySelectorAll('[data-guide-topic]');const status=host.querySelector('[data-guide-status]');const link=host.querySelector('[data-guide-link]');
 if(!input||!form||!output||!link)continue;
 const answer=(prompt)=>{
  const result=reply(prompt);
  if(!result){status.textContent='Enter a campus question.';return}
  output.replaceChildren(el('strong',result.title),el('p',result.message));
  link.href=result.url;link.textContent=result.url.startsWith('/')?'Open 3D Campus':'Explore this section';link.hidden=false;
  status.textContent='Campus guide answer ready. This is a guided preview, not a live AI chat.';
 };
 form.addEventListener('submit',event=>{event.preventDefault();answer(input.value)});
 chips.forEach(button=>button.addEventListener('click',()=>{const key=button.getAttribute('data-guide-topic');if(!key||!campus[key])return;input.value=campus[key].title;answer(input.value)}));
}
})();
