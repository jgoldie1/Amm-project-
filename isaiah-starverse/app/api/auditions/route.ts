import { NextResponse } from "next/server"

type AuditionInput = {
  name?: string
  talent?: string
  city?: string
  state?: string
  videoUrl?: string
  story?: string
  age?: string
  parentName?: string
  parentConsent?: boolean
  ageGroup?: string
}

function scoreAudition(input: AuditionInput): number {
  let score = 55
  if (input.name && input.name.length > 1)     score += 5
  if (input.talent && input.talent.length > 2)  score += 10
  if (input.city && input.city.length > 1)      score += 3
  if (input.videoUrl && input.videoUrl.length > 4) score += 15
  if (input.story && input.story.length > 30)   score += 10
  if (input.story && input.story.length > 100)  score += 5  // bonus for rich story
  if (input.parentName && input.parentName.length > 1) score += 5  // parent involvement
  if (input.parentConsent)                      score += 5
  if (input.age && parseInt(input.age) < 18 && !input.parentConsent) score -= 15 // required
  return Math.min(Math.max(score, 40), 100)
}

const JUDGE_RESPONSES = [
  (score: number, talent: string) => `Isaiah AI MD sees potential here. Your ${talent} story scored ${score}/100. The narrative is compelling — keep building.`,
  (score: number, talent: string) => `Coach Titan evaluated your ${talent} submission: ${score}/100. Discipline and consistency will push this score higher. Come back with a second clip.`,
  (score: number, talent: string) => `Pastor Grace reviewed your story. Your ${talent} resonates with purpose. Score: ${score}/100. Your faith comes through.`,
  (score: number, talent: string) => `DJ Starmaker on your ${talent} submission: ${score}/100. Stage presence is reading through the screen. Keep performing.`,
  (score: number, talent: string) => `Queen Vision scored your ${talent} at ${score}/100. Originality is there. Polish the presentation and resubmit for a featured slot.`,
]

export async function POST(req: Request) {
  const body: AuditionInput = await req.json()
  const score = scoreAudition(body)
  const isYouth = body.age ? parseInt(body.age) < 18 : false

  // Safety check for youth without parent consent
  if (isYouth && !body.parentConsent) {
    return NextResponse.json({
      ok: false,
      score: 0,
      message: "Parent or guardian consent is required for performers under 18. Please have a parent complete and sign the consent section.",
      requiresParentConsent: true,
    })
  }

  const randomJudge = JUDGE_RESPONSES[Math.floor(Math.random() * JUDGE_RESPONSES.length)]
  const judgeComment = randomJudge(score, body.talent || "talent")

  const status = score >= 85 ? "featured" : score >= 70 ? "approved" : "pending"

  return NextResponse.json({
    ok: true,
    score,
    status,
    message: `Audition received for ${body.name || "Star"}. ${judgeComment} Status: ${status.toUpperCase()}. ${status === "featured" ? "🌟 You may be featured in the next Starverse Showcase!" : status === "approved" ? "✅ Approved for Starverse ranking." : "⏳ Under review — check back in 48 hours."}`,
    judgeComment,
    nextStep: status === "featured"
      ? "Register for the next showcase at tryamm.online/showcase"
      : "Add a video link to your next submission for a higher score.",
  })
}

export async function GET() {
  return NextResponse.json({
    auditions: [
      { id: 1, name: "Isaiah Stubbs", talent: "Athlete", status: "featured", score: 98 },
    ],
    total: 1,
  })
}
