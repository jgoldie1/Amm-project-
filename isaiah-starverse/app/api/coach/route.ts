import { NextResponse } from "next/server"

type Profile = {
  name?: string
  talent?: string
  city?: string
  goal?: string
  weakness?: string
  strength?: string
  age?: string
  parentName?: string
}

const JUDGE_VOICES = [
  (p: Profile) => `${p.name}, Coach Titan speaking. In athletics and performance, discipline is the only shortcut. Your next 30 days: train your ${p.talent} skill DAILY. Not when you feel like it — daily. That is how legends are built.`,
  (p: Profile) => `${p.name}, Pastor Grace here. Your gift was placed in you for a purpose greater than fame. Lead with your faith, your character, and your family values. The talent will take you far — but the character will keep you there.`,
  (p: Profile) => `${p.name}, DJ Starmaker on the mic. Stage presence is everything. Whether you are an athlete, a dancer, or a speaker — you are performing every time someone watches you. Own your moment. Be unforgettable.`,
  (p: Profile) => `${p.name}, Queen Vision checking in. I need you to stop doing what everyone else does. Your originality is your superpower. Do not copy the stars you see — become the star only you can be.`,
]

export async function POST(req: Request) {
  const body: Profile = await req.json()

  const name      = body.name?.trim()      || "Star"
  const talent    = body.talent?.trim()    || "your talent"
  const goal      = body.goal?.trim()      || "be discovered and build a legacy"
  const strength  = body.strength?.trim()  || "your natural gift"
  const weakness  = body.weakness?.trim()  || "consistency and follow-through"
  const age       = body.age?.trim()       || ""
  const parentName = body.parentName?.trim()

  const starScore = Math.floor(75 + Math.random() * 20)
  const randomJudge = JUDGE_VOICES[Math.floor(Math.random() * JUDGE_VOICES.length)](body)

  const isYouth = age ? parseInt(age) < 18 : false

  const plan = `
═══════════════════════════════════════
MESSIAH AI MD — STAR DEVELOPMENT PLAN
═══════════════════════════════════════

STAR: ${name}${age ? ` (Age ${age})` : ""}
TALENT: ${talent}
MISSION: ${goal}
AI SCORE: ${starScore}/100

───────────────────────────────────────
YOUR 30-DAY STAR PLAN
───────────────────────────────────────

WEEK 1 — FOUNDATION
• Day 1–7: Document your ${talent} every single day. 
  One video clip per day, even if it's 60 seconds.
• Build on your strength: ${strength}.
• Identify your weak point: ${weakness}. Attack it directly.
• Set up your Starverse profile if you haven't already.

WEEK 2 — DEVELOPMENT  
• Start your performance routine — daily practice minimum 30 minutes.
• Record 3 "performance clips" this week showing your ${talent} clearly.
• Get feedback from someone you trust: coach, parent, or mentor.
• Research 3 stars in your lane who are 2–5 years ahead of you. Study them.

WEEK 3 — VISIBILITY
• Submit your audition to the Isaiah AI Starverse if not done.
• Share your content with family and close community first.
• Ask for honest feedback — not just encouragement.
• Fan votes matter. Let people know you're competing.

WEEK 4 — SHOWCASE READY
• Polish your best performance clip from the month.
• Prepare a 90-second showcase piece for live competition.
• Write your star story (why you do this, what drives you).
• Register for the next Starverse Showcase.

───────────────────────────────────────
JUDGE VOICE OF THE DAY
───────────────────────────────────────
${randomJudge}

───────────────────────────────────────
${isYouth && parentName ? `PARENT PARTNER SECTION — ${parentName.toUpperCase()}
───────────────────────────────────────
${parentName}, your role is critical. Here is how to support ${name}:

1. SHOW UP — attend every practice and performance possible
2. RECORD — capture their best moments on your phone
3. ENCOURAGE — specific praise beats generic praise every time
4. PROTECT — ensure they stay safe, rested, and balanced
5. CELEBRATE EFFORT — not just results

The best stars are made at home before they are made on stage.
You are the first judge, the last coach, and the most important person in this journey.
───────────────────────────────────────
` : ""}
NEXT STEPS
───────────────────────────────────────
1. Save this plan
2. Submit your audition at tryamm.online/audition  
3. Register for the next showcase
4. Vote for other stars in the Starverse — community matters
5. Come back for your Week 2 check-in plan

Isaiah AI Starverse — Anyone Can Be A Star
Faith · Family · Talent · Legacy
═══════════════════════════════════════`

  return NextResponse.json({
    plan,
    score: starScore,
    name,
    talent,
    isYouth,
  })
}
