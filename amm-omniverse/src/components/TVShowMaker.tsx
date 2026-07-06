// AMM Isaiah AI — TV Show Maker
// How to make your own AI TV shows from scratch
// Complete production system: concept → script → host → run → broadcast

import { useState } from 'react'

// ── SHOW HOSTS ────────────────────────────────────────────────────────
// Built-in AI hosts for showcases and game shows
// Each has a distinct personality, catchphrases, and interaction style

export interface ShowHost {
  id: string
  name: string
  role: 'showcase_host' | 'game_show_host' | 'talk_show_host' | 'announcer' | 'co_host'
  personality: string
  catchphrases: string[]
  openingLines: string[]
  winnerAnnouncements: string[]
  transitionLines: string[]
  adBreakLines: string[]
  emoji: string
  color: string
  style: 'hype' | 'smooth' | 'faith' | 'comedic' | 'professional'
}

export const SHOW_HOSTS: ShowHost[] = [
  {
    id: 'amm_host_prime',
    name: 'A.M. Prime',
    role: 'showcase_host',
    personality: 'High-energy, faith-forward host. Hypes up every performer. Makes every contestant feel like a champion before they even perform.',
    catchphrases: [
      'LET THE STAR RISE! 🌟',
      'THIS IS YOUR MOMENT — OWN IT!',
      'The Starverse is WATCHING! 👁️',
      'Faith over fear, EVERY TIME!',
      'AMMMM OMNIVERSE, let me hear you!',
    ],
    openingLines: [
      'WELCOME to the AMM Omniverse Starverse Showcase — where ANYONE can be a star! I\'m your host, A.M. Prime, and tonight we are about to change some LIVES!',
      'Good evening, Starverse! If you are watching from home, if you are in this room, if you believe in your gift — tonight is FOR YOU. I\'m A.M. Prime and this is the show that discovers greatness!',
      'Every legend started as a nobody. Every star started in the dark. Tonight we turn the lights ON. I\'m A.M. Prime. Welcome to the stage that changes everything.',
    ],
    winnerAnnouncements: [
      'AND YOUR STARVERSE CHAMPION IS — drumroll please — {name}! {talent} from {city}! GIVE IT UP!',
      'The votes are in! The judges have spoken! The Starverse has decided — {name} — you ARE a star!',
      'With a score of {score} out of 100 and {votes} fan votes — the winner is {name}! Take your bow, CHAMPION!',
    ],
    transitionLines: [
      'Beautiful. Absolutely beautiful. Give our performer a hand while we reset the stage!',
      'That right there — THAT is why we do this. Up next, don\'t go anywhere!',
      'Our next performer has been waiting all day for this moment. Let\'s make them feel it!',
    ],
    adBreakLines: [
      'We\'ll be right back — don\'t touch that dial! AMM Omniverse — tryamm.online — check it out!',
      'Short break! While we\'re gone — go vote for your favorite star at tryamm.online! Back in 60!',
    ],
    emoji: '⭐',
    color: '#ffd700',
    style: 'hype',
  },

  {
    id: 'grace_divine',
    name: 'Grace Divine',
    role: 'showcase_host',
    personality: 'Warm, nurturing, faith-centered host. Specializes in youth showcases and parent-child events. Makes children and parents both feel safe and celebrated.',
    catchphrases: [
      'Every child is already a gift from above.',
      'Parents — look at your child right now. THAT is your miracle.',
      'We don\'t judge potential here. We REVEAL it.',
      'Your story matters. Your gift matters. YOU matter.',
    ],
    openingLines: [
      'Welcome, families, to a very special evening. Tonight we celebrate gifts — not just on the stage, but in the seats. Every child here was believed in by a parent, and every parent here is a hero. I\'m Grace Divine, and this is your night.',
      'Good evening. I want every young performer backstage to take a deep breath right now. You are safe. You are loved. You are enough. And tonight, we get to see what you\'ve been working on. I\'m Grace Divine — welcome.',
    ],
    winnerAnnouncements: [
      '{name}, sweetheart — do you hear that? That\'s the whole room cheering for YOU. Congratulations, our Starverse Rising Star!',
      'The votes are in, and our winner tonight — with their parent right by their side — is {name}! Come on up, family!',
    ],
    transitionLines: [
      'Wasn\'t that wonderful? Let\'s give them love, everyone.',
      'Take a moment to appreciate what we just witnessed. A young person, brave enough to show us their gift.',
      'Parents — did you see the look on their face? That\'s what this is all about.',
    ],
    adBreakLines: [
      'While we take a quick break — hug the young person next to you. Back in a moment.',
    ],
    emoji: '✝️',
    color: '#ffd700',
    style: 'faith',
  },

  {
    id: 'king_thunder',
    name: 'King Thunder',
    role: 'game_show_host',
    personality: 'Electrifying game show host. Builds suspense, dramatic pauses, hypes up wrong answers as much as right ones. Comedy and energy in equal measure.',
    catchphrases: [
      'ARE YOU READY FOR THE THUNDER?! ⚡',
      'WRONG! But don\'t worry — we love you anyway!',
      'CORRECT! The crowd goes ABSOLUTELY WILD!',
      'This next question is worth — EVERYTHING!',
      'You came to play. Let\'s PLAY!',
    ],
    openingLines: [
      'GOOD EVENING ladies and gentlemen and welcome to the show where ordinary people do EXTRAORDINARY things! I\'m King Thunder and this is the game that changes lives! Let\'s meet our contestants!',
      'You hear that music? That means it\'s GAME TIME! King Thunder is IN THE BUILDING and we are about to find out who\'s ready to compete for the Starverse crown! HERE WE GO!',
    ],
    winnerAnnouncements: [
      'Drumroll please... AND OUR CHAMPION IS... {name}! With a FINAL SCORE of {score}! THUNDER WINS!',
      'The audience has voted! The judges have scored! And standing above them all — it\'s {name}! KING THUNDER CROWNS A NEW CHAMPION!',
    ],
    transitionLines: [
      'TAKE A BREATH! We need a second because THAT just happened!',
      'Hold on — hold on — I need the crowd to feel this before we move on.',
      'AND WE KEEP MOVING! Next up — this could be the game-changer!',
    ],
    adBreakLines: [
      'Don\'t move! Don\'t change that channel! King Thunder will be BACK with more heat after this!',
    ],
    emoji: '⚡',
    color: '#ffaa00',
    style: 'hype',
  },

  {
    id: 'nova_smooth',
    name: 'Nova Smooth',
    role: 'co_host',
    personality: 'Cool, professional co-host who keeps the show grounded. Provides facts, reads scores, manages time, and smooths over any awkward moments. The professional counterbalance to high-energy hosts.',
    catchphrases: [
      'The numbers don\'t lie.',
      'According to our Isaiah AI scoring system...',
      'And with that, we move to our next segment.',
      'The score is in. Let\'s break it down.',
    ],
    openingLines: [
      'Good evening. I\'m Nova Smooth, your co-host for tonight\'s Starverse Showcase. Let me walk you through tonight\'s format before we begin.',
      'Welcome, everyone. Tonight we have {count} performers, {judges} judges, and one very clear mission: to discover the next Starverse star. I\'m Nova Smooth.',
    ],
    winnerAnnouncements: [
      'According to the final tally: judge scores combined with fan votes, weighted at 60/40 — the winner, with a composite score of {score}, is {name}.',
      'The algorithm is clear. The math is done. {name} — you are tonight\'s Starverse champion.',
    ],
    transitionLines: [
      'Thank you. Up next, performer number {num}.',
      'Excellent. Moving to the next segment.',
      'The judges are ready. Our next performer may take the stage.',
    ],
    adBreakLines: [
      'We\'ll return in approximately ninety seconds.',
    ],
    emoji: '🎙️',
    color: '#00ccff',
    style: 'professional',
  },

  {
    id: 'bishop_hype',
    name: 'Bishop Hype',
    role: 'announcer',
    personality: 'Gospel-inspired hype man announcer. Brings church energy to every introduction. Every performer gets announced like they\'re walking into a sanctuary.',
    catchphrases: [
      'SAY IT WITH ME — ANYBODY CAN BE A STAR! 🙌',
      'If you believe in this performer — make some NOISE!',
      'The gift in this person is REAL and it\'s about to be REVEALED!',
      'Somebody in here needed to see this tonight. THIS IS YOUR SIGN!',
    ],
    openingLines: [
      'GIVE HONOR where honor is due! Welcome to the Starverse Showcase — I\'m Bishop Hype, your announcer and your HYPE MAN for the evening! Now SOMEBODY say AMEN!',
    ],
    winnerAnnouncements: [
      'Church is in SESSION! Our winner tonight — handpicked by the fans and confirmed by the judges — {name} from {city}! Can I get a witness?!',
    ],
    transitionLines: [
      'Give the Lord praise for that performance! Now HOLD ON — because we\'re not done!',
      'That right there was a BLESSING. Now let\'s receive another one!',
    ],
    adBreakLines: [
      'We\'ll be back. While we\'re gone — go bless somebody. Tell them about AMM Omniverse. tryamm.online. Back in a moment!',
    ],
    emoji: '🙌',
    color: '#ffd700',
    style: 'faith',
  },
]

