export function pkEndPresentation(detail: { reason?: unknown; left?: unknown; right?: unknown }) {
  if (detail.reason === 'leave') {
    return { title: 'PK SESSION ENDED', detail: 'You left the arena. No match result was recorded.' }
  }
  const scores = [detail.left, detail.right]
  if (!scores.every(score => typeof score === 'number' && Number.isFinite(score) && score >= 0)) {
    return { title: 'PK SESSION ENDED', detail: 'Match result is not available yet.' }
  }
  return { title: 'PK RESULT', detail: `TEAM A ${detail.left} • ${detail.right} TEAM B` }
}
