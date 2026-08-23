const assert = require('assert')
const { QuantumAgentRuntime } = require('../agents/quantum-agent-runtime')

function createMockSupabase() {
  const rows = new Map()
  return {
    rows,
    from(table) {
      assert.equal(table, 'quantum_agent_runs')
      return {
        insert(row) {
          rows.set(row.id, { ...row })
          return Promise.resolve({ data: row, error: null })
        },
        update(patch) {
          return {
            eq(column, value) {
              assert.equal(column, 'id')
              const current = rows.get(value) || { id: value }
              rows.set(value, { ...current, ...patch })
              return Promise.resolve({ data: rows.get(value), error: null })
            }
          }
        }
      }
    }
  }
}

async function main() {
  const supabase = createMockSupabase()
  const originalKey = process.env.OPENAI_API_KEY
  delete process.env.OPENAI_API_KEY
  const runtime = new QuantumAgentRuntime({ supabase })

  assert.equal(runtime.isConfigured(), false)

  // Approval-gated tasks must persist an awaiting_approval run without calling OpenAI.
  process.env.OPENAI_API_KEY = 'test-key-not-used'
  const gated = new QuantumAgentRuntime({ supabase })
  gated.callOpenAI = async () => { throw new Error('OpenAI should not be called before approval') }

  const result = await gated.execute({
    userId: 'user-1',
    task: 'production deploy the convergence branch',
    context: { source: 'ci-mock' },
    approved: false,
  })

  assert.equal(result.status, 'awaiting_approval')
  assert.equal(result.approvalRequired, true)
  const persisted = supabase.rows.get(result.runId)
  assert.equal(persisted.status, 'awaiting_approval')
  assert.equal(persisted.user_id, 'user-1')
  assert.equal(persisted.input_context.source, 'ci-mock')

  if (originalKey === undefined) delete process.env.OPENAI_API_KEY
  else process.env.OPENAI_API_KEY = originalKey

  console.log('agent runtime mock persistence tests passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