// ── AI TV SHOW FORMATS ────────────────────────────────────────────────

export interface TVShowFormat {
  id: string
  name: string
  description: string
  duration: string
  segments: ShowSegmentTemplate[]
  recommendedHosts: string[]
  recommendedJudges: number
  adBreaks: number
  fanInteraction: boolean
  liveVoting: boolean
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  equipment: string[]
}

export interface ShowSegmentTemplate {
  name: string
  type: 'open' | 'intro' | 'performance' | 'judging' | 'ad_break' | 'voting' | 'results' | 'close' | 'interview' | 'game_round'
  duration: string
  scriptable: boolean
  description: string
}

export const TV_SHOW_FORMATS: TVShowFormat[] = [
  {
    id: 'showcase_30',
    name: 'Starverse Showcase — 30 min',
    description: 'A tight, fast-paced 30-minute talent showcase. 4–6 performers, 3 judges, fan voting. Perfect for weekly online showcases.',
    duration: '30 minutes',
    segments: [
      { name: 'Cold Open',          type: 'open',        duration: '1 min',  scriptable: true,  description: 'Hype montage or host opening statement' },
      { name: 'Host Welcome',       type: 'intro',       duration: '2 min',  scriptable: true,  description: 'Host introduces the show, judges, and format' },
      { name: 'Performer 1',        type: 'performance', duration: '3 min',  scriptable: false, description: 'Live performance' },
      { name: 'Judge Panel 1',      type: 'judging',     duration: '2 min',  scriptable: false, description: 'Judges score and comment' },
      { name: 'Ad Break 1',         type: 'ad_break',    duration: '30 sec', scriptable: true,  description: 'Holographic ad — AMM Pro or Gospel Beats' },
      { name: 'Performer 2',        type: 'performance', duration: '3 min',  scriptable: false, description: 'Live performance' },
      { name: 'Judge Panel 2',      type: 'judging',     duration: '2 min',  scriptable: false, description: 'Judges score and comment' },
      { name: 'Performer 3',        type: 'performance', duration: '3 min',  scriptable: false, description: 'Live performance' },
      { name: 'Judge Panel 3',      type: 'judging',     duration: '2 min',  scriptable: false, description: 'Judges score and comment' },
      { name: 'Fan Voting',         type: 'voting',      duration: '3 min',  scriptable: true,  description: 'Live fan votes — host hypes the voting window' },
      { name: 'Ad Break 2',         type: 'ad_break',    duration: '30 sec', scriptable: true,  description: 'Holographic ad' },
      { name: 'Results Reveal',     type: 'results',     duration: '4 min',  scriptable: true,  description: 'Announce rankings, winner, and prizes' },
      { name: 'Show Close',         type: 'close',       duration: '2 min',  scriptable: true,  description: 'Thank performers, promote next show, platform CTA' },
    ],
    recommendedHosts: ['amm_host_prime', 'grace_divine'],
    recommendedJudges: 3,
    adBreaks: 2,
    fanInteraction: true,
    liveVoting: true,
    difficulty: 'beginner',
    equipment: ['Phone or webcam', 'AMM Omniverse account', 'Stable internet', 'Good lighting'],
  },

  {
    id: 'showcase_60',
    name: 'Starverse Grand Showcase — 60 min',
    description: 'A full hour showcase with 8–12 performers, all 5 judges, parent-child duo category, and a live grand prize reveal.',
    duration: '60 minutes',
    segments: [
      { name: 'Pre-Show Hype',      type: 'open',        duration: '3 min',  scriptable: true,  description: 'Countdown, music, audience warm-up' },
      { name: 'Grand Opening',      type: 'intro',       duration: '3 min',  scriptable: true,  description: 'Full host and judge introductions' },
      { name: 'Youth Round 1–3',    type: 'performance', duration: '12 min', scriptable: false, description: '3 youth performers × 4 min each' },
      { name: 'Youth Judge Panel',  type: 'judging',     duration: '4 min',  scriptable: false, description: 'Judges score all 3 youth performers' },
      { name: 'Ad Break 1',         type: 'ad_break',    duration: '1 min',  scriptable: true,  description: 'Holographic ad + host segment bridge' },
      { name: 'Adult Round 1–3',    type: 'performance', duration: '12 min', scriptable: false, description: '3 adult performers × 4 min each' },
      { name: 'Adult Judge Panel',  type: 'judging',     duration: '4 min',  scriptable: false, description: 'Judges score' },
      { name: 'Parent-Child Duo',   type: 'performance', duration: '5 min',  scriptable: false, description: 'Parent-child paired performance' },
      { name: 'Duo Judge Panel',    type: 'judging',     duration: '3 min',  scriptable: false, description: 'Judges score' },
      { name: 'Fan Voting Window',  type: 'voting',      duration: '5 min',  scriptable: true,  description: 'All categories voting simultaneously' },
      { name: 'Ad Break 2',         type: 'ad_break',    duration: '1 min',  scriptable: true,  description: 'Holographic ads' },
      { name: 'Grand Results',      type: 'results',     duration: '5 min',  scriptable: true,  description: 'Category winners + overall champion' },
      { name: 'Champion Interview', type: 'interview',   duration: '3 min',  scriptable: false, description: 'Host interviews winner live' },
      { name: 'Grand Close',        type: 'close',       duration: '2 min',  scriptable: true,  description: 'Next event promo + platform CTA' },
    ],
    recommendedHosts: ['amm_host_prime', 'bishop_hype'],
    recommendedJudges: 5,
    adBreaks: 2,
    fanInteraction: true,
    liveVoting: true,
    difficulty: 'intermediate',
    equipment: ['Multiple cameras or phones', 'AMM Omniverse Pro', 'Production team 2–3 people', 'Venue with stage'],
  },

  {
    id: 'game_show_30',
    name: 'Star Knowledge Game Show — 30 min',
    description: 'A faith and creator knowledge trivia game show. Contestants answer questions about scripture, music, sports, and the AMM platform. High energy, prizes, and crowd involvement.',
    duration: '30 minutes',
    segments: [
      { name: 'Game Show Open',     type: 'open',        duration: '1 min',  scriptable: true,  description: 'Dramatic music, lightning effects, host intro' },
      { name: 'Contestant Intro',   type: 'intro',       duration: '2 min',  scriptable: true,  description: 'Host introduces all contestants' },
      { name: 'Round 1 — Faith',    type: 'game_round',  duration: '5 min',  scriptable: true,  description: '5 faith/scripture questions, 30 sec each' },
      { name: 'Ad Break',           type: 'ad_break',    duration: '30 sec', scriptable: true,  description: 'Holographic ad' },
      { name: 'Round 2 — Sports',   type: 'game_round',  duration: '5 min',  scriptable: true,  description: '5 AMM sports questions' },
      { name: 'Crowd Lifeline',     type: 'voting',      duration: '2 min',  scriptable: true,  description: 'Audience votes to help contestant' },
      { name: 'Round 3 — Music',    type: 'game_round',  duration: '5 min',  scriptable: true,  description: '5 gospel/music questions' },
      { name: 'Final Round',        type: 'game_round',  duration: '5 min',  scriptable: true,  description: 'Sudden death — hardest questions' },
      { name: 'Winner Reveal',      type: 'results',     duration: '2 min',  scriptable: true,  description: 'Champion crowned, prize announced' },
      { name: 'Close',              type: 'close',       duration: '2 min',  scriptable: true,  description: 'Next episode preview + AMM CTA' },
    ],
    recommendedHosts: ['king_thunder', 'nova_smooth'],
    recommendedJudges: 0,
    adBreaks: 1,
    fanInteraction: true,
    liveVoting: true,
    difficulty: 'beginner',
    equipment: ['Phone or webcam', 'AMM Omniverse account', 'Question bank prepared in advance'],
  },

  {
    id: 'talk_show_30',
    name: 'Messiah AI MD Talk Show — 30 min',
    description: 'A weekly faith and life coaching talk show. The AI host coaches real guests through challenges, dreams, and life decisions live on air.',
    duration: '30 minutes',
    segments: [
      { name: 'Show Open',          type: 'open',        duration: '1 min',  scriptable: true,  description: 'Theme music, host intro' },
      { name: 'Topic Intro',        type: 'intro',       duration: '2 min',  scriptable: true,  description: 'Host introduces today\'s theme and guests' },
      { name: 'Guest 1 Interview',  type: 'interview',   duration: '8 min',  scriptable: false, description: 'Guest shares story, host coaches live' },
      { name: 'Community Question', type: 'voting',      duration: '2 min',  scriptable: true,  description: 'Audience submits questions for the guest' },
      { name: 'Ad Break',           type: 'ad_break',    duration: '30 sec', scriptable: true,  description: 'Holographic ad — faith-friendly only' },
      { name: 'Guest 2 Interview',  type: 'interview',   duration: '8 min',  scriptable: false, description: 'Second guest story + coaching' },
      { name: 'Messiah AI Wisdom',  type: 'intro',       duration: '3 min',  scriptable: true,  description: 'Host delivers closing wisdom and challenge' },
      { name: 'Close + CTA',        type: 'close',       duration: '2 min',  scriptable: true,  description: 'Resources, next episode, platform link' },
    ],
    recommendedHosts: ['grace_divine', 'nova_smooth'],
    recommendedJudges: 0,
    adBreaks: 1,
    fanInteraction: true,
    liveVoting: false,
    difficulty: 'beginner',
    equipment: ['Phone or webcam', 'Quiet background', 'Guest access via Zoom or AMM Live'],
  },
]

