// AMM Social Sharing System
// Share game clips, cards, marketplace wins, and live stream moments
// to ALL major platforms directly from inside the app

export type SharePlatform = 'twitter' | 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'linkedin' | 'whatsapp' | 'telegram' | 'discord' | 'clipboard' | 'native'

export interface SharePayload {
  title: string
  text: string
  hashtags: string[]
  url: string
  imageUrl?: string
  videoUrl?: string
  platform?: SharePlatform
}

// AMM-branded share templates for every game/moment type
export const SHARE_TEMPLATES = {
  boxing_win: (opponentName: string, rounds: number, cash: number) => ({
    title: 'AMM Omniverse — Boxing Championship!',
    text: `🥊 Just knocked out ${opponentName} in ${rounds} rounds on AMM Omniverse! Won $${cash.toLocaleString()}! The Omniverse Boxing Arena is LIVE. Come duel me. 👑`,
    hashtags: ['AMMOmniverse', 'OmniverseBoxing', 'CreatorEconomy', 'Faith', 'TryAMM'],
    url: 'https://tryamm.online',
  }),
  basketball_win: (score: string) => ({
    title: 'AMM Omniverse — Holy Hoops!',
    text: `🏀 ${score} FINAL on AMM Omniverse! Rhythm Shooting is a different experience. My MyPlayer is built different. Come challenge me at tryamm.online 🙏`,
    hashtags: ['AMMOmniverse', 'HolyHoops', 'WNBA', 'Basketball', 'TryAMM'],
    url: 'https://tryamm.online',
  }),
  wnba_win: (score: string) => ({
    title: 'AMM W League — W Champion!',
    text: `🏀👑 W League victory on AMM Omniverse! ${score}. The W is built different and so is this platform. Faith + Sports + Creator Economy = AMM. Join at tryamm.online`,
    hashtags: ['AMMOmniverse', 'WLeague', 'WNBA', 'WomenInSports', 'TryAMM'],
    url: 'https://tryamm.online',
  }),
  football_td: () => ({
    title: 'AMM Omniverse — Omniverse Bowl!',
    text: `🏈 TOUCHDOWN on AMM Omniverse! Real play-calling, real strategy, real faith. The Omniverse Bowl is the only game where faith meets football. Come play at tryamm.online`,
    hashtags: ['AMMOmniverse', 'OmniverseBowl', 'Football', 'CreatorLeague', 'TryAMM'],
    url: 'https://tryamm.online',
  }),
  mma_submit: () => ({
    title: 'AMM Omniverse — Submission Win!',
    text: `🥋 SUBMISSION VICTORY in the AMM Omniverse Cage! Real position-based MMA — standing, clinch, ground game. No gatekeepers. Real competition. tryamm.online 🔒`,
    hashtags: ['AMMOmniverse', 'MMA', 'CreatorFight', 'NoGatekeepers', 'TryAMM'],
    url: 'https://tryamm.online',
  }),
  card_duel_win: (deckRealm: string) => ({
    title: 'AMM Omniverse — Duel Realms Victory!',
    text: `🃏 DUEL WIN with a ${deckRealm} deck on AMM Omniverse Card Battle Arena! 100 original cards, 10 Omniverse Realms, Hebrew Feast gift cards. Nothing like it anywhere. tryamm.online`,
    hashtags: ['AMMOmniverse', 'OmniverseDuelRealms', 'CardBattle', 'Faith', 'TryAMM'],
    url: 'https://tryamm.online',
  }),
  creature_caught: (creatureName: string, rarity: string) => ({
    title: 'AMM Omniverse — Creature Captured!',
    text: `🌍 Just caught a ${rarity.toUpperCase()} ${creatureName} in AMM Omniverse Creature Capture! It's like Pokémon GO but faith-centered and built for creators. tryamm.online`,
    hashtags: ['AMMOmniverse', 'CreatureCapture', 'AR', 'Faith', 'TryAMM'],
    url: 'https://tryamm.online',
  }),
  feast_card: (feastName: string, cardName: string) => ({
    title: `AMM Omniverse — ${feastName} Feast Card!`,
    text: `✨ The ${cardName} card just activated in my duel! AMM Omniverse celebrates every Hebrew Appointed Feast with special holographic gift cards. This platform is built different. tryamm.online 🙏`,
    hashtags: ['AMMOmniverse', 'HebrewFeasts', feastName.replace(/\s/g,''), 'Faith', 'TryAMM'],
    url: 'https://tryamm.online',
  }),
  live_stream: (viewerCount: number) => ({
    title: 'AMM Omniverse — Going LIVE!',
    text: `🔴 LIVE NOW on AMM Omniverse with ${viewerCount} viewers! Holographic stage, real gifts, 90% creator cut. This is what streaming should be. Join at tryamm.online 🎤`,
    hashtags: ['AMMOmniverse', 'AMMLive', 'CreatorEconomy', 'Faith', 'TryAMM'],
    url: 'https://tryamm.online',
  }),
  marketplace_sale: (productName: string, amount: number) => ({
    title: 'AMM Omniverse — Marketplace Sale!',
    text: `🛒 Just sold "${productName}" for $${amount} on AMM Omniverse Marketplace! Creators keep 90%. No gatekeepers. tryamm.online — the All American Marketplace.`,
    hashtags: ['AMMOmniverse', 'AllAmericanMarketplace', 'CreatorEconomy', 'BlackOwned', 'TryAMM'],
    url: 'https://tryamm.online',
  }),
  music_upload: (trackName: string) => ({
    title: 'AMM Omniverse — New Track Live!',
    text: `🎵 "${trackName}" is now streaming on AMM Omniverse Set Apart Music Network! Gospel/faith creators earn $0.015-$0.019 per stream — higher than Spotify. Stream at tryamm.online 🙏`,
    hashtags: ['AMMOmniverse', 'SetApartMusic', 'Gospel', 'IndependentArtist', 'TryAMM'],
    url: 'https://tryamm.online',
  }),
  platform_general: () => ({
    title: 'AMM Omniverse — Faith Creator Metaverse',
    text: `🌐 AMM Omniverse is unlike anything else. 3D open world, 9 real games, live streaming, marketplace, music royalties, Hebrew feast cards, NFTs, DAO voting — all faith-centered. No gatekeepers. Try it free at tryamm.online 👑`,
    hashtags: ['AMMOmniverse', 'TryAMM', 'CreatorEconomy', 'Faith', 'Metaverse', 'BlackOwned', 'NoGatekeepers'],
    url: 'https://tryamm.online',
  }),
}

