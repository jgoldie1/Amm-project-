(()=>{
  if(!location.pathname.startsWith('/streetverse'))return
  const STORAGE='tryamm.streetverse.mpc.v1'
  const load=()=>{try{return JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch{return{}}}
  const save=v=>localStorage.setItem(STORAGE,JSON.stringify(v))
  const profile={id:'local-mpc',displayName:'Player',role:'member-player-character',voiceEnabled:false,language:'en-US',...load()}
  save(profile)
  window.__TRYAMM_STREETVERSE_MPC__=profile
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mpc-ready',{detail:{...profile,controlledBy:'human-local-player',npc:false}}))
  window.addEventListener('tryamm:streetverse-mpc-message',e=>{
    const d=e.detail||{}
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-conversation',{detail:{channel:'mpc',from:profile.id,to:d.to||'nearby',text:String(d.text||''),language:d.language||profile.language,humanControlled:true}}))
  })
})()
