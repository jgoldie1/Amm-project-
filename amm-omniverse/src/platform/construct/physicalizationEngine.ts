import type { ConstructPlan } from './constructEngine'
import type { ConstructDeviceAdapter } from './deviceAdapters'

export type PhysicalizationState = 'IDLE' | 'PREPARING' | 'RUNNING' | 'STOPPED' | 'FAILED'

export type PhysicalizationExecution = {
  id: string
  constructId: string
  state: PhysicalizationState
  adapterExecutionIds: Record<string, string>
  startedAt?: string
  stoppedAt?: string
  failureReason?: string
}

export type PhysicalizationOptions = {
  maxTotalPowerW?: number
  timeoutMs?: number
}

export class PhysicalizationEngine {
  private executions = new Map<string, PhysicalizationExecution>()

  constructor(
    private adapters: Map<string, ConstructDeviceAdapter>,
    private options: PhysicalizationOptions = {},
  ) {}

  async verify(plan: ConstructPlan) {
    const reasons: string[] = []
    if (!plan.safety.allowed) reasons.push(...plan.safety.reasons)

    const maxTotalPowerW = this.options.maxTotalPowerW ?? 1000
    if (plan.resources.totalW > maxTotalPowerW) {
      reasons.push(`Construct requires ${plan.resources.totalW} W, above configured ${maxTotalPowerW} W limit.`)
    }

    const health = await Promise.all(
      plan.adapters.map(async id => {
        const adapter = this.adapters.get(id)
        if (!adapter) return { id, available: false, detail: 'Adapter is not registered.' }
        return adapter.health()
      }),
    )

    for (const status of health) {
      if (!status.available) reasons.push(`${status.id}: ${status.detail ?? 'unavailable'}`)
    }

    return { allowed: reasons.length === 0, reasons, health }
  }

  async execute(plan: ConstructPlan): Promise<PhysicalizationExecution> {
    const verification = await this.verify(plan)
    const execution: PhysicalizationExecution = {
      id: `${plan.id}:${Date.now()}`,
      constructId: plan.id,
      state: 'PREPARING',
      adapterExecutionIds: {},
    }
    this.executions.set(execution.id, execution)

    if (!verification.allowed) {
      execution.state = 'FAILED'
      execution.failureReason = verification.reasons.join(' ')
      return structuredClone(execution)
    }

    try {
      const selected = plan.adapters.map(id => this.adapters.get(id)!).filter(Boolean)
      for (const adapter of selected) await adapter.prepare(plan)

      const timeoutMs = this.options.timeoutMs ?? 15000
      const run = Promise.all(selected.map(adapter => adapter.execute(plan)))
      const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Physicalization execution timed out.')), timeoutMs))
      const results = await Promise.race([run, timeout])

      for (let index = 0; index < results.length; index += 1) {
        const result = results[index]
        const adapter = selected[index]
        if (!result.accepted) throw new Error(result.reason ?? `${adapter.id} rejected execution.`)
        if (result.executionId) execution.adapterExecutionIds[adapter.id] = result.executionId
      }

      execution.state = 'RUNNING'
      execution.startedAt = new Date().toISOString()
      return structuredClone(execution)
    } catch (error) {
      execution.state = 'FAILED'
      execution.failureReason = error instanceof Error ? error.message : String(error)
      await this.stop(execution.id)
      return structuredClone(this.executions.get(execution.id) ?? execution)
    }
  }

  async stop(executionId: string) {
    const execution = this.executions.get(executionId)
    if (!execution) return false

    await Promise.all(
      Object.entries(execution.adapterExecutionIds).map(async ([adapterId, adapterExecutionId]) => {
        const adapter = this.adapters.get(adapterId)
        if (adapter) await adapter.stop(adapterExecutionId)
      }),
    )

    execution.state = 'STOPPED'
    execution.stoppedAt = new Date().toISOString()
    return true
  }

  async emergencyStop() {
    const active = Array.from(this.executions.values()).filter(value => value.state === 'PREPARING' || value.state === 'RUNNING')
    await Promise.all(active.map(value => this.stop(value.id)))
    return active.length
  }

  getExecution(id: string) {
    const value = this.executions.get(id)
    return value ? structuredClone(value) : undefined
  }

  listExecutions() {
    return Array.from(this.executions.values()).map(value => structuredClone(value))
  }
}
