import type { CSSProperties } from 'react'

type Season = {
  month: string
  world: string
  headline: string
  game: string
  status: 'LIVE' | 'NEXT' | 'ROADMAP'
  routes: string[]
  beats: string[]
}

const seasons: Season[] = [
  {
    month: 'SEPTEMBER',
    world: 'STREETVERSE',
    headline: 'Living City Season',
    game: 'StreetVerse city missions, racing, creator districts and Reel moments',
    status: 'LIVE',
    routes: ['/streetverse', '/live'],
    beats: ['Week 1 • Tease + hidden city clues', 'Week 2 • Creator sneak peeks', 'Week 3 • Game/world release event', 'Week 4 • Championship + next reveal'],
  },
  {
    month: 'OCTOBER',
    world: 'SPORTVERSE',
    headline: 'SportVerse Kickoff',
    game: 'Track, basketball, football, training challenges and creator sports panels',
    status: 'NEXT',
    routes: ['/live'],
    beats: ['Athlete creator panels', 'Team PK challenges', 'Tournament brackets', 'Sports sponsor + marketplace activations'],
  },
  {
    month: 'NOVEMBER',
    world: 'GAMEVERSE',
    headline: 'Game Night Season',
    game: 'Social poker, pool, bowling, trivia and multiplayer challenges',
    status: 'ROADMAP',
    routes: ['/live'],
    beats: ['Social chips only for poker', 'LIVE spectator panels', 'Creator-hosted tournaments', 'Verified gifts stay separate from game stakes'],
  },
  {
    month: 'DECEMBER',
    world: 'STARVERSE',
    headline: 'StarVerse Showcase',
    game: 'Auditions, music, performances, talent battles and creator showcases',
    status: 'ROADMAP',
    routes: ['/starverse', '/holo-music', '/live'],
    beats: ['Audition week', 'Music/video premieres', 'LIVE panel performances', 'Final showcase + next-world reveal'],
  },
  {
    month: 'JANUARY',
    world: 'SPACEVERSE',
    headline: 'Mission Beyond',
    game: 'Space missions, navigation challenges and crew-based exploration experiences',
    status: 'ROADMAP',
    routes: ['/live'],
    beats: ['Mission briefing teaser', 'Crew sneak peek', 'Exploration release', 'Mission championship + new reveal'],
  },
]

const stageModes = ['TALK', 'YOUTUBE', 'VIDEO / MOVIE', 'MUSIC', 'GAME', 'SHOP', 'GIFT / PK']

export default function WorldSeasonsHub() {
  return <div style={styles.shell}>
    <header style={styles.header}>
      <div>
        <div style={styles.eyebrow}>TRYAMM WORLD SEASONS</div>
        <h1 style={styles.title}>A new reason to return every month.</h1>
        <p style={styles.subtitle}>One featured World + one major game or experience + four weekly release beats + LIVE panels + creator commerce. Roadmap items are clearly separated from production-ready surfaces.</p>
      </div>
      <a href="/" style={styles.back}>← TRYAMM</a>
    </header>

    <section style={styles.hero}>
      <div>
        <div style={styles.badge}>MONTHLY RELEASE ENGINE</div>
        <h2 style={styles.heroTitle}>TEASE → SNEAK PEEK → RELEASE → CHAMPIONSHIP → NEXT WORLD</h2>
        <p style={styles.subtitle}>Bennie can host reveals, creators can preview the next experience, and the LIVE panel can switch between people, YouTube, video, music, games, shopping and verified gift/PK events.</p>
      </div>
      <div style={styles.stageModes}>{stageModes.map(mode => <span key={mode} style={styles.chip}>{mode}</span>)}</div>
    </section>

    <main style={styles.grid}>
      {seasons.map(season => <article key={`${season.month}-${season.world}`} style={styles.card}>
        <div style={styles.cardTop}>
          <div><div style={styles.month}>{season.month}</div><h2 style={styles.world}>{season.world}</h2></div>
          <span style={{...styles.status, ...(season.status === 'LIVE' ? styles.live : season.status === 'NEXT' ? styles.next : styles.roadmap)}}>{season.status}</span>
        </div>
        <h3 style={styles.headline}>{season.headline}</h3>
        <p style={styles.game}>{season.game}</p>
        <div style={styles.beats}>{season.beats.map(beat => <div key={beat} style={styles.beat}>{beat}</div>)}</div>
        <div style={styles.routes}>{season.routes.map(route => <a key={route} href={route} style={styles.route}>{route}</a>)}</div>
      </article>)}
    </main>

    <section style={styles.money}>
      <h2 style={styles.headline}>Season money loop</h2>
      <p style={styles.subtitle}>MONTHLY REVEAL → CREATOR LIVE → VIEWERS → VERIFIED GIFTS / SALES / SPONSORSHIPS → PLATFORM LEDGER → CREATOR / RIGHTSHOLDER SPLITS → PAYABLE BALANCE → OMNI CASH.</p>
      <p style={styles.note}>Game points, social poker chips and visual gift effects never become withdrawable cash by themselves. Third-party music, movies and YouTube content remain subject to their rights and platform rules.</p>
    </section>
  </div>
}

