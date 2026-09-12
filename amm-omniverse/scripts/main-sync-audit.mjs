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
  /^amm-omniverse\/public\/founder-dashboard\.(css|html|js)$/,
  /^public\/founder-(dashboard|velocity)\.(css|html|js)$/,
  /^test\/benny-velocity-command-center-smoke\.js$/,
  /^amm-omniverse\/src\/components\/(EthiopianBibleMetaverse|FaithChronoLauncher)\.tsx$/,
  /^amm-omniverse\/src\/components\/(HoloStyle|LivingStory|MovieStudio|PropertyVerse|FamilyLegacy|Quantum|Poyo|OTT|ProAudio)/,
]

const bucketFor = (path) => releaseCritical.some((re) => re.test(path))
  ? 'release-critical'
  : docsOrFeature.some((re) => re.test(path))
    ? 'defer-feature-docs'
    : 'review'

try {
  run('fetch', '--quiet', 'origin', 'main')
} catch {
  console.error('Unable to fetch origin/main. Run this script in a checkout with GitHub network access.')
  process.exit(2)
}

const behind = Number(run('rev-list', '--count', 'HEAD..origin/main'))
const ahead = Number(run('rev-list', '--count', 'origin/main..HEAD'))
const mergeBase = run('merge-base', 'HEAD', 'origin/main')
const statusLines = split(run('diff', '--name-status', 'HEAD...origin/main'))

const rows = statusLines.map((line) => {
  const [status, ...parts] = line.split('\t')
  const path = parts.at(-1) || ''
  return { status, path, bucket: bucketFor(path) }
})

const branchPaths = new Set(split(run('diff', '--name-only', `${mergeBase}..HEAD`)))
const mainPaths = new Set(split(run('diff', '--name-only', `${mergeBase}..origin/main`)))
const overlapRows = [...branchPaths]
  .filter((path) => mainPaths.has(path))
  .map((path) => ({ path, bucket: bucketFor(path) }))
  .sort((a, b) => a.bucket.localeCompare(b.bucket) || a.path.localeCompare(b.path))

const groups = Object.groupBy(rows, (row) => row.bucket)
const printGroup = (name) => {
  const items = groups[name] || []
  console.log(`\n${name.toUpperCase()} (${items.length})`)
  for (const item of items) console.log(`${item.status}\t${item.path}`)
}

const overlapGroups = Object.groupBy(overlapRows, (row) => row.bucket)
const printOverlapGroup = (name) => {
  const items = overlapGroups[name] || []
  console.log(`\nOVERLAP ${name.toUpperCase()} (${items.length})`)
  for (const item of items) console.log(`BOTH\t${item.path}`)
}

console.log(`main-sync audit: ahead=${ahead} behind=${behind} changed=${rows.length} merge-base=${mergeBase}`)
printGroup('release-critical')
printGroup('review')
printGroup('defer-feature-docs')

console.log(`\nOVERLAP SUMMARY: files changed on both branch and main since merge-base=${overlapRows.length}`)
printOverlapGroup('release-critical')
printOverlapGroup('review')
printOverlapGroup('defer-feature-docs')

if (behind === 0) {
  console.log('\nSYNC STATUS: branch contains current main history.')
  process.exit(0)
}

if ((overlapGroups['release-critical'] || []).length > 0) {
  console.log('\nSYNC BLOCKER: release-critical paths changed on both sides. Reconcile those paths individually before any broad history synchronization.')
}

console.log('\nSYNC STATUS: reconciliation still required. Review release-critical files first; do not use a blanket ours merge merely to make behind=0.')
process.exitCode = 1