// ── AI SHOW SCRIPT GENERATOR ──────────────────────────────────────────
// Takes show config and generates a complete runnable script

export function generateShowScript(config: {
  format: TVShowFormat
  host: ShowHost
  showTitle: string
  performers: { name: string; talent: string; city: string }[]
  prizes: string
  date: string
  venue: string
}): string {
  const { format, host, showTitle, performers, prizes, date, venue } = config
  const opening = host.openingLines[Math.floor(Math.random() * host.openingLines.length)]
  const adBreak = host.adBreakLines[Math.floor(Math.random() * host.adBreakLines.length)]

  const lines: string[] = [
    `═══════════════════════════════════════════════`,
    `SHOW SCRIPT — ${showTitle.toUpperCase()}`,
    `Host: ${host.name} · Format: ${format.name}`,
    `Date: ${date} · Venue: ${venue}`,
    `Prize: ${prizes}`,
    `═══════════════════════════════════════════════`,
    '',
  ]

  format.segments.forEach((seg, i) => {
    lines.push(`───────────────────────────────────────────────`)
    lines.push(`SEGMENT ${i + 1}: ${seg.name.toUpperCase()} [${seg.duration}]`)
    lines.push(`Type: ${seg.type.replace('_', ' ')} · Scriptable: ${seg.scriptable ? 'YES' : 'No — live'}`)
    lines.push('')

    if (seg.type === 'open' || seg.type === 'intro') {
      lines.push(`HOST (${host.name}):`)
      lines.push(opening)
      lines.push('')
      lines.push(`DIRECTOR NOTE: ${seg.description}`)
    } else if (seg.type === 'performance') {
      const performer = performers[Math.floor(Math.random() * performers.length)]
      lines.push(`HOST (${host.name}):`)
      lines.push(`"Next up — putting everything they have on the line tonight — from ${performer?.city || 'our city'} — ${performer?.name || 'our next performer'}! Give it UP!"`)
      lines.push('')
      lines.push(`[PERFORMER TAKES STAGE]`)
      lines.push(`[MUSIC STARTS — ${performer?.talent || 'performance'} begins]`)
      lines.push(`[HOST STEPS BACK — no commentary during performance]`)
    } else if (seg.type === 'judging') {
      lines.push(`HOST: "Let's hear from our judges! Starting with — [JUDGE NAME]!"`)
      lines.push(`[EACH JUDGE HAS 30-45 SECONDS TO COMMENT AND SCORE]`)
      lines.push(`[SCORES APPEAR ON SCREEN VIA ISAIAH AI DASHBOARD]`)
    } else if (seg.type === 'ad_break') {
      lines.push(`HOST (${host.name}):`)
      lines.push(adBreak)
      lines.push(`[HOLOGRAPHIC AD FIRES — ${seg.duration}]`)
      lines.push(`[AD: AMM Omniverse Pro — tryamm.online]`)
    } else if (seg.type === 'voting') {
      lines.push(`HOST: "Fans — NOW is your moment! Go to tryamm.online RIGHT NOW and vote for your favorite performer! You have ${seg.duration} — GO!"`)
      lines.push(`[FAN VOTING OPENS ON AMM OMNIVERSE]`)
      lines.push(`[DISPLAY LIVE VOTE COUNT ON SCREEN]`)
      lines.push(`[HOST KEEPS ENERGY UP — share stats live]`)
    } else if (seg.type === 'results') {
      const winner = performers[0]
      const announcement = host.winnerAnnouncements[0]
        .replace('{name}', winner?.name || 'our winner')
        .replace('{talent}', winner?.talent || 'talent')
        .replace('{city}', winner?.city || 'our city')
        .replace('{score}', '96')
        .replace('{votes}', '247')
      lines.push(`HOST (${host.name}):`)
      lines.push(`"The votes are in. The scores are final. And our Isaiah AI ranking system has made its decision..."`)
      lines.push(`[DRAMATIC PAUSE — 3 SECONDS]`)
      lines.push(announcement)
      lines.push(`[CELEBRATION — confetti, music, crowd reaction]`)
      lines.push(`Prize announcement: ${prizes}`)
    } else if (seg.type === 'close') {
      lines.push(`HOST (${host.name}):`)
      lines.push(`"That's our show, Starverse! Thank you to every performer who put their heart on that stage tonight. You are ALL stars. Our next showcase is coming soon — go to tryamm.online and register. I'm ${host.name} — and I will see you NEXT TIME!"`)
      lines.push(`[OUTRO MUSIC]`)
      lines.push(`[DISPLAY: tryamm.online · SUBSCRIBE TO AMM PRO]`)
    } else if (seg.type === 'game_round') {
      lines.push(`HOST: "Round ${i} begins NOW! Question 1 of 5..."`)
      lines.push(`[READ QUESTION FROM PREPARED QUESTION BANK]`)
      lines.push(`[CONTESTANT HAS 30 SECONDS]`)
      lines.push(`[HOST REACTS BASED ON ANSWER — correct or wrong]`)
      if (host.catchphrases.length > 0) {
        lines.push(`[USE CATCHPHRASE: "${host.catchphrases[0]}"]`)
      }
    }

    lines.push('')
  })

  lines.push(`═══════════════════════════════════════════════`)
  lines.push(`END OF SCRIPT — ${showTitle}`)
  lines.push(`Host: ${host.name} · Format: ${format.name}`)
  lines.push(`ISAIAH AI STARVERSE · ANYONE CAN BE A STAR`)
  lines.push(`═══════════════════════════════════════════════`)

  return lines.join('\n')
}