// Build platform-specific share URLs
export function buildShareURL(platform: SharePlatform, payload: SharePayload): string {
  const text = encodeURIComponent(`${payload.text}\n\n${payload.hashtags.map(h => `#${h}`).join(' ')}`)
  const url = encodeURIComponent(payload.url)
  const title = encodeURIComponent(payload.title)

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${text}&url=${url}`
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}&title=${title}`
    case 'whatsapp':
      return `https://wa.me/?text=${text}%20${url}`
    case 'telegram':
      return `https://t.me/share/url?url=${url}&text=${text}`
    case 'tiktok':
      // TikTok doesn't have a web share URL — copy text and open TikTok
      return `https://www.tiktok.com/`
    case 'instagram':
      // Instagram doesn't support web share — copy text and open Instagram
      return `https://www.instagram.com/`
    case 'youtube':
      return `https://www.youtube.com/upload`
    case 'discord':
      return `https://discord.com/`
    default:
      return payload.url
  }
}

// Main share function — uses Web Share API on mobile, opens URLs on desktop
export async function shareToAll(payload: SharePayload, platform?: SharePlatform): Promise<boolean> {
  // Try native Web Share API first (iOS/Android)
  if (!platform && navigator.share) {
    try {
      await navigator.share({
        title: payload.title,
        text: `${payload.text}\n\n${payload.hashtags.map(h => `#${h}`).join(' ')}`,
        url: payload.url,
      })
      return true
    } catch (e) { /* user cancelled or not supported */ }
  }

  // Copy to clipboard
  if (platform === 'clipboard' || !platform) {
    try {
      const fullText = `${payload.title}\n\n${payload.text}\n\n${payload.hashtags.map(h => `#${h}`).join(' ')}\n\n${payload.url}`
      await navigator.clipboard.writeText(fullText)
      return true
    } catch { return false }
  }

  // Open platform URL
  const shareUrl = buildShareURL(platform, payload)
  window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500')
  return true
}

// Social platforms with icons and colors for the share modal
export const SOCIAL_PLATFORMS: Array<{
  id: SharePlatform; name: string; emoji: string; color: string; desc: string
}> = [
  { id:'twitter',   name:'X / Twitter',  emoji:'𝕏',  color:'#000000', desc:'Tweet to your followers' },
  { id:'instagram', name:'Instagram',     emoji:'📸', color:'#e1306c', desc:'Copy & post as caption' },
  { id:'tiktok',    name:'TikTok',        emoji:'🎵', color:'#ff0050', desc:'Copy & post on TikTok' },
  { id:'facebook',  name:'Facebook',      emoji:'📘', color:'#1877f2', desc:'Share to your timeline' },
  { id:'youtube',   name:'YouTube',       emoji:'▶️', color:'#ff0000', desc:'Upload video clip' },
  { id:'whatsapp',  name:'WhatsApp',      emoji:'💬', color:'#25d366', desc:'Send to contacts' },
  { id:'telegram',  name:'Telegram',      emoji:'✈️', color:'#0088cc', desc:'Share to channels' },
  { id:'discord',   name:'Discord',       emoji:'🎮', color:'#5865f2', desc:'Share to server' },
  { id:'linkedin',  name:'LinkedIn',      emoji:'💼', color:'#0077b5', desc:'Share professionally' },
  { id:'clipboard', name:'Copy Link',     emoji:'📋', color:'#00ffcc', desc:'Copy full post text' },
  { id:'native',    name:'Share Sheet',   emoji:'🔗', color:'#888888', desc:'Phone share menu' },
]
