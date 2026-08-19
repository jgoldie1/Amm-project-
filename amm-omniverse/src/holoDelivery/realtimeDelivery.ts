import { createClient, type RealtimeChannel } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export type RealtimeDeliveryEvent = {
  id: string;
  order_id: string;
  account_id: string;
  state: string;
  public_message: string;
  eta_minutes?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  source: string;
  created_at: string;
};

export function subscribeToDeliveryOrder(
  orderId: string,
  onEvent: (event: RealtimeDeliveryEvent) => void,
): () => void {
  if (!url || !anon) return () => {};
  const supabase = createClient(url, anon);
  let channel: RealtimeChannel | null = supabase
    .channel(`holo-delivery:${orderId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'holo_delivery_events', filter: `order_id=eq.${orderId}` },
      (payload) => onEvent(payload.new as RealtimeDeliveryEvent),
    )
    .subscribe();

  return () => {
    if (channel) void supabase.removeChannel(channel);
    channel = null;
  };
}
