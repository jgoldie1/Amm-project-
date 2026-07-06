import { NextResponse } from "next/server"
import { SHOWCASES, JUDGES } from "../../lib/data"

export async function GET() {
  return NextResponse.json({ showcases: SHOWCASES, judges: JUDGES })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, talent, ageGroup, parentName, email } = body
  if (!name || !talent || !email) {
    return NextResponse.json({ ok: false, message: "Name, talent, and email required" }, { status: 400 })
  }
  return NextResponse.json({
    ok: true,
    confirmationId: "SC-" + Date.now().toString().slice(-6),
    message: `${name} registered for the showcase! Confirmation sent to ${email}. ${parentName ? `Parent/Guardian ${parentName} will receive a separate guide.` : ""}`,
    nextStep: "Watch your email for the pre-show guide and stream link.",
  })
}
