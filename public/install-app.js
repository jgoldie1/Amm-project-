'use strict';
(()=>{
  const card=document.querySelector('#installCard'),install=document.querySelector('#installConfirm'),dismiss=document.querySelector('#installDismiss'),open=document.querySelector('#installOpen'),status=document.querySelector('#installStatus'),instructions=document.querySelector('#installInstructions');
  if(!card||!install||!dismiss||!open||!status||!instructions)return;
  const KEY='tryamm-install-dismissed-at',COOLDOWN=7*24*60*60*1000;
  const standalone=()=>matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
  const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
  let promptEvent=null,splashFinished=document.querySelector('#appSplash')?.hidden===true;
  function recentlyDismissed(){return Date.now()-Number(localStorage.getItem(KEY)||0)<COOLDOWN;}
  function hide(){card.hidden=true;}
  function show(){if(standalone()||recentlyDismissed())return;card.hidden=false;open.classList.add('available');if(isIOS&&!promptEvent){install.hidden=true;instructions.innerHTML='<li>Tap the Share button in Safari.</li><li>Choose <strong>Add to Home Screen</strong>.</li><li>Tap <strong>Add</strong>.</li>';status.textContent='iPhone and iPad installation uses Safari’s Share menu.';}else{install.hidden=false;instructions.innerHTML='<li>Opens from your launcher like an app</li><li>Uses the Judah TRYAMM icon</li><li>No VS Code or large download required</li>';status.textContent='Installation adds TRYAMM to this device.';}}
  function maybeShow(){if(!splashFinished||standalone()||recentlyDismissed())return;if(promptEvent||isIOS)setTimeout(show,600);}
  addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;open.classList.add('available');maybeShow();});
  addEventListener('appinstalled',()=>{promptEvent=null;localStorage.removeItem(KEY);hide();open.classList.remove('available');status.textContent='TRYAMM installed successfully.';});
  addEventListener('tryamm:splash-closed',()=>{splashFinished=true;maybeShow();});
  open.addEventListener('click',show);
  dismiss.addEventListener('click',()=>{localStorage.setItem(KEY,String(Date.now()));hide();});
  install.addEventListener('click',async()=>{if(!promptEvent){status.textContent='Use Chrome’s menu: Cast, save, and share → Install TRYAMM.';return;}install.disabled=true;await promptEvent.prompt();const choice=await promptEvent.userChoice;install.disabled=false;if(choice.outcome==='accepted'){status.textContent='Installing TRYAMM…';hide();}else{status.textContent='Installation canceled. You can install later from Chrome’s menu.';localStorage.setItem(KEY,String(Date.now()));}promptEvent=null;});
  if(standalone()){hide();open.classList.remove('available');}else if(isIOS){open.classList.add('available');maybeShow();}
})();