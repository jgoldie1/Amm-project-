import { createClient } from 'npm:@supabase/supabase-js@2.108.2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const deliveryStates = new Set([
  'confirmed','merchant_accepted','preparing','ready_for_pickup','courier_assigned',
  'picked_up','in_transit','arriving','delivered','problem','cancelled','refunded',
]);

const transitions: Record<string, string[]> = {
  paid_sandbox: ['confirmed','cancelled','refunded'],
  confirmed: ['merchant_accepted','preparing','courier_assigned','cancelled','problem'],
  merchant_accepted: ['preparing','ready_for_pickup','cancelled','problem'],
  preparing: ['ready_for_pickup','courier_assigned','cancelled','problem'],
  ready_for_pickup: ['courier_assigned','picked_up','cancelled','problem'],
  courier_assigned: ['picked_up','in_transit','cancelled','problem'],
  picked_up: ['in_transit','arriving','problem'],
  in_transit: ['arriving','delivered','problem'],
  arriving: ['delivered','problem'],
  problem: ['in_transit','arriving','delivered','cancelled','refunded'],
  delivered: [], cancelled: ['refunded'], refunded: [],
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}
function requiredString(value: unknown, name: string) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing ${name}`);
  return value.trim();
}
function moneyMinor(value: unknown, name: string) {
  if (!Number.isInteger(value) || (value as number) < 0) throw new Error(`${name} must be a non-negative integer`);
  return value as number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceKey) return json({ error: 'server_misconfigured' }, 500);

  const authHeader = req.headers.get('Authorization') ?? '';
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } }, auth: { persistSession: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData.user;
  if (userError || !user) return json({ error: 'unauthorized' }, 401);

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'invalid_json' }, 400); }
  const action = body?.action;
  const input = body?.input ?? {};
  const correlationId = typeof body?.correlationId === 'string' && body.correlationId.trim() ? body.correlationId.trim() : crypto.randomUUID();

  async function audit(
    result: 'allowed'|'denied'|'pending_approval'|'success'|'failure',
    targetType?: string,
    targetId?: string,
    metadata: Record<string, unknown> = {},
    actionOverride?: string,
  ) {
    const { data, error } = await admin.from('tryamm_audit_events').insert({
      actor_id: user.id, action: actionOverride ?? String(action ?? 'unknown'), target_type: targetType ?? null,
      target_id: targetId ?? null, result, correlation_id: correlationId, metadata,
    }).select().single();
    if (error) throw error;
    return data;
  }

  async function reject(error: string, status: number, targetType?: string, targetId?: string, metadata: Record<string, unknown> = {}) {
    await audit('denied', targetType, targetId, { error, ...metadata });
    return json({ error, correlationId }, status);
  }

  try {
    if (action === 'upsert_business') {
      const name = requiredString(input.name, 'name');
      const id = typeof input.id === 'string' ? input.id : undefined;
      if (id) {
        const { data: existing } = await admin.from('tryamm_businesses').select('id,owner_id').eq('id', id).maybeSingle();
        if (!existing || existing.owner_id !== user.id) return reject('forbidden', 403, 'business', id);
        const { data, error } = await admin.from('tryamm_businesses').update({
          name, status: input.status ?? 'draft', profile: input.profile ?? {}, updated_at: new Date().toISOString(),
        }).eq('id', id).select().single();
        if (error) throw error;
        await audit('success', 'business', data.id);
        return json({ data, correlationId });
      }
      const { data, error } = await admin.from('tryamm_businesses').insert({
        owner_id: user.id, name, status: input.status ?? 'draft', profile: input.profile ?? {},
      }).select().single();
      if (error) throw error;
      await audit('success', 'business', data.id);
      return json({ data, correlationId }, 201);
    }

    if (action === 'create_order') {
      const kind = requiredString(input.kind, 'kind');
      const totalMinor = moneyMinor(input.totalMinor, 'totalMinor');
      const idempotencyKey = requiredString(input.idempotencyKey, 'idempotencyKey');
      if (!['marketplace','food','package','service'].includes(kind)) return reject('unsupported_order_kind', 400);
      if (input.businessId) {
        const { data: business } = await admin.from('tryamm_businesses').select('id').eq('id', input.businessId).maybeSingle();
        if (!business) return reject('business_not_found', 404, 'business', input.businessId);
      }
      const record = {
        buyer_id: user.id, business_id: input.businessId ?? null, kind, status: 'created', total_minor: totalMinor,
        currency: typeof input.currency === 'string' ? input.currency.toUpperCase() : 'USD', payload: input.payload ?? {},
        idempotency_key: idempotencyKey,
      };
      const { data, error } = await admin.from('tryamm_orders').upsert(record, {
        onConflict: 'buyer_id,idempotency_key', ignoreDuplicates: false,
      }).select().single();
      if (error) throw error;
      await audit('success', 'order', data.id, { kind, totalMinor });
      return json({ data, correlationId }, 201);
    }

    if (action === 'record_sandbox_payment') {
      const orderId = requiredString(input.orderId, 'orderId');
      const approvalId = requiredString(input.approvalId, 'approvalId');
      const idempotencyKey = requiredString(input.idempotencyKey, 'idempotencyKey');
      const { data: order } = await admin.from('tryamm_orders').select('id,buyer_id,total_minor,currency,status').eq('id', orderId).maybeSingle();
      if (!order || order.buyer_id !== user.id) return reject('order_not_found', 404, 'order', orderId);
      if (!['created','payment_pending','paid_sandbox'].includes(order.status)) return reject('order_not_payable', 409, 'order', orderId, { status: order.status });
      const { data: approval } = await admin.from('tryamm_approval_requests')
        .select('id,user_id,action,payload,status').eq('id', approvalId).maybeSingle();
      if (!approval || approval.user_id !== user.id || approval.status !== 'approved' || approval.action !== 'authorize_sandbox_checkout' || approval.payload?.orderId !== orderId) {
        return reject('approved_checkout_required', 403, 'order', orderId, { approvalId });
      }
      const amountMinor = input.amountMinor === undefined ? order.total_minor : moneyMinor(input.amountMinor, 'amountMinor');
      if (amountMinor !== order.total_minor) return reject('amount_mismatch', 409, 'order', orderId);
      const paymentRecord = {
        user_id: user.id, order_id: order.id, amount_minor: amountMinor, currency: order.currency,
        status: 'recorded', provider: 'tryamm_sandbox', idempotency_key: idempotencyKey, updated_at: new Date().toISOString(),
      };
      const { data: payment, error: paymentError } = await admin.from('tryamm_sandbox_payments')
        .upsert(paymentRecord, { onConflict: 'order_id', ignoreDuplicates: false }).select().single();
      if (paymentError) throw paymentError;
      const { error: orderError } = await admin.from('tryamm_orders').update({ status: 'paid_sandbox', updated_at: new Date().toISOString() }).eq('id', order.id);
      if (orderError) throw orderError;
      await audit('success', 'order', order.id, { paymentId: payment.id, amountMinor, approvalId });
      return json({ data: payment, correlationId }, 201);
    }

    if (action === 'append_delivery_event') {
      const orderId = requiredString(input.orderId, 'orderId');
      const state = requiredString(input.state, 'state');
      const publicMessage = requiredString(input.publicMessage, 'publicMessage');
      if (!deliveryStates.has(state)) return reject('invalid_delivery_state', 400, 'order', orderId, { state });
      const { data: order } = await admin.from('tryamm_orders').select('id,buyer_id,status').eq('id', orderId).maybeSingle();
      if (!order || order.buyer_id !== user.id) return reject('order_not_found', 404, 'order', orderId);
      const allowed = transitions[order.status] ?? [];
      if (!allowed.includes(state) && order.status !== state) return reject('invalid_delivery_transition', 409, 'order', orderId, { from: order.status, to: state });
      const etaMinutes = input.etaMinutes === undefined ? null : moneyMinor(input.etaMinutes, 'etaMinutes');
      const { data, error } = await admin.from('tryamm_delivery_events').insert({
        order_id: order.id, actor_id: user.id, state, public_message: publicMessage, eta_minutes: etaMinutes,
      }).select().single();
      if (error) throw error;
      const { error: updateError } = await admin.from('tryamm_orders').update({ status: state, updated_at: new Date().toISOString() }).eq('id', order.id);
      if (updateError) throw updateError;
      await audit('success', 'order', order.id, { deliveryEventId: data.id, state });
      return json({ data, correlationId }, 201);
    }

    if (action === 'record_audit_event') {
      const requestedAction = requiredString(input.action, 'action');
      const result = requiredString(input.result, 'result');
      if (!['allowed','denied','pending_approval','success','failure'].includes(result)) return json({ error: 'invalid_audit_result', correlationId }, 400);
      const data = await audit(
        result as 'allowed'|'denied'|'pending_approval'|'success'|'failure',
        typeof input.targetType === 'string' ? input.targetType : undefined,
        typeof input.targetId === 'string' ? input.targetId : undefined,
        input.metadata ?? {},
        requestedAction,
      );
      return json({ data, correlationId }, 201);
    }

    if (action === 'dashboard') {
      const { data: ownedBusinesses, error: businessError } = await admin.from('tryamm_businesses').select('id,name,status,updated_at').eq('owner_id', user.id);
      if (businessError) throw businessError;
      const businessIds = (ownedBusinesses ?? []).map((b) => b.id);
      const buyerQuery = admin.from('tryamm_orders').select('id,status,total_minor,currency,created_at,business_id,buyer_id').eq('buyer_id', user.id).order('created_at', { ascending: false }).limit(100);
      const sellerQuery = businessIds.length
        ? admin.from('tryamm_orders').select('id,status,total_minor,currency,created_at,business_id,buyer_id').in('business_id', businessIds).order('created_at', { ascending: false }).limit(100)
        : Promise.resolve({ data: [], error: null } as any);
      const paymentsQuery = admin.from('tryamm_sandbox_payments').select('id,amount_minor,currency,status,created_at,order_id').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100);
      const [buyerResult, sellerResult, paymentsResult] = await Promise.all([buyerQuery, sellerQuery, paymentsQuery]);
      if (buyerResult.error) throw buyerResult.error;
      if (sellerResult.error) throw sellerResult.error;
      if (paymentsResult.error) throw paymentsResult.error;
      const orderMap = new Map<string, any>();
      for (const row of [...(buyerResult.data ?? []), ...(sellerResult.data ?? [])]) orderMap.set(row.id, row);
      const orders = [...orderMap.values()].sort((a,b) => String(b.created_at).localeCompare(String(a.created_at)));
      const payments = paymentsResult.data ?? [];
      const paidMinor = payments.filter((p) => p.status === 'recorded').reduce((sum, p) => sum + p.amount_minor, 0);
      const delivered = orders.filter((o) => o.status === 'delivered').length;
      const active = orders.filter((o) => !['delivered','cancelled','refunded'].includes(o.status)).length;
      const dashboard = {
        businesses: ownedBusinesses ?? [],
        totals: { orders: orders.length, activeOrders: active, deliveredOrders: delivered, sandboxPaidMinor: paidMinor, currency: 'USD' },
        recentOrders: orders.slice(0,20), recentPayments: payments.slice(0,20), generatedAt: new Date().toISOString(),
      };
      await audit('success', 'dashboard', user.id, { orders: orders.length, businesses: businessIds.length });
      return json({ data: dashboard, correlationId });
    }

    return json({ error: 'unknown_action', correlationId }, 400);
  } catch (error) {
    try {
      await audit('failure', undefined, undefined, { message: error instanceof Error ? error.message : 'unknown_error' });
    } catch {
      // Preserve the original operation failure even if audit persistence is unavailable.
    }
    return json({ error: 'operation_failed', correlationId }, 500);
  }
});