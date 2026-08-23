import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const ua = navigator.userAgent
    const ios = /iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream
    setIsIOS(ios)

    const openInstall = () => setShowBanner(true)
    window.addEventListener('tryamm:install-open', openInstall)
    ;(window as any).__showInstallTRYAMM = openInstall

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
      if (!localStorage.getItem('tryamm_install_dismissed')) setShowBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    const appInstalled = () => {
      setIsInstalled(true)
      setShowBanner(false)
    }
    window.addEventListener('appinstalled', appInstalled)

    if (ios && !localStorage.getItem('tryamm_install_dismissed')) {
      const timer = window.setTimeout(() => setShowBanner(true), 3000)
      return () => {
        window.clearTimeout(timer)
        window.removeEventListener('tryamm:install-open', openInstall)
        window.removeEventListener('beforeinstallprompt', handler)
        window.removeEventListener('appinstalled', appInstalled)
        if ((window as any).__showInstallTRYAMM === openInstall) delete (window as any).__showInstallTRYAMM
      }
    }

    return () => {
      window.removeEventListener('tryamm:install-open', openInstall)
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', appInstalled)
      if ((window as any).__showInstallTRYAMM === openInstall) delete (window as any).__showInstallTRYAMM
    }
  }, [])

  const handleInstall = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome === 'accepted') {
      setIsInstalled(true)
      setShowBanner(false)
    }
    setInstallEvent(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('tryamm_install_dismissed', '1')
  }

  if (isInstalled || !showBanner) return null

  const shellStyle = {
    position:'fixed' as const,bottom:0,left:0,right:0,zIndex:12000,
    background:'rgba(4,5,14,.98)',border:'1px solid #4FE3FF55',borderRadius:'20px 20px 0 0',
    padding:'18px 20px max(28px,env(safe-area-inset-bottom))',fontFamily:'Inter,ui-sans-serif,system-ui,sans-serif',
    boxShadow:'0 -20px 70px #000b',color:'#fff'
  }

  if (isIOS) return (
    <div role="dialog" aria-label="Install TRYAMM" style={shellStyle}>
      <div style={{display:'flex',justifyContent:'space-between',gap:14,alignItems:'center'}}>
        <div><div style={{color:'#4FE3FF',fontSize:11,fontWeight:950,letterSpacing:2}}>INSTALL TRYAMM</div><div style={{fontSize:18,fontWeight:950,marginTop:3}}>No App Store needed</div></div>
        <button aria-label="Close install instructions" onClick={handleDismiss} style={{background:'#111827',border:'1px solid #334155',color:'#fff',width:36,height:36,borderRadius:'50%',cursor:'pointer'}}>×</button>
      </div>
      <p style={{color:'#aeb9c8',fontSize:13,lineHeight:1.55}}>On iPhone or iPad, install TRYAMM directly from Safari:</p>
      <div style={{display:'grid',gap:9,fontSize:13}}>
        <div style={{padding:12,borderRadius:12,background:'#0b1320'}}>1. Tap <strong style={{color:'#4FE3FF'}}>Share</strong> in Safari.</div>
        <div style={{padding:12,borderRadius:12,background:'#0b1320'}}>2. Choose <strong style={{color:'#4FE3FF'}}>Add to Home Screen</strong>.</div>
        <div style={{padding:12,borderRadius:12,background:'#0b1320'}}>3. Tap <strong style={{color:'#E8B944'}}>Add</strong>. TRYAMM opens like an app.</div>
      </div>
      <div style={{marginTop:12,color:'#718096',fontSize:10}}>Installable web app • Full-screen launch • Updates from tryamm.online</div>
    </div>
  )

  return (
    <div role="dialog" aria-label="Install TRYAMM" style={shellStyle}>
      <div style={{display:'flex',justifyContent:'space-between',gap:14,alignItems:'center'}}>
        <div><div style={{color:'#4FE3FF',fontSize:11,fontWeight:950,letterSpacing:2}}>TRYAMM APP</div><div style={{fontSize:18,fontWeight:950,marginTop:3}}>Install from the website</div></div>
        <button aria-label="Close install instructions" onClick={handleDismiss} style={{background:'#111827',border:'1px solid #334155',color:'#fff',width:36,height:36,borderRadius:'50%',cursor:'pointer'}}>×</button>
      </div>
      <p style={{color:'#aeb9c8',fontSize:13,lineHeight:1.55}}>{installEvent ? 'Add TRYAMM to your phone or desktop and launch it like a normal app.' : 'Use your browser menu and choose “Install app” or “Add to Home screen.”'}</p>
      {installEvent && <button onClick={handleInstall} style={{width:'100%',border:0,borderRadius:13,padding:'14px 16px',background:'linear-gradient(135deg,#4FE3FF,#66A6FF)',color:'#04111a',fontWeight:950,cursor:'pointer'}}>⬇ INSTALL TRYAMM</button>}
      <div style={{marginTop:10,color:'#718096',fontSize:10}}>No separate download file • Uses tryamm.online • Updates automatically</div>
    </div>
  )
}