// ── TV SHOW MAKER COMPONENT ───────────────────────────────────────────

export default function TVShowMaker() {
  const [step, setStep] = useState(1)
  const [showTitle, setShowTitle] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<TVShowFormat | null>(null)
  const [selectedHost, setSelectedHost] = useState<ShowHost | null>(null)
  const [selectedCoHost, setSelectedCoHost] = useState<ShowHost | null>(null)
  const [performers, setPerformers] = useState([{ name: '', talent: '', city: '' }])
  const [prizes, setPrizes] = useState('')
  const [date, setDate] = useState('')
  const [venue, setVenue] = useState('')
  const [script, setScript] = useState('')
  const [activeTab, setActiveTab] = useState<'formats'|'hosts'|'script'|'howto'>('howto')

  const generateScript = () => {
    if (!selectedFormat || !selectedHost) return
    const s = generateShowScript({
      format: selectedFormat,
      host: selectedHost,
      showTitle: showTitle || 'Isaiah AI Starverse Show',
      performers: performers.filter(p => p.name),
      prizes: prizes || '$500 grand prize',
      date: date || 'TBD',
      venue: venue || 'AMM Omniverse Live',
    })
    setScript(s)
    setStep(4)
    setActiveTab('script')
  }

  return (
    <div style={{ fontFamily: 'monospace', color: '#ccc', background: '#020212', minHeight: '100vh', padding: 20 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ color: '#ffd700', fontSize: 24, fontWeight: 900 }}>📺 ISAIAH AI TV SHOW MAKER</div>
          <p style={{ color: '#888', fontSize: 13, marginTop: 6 }}>Build · Script · Host · Broadcast — your own original AI TV show</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { id: 'howto',   label: '📖 How To Make Shows' },
            { id: 'formats', label: '📋 Show Formats' },
            { id: 'hosts',   label: '🎙️ Hosts' },
            { id: 'script',  label: '📄 Script Generator' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${activeTab === tab.id ? '#ffd700' : '#333'}`, background: activeTab === tab.id ? 'rgba(255,215,0,0.12)' : 'transparent', color: activeTab === tab.id ? '#ffd700' : '#888', cursor: 'pointer', fontSize: 12, fontFamily: 'monospace' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* HOW TO MAKE SHOWS */}
        {activeTab === 'howto' && (
          <div>
            <div style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <div style={{ color: '#ffd700', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>How to Make Your Own AI TV Show on AMM Omniverse</div>
              <p style={{ fontSize: 13, lineHeight: 1.8, color: '#aaa' }}>
                You do not need a studio. You do not need expensive equipment. You do not need a crew.
                You need AMM Omniverse Pro, a phone with a decent camera, and a story worth telling.
              </p>
            </div>
            {[
              { step: '1', title: 'Choose Your Show Format', desc: 'Pick from Showcase (30 or 60 min), Game Show (30 min), Talk Show (30 min), or build your own segment list. Each format has a pre-built run of show. See the "Show Formats" tab.', emoji: '📋', cost: '$0' },
              { step: '2', title: 'Pick Your Host', desc: 'Choose from 5 built-in AI host personalities — A.M. Prime (hype showcase), Grace Divine (family/youth), King Thunder (game show), Nova Smooth (co-host), or Bishop Hype (announcer). Each has unique scripts, catchphrases, and opening lines. See "Hosts" tab.', emoji: '🎙️', cost: '$0' },
              { step: '3', title: 'Generate Your Script', desc: 'Enter your show title, performers, prizes, date, and venue. The AI Script Generator builds a complete word-for-word script for every segment — what the host says, when ads fire, when voting opens, how the results are announced. See "Script Generator" tab.', emoji: '📄', cost: '$0' },
              { step: '4', title: 'Set Up AMM Omniverse Live', desc: 'Deploy the Isaiah AI Live Studio (available in the Studio tab at isaiah-starverse). Load your run of show, seat your judges, and connect your streaming link to tryamm.online. The production dashboard fires holographic ads automatically.', emoji: '🖥️', cost: 'AMM Pro — $19.99/month' },
              { step: '5', title: 'Go Live', desc: 'Open the stream on AMM Omniverse. Viewers join at tryamm.online/live. Fan voting activates in real time. Judge scores display on screen. Holographic ads fire during breaks. The Starverse ranking updates live.', emoji: '🔴', cost: '$0 (included in AMM Pro)' },
              { step: '6', title: 'Add Product Placements', desc: 'Contact Black-owned brands through the AMM Marketplace to place holographic ads in your show. Rate: $200–$500 per episode. Faith-friendly only. Your 10% plus their ad fee = recurring income per show.', emoji: '📦', cost: 'You earn — $200–$500/placement' },
              { step: '7', title: 'Upload to Isaiah AI TV', desc: 'After your live show, upload the recording to Isaiah AI TV on AMM Omniverse. It becomes VOD content — viewers can watch it anytime. You earn streaming royalties per qualified view.', emoji: '📺', cost: '$0 — royalties paid to you' },
            ].map(s => (
              <div key={s.step} style={{ background: 'rgba(5,5,30,0.6)', border: '1px solid #1a1a3e', borderRadius: 10, padding: 16, marginBottom: 12, display: 'flex', gap: 14 }}>
                <div style={{ fontSize: 28, width: 40, textAlign: 'center', flexShrink: 0 }}>{s.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#ffd700', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Step {s.step}: {s.title}</div>
                  <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
                <div style={{ color: '#00cc44', fontSize: 11, textAlign: 'right', flexShrink: 0 }}>{s.cost}</div>
              </div>
            ))}
          </div>
        )}

        {/* FORMATS */}
        {activeTab === 'formats' && (
          <div>
            {TV_SHOW_FORMATS.map(f => (
              <div key={f.id} onClick={() => { setSelectedFormat(f); setActiveTab('hosts') }}
                style={{ background: selectedFormat?.id === f.id ? 'rgba(255,215,0,0.08)' : 'rgba(5,5,30,0.6)', border: `1px solid ${selectedFormat?.id === f.id ? '#ffd700' : '#1a1a3e'}`, borderRadius: 12, padding: 18, marginBottom: 14, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ color: '#ffd700', fontWeight: 700, fontSize: 15 }}>{f.name}</div>
                    <div style={{ color: '#555', fontSize: 12, marginTop: 2 }}>{f.duration} · {f.segments.length} segments · {f.recommendedJudges} judges · {f.adBreaks} ad breaks · {f.difficulty}</div>
                  </div>
                  {selectedFormat?.id === f.id && <span style={{ color: '#ffd700', fontSize: 13 }}>✓ SELECTED</span>}
                </div>
                <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px' }}>{f.description}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {f.fanInteraction && <span style={{ background: 'rgba(0,204,68,0.1)', border: '1px solid #00cc4433', color: '#00cc44', borderRadius: 20, padding: '2px 10px', fontSize: 11 }}>👥 Fan Interaction</span>}
                  {f.liveVoting && <span style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid #ffd70033', color: '#ffd700', borderRadius: 20, padding: '2px 10px', fontSize: 11 }}>🗳️ Live Voting</span>}
                  <span style={{ background: 'rgba(255,170,0,0.1)', border: '1px solid #ffaa0033', color: '#ffaa00', borderRadius: 20, padding: '2px 10px', fontSize: 11 }}>✨ Holo Ads: {f.adBreaks}x</span>
                </div>
                <div style={{ fontSize: 12, color: '#555' }}>
                  Equipment: {f.equipment.join(' · ')}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* HOSTS */}
        {activeTab === 'hosts' && (
          <div>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>Select your main host and optionally a co-host. Each has a distinct script and personality.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {SHOW_HOSTS.map(host => (
                <div key={host.id} onClick={() => setSelectedHost(host)}
                  style={{ background: selectedHost?.id === host.id ? `${host.color}15` : 'rgba(5,5,30,0.6)', border: `1px solid ${selectedHost?.id === host.id ? host.color : '#1a1a3e'}`, borderRadius: 12, padding: 16, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 32 }}>{host.emoji}</span>
                    <div>
                      <div style={{ color: host.color, fontWeight: 700 }}>{host.name}</div>
                      <div style={{ color: '#555', fontSize: 11 }}>{host.role.replace('_', ' ')} · {host.style}</div>
                    </div>
                    {selectedHost?.id === host.id && <span style={{ marginLeft: 'auto', color: host.color, fontSize: 12 }}>✓</span>}
                  </div>
                  <p style={{ fontSize: 12, color: '#888', lineHeight: 1.5, margin: '0 0 10px' }}>{host.personality}</p>
                  <div style={{ fontSize: 11, color: host.color, fontStyle: 'italic' }}>
                    "{host.catchphrases[0]}"
                  </div>
                </div>
              ))}
            </div>
            {selectedFormat && selectedHost && (
              <button onClick={() => setActiveTab('script')} style={{ width: '100%', marginTop: 20, background: 'rgba(255,215,0,0.12)', border: '1px solid #ffd700', color: '#ffd700', borderRadius: 10, padding: 14, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>
                ▶ Build Show Script →
              </button>
            )}
          </div>
        )}

        {/* SCRIPT GENERATOR */}
        {activeTab === 'script' && (
          <div>
            {!script ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#555', display: 'block', marginBottom: 4 }}>Show Title</label>
                    <input value={showTitle} onChange={e => setShowTitle(e.target.value)} placeholder="Anyone Can Be A Star Vol. 1" style={{ width: '100%', background: '#09091c', border: '1px solid #333', color: '#ccc', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#555', display: 'block', marginBottom: 4 }}>Prize</label>
                    <input value={prizes} onChange={e => setPrizes(e.target.value)} placeholder="$500 + AMM Creator tier" style={{ width: '100%', background: '#09091c', border: '1px solid #333', color: '#ccc', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#555', display: 'block', marginBottom: 4 }}>Date</label>
                    <input value={date} onChange={e => setDate(e.target.value)} type="date" style={{ width: '100%', background: '#09091c', border: '1px solid #333', color: '#ccc', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#555', display: 'block', marginBottom: 4 }}>Venue</label>
                    <input value={venue} onChange={e => setVenue(e.target.value)} placeholder="AMM Omniverse Live + Herrin Community Center" style={{ width: '100%', background: '#09091c', border: '1px solid #333', color: '#ccc', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 13 }} />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, color: '#555', display: 'block', marginBottom: 8 }}>Performers</label>
                  {performers.map((p, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                      <input value={p.name} onChange={e => { const n = [...performers]; n[i] = { ...n[i], name: e.target.value }; setPerformers(n) }} placeholder="Name" style={{ background: '#09091c', border: '1px solid #333', color: '#ccc', borderRadius: 8, padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }} />
                      <input value={p.talent} onChange={e => { const n = [...performers]; n[i] = { ...n[i], talent: e.target.value }; setPerformers(n) }} placeholder="Talent" style={{ background: '#09091c', border: '1px solid #333', color: '#ccc', borderRadius: 8, padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }} />
                      <input value={p.city} onChange={e => { const n = [...performers]; n[i] = { ...n[i], city: e.target.value }; setPerformers(n) }} placeholder="City" style={{ background: '#09091c', border: '1px solid #333', color: '#ccc', borderRadius: 8, padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }} />
                      <button onClick={() => setPerformers(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: '1px solid #333', color: '#555', borderRadius: 8, padding: '8px', cursor: 'pointer', fontFamily: 'monospace' }}>✕</button>
                    </div>
                  ))}
                  <button onClick={() => setPerformers(p => [...p, { name: '', talent: '', city: '' }])} style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid #ffd70033', color: '#ffd700', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 12 }}>
                    + Add Performer
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 10, padding: 14, background: 'rgba(5,5,30,0.6)', border: '1px solid #1a1a3e', borderRadius: 10, marginBottom: 16 }}>
                  <div style={{ fontSize: 16 }}>
                    {selectedFormat ? `✅ ${selectedFormat.name}` : '❌ No format selected'}
                  </div>
                  <div style={{ marginLeft: 20 }}>
                    {selectedHost ? `✅ Host: ${selectedHost.name}` : '❌ No host selected'}
                  </div>
                </div>

                <button onClick={generateScript} disabled={!selectedFormat || !selectedHost}
                  style={{ width: '100%', background: selectedFormat && selectedHost ? 'rgba(255,215,0,0.15)' : 'rgba(50,50,50,0.3)', border: `1px solid ${selectedFormat && selectedHost ? '#ffd700' : '#333'}`, color: selectedFormat && selectedHost ? '#ffd700' : '#555', borderRadius: 10, padding: 16, cursor: selectedFormat && selectedHost ? 'pointer' : 'not-allowed', fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>
                  📄 GENERATE COMPLETE SHOW SCRIPT
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <button onClick={() => setScript('')} style={{ background: 'none', border: '1px solid #333', color: '#888', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 12 }}>← Regenerate</button>
                  <button onClick={() => navigator.clipboard?.writeText(script)} style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid #ffd70044', color: '#ffd700', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 12 }}>📋 Copy Script</button>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12, color: '#aaa', lineHeight: 1.7, background: 'rgba(5,5,30,0.6)', border: '1px solid #1a1a3e', borderRadius: 12, padding: 20, maxHeight: 600, overflow: 'auto' }}>
                  {script}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
