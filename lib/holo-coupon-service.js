"use strict";

function createHoloCouponService({ supabase }) {
  if (!supabase) throw new Error("SUPABASE_REQUIRED");

  async function validateCoupon({ code, userId, subtotal, channel = "storefront" }) {
    const { data: coupon, error } = await supabase
      .from("holo_coupons")
      .select("*")
      .eq("code", code)
      .eq("active", true)
      .maybeSingle();
    if (error) throw error;
    if (!coupon) return { valid: false, reason: "NOT_FOUND" };

    const now = new Date();
    if (coupon.starts_at && now < new Date(coupon.starts_at)) return { valid: false, reason: "NOT_STARTED" };
    if (coupon.ends_at && now > new Date(coupon.ends_at)) return { valid: false, reason: "EXPIRED" };
    if (Array.isArray(coupon.channel_scope) && !coupon.channel_scope.includes(channel)) return { valid: false, reason: "CHANNEL_NOT_ELIGIBLE" };
    if (Number(subtotal || 0) < Number(coupon.min_subtotal || 0)) return { valid: false, reason: "MINIMUM_NOT_MET" };
    if (coupon.max_redemptions && Number(coupon.redemption_count || 0) >= Number(coupon.max_redemptions)) return { valid: false, reason: "REDEMPTION_LIMIT_REACHED" };

    if (coupon.first_order_only) {
      const { count, error: countError } = await supabase
        .from("commerce_orders")
        .select("id", { count: "exact", head: true })
        .eq("customer_id", userId)
        .eq("payment_status", "paid");
      if (countError) throw countError;
      if ((count || 0) > 0) return { valid: false, reason: "FIRST_ORDER_ONLY" };
    }

    let discountAmount = 0;
    const value = Number(coupon.discount_value || 0);
    if (coupon.discount_type === "fixed") discountAmount = value;
    if (coupon.discount_type === "percent") discountAmount = Number(subtotal || 0) * value / 100;
    discountAmount = Math.min(Number(subtotal || 0), Math.max(0, discountAmount));

    return { valid: true, coupon, discountAmount };
  }

  async function redeemCoupon({ couponId, userId, orderId, channel, discountAmount, referralCode = null }) {
    const { data: redemption, error } = await supabase
      .from("holo_coupon_redemptions")
      .insert({
        coupon_id: couponId,
        user_id: userId,
        order_id: orderId,
        channel,
        discount_amount: discountAmount,
        referral_code: referralCode
      })
      .select()
      .single();
    if (error) throw error;

    const { data: coupon, error: fetchError } = await supabase
      .from("holo_coupons")
      .select("redemption_count")
      .eq("id", couponId)
      .single();
    if (fetchError) throw fetchError;

    const { error: updateError } = await supabase
      .from("holo_coupons")
      .update({ redemption_count: Number(coupon.redemption_count || 0) + 1, updated_at: new Date().toISOString() })
      .eq("id", couponId);
    if (updateError) throw updateError;

    return redemption;
  }

  return { validateCoupon, redeemCoupon };
}

module.exports = { createHoloCouponService };
