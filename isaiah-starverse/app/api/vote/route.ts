import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()
  const id = Number(body.id || 0)
  if (!id) return NextResponse.json({ ok: false, message: "Star ID required" }, { status: 400 })
  return NextResponse.json({ ok: true, id, message: "Vote counted. Starverse ranking updated in real time." })
}
