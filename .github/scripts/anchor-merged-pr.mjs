import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const repository = 'jgoldie1/Amm-project-'
const endpoint = 'https://fxluchtdfpediivhoksl.supabase.co/rest/v1/rpc/anchor_internal_chain_event'

export async function recordMerge(pr, key, send = fetch) {
  if (!pr.merged || pr.base?.ref !== 'main' || pr.base.repo?.full_name !== repository ||
      !Number.isSafeInteger(pr.number) || pr.number < 1 ||
      !/^[0-9a-f]{40}$/.test(pr.merge_commit_sha) ||
      !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(pr.merged_at)) {
    throw Error('Expected a confirmed TRYAMM main-branch merge')
  }
  if (!key) throw Error('Missing server credential for the TRYAMM receipt workflow')
  const evidence = {repository, pullRequest: pr.number, branch: 'main', mergeCommit: pr.merge_commit_sha, mergedAt: pr.merged_at}
  const eventId = 'github:' + repository + ':pull:' + pr.number + ':merged'
  const headers = {apikey: key, 'Content-Type': 'application/json'}
  if (!key.startsWith('sb_secret_')) headers.Authorization = 'Bearer ' + key
  const response = await send(endpoint, {
    method: 'POST', headers, redirect: 'error', signal: AbortSignal.timeout(15000),
    body: JSON.stringify({
      p_event_id: eventId, p_event_type: 'PULL_REQUEST_MERGED',
      p_resource_ref: 'https://github.com/' + repository + '/pull/' + pr.number,
      p_payload_hash: createHash('sha256').update(JSON.stringify(evidence)).digest('hex')
    })
  })
  if (!response.ok) throw Error('Platform anchor returned HTTP ' + response.status)
  const receipt = await response.json()
  if (receipt?.network !== 'tryamm-internal-hash-chain-v1' || receipt.eventId !== eventId ||
      !Number.isSafeInteger(receipt.blockNumber) || receipt.blockNumber < 1 ||
      !/^[0-9a-f]{64}$/.test(receipt.blockHash)) throw Error('Invalid production receipt')
  return receipt
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'))
  let pr = event.pull_request
  if (process.env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
    const number = String(event.inputs?.pr_number ?? '')
    if (!/^[1-9]\d*$/.test(number)) throw Error('Expected a pull request number')
    const reply = await fetch('https://api.github.com/repos/' + repository + '/pulls/' + number, {
      headers: {Authorization: 'Bearer ' + process.env.GITHUB_TOKEN}, redirect: 'error'
    })
    if (!reply.ok) throw Error('Unable to verify merge with GitHub: ' + reply.status)
    pr = await reply.json()
  }
  console.log(JSON.stringify(await recordMerge(pr, process.env.SUPABASE_SERVICE_ROLE_KEY)))
}
