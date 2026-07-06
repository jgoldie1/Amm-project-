import { NextResponse } from "next/server"
import { JUDGES } from "../../lib/data"

export async function GET() {
  return NextResponse.json({ judges: JUDGES, count: JUDGES.length })
}

export async function POST(req: Request) {
  const { performerId, judgeId, score, comment } = await req.json()
  if (!performerId || !judgeId || !score) {
    return NextResponse.json({ ok: false, message: "performerId, judgeId, and score required" }, { status: 400 })
  }
  const judge = JUDGES.find(j => j.id === judgeId)
  return NextResponse.json({
    ok: true,
    score,
    judgeId,
    judgeName: judge?.name || "Judge",
    comment: comment || judge?.aiPersonality || "Score recorded.",
    message: `${judge?.name || "Judge"} scored performer ${performerId}: ${score}/100`,
  })
}
