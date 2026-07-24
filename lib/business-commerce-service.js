"use strict";

function createBusinessCommerceService({ supabase, payRouter, revenueEngine }) {
  if (!supabase) throw new Error("SUPABASE_REQUIRED");

  async function createBusiness({ ownerId, name, businessType, country = "US", currency = "USD", planId = "starter" }) {
    const { data, error } = await supabase.from("business_accounts").insert({
      owner_id: ownerId,
      name,
      business_type: businessType,
      country,
      currency,
      plan_id: planId,
      status: "pending_activation"
    }).select().single();
    if (error) throw error;
    return data;
  }

  async function createStorefront({ businessId, slug, displayName, description = "", storefrontType = "general" }) {
    const { data, error } = await supabase.from("business_storefronts").insert({
      business_id: businessId,
      slug,
      display_name: displayName,
      description,
      storefront_type: storefrontType,
      status: "draft"
    }).select().single();
    if (error) throw error;
    return data;
  }

  async function addProduct({ storefrontId, name, description = "", price, currency = "USD", sku = null, productType = "physical" }) {
    const { data, error } = await supabase.from("storefront_products").insert({
      storefront_id: storefrontId,
      name,
      description,
      price,
      currency,
      sku,
      product_type: productType,
      active: true
    }).select().single();
    if (error) throw error;
    return data;
  }

  async function createRestaurantMenu({ businessId, name = "Main Menu" }) {
    const { data, error } = await supabase.from("restaurant_menus").insert({ business_id: businessId, name, active: true }).select().single();
    if (error) throw error;
    return data;
  }

  async function addMenuItem({ menuId, name, description = "", price, currency = "USD", category = "General" }) {
    const { data, error } = await supabase.from("restaurant_menu_items").insert({
      menu_id: menuId,
      name,
      description,
      price,
      currency,
      category,
      active: true
    }).select().single();
    if (error) throw error;
    return data;
  }

  async function createOrder({ customerId, businessId, storefrontId = null, orderType = "storefront", items = [], currency = "USD", promoCode = null, country = "US" }) {
    const subtotal = items.reduce((sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 1), 0);
    const promo = promoCode ? await resolvePromo({ promoCode, subtotal }) : null;
    const discount = promo?.discountAmount || 0;
    const total = Math.max(0, subtotal - discount);

    const { data, error } = await supabase.from("commerce_orders").insert({
      customer_id: customerId,
      business_id: businessId,
      storefront_id: storefrontId,
      order_type: orderType,
      items,
      currency,
      subtotal,
      discount_total: discount,
      total,
      promo_code: promoCode,
      payment_status: "pending",
      fulfillment_status: "pending"
    }).select().single();
    if (error) throw error;

    return {
      order: data,
      checkout: payRouter ? await payRouter.createCheckout({
        orderId: data.id,
        amount: total,
        currency,
        country,
        metadata: { businessId, orderType, promoCode: promoCode || "" }
      }) : null
    };
  }

  async function resolvePromo({ promoCode, subtotal }) {
    const { data, error } = await supabase.from("promo_codes").select("*").eq("code", promoCode).eq("active", true).maybeSingle();
    if (error) throw error;
    if (!data) return null;

    let discountAmount = 0;
    if (data.discount_type === "fixed") discountAmount = Number(data.discount_value || 0);
    if (data.discount_type === "percent") discountAmount = subtotal * Number(data.discount_value || 0) / 100;

    return { ...data, discountAmount: Math.min(subtotal, discountAmount) };
  }

  async function settleVerifiedOrder({ orderId, providerEventId, providerFees = 0, taxes = 0 }) {
    const { data: order, error } = await supabase.from("commerce_orders").select("*").eq("id", orderId).single();
    if (error) throw error;

    const policyId = order.order_type === "restaurant" ? "RW-RESTAURANT-01" : "RW-MARKETPLACE-01";
    const settlement = revenueEngine ? await revenueEngine.settle({
      policyId,
      grossAmount: Number(order.total),
      providerFees,
      taxes,
      referenceId: providerEventId,
      businessId: order.business_id,
      orderId
    }) : null;

    const { error: updateError } = await supabase.from("commerce_orders").update({
      payment_status: "paid",
      provider_event_id: providerEventId,
      paid_at: new Date().toISOString()
    }).eq("id", orderId);
    if (updateError) throw updateError;

    return { orderId, settlement };
  }

  return {
    createBusiness,
    createStorefront,
    addProduct,
    createRestaurantMenu,
    addMenuItem,
    createOrder,
    resolvePromo,
    settleVerifiedOrder
  };
}

module.exports = { createBusinessCommerceService };
