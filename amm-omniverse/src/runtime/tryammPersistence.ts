import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js';

export type TryammCoreAction =
  | 'upsert_business'
  | 'create_order'
  | 'record_sandbox_payment'
  | 'append_delivery_event'
  | 'record_audit_event'
  | 'dashboard';

export type TryammCoreResponse<T> = {
  data?: T;
  correlationId?: string;
  error?: string;
};

export type TryammBusinessRecord = {
  id: string;
  owner_id: string;
  name: string;
  status: string;
  profile: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type TryammOrderRecord = {
  id: string;
  buyer_id: string;
  business_id: string | null;
  kind: string;
  status: string;
  total_minor: number;
  currency: string;
  payload: Record<string, unknown>;
  idempotency_key?: string | null;
  created_at: string;
  updated_at: string;
};

export type TryammDeliveryEventRecord = {
  id: string;
  order_id: string;
  actor_id: string;
  state: string;
  public_message: string;
  eta_minutes: number | null;
  occurred_at: string;
};

export type TryammSandboxPaymentRecord = {
  id: string;
  user_id: string;
  order_id: string;
  amount_minor: number;
  currency: string;
  status: string;
  provider: string;
  idempotency_key?: string | null;
  created_at: string;
  updated_at: string;
};

export type TryammAuditRecord = {
  id: string;
  actor_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  result: string;
  correlation_id: string;
  metadata: Record<string, unknown>;
  occurred_at: string;
};

export type TryammDashboard = {
  businesses: Array<Pick<TryammBusinessRecord, 'id' | 'name' | 'status' | 'updated_at'>>;
  totals: {
    orders: number;
    activeOrders: number;
    deliveredOrders: number;
    sandboxPaidMinor: number;
    currency: string;
  };
  recentOrders: Array<Pick<TryammOrderRecord, 'id' | 'status' | 'total_minor' | 'currency' | 'created_at' | 'business_id'>>;
  recentPayments: Array<Pick<TryammSandboxPaymentRecord, 'id' | 'amount_minor' | 'currency' | 'status' | 'created_at' | 'order_id'>>;
  generatedAt: string;
};

let client: SupabaseClient | null = null;

function env(name: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_PUBLISHABLE_KEY') {
  const value = import.meta.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

export function hasLiveTryammPersistence() {
  return Boolean(env('VITE_SUPABASE_URL') && env('VITE_SUPABASE_PUBLISHABLE_KEY'));
}

export function getTryammSupabase(): SupabaseClient {
  if (client) return client;
  const url = env('VITE_SUPABASE_URL');
  const key = env('VITE_SUPABASE_PUBLISHABLE_KEY');
  if (!url || !key) {
    throw new Error('TRYAMM live persistence is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  }
  client = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

async function invokeCore<T>(action: TryammCoreAction, input: Record<string, unknown> = {}, correlationId = crypto.randomUUID()): Promise<TryammCoreResponse<T>> {
  const supabase = getTryammSupabase();
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return { error: 'authentication_required', correlationId };

  const { data, error } = await supabase.functions.invoke('tryamm-core', {
    body: { action, input, correlationId },
  });
  if (error) return { error: error.message, correlationId };
  return data as TryammCoreResponse<T>;
}

function unwrap<T>(response: TryammCoreResponse<T>): T {
  if (response.error || !response.data) throw new Error(response.error ?? 'TRYAMM core returned no data.');
  return response.data;
}

export async function saveBusiness(input: { id?: string; name: string; status?: string; profile?: Record<string, unknown> }) {
  return unwrap(await invokeCore<TryammBusinessRecord>('upsert_business', input));
}

export async function createSandboxOrder(input: {
  businessId?: string;
  kind: string;
  totalMinor: number;
  currency?: string;
  payload?: Record<string, unknown>;
  idempotencyKey: string;
}) {
  return unwrap(await invokeCore<TryammOrderRecord>('create_order', input));
}

export async function recordSandboxPayment(input: { orderId: string; amountMinor?: number; idempotencyKey: string; approvalId: string }) {
  return unwrap(await invokeCore<TryammSandboxPaymentRecord>('record_sandbox_payment', input));
}

export async function appendDeliveryEvent(input: { orderId: string; state: string; publicMessage: string; etaMinutes?: number }) {
  return unwrap(await invokeCore<TryammDeliveryEventRecord>('append_delivery_event', input));
}

export async function recordAuditEvent(input: {
  action: string;
  targetType?: string;
  targetId?: string;
  result: 'allowed' | 'denied' | 'pending_approval' | 'success' | 'failure';
  metadata?: Record<string, unknown>;
}) {
  return unwrap(await invokeCore<TryammAuditRecord>('record_audit_event', input));
}

export async function loadTryammDashboard() {
  return unwrap(await invokeCore<TryammDashboard>('dashboard'));
}

export async function readOrderJourney(orderId: string) {
  const supabase = getTryammSupabase();
  const [orderResult, paymentResult, deliveryResult, auditResult] = await Promise.all([
    supabase.from('tryamm_orders').select('*').eq('id', orderId).maybeSingle(),
    supabase.from('tryamm_sandbox_payments').select('*').eq('order_id', orderId).maybeSingle(),
    supabase.from('tryamm_delivery_events').select('*').eq('order_id', orderId).order('occurred_at', { ascending: true }),
    supabase.from('tryamm_audit_events').select('*').eq('target_id', orderId).order('occurred_at', { ascending: true }),
  ]);
  if (orderResult.error) throw orderResult.error;
  if (paymentResult.error) throw paymentResult.error;
  if (deliveryResult.error) throw deliveryResult.error;
  if (auditResult.error) throw auditResult.error;
  return {
    order: orderResult.data as TryammOrderRecord | null,
    payment: paymentResult.data as TryammSandboxPaymentRecord | null,
    deliveryEvents: (deliveryResult.data ?? []) as TryammDeliveryEventRecord[],
    auditEvents: (auditResult.data ?? []) as TryammAuditRecord[],
  };
}

export function subscribeToOrderJourney(
  orderId: string,
  handlers: {
    onOrder?: (order: TryammOrderRecord) => void;
    onDeliveryEvent?: (event: TryammDeliveryEventRecord) => void;
    onStatus?: (status: string) => void;
  },
): RealtimeChannel {
  const supabase = getTryammSupabase();
  return supabase
    .channel(`tryamm-order-${orderId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tryamm_orders', filter: `id=eq.${orderId}` }, (payload) => {
      handlers.onOrder?.(payload.new as TryammOrderRecord);
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tryamm_delivery_events', filter: `order_id=eq.${orderId}` }, (payload) => {
      handlers.onDeliveryEvent?.(payload.new as TryammDeliveryEventRecord);
    })
    .subscribe((status) => handlers.onStatus?.(status));
}

export function stopOrderJourneySubscription(channel: RealtimeChannel) {
  return getTryammSupabase().removeChannel(channel);
}
