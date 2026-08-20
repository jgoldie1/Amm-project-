import { getSupabaseClient } from '../services/supabaseClient'
import {
  appendDeliveryEvent,
  approveRequest,
  createSandboxOrder,
  loadTryammDashboard,
  recordAuditEvent,
  recordSandboxPayment,
  requestApproval,
  saveBusiness,
  stopOrderJourneySubscription,
  subscribeToOrderJourney,
  type TryammDashboard,
} from '../runtime/tryammPersistence'

export type JourneyPassport = {
  displayName?: string
  accessibility?: Record<string, unknown>
  learning?: Record<string, unknown>
  goals?: string[]
  updatedAt?: string
}

export type JourneyBusiness = {
  id: string
  name: string
  status: 'draft' | 'active' | 'suspended' | 'closed'
  profile: Record<string, unknown>
}

export type JourneyOrder = {
  id: string
  kind: 'marketplace' | 'food' | 'package' | 'service'
  status: string
  totalMinor: number
  currency: string
  payload: Record<string, unknown>
}

async function requireAuth() {
  const sb = getSupabaseClient()
  if (!sb) throw new Error('Supabase is not configured.')
  const { data, error } = await sb.auth.getUser()
  if (error || !data.user) throw new Error('A real authenticated account is required for this journey.')
  return { sb, user: data.user }
}

export async function savePassport(passport: JourneyPassport) {
  const { sb, user } = await requireAuth()
  const data = { ...passport, updatedAt: new Date().toISOString() }
  const { error } = await sb.from('tryamm_passports').upsert({ user_id: user.id, data, updated_at: new Date().toISOString() })
  if (error) throw error
  await writeAudit('passport.save', 'passport', user.id, 'success')
  return data
}

export async function loadPassport(): Promise<JourneyPassport | null> {
  const { sb, user } = await requireAuth()
  const { data, error } = await sb.from('tryamm_passports').select('data').eq('user_id', user.id).maybeSingle()
  if (error) throw error
  return (data?.data as JourneyPassport | undefined) ?? null
}

export async function createBusiness(name: string, profile: Record<string, unknown> = {}): Promise<JourneyBusiness> {
  await requireAuth()
  const cleanName = name.trim()
  if (cleanName.length < 2) throw new Error('Business name is required.')
  const data = await saveBusiness({ name: cleanName, profile, status: 'draft' })
  return { id: data.id, name: data.name, status: data.status as JourneyBusiness['status'], profile: data.profile }
}

export async function createMarketplaceOrder(input: {
  businessId?: string
  totalMinor: number
  currency?: string
  payload: Record<string, unknown>
}): Promise<JourneyOrder> {
  await requireAuth()
  const data = await createSandboxOrder({
    businessId: input.businessId,
    kind: 'marketplace',
    totalMinor: input.totalMinor,
    currency: input.currency ?? 'USD',
    payload: input.payload,
    idempotencyKey: crypto.randomUUID(),
  })
  return {
    id: data.id,
    kind: data.kind as JourneyOrder['kind'],
    status: data.status,
    totalMinor: data.total_minor,
    currency: data.currency,
    payload: data.payload,
  }
}

export async function requestJarvisApproval(action: string, payload: Record<string, unknown>) {
  await requireAuth()
  return requestApproval({ action, payload })
}

export async function approveJarvisRequest(id: string) {
  await requireAuth()
  return approveRequest({ id })
}

export async function authorizeSandboxPayment(order: JourneyOrder, approvalId: string) {
  await requireAuth()
  return recordSandboxPayment({
    orderId: order.id,
    amountMinor: order.totalMinor,
    idempotencyKey: crypto.randomUUID(),
    approvalId,
  })
}

export async function addDeliveryEvent(orderId: string, state: string, publicMessage: string, etaMinutes?: number) {
  await requireAuth()
  return appendDeliveryEvent({ orderId, state, publicMessage, etaMinutes })
}

export async function listDeliveryEvents(orderId: string) {
  const { sb } = await requireAuth()
  const { data, error } = await sb.from('tryamm_delivery_events')
    .select('id,state,public_message,eta_minutes,occurred_at')
    .eq('order_id', orderId).order('occurred_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function loadBusinessDashboard(): Promise<TryammDashboard> {
  await requireAuth()
  return loadTryammDashboard()
}

export async function listAuditEvidence(limit = 25) {
  const { sb, user } = await requireAuth()
  const { data, error } = await sb.from('tryamm_audit_events')
    .select('id,action,target_type,target_id,result,correlation_id,metadata,occurred_at')
    .eq('actor_id', user.id).order('occurred_at', { ascending: false }).limit(limit)
  if (error) throw error
  return data ?? []
}

export async function subscribeJourney(
  orderId: string,
  handlers: Parameters<typeof subscribeToOrderJourney>[1],
) {
  await requireAuth()
  return subscribeToOrderJourney(orderId, handlers)
}

export { stopOrderJourneySubscription as stopJourneySubscription }

async function writeAudit(
  action: string,
  targetType: string,
  targetId: string,
  result: 'allowed' | 'denied' | 'pending_approval' | 'success' | 'failure',
  metadata: Record<string, unknown> = {},
) {
  await requireAuth()
  await recordAuditEvent({ action, targetType, targetId, result, metadata })
}
