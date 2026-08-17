"use strict";
const worlds={
 time:{kicker:"TIME MACHINE",title:"Travel through simulated eras",description:"Build historically inspired rooms, explore possible futures and create branching stories where every choice can change the shared world state.",time:true},
 moon:{kicker:"THE MOON",title:"Build in low gravity",description:"Explore lunar terrain, operate rovers, design accessible habitats and host creator missions using a Moon-specific gravity profile."},
 mars:{kicker:"MARS",title:"Create a living Mars settlement",description:"Combine survival gameplay, science education, vehicle missions and community-built habitats in one persistent digital world."},
 saturn:{kicker:"SATURN",title:"Explore the ring system",description:"Pilot simulated orbital expeditions, build stations and create music, film and educational events above Saturn's atmosphere."},
 moons:{kicker:"SATURN'S MOONS",title:"Many moons, one connected journey",description:"Travel between Titan, Enceladus, Rhea, Iapetus and other simulated destinations while keeping the same avatar, inventory and mission history."}
};
const buttons=[...document.querySelectorAll(".world")],kicker=document.querySelector("#worldKicker"),title=document.querySelector("#worldTitle"),description=document.querySelector("#worldDescription"),timeControls=document.querySelector("#timeControls"),era=document.querySelector("#era"),eraOutput=document.querySelector("#eraOutput"),status=document.querySelector("#launchStatus");
let selected="time";
function selectWorld(key){selected=key;const world=worlds[key];buttons.forEach(button=>{const active=button.dataset.world===key;button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active));});kicker.textContent=world.kicker;title.textContent=world.title;description.textContent=world.description;timeControls.hidden=!world.time;status.textContent="Selected "+world.kicker+". Prepare a safe digital simulation when ready.";}
buttons.forEach(button=>button.addEventListener("click",()=>selectWorld(button.dataset.world)));
era.addEventListener("input",()=>{eraOutput.value=era.value;eraOutput.textContent=era.value;});
document.querySelector("#launchPreview").addEventListener("click",()=>{const world=worlds[selected];status.textContent=world.time?"Time Machine simulation prepared for year "+era.value+". Full 3D world engine connection is the next build stage.":world.kicker+" simulation prepared. Full 3D world engine connection is the next build stage.";});
selectWorld(selected);
