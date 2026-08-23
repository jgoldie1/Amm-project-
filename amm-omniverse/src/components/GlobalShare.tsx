// AMM Omniverse — Global Social Sharing System
// All regions from the documents: USA, India, China, Japan, Australia, Africa
// All platforms: Clapper, BIGO, ShareChat, Moj, WeChat, LINE, Boomplay, Audiomack + more

import { useState } from 'react'
import { useGameStore } from '../game/state/useGameStore'

// ── REGIONAL PLATFORM DATA ────────────────────────────────────────────────────

export const REGIONAL_PLATFORMS = {
  global_live: {
    label: '🌐 Global Live + Short Video',
    color: '#00ffcc',
    platforms: [
      { id: 'tiktok',     name: 'TikTok',     emoji: '🎵', buildUrl: (u:string,t:string)=>`https://www.tiktok.com/share?url=${u}&text=${t}` },
      { id: 'clapper',    name: 'Clapper',    emoji: '🎬', buildUrl: (u:string)=>u },
      { id: 'bigo_live',  name: 'BIGO Live',  emoji: '📡', buildUrl: (u:string)=>u },
      { id: 'youtube',    name: 'YouTube',    emoji: '▶️', buildUrl: (u:string,t:string)=>`https://www.youtube.com/share?url=${u}&title=${t}` },
      { id: 'instagram',  name: 'Instagram',  emoji: '📸', buildUrl: (u:string)=>u },
      { id: 'snapchat',   name: 'Snapchat',   emoji: '👻', buildUrl: (u:string)=>`https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(u)}` },
      { id: 'facebook',   name: 'Facebook',   emoji: '👍', buildUrl: (u:string)=>`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
      { id: 'x',          name: 'X / Twitter',emoji: '𝕏',  buildUrl: (u:string,t:string)=>`https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
      { id: 'whatsapp',   name: 'WhatsApp',   emoji: '💬', buildUrl: (u:string,t:string)=>`https://wa.me/?text=${encodeURIComponent(t+' '+u)}` },
      { id: 'telegram',   name: 'Telegram',   emoji: '✈️', buildUrl: (u:string,t:string)=>`https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
    ],
  },
  india: {
    label: '🇮🇳 India',
    color: '#ff9933',
    platforms: [
      { id: 'sharechat',  name: 'ShareChat',  emoji: '🗣️', buildUrl: (u:string)=>u },
      { id: 'moj',        name: 'Moj',        emoji: '🎭', buildUrl: (u:string)=>u },
      { id: 'roposo',     name: 'Roposo',     emoji: '📹', buildUrl: (u:string)=>u },
      { id: 'koo',        name: 'Koo',        emoji: '🐦', buildUrl: (u:string)=>u },
      { id: 'instagram',  name: 'Instagram',  emoji: '📸', buildUrl: (u:string)=>u },
      { id: 'youtube',    name: 'YouTube',    emoji: '▶️', buildUrl: (u:string,t:string)=>`https://www.youtube.com/share?url=${u}&title=${t}` },
      { id: 'whatsapp',   name: 'WhatsApp',   emoji: '💬', buildUrl: (u:string,t:string)=>`https://wa.me/?text=${encodeURIComponent(t+' '+u)}` },
      { id: 'telegram',   name: 'Telegram',   emoji: '✈️', buildUrl: (u:string,t:string)=>`https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
    ],
  },
  china: {
    label: '🇨🇳 China',
    color: '#ff0000',
    platforms: [
      { id: 'wechat',         name: 'WeChat',         emoji: '💚', buildUrl: (u:string)=>u },
      { id: 'weibo',          name: 'Weibo',          emoji: '🔴', buildUrl: (u:string,t:string)=>`https://service.weibo.com/share/share.php?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}` },
      { id: 'qq',             name: 'QQ',             emoji: '🐧', buildUrl: (u:string,t:string)=>`https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}` },
      { id: 'douyin',         name: 'Douyin',         emoji: '🎵', buildUrl: (u:string)=>u },
      { id: 'xiaohongshu',    name: 'Xiaohongshu',   emoji: '📕', buildUrl: (u:string)=>u },
      { id: 'bilibili',       name: 'Bilibili',       emoji: '📺', buildUrl: (u:string)=>u },
    ],
  },
  japan: {
    label: '🇯🇵 Japan',
    color: '#bc002d',
    platforms: [
      { id: 'line',       name: 'LINE',       emoji: '💬', buildUrl: (u:string,t:string)=>`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
      { id: 'x',          name: 'X Japan',    emoji: '𝕏',  buildUrl: (u:string,t:string)=>`https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
      { id: 'instagram',  name: 'Instagram',  emoji: '📸', buildUrl: (u:string)=>u },
      { id: 'tiktok',     name: 'TikTok JP',  emoji: '🎵', buildUrl: (u:string)=>u },
      { id: 'youtube',    name: 'YouTube',    emoji: '▶️', buildUrl: (u:string,t:string)=>`https://www.youtube.com/share?url=${u}&title=${t}` },
      { id: 'lemon8',     name: 'Lemon8',     emoji: '🍋', buildUrl: (u:string)=>u },
      { id: 'niconico',   name: 'NicoNico',   emoji: '🎮', buildUrl: (u:string)=>u },
    ],
  },
  australia: {
    label: '🇦🇺 Australia',
    color: '#00843d',
    platforms: [
      { id: 'facebook',   name: 'Facebook',   emoji: '👍', buildUrl: (u:string)=>`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
      { id: 'instagram',  name: 'Instagram',  emoji: '📸', buildUrl: (u:string)=>u },
      { id: 'tiktok',     name: 'TikTok',     emoji: '🎵', buildUrl: (u:string)=>u },
      { id: 'youtube',    name: 'YouTube',    emoji: '▶️', buildUrl: (u:string,t:string)=>`https://www.youtube.com/share?url=${u}&title=${t}` },
      { id: 'reddit',     name: 'Reddit',     emoji: '🔶', buildUrl: (u:string,t:string)=>`https://www.reddit.com/submit?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}` },
      { id: 'snapchat',   name: 'Snapchat',   emoji: '👻', buildUrl: (u:string)=>`https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(u)}` },
      { id: 'linkedin',   name: 'LinkedIn',   emoji: '💼', buildUrl: (u:string)=>`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(u)}` },
      { id: 'whatsapp',   name: 'WhatsApp',   emoji: '💬', buildUrl: (u:string,t:string)=>`https://wa.me/?text=${encodeURIComponent(t+' '+u)}` },
    ],
  },
  west_africa: {
    label: '🌍 West Africa (Nigeria · Ghana · Senegal)',
    color: '#009a44',
    platforms: [
      { id: 'facebook',   name: 'Facebook',   emoji: '👍', buildUrl: (u:string)=>`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
      { id: 'instagram',  name: 'Instagram',  emoji: '📸', buildUrl: (u:string)=>u },
      { id: 'tiktok',     name: 'TikTok',     emoji: '🎵', buildUrl: (u:string)=>u },
      { id: 'youtube',    name: 'YouTube',    emoji: '▶️', buildUrl: (u:string,t:string)=>`https://www.youtube.com/share?url=${u}&title=${t}` },
      { id: 'whatsapp',   name: 'WhatsApp',   emoji: '💬', buildUrl: (u:string,t:string)=>`https://wa.me/?text=${encodeURIComponent(t+' '+u)}` },
      { id: 'telegram',   name: 'Telegram',   emoji: '✈️', buildUrl: (u:string,t:string)=>`https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
      { id: 'audiomack',  name: 'Audiomack',  emoji: '🎧', buildUrl: (u:string)=>u },
      { id: 'boomplay',   name: 'Boomplay',   emoji: '🔊', buildUrl: (u:string)=>u },
      { id: 'x',          name: 'X',          emoji: '𝕏',  buildUrl: (u:string,t:string)=>`https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
    ],
  },
  east_africa: {
    label: '🌍 East Africa (Kenya · Tanzania · Uganda · Ethiopia)',
    color: '#006600',
    platforms: [
      { id: 'facebook',   name: 'Facebook',   emoji: '👍', buildUrl: (u:string)=>`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
      { id: 'instagram',  name: 'Instagram',  emoji: '📸', buildUrl: (u:string)=>u },
      { id: 'tiktok',     name: 'TikTok',     emoji: '🎵', buildUrl: (u:string)=>u },
      { id: 'youtube',    name: 'YouTube',    emoji: '▶️', buildUrl: (u:string,t:string)=>`https://www.youtube.com/share?url=${u}&title=${t}` },
      { id: 'whatsapp',   name: 'WhatsApp',   emoji: '💬', buildUrl: (u:string,t:string)=>`https://wa.me/?text=${encodeURIComponent(t+' '+u)}` },
      { id: 'telegram',   name: 'Telegram',   emoji: '✈️', buildUrl: (u:string,t:string)=>`https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
      { id: 'mdundo',     name: 'Mdundo',     emoji: '🎵', buildUrl: (u:string)=>u },
      { id: 'boomplay',   name: 'Boomplay',   emoji: '🔊', buildUrl: (u:string)=>u },
      { id: 'opera_news', name: 'Opera News', emoji: '📰', buildUrl: (u:string)=>u },
    ],
  },
  south_africa: {
    label: '🇿🇦 South Africa',
    color: '#007a4d',
    platforms: [
      { id: 'facebook',   name: 'Facebook',   emoji: '👍', buildUrl: (u:string)=>`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
      { id: 'instagram',  name: 'Instagram',  emoji: '📸', buildUrl: (u:string)=>u },
      { id: 'tiktok',     name: 'TikTok',     emoji: '🎵', buildUrl: (u:string)=>u },
      { id: 'youtube',    name: 'YouTube',    emoji: '▶️', buildUrl: (u:string,t:string)=>`https://www.youtube.com/share?url=${u}&title=${t}` },
      { id: 'whatsapp',   name: 'WhatsApp',   emoji: '💬', buildUrl: (u:string,t:string)=>`https://wa.me/?text=${encodeURIComponent(t+' '+u)}` },
      { id: 'moya',       name: 'Moya',       emoji: '💙', buildUrl: (u:string)=>u },
      { id: 'ayoba',      name: 'Ayoba',      emoji: '🟡', buildUrl: (u:string)=>u },
      { id: 'snapchat',   name: 'Snapchat',   emoji: '👻', buildUrl: (u:string)=>`https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(u)}` },
    ],
  },
  north_africa: {
    label: '🌍 North Africa (Egypt · Morocco · Algeria · Tunisia)',
    color: '#c1272d',
    platforms: [
      { id: 'facebook',   name: 'Facebook',   emoji: '👍', buildUrl: (u:string)=>`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
      { id: 'instagram',  name: 'Instagram',  emoji: '📸', buildUrl: (u:string)=>u },
      { id: 'tiktok',     name: 'TikTok',     emoji: '🎵', buildUrl: (u:string)=>u },
      { id: 'youtube',    name: 'YouTube',    emoji: '▶️', buildUrl: (u:string,t:string)=>`https://www.youtube.com/share?url=${u}&title=${t}` },
      { id: 'whatsapp',   name: 'WhatsApp',   emoji: '💬', buildUrl: (u:string,t:string)=>`https://wa.me/?text=${encodeURIComponent(t+' '+u)}` },
      { id: 'telegram',   name: 'Telegram',   emoji: '✈️', buildUrl: (u:string,t:string)=>`https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
      { id: 'x',          name: 'X',          emoji: '𝕏',  buildUrl: (u:string,t:string)=>`https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
      { id: 'snapchat',   name: 'Snapchat',   emoji: '👻', buildUrl: (u:string)=>`https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(u)}` },
    ],
  },
} as const

// ── GLOBAL SHARE COMPONENT ────────────────────────────────────────────────────

export function GlobalSharePanel({ url, title, description, onClose }: {
  url: string; title: string; description: string; onClose: () => void
}) {
  const store = useGameStore()
  const [region, setRegion] = useState<keyof typeof REGIONAL_PLATFORMS>('global_live')
  const [copied, setCopied] = useState(false)

  const shareUrl = url || 'https://tryamm.online'
  const shareTitle = title || 'AMM Omniverse — Faith Creator Metaverse'
  const shareDesc  = description || 'Join the All American Marketplace. 11 games, Drama Box, live streaming, music royalties. tryamm.online'

  const copyLink = () => {
    navigator.clipboard?.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    store.setNotif('📋 Link copied!')
  }

  const currentRegion = REGIONAL_PLATFORMS[region]

  const handleShare = (platform: { id: string; name: string; buildUrl: (u:string,t:string)=>string }) => {
    const shareableUrl = platform.buildUrl(encodeURIComponent(shareUrl), encodeURIComponent(shareTitle))
    if (shareableUrl !== shareUrl && shareableUrl !== encodeURIComponent(shareUrl)) {
      window.open(shareableUrl, '_blank', 'width=600,height=400')
    } else {
      // Copy to clipboard for platforms without direct share URLs
      copyLink()
      store.setNotif(`📋 Link copied! Paste into ${platform.name}`)
    }
    store.earnXp(10)
  }

  return (
    <div style={{ width:'100%',height:'100%',background:'#020212',fontFamily:'monospace',color:'#ccc',display:'flex',flexDirection:'column' }}>
      <div style={{ padding:'10px 14px',borderBottom:'1px solid #1a1a3e',background:'#09091d',display:'flex',alignItems:'center',gap:10 }}>
        <button onClick={onClose} style={{ background:'none',border:'1px solid #333',color:'#555',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>← BACK</button>
        <span style={{ color:'#00ffcc',fontWeight:900,fontSize:13 }}>🌍 GLOBAL SHARE</span>
        <span style={{ marginLeft:'auto',color:'#555',fontSize:10 }}>{Object.values(REGIONAL_PLATFORMS).reduce((s,r)=>s+r.platforms.length,0)} platforms · 9 regions</span>
      </div>

      {/* Region selector */}
      <div style={{ padding:'8px 12px',borderBottom:'1px solid #1a1a3e',overflowX:'auto',whiteSpace:'nowrap' }}>
        {(Object.entries(REGIONAL_PLATFORMS) as [keyof typeof REGIONAL_PLATFORMS, typeof REGIONAL_PLATFORMS[keyof typeof REGIONAL_PLATFORMS]][]).map(([key, reg]) => (
          <button key={key} onClick={() => setRegion(key)}
            style={{ display:'inline-block',marginRight:6,background:region===key?`${reg.color}20`:'transparent',border:`1px solid ${region===key?reg.color:'#333'}`,color:region===key?reg.color:'#555',borderRadius:20,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10,whiteSpace:'nowrap' }}>
            {reg.label.split(' ')[0]} {reg.label.split(' ').slice(1,3).join(' ')}
          </button>
        ))}
      </div>

      <div style={{ flex:1,overflowY:'auto',padding:14 }}>
        {/* Share preview */}
        <div style={{ background:`${currentRegion.color}08`,border:`1px solid ${currentRegion.color}33`,borderRadius:10,padding:12,marginBottom:14 }}>
          <div style={{ color:currentRegion.color,fontWeight:700,fontSize:12,marginBottom:4 }}>{currentRegion.label}</div>
          <div style={{ color:'#888',fontSize:11,marginBottom:4,wordBreak:'break-all' }}>{shareUrl}</div>
          <div style={{ color:'#ccc',fontSize:12,marginBottom:8 }}>{shareTitle}</div>
          <div style={{ display:'flex',gap:8 }}>
            <button onClick={copyLink} style={{ flex:1,background:copied?'rgba(0,204,68,.2)':'rgba(0,255,204,.08)',border:`1px solid ${copied?'#00cc44':'#00ffcc44'}`,color:copied?'#00cc44':'#00ffcc',borderRadius:6,padding:'7px',cursor:'pointer',fontFamily:'monospace',fontSize:11,fontWeight:700 }}>
              {copied?'✅ COPIED!':'📋 COPY LINK'}
            </button>
            {navigator.share && (
              <button onClick={()=>navigator.share({url:shareUrl,title:shareTitle,text:shareDesc})} style={{ flex:1,background:'rgba(255,215,0,.08)',border:'1px solid #ffd70044',color:'#ffd700',borderRadius:6,padding:'7px',cursor:'pointer',fontFamily:'monospace',fontSize:11,fontWeight:700 }}>
                📤 NATIVE SHARE
              </button>
            )}
          </div>
        </div>

        {/* Platform buttons */}
        <div style={{ fontSize:11,color:'#555',marginBottom:10,letterSpacing:2 }}>SHARE TO PLATFORM</div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
          {currentRegion.platforms.map((platform: any) => (
            <button key={platform.id} onClick={()=>handleShare(platform)}
              style={{ background:'#09091c',border:'1px solid #222',borderRadius:10,padding:'10px 12px',cursor:'pointer',fontFamily:'monospace',display:'flex',alignItems:'center',gap:8,transition:'all .15s',textAlign:'left' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=currentRegion.color;(e.currentTarget as HTMLButtonElement).style.background=`${currentRegion.color}10`}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor='#222';(e.currentTarget as HTMLButtonElement).style.background='#09091c'}}>
              <span style={{ fontSize:20 }}>{platform.emoji}</span>
              <div>
                <div style={{ color:'#ccc',fontWeight:700,fontSize:11 }}>{platform.name}</div>
                <div style={{ color:'#444',fontSize:9,marginTop:1 }}>Share →</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginTop:16,padding:12,background:'rgba(0,0,0,.4)',borderRadius:10,fontSize:10,color:'#444',lineHeight:1.6,textAlign:'center' }}>
          Some platforms require copy-link + manual paste when direct API sharing is not available.<br/>
          Note: China platforms (WeChat, Douyin, Bilibili, Xiaohongshu) require their mobile apps for sharing.
        </div>
      </div>
    </div>
  )
}