const styles: Record<string, CSSProperties> = {
  shell: { minHeight: '100vh', background: 'radial-gradient(circle at top,#15233c 0,#070b13 42%,#020306 100%)', color: '#fff', padding: '28px 18px 90px', fontFamily: 'system-ui,sans-serif' },
  header: { maxWidth: 1180, margin: '0 auto 18px', display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start' },
  eyebrow: { fontSize: 12, letterSpacing: 2.2, fontWeight: 950, color: '#79e6ff' },
  title: { fontSize: 'clamp(34px,7vw,74px)', lineHeight: .98, margin: '8px 0 14px', maxWidth: 820 },
  subtitle: { color: '#c8d4e8', lineHeight: 1.55, maxWidth: 900 },
  back: { color: '#fff', border: '1px solid #ffffff30', padding: '10px 14px', borderRadius: 999, textDecoration: 'none', whiteSpace: 'nowrap' },
  hero: { maxWidth: 1180, margin: '0 auto 18px', padding: 22, border: '1px solid #62d9ff55', borderRadius: 24, background: '#0b1726cc', display: 'grid', gap: 16 },
  badge: { fontSize: 11, letterSpacing: 2, fontWeight: 950, color: '#ffd66b' },
  heroTitle: { margin: '6px 0', fontSize: 'clamp(23px,4vw,42px)' },
  stageModes: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: { border: '1px solid #ffffff2b', borderRadius: 999, padding: '9px 12px', background: '#101b2c', fontSize: 12, fontWeight: 900 },
  grid: { maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 },
  card: { border: '1px solid #ffffff20', borderRadius: 22, padding: 18, background: '#0a0f19e8' },
  cardTop: { display: 'flex', justifyContent: 'space-between', gap: 12 },
  month: { fontSize: 11, letterSpacing: 1.5, color: '#95a9c5', fontWeight: 900 },
  world: { margin: '3px 0 0', fontSize: 25 },
  status: { borderRadius: 999, padding: '6px 9px', fontSize: 10, fontWeight: 950, height: 'fit-content' },
  live: { background: '#0c4f36', color: '#bfffdc' },
  next: { background: '#493b08', color: '#ffe991' },
  roadmap: { background: '#252a36', color: '#cdd5e3' },
  headline: { margin: '16px 0 7px', fontSize: 19 },
  game: { color: '#d0daea', lineHeight: 1.5 },
  beats: { display: 'grid', gap: 7, marginTop: 14 },
  beat: { padding: '9px 10px', borderRadius: 11, background: '#111b2b', fontSize: 12 },
  routes: { display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 14 },
  route: { color: '#9cecff', fontSize: 11, textDecoration: 'none', borderBottom: '1px solid #9cecff55' },
  money: { maxWidth: 1180, margin: '18px auto 0', padding: 20, borderRadius: 20, background: '#161108', border: '1px solid #ffcf6250' },
  note: { color: '#d8cbaa', fontSize: 12, lineHeight: 1.5 },
}
