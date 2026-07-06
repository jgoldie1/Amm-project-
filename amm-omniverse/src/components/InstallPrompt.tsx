import { useState, useEffect } from 'react'

// BeforeInstallPromptEvent is not in standard TypeScript types
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if previously dismissed
    if (localStorage.getItem('amm_install_dismissed')) {
      setDismissed(true)
      return
    }

    // iOS detection (Safari on iPhone/iPad)
    const ua = navigator.userAgent
    const ios = /iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream
    setIsIOS(ios)

    if (ios) {
      // On iOS, show manual install instructions after 3 seconds
      setTimeout(() => setShowBanner(true), 3000)
      return
    }

    // Android/Chrome — capture the install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
      setTimeout(() => setShowBanner(true), 2000)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Also show if on Android and prompt wasn't captured (already installed check)
    const appInstalled = () => setIsInstalled(true)
    window.addEventListener('appinstalled', appInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', appInstalled)
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
    setDismissed(true)
    localStorage.setItem('amm_install_dismissed', '1')
  }

  if (isInstalled || dismissed || !showBanner) return null

  // iOS — manual share sheet instructions
  if (isIOS) return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: 'rgba(2,2,18,0.97)',
      border: '1px solid #00ffcc44',
      borderRadius: '16px 16px 0 0',
      padding: '16px 20px 32px',
      fontFamily: 'monospace',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#020212', border: '1px solid #00ffcc44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🌐</div>
          <div>
            <div style={{ color: '#00ffcc', fontWeight: 700, fontSize: 14 }}>AMM Omniverse</div>
            <div style={{ color: '#555', fontSize: 11 }}>Add to Home Screen</div>
          </div>
        </div>
        <button onClick={handleDismiss} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 20, padding: '4px 8px' }}>✕</button>
      </div>

      <div style={{ color: '#888', fontSize: 12, lineHeight: 1.7, marginBottom: 14 }}>
        Install AMM Omniverse on your iPhone for the full app experience — no App Store needed.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(0,255,204,0.06)', borderRadius: 8, border: '1px solid #00ffcc22' }}>
          <div style={{ fontSize: 22, width: 32, textAlign: 'center' }}>1️⃣</div>
          <div style={{ color: '#ccc', fontSize: 12 }}>Tap the <strong style={{ color: '#00ffcc' }}>Share button</strong> <span style={{ fontSize: 16 }}>⎙</span> at the bottom of Safari</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(0,255,204,0.06)', borderRadius: 8, border: '1px solid #00ffcc22' }}>
          <div style={{ fontSize: 22, width: 32, textAlign: 'center' }}>2️⃣</div>
          <div style={{ color: '#ccc', fontSize: 12 }}>Scroll down and tap <strong style={{ color: '#00ffcc' }}>Add to Home Screen</strong></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(0,255,204,0.06)', borderRadius: 8, border: '1px solid #00ffcc22' }}>
          <div style={{ fontSize: 22, width: 32, textAlign: 'center' }}>3️⃣</div>
          <div style={{ color: '#ccc', fontSize: 12 }}>Tap <strong style={{ color: '#00ffcc' }}>Add</strong> — icon appears on your home screen</div>
        </div>
      </div>

      <div style={{ marginTop: 14, color: '#555', fontSize: 10, textAlign: 'center' }}>
        Works offline · No app store · Instant updates
      </div>
    </div>
  )

  // Android/Chrome — native install button
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: 'rgba(2,2,18,0.97)',
      border: '1px solid #00ffcc44',
      borderRadius: '16px 16px 0 0',
      padding: '16px 20px 32px',
      fontFamily: 'monospace',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#020212', border: '1px solid #00ffcc44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🌐</div>
          <div>
            <div style={{ color: '#00ffcc', fontWeight: 700, fontSize: 14 }}>AMM Omniverse</div>
            <div style={{ color: '#555', fontSize: 11 }}>tryamm.online · Faith Creator Metaverse</div>
          </div>
        </div>
        <button onClick={handleDismiss} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 20, padding: '4px 8px' }}>✕</button>
      </div>

      <div style={{ color: '#888', fontSize: 12, lineHeight: 1.6, marginBottom: 14 }}>
        Add AMM Omniverse to your home screen. Works like a real app — offline support, full screen, no browser bar.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
        <button onClick={handleInstall} style={{
          background: 'linear-gradient(135deg, #00ffcc22, #8800ff22)',
          border: '1px solid #00ffcc',
          color: '#00ffcc',
          borderRadius: 8,
          padding: '12px',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontWeight: 700,
          fontSize: 14,
        }}>
          ⬇️ ADD TO HOME SCREEN
        </button>
        <button onClick={handleDismiss} style={{
          background: 'transparent',
          border: '1px solid #333',
          color: '#555',
          borderRadius: 8,
          padding: '12px 16px',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: 12,
        }}>
          Later
        </button>
      </div>

      <div style={{ marginTop: 10, color: '#333', fontSize: 10, textAlign: 'center' }}>
        No App Store needed · Free · Works on any Android phone
      </div>
    </div>
  )
}
