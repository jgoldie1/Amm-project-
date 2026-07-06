import { NextResponse } from "next/server"
import { MOVIES, TV_SHOWS, DANCE_PRODUCTIONS } from "../../lib/data"

export async function GET() {
  return NextResponse.json({
    movies: MOVIES,
    shows: TV_SHOWS,
    dance: DANCE_PRODUCTIONS,
    total: { movies: MOVIES.length, shows: TV_SHOWS.length, dance: DANCE_PRODUCTIONS.length }
  })
}
