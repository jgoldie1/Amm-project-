import type { SupabaseClient } from '@supabase/supabase-js';

export type MarketplaceOrderRecord = {
  id?: string;
  account_id: string;
  buyer_user_id: string;
  seller_account_id: string;
  status: 'draft'|'payment_pending'|'confirmed'|'processing'|'fulfilled'|'cancelled'|'refunded'|'disputed';
  currency: string;
  subtotal_minor: number;
  discount_minor: number;
  delivery_minor: number;
  tax_minor: number;
  total_minor: number;
  fulfillment_type: 'holo_delivery'|'package_delivery'|'pickup'|'digital'|'service'|'external_shipping';
  idempotency_key: string;
};

export type DeliveryEventInput = {
  delivery_job_id: string;
  state: string;
  public_message: string;
  eta_minutes?: number;
  latitude?: number;
  longitude?: number;
  accuracy_meters?: number;
  source: 'merchant'|'courier'|'provider'|'system';
};

export type JournalLine = {
  ledger_account: string;
  debit_minor?: number;
  credit_minor?: number;
};

export type JournalInput = {
  account_id: string;
  source_type: string;
  source_id: string;
  currency: string;
  idempotency_key: string;
  created_by: string;
  lines: JournalLine[];
};

export type JarvisApprovalInput = {
  account_id: string;
  requested_by_agent: string;
  requested_for_user_id: string;
  action: string;
  action_payload: Record<string, unknown>;
  risk_level: 'low'|'medium'|'high'|'critical';
  expires_at?: string;
};

export function createCommerceRepository(supabase: SupabaseClient) {
  return {
    async createOrder(order: MarketplaceOrderRecord) {
      const { data, error } = await supabase.from('marketplace_orders').insert(order).select('*').single();
      if (error) throw error;
      return data;
    },

    async getOrder(orderId: string) {
      const { data, error } = await supabase.from('marketplace_orders').select('*, marketplace_order_items(*)').eq('id', orderId).single();
      if (error) throw error;
      return data;
    },

    async appendDeliveryEvent(event: DeliveryEventInput) {
      const { data, error } = await supabase.from('delivery_tracking_events').insert(event).select('*').single();
      if (error) throw error;
      return data;
    },

    async getDeliveryTimeline(deliveryJobId: string) {
      const { data, error } = await supabase.from('delivery_tracking_events').select('*').eq('delivery_job_id', deliveryJobId).order('occurred_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },

    async createJarvisApproval(input: JarvisApprovalInput) {
      const { data, error } = await supabase.from('jarvis_approval_requests').insert({ ...input, status: 'pending' }).select('*').single();
      if (error) throw error;
      return data;
    },

    async decideJarvisApproval(input: { id: string; status: 'approved'|'denied'; decided_by: string }) {
      const { data, error } = await supabase.from('jarvis_approval_requests')
        .update({ status: input.status, decided_by: input.decided_by, decided_at: new Date().toISOString() })
        .eq('id', input.id).eq('status', 'pending').select('*').single();
      if (error) throw error;
      return data;
    },

    async createJournalDraft(journal: JournalInput) {
      const debit = journal.lines.reduce((sum, line) => sum + (line.debit_minor ?? 0), 0);
      const credit = journal.lines.reduce((sum, line) => sum + (line.credit_minor ?? 0), 0);
      if (debit <= 0 || debit !== credit) throw new Error('Journal must be balanced and non-zero.');

      // NOTE: Production money writes should move behind a trusted RPC/server endpoint.
      // This client repository is intentionally suitable for service-role/server usage only.
      const { data: entry, error: entryError } = await supabase.from('money_journal_entries').insert({
        account_id: journal.account_id,
        source_type: journal.source_type,
        source_id: journal.source_id,
        currency: journal.currency,
        idempotency_key: journal.idempotency_key,
        status: 'pending',
        created_by: journal.created_by,
      }).select('*').single();
      if (entryError) throw entryError;

      const { error: linesError } = await supabase.from('money_journal_lines').insert(journal.lines.map((line) => ({
        journal_entry_id: entry.id,
        ledger_account: line.ledger_account,
        debit_minor: line.debit_minor ?? 0,
        credit_minor: line.credit_minor ?? 0,
      })));
      if (linesError) throw linesError;
      return entry;
    },
  };
}
