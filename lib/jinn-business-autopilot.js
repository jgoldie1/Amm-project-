"use strict";

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function createJinnBusinessAutopilot() {
  function businessHealth(input = {}) {
    const revenueTrend = Number(input.revenueTrendPct || 0);
    const refundRate = Number(input.refundRatePct || 0);
    const repeatRate = Number(input.repeatCustomerPct || 0);
    const overdueInvoices = Number(input.overdueInvoicePct || 0);
    const cashCoverageDays = Number(input.cashCoverageDays || 0);
    const adRoas = Number(input.adRoas || 0);
    const inventoryStockoutRate = Number(input.inventoryStockoutRatePct || 0);

    let score = 50;
    score += clamp(revenueTrend, -20, 20) * 0.6;
    score += clamp(repeatRate - 20, -20, 40) * 0.3;
    score += clamp(cashCoverageDays - 30, -30, 60) * 0.2;
    score += clamp(adRoas - 1, -1, 5) * 4;
    score -= clamp(refundRate, 0, 20) * 1.5;
    score -= clamp(overdueInvoices, 0, 100) * 0.25;
    score -= clamp(inventoryStockoutRate, 0, 50) * 0.5;

    return Math.round(clamp(score, 0, 100));
  }

  function recommendations(input = {}) {
    const out = [];

    if (Number(input.inventoryStockoutRatePct || 0) > 8) {
      out.push({ area: "inventory", priority: "high", action: "Review fast-moving items and create reorder suggestions." });
    }

    if (Number(input.overdueInvoicePct || 0) > 20) {
      out.push({ area: "invoices", priority: "high", action: "Generate reminder drafts for overdue invoices and rank by amount and age." });
    }

    if (Number(input.repeatCustomerPct || 0) < 20) {
      out.push({ area: "retention", priority: "medium", action: "Create a HoloPass win-back campaign draft and HoloCoupon recommendation." });
    }

    if (Number(input.adRoas || 0) < 1.5 && Number(input.adSpend || 0) > 0) {
      out.push({ area: "marketing", priority: "high", action: "Reduce or reallocate low-performing ad spend after merchant approval." });
    }

    if (Number(input.cashCoverageDays || 0) < 21) {
      out.push({ area: "cashflow", priority: "high", action: "Build a 30-day cash-flow calendar and flag discretionary spend." });
    }

    if (input.procurementProfileComplete === false) {
      out.push({ area: "procurement", priority: "medium", action: "Complete supplier capabilities, certifications, service area and past-performance profile." });
    }

    if (input.fundingDocumentsComplete === false) {
      out.push({ area: "funding", priority: "medium", action: "Prepare missing funding-readiness documents and deadline reminders." });
    }

    return out;
  }

  function requiresApproval(action = "") {
    const material = new Set([
      "spend_money",
      "change_price",
      "issue_material_refund",
      "submit_application",
      "accept_contract",
      "move_funds",
      "change_payout_settings",
      "hire_staff",
      "terminate_staff"
    ]);
    return material.has(action);
  }

  return { businessHealth, recommendations, requiresApproval };
}

module.exports = { createJinnBusinessAutopilot };
