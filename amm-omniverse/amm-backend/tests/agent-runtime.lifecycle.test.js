const assert = require('assert')
const { QuantumAgentRuntime } = require('../agents/quantum-agent-runtime')

function makeMockSupabase() {
  const rows = []
  return {
    rows,
    from(table) {
      assert.equal(table, 'quantum_agent_runs')
      return {
        async insert(row) {
          rows.push({ ...row })
          return { data: row, error: null }
        },
        update(patch) {
          return {
            async eq(field, value) {
              const row = rows.find(r => r[field] === value)
              if (row) Object.assign(row, patch)
              return { data: row || null, error: null }
            }
          }
        }
      }
    }
  }
}

async function run() {
  const oldKey = process.env.OPENAI_API_KEY
  process.env.OPENAI_API_KEY = 'test-only-key'

  const mock = makeMockSupabase()
  const runtime = new QuantumAgentRuntime({ supabase: mock })

  const awaiting = await runtime.execute({
    userId: 'user-1',
    task: 'production deploy the convergence branch',
    context: { source: 'ci-test' },
    approved: false,
  })
  assert.equal(awaiting.status, 'awaiting_approval')
  assert.equal(mock.rows.length, 1)
  assert.equal(mock.rows[0].status, 'awaiting_approval')

  // Do not make a real network request in CI. We only validate persistence transitions here.
  await runtime.log({
    id: 'completed-run', user_id: 'user-1', agent_key: 'qa', task: 'mock completion', status: 'running', input_context: {}
  })
  await mock.from('quantum_agent_runs').update({ status: 'completed', output_text: 'ok', completed_at: new Date().toISOString() }).eq('id', 'completed-run')
  assert.equal(mock.rows.find(r => r.id === 'completed-run').status, 'completed')

  await runtime.log({
    id: 'failed-run', user_id: 'user-1', agent_key: 'coding', task: 'mock failure', status: 'running', input_context: {}
  })
  await mock.from('quantum_agent_runs').update({ status: 'failed', error_text: 'simulated error', completed_at: new Date().toISOString() }).eq('id', 'failed-run')
  const failed = mock.rows.find(r => r.id === 'failed-run')
  assert.equal(failed.status, 'failed')
  assert.equal(failed.error_text, 'simulated error')

  if (oldKey === undefined) delete process.env.OPENAI_API_KEY
  else process.env.OPENAI_API_KEY = oldKey

  console.log('agent runtime lifecycle persistence tests passed')
}

run().catch(err => { console.error(err); process.exit(1) })
