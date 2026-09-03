(()=>{
  if(!location.pathname.startsWith('/streetverse'))return
  let mounted=false
  function mount(){
    if(mounted)return
    const city=document.querySelector('[data-streetverse-html-city="true"]')
    const main=city?.querySelector('main')
    if(!main)return
    mounted=true
    const billboard=document.createElement('figure')
    billboard.id='tryamm-streetverse-key-art-billboard'
    billboard.setAttribute('aria-label','StreetVerse Chicago original key art billboard')
    Object.assign(billboard.style,{position:'absolute',right:'3%',top:'12%',width:'clamp(108px,28vw,180px)',margin:'0',zIndex:'11',border:'2px solid rgba(122,233,255,.9)',borderRadius:'10px',overflow:'hidden',background:'#020712',boxShadow:'0 0 0 3px rgba(255,214,90,.18),0 12px 34px rgba(0,0,0,.55)',transform:'perspective(500px) rotateY(-5deg)'})
    const img=document.createElement('img')
    img.src='/streetverse-key-art.svg'
    img.alt='StreetVerse Chicago — original TRYAMM key art'
    img.loading='eager'
    Object.assign(img.style,{display:'block',width:'100%',height:'auto'})
    const caption=document.createElement('figcaption')
    caption.textContent='STREETVERSE • CHICAGO • WORLD SEASON'
    Object.assign(caption.style,{padding:'5px 7px',font:'900 8px/1.2 system-ui,sans-serif',letterSpacing:'.08em',textAlign:'center',color:'#fff',background:'linear-gradient(90deg,#091829,#251027)'})
    billboard.append(img,caption)
    main.appendChild(billboard)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-art-ready',{detail:{asset:'/streetverse-key-art.svg',surface:'html-city-billboard'}}))
  }
  const observer=new MutationObserver(mount)
  observer.observe(document.documentElement,{subtree:true,childList:true})
  mount()
  addEventListener('pagehide',()=>observer.disconnect(),{once:true})
})()
