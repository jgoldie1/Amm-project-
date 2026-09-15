import fs from 'node:fs'

const workflow = fs.readFileSync('.github/workflows/ci.yml', 'utf8')

function requirePattern(pattern, message) {
  if (!pattern.test(workflow)) throw new Error(message)
}

requirePattern(/push:\s*\n\s+branches:\s*\[[^\]]*foundation\/aaa-golden-order-world-rollout[^\]]*\]/, 'Foundation branch must keep direct-push CI coverage')
requirePattern(/pull_request:\s*\n\s+branches:\s*\[[^\]]*main[^\]]*\]/, 'PRs targeting main must keep CI coverage')
requirePattern(/production-deploy:[\s\S]*?if:\s*\$\{\{\s*github\.event_name\s*==\s*'push'\s*&&\s*github\.ref\s*==\s*'refs\/heads\/main'\s*\}\}/, 'Production deploy must remain restricted to direct pushes on main')

const productionJob = workflow.match(/\n  production-deploy:[\s\S]*$/)?.[0] ?? ''
if (!productionJob.includes('needs: [release-gate]')) {
  throw new Error('Production deploy must remain gated on the release-gate job')
}

console.log('CI release boundary contract: GREEN')
