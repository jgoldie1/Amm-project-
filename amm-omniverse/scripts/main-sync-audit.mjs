import { execFileSync } from 'node:child_process'

const run = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
const split = (value) => value ? value.split('\n').filter(Boolean) : []

const releaseCritical = [
  /^\.github\/workflows\//,
  /^package\.json$/,
  /^server\.js$/,
  /^amm-omniverse\/package\.json$/,
  /^amm-omniverse\/src\/App\.tsx$/,
  /^amm-omniverse\/src\/components\/(CityView|GameVerseLauncher|HoloDirectLaunchBridge|LivingWorldsBridge|StreetVerseSafeWorld)\.tsx$/,
  /^amm-omniverse\/src\/runtime\//,
  /^amm-omniverse\/src\/foundation\//,
  /^amm-omniverse\/tests\//,
  /^amm-omniverse\/api\//,
  /^lib\//,
  /^public\/(app-shell|music-hub|business-boost|streetverse-business)/,
]

const docsOrFeature = [
  /^docs\//,
  /^amm-omniverse\/docs\//,
  /^amm-omniverse\/src\/components\/(HoloStyle|LivingStory|MovieStudio|PropertyVerse|FamilyLegacy|Quantum|Poyo|OTT|ProAudio)/,
]

try {
  run('fetch', '--quiet', 'origin', 'main')
} catch {
  console.error('Unable to fetch origin/main. Run this script in a checkout with GitHub network access.')
  process.exit(2)
}

const behind = Number(run('rev-list', '--count', 'HEAD..origin/main'))
const ahead = Number(run('rev-list', '--count', 'origin/main..HEAD'))
const statusLines = split(run('diff', '--name-status', 'HEAD...origin/main'))

const rows = statusLines.map((line) => {
  const [status, ...parts] = line.split('\t')
  const path = parts.at(-1) || ''
  const bucket = releaseCritical.some((re) => re.test(path))
    ? 'release-critical'
    : docsOrFeature.some((re) => re.test(path))
      ? 'defer-feature-docs'
      : 'review'
  return { status, path, bucket }
})

const groups = Object.groupBy(rows, (row) => row.bucket)
const printGroup = (name) => {
  const items = groups[name] || []
  console.log(`\n${name.toUpperCase()} (${items.length})`)
  for (const item of items) console.log(`${item.status}\t${item.path}`)
}

console.log(`main-sync audit: ahead=${ahead} behind=${behind} changed=${rows.length}`)
printGroup('release-critical')
printGroup('review')
printGroup('defer-feature-docs')

if (behind === 0) {
  console.log('\nSYNC STATUS: branch contains current main history.')
  process.exit(0)
}

console.log('\nSYNC STATUS: reconciliation still required. Review release-critical files first; do not use a blanket ours merge merely to make behind=0.')
process.exitCode = 1
