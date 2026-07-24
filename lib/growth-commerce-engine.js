"use strict";

function roundMoney(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function createGrowthCommerceEngine({ db, ledger }) {
  if (!db) throw new Error("DB_REQUIRED");

  async function earnHoloPass({ userId, businessId, beans = 0, xp = 0, eventType, referenceId, metadata = {} }) {
    if (!userId) throw new Error("USER_ID_REQUIRED");
    if (!eventType) throw new Error("EVENT_TYPE_REQUIRED");

    return db.withTransaction(async tx => {
      const event = await tx.insertHoloPassEvent({
        userId,
        businessId: businessId || null,
        eventType,
        beansDelta: Number(beans || 0),
        xpDelta: Number(xp || 0),
        referenceId: referenceId || null,
        metadata
      });

      await tx.incrementHoloPassBalance({
        userId,
        beansDelta: Number(beans || 0),
        xpDelta: Number(xp || 0)
      });

      if (ledger && (beans || xp)) {
        if (beans) await ledger.credit({ partyId: userId, valueType: "beans", amount: Number(beans), eventType, referenceId });
        if (xp) await ledger.credit({ partyId: userId, valueType: "xp", amount: Number(xp), eventType, referenceId });
      }

      return event;
    });
  }

  async function calculateAffiliateConversion({ campaign, order, creatorUserId }) {
    if (!campaign || campaign.status !== "active") throw new Error("CAMPAIGN_NOT_ACTIVE");
    const gross = Number(order.grossAmount || 0);
    if (gross <= 0) throw new Error("INVALID_GROSS_AMOUNT");

    let commission = 0;
    if (campaign.creatorCommissionType === "percentage") {
      commission = gross * (Number(campaign.creatorCommissionValue || 0) / 100);
    } else {
      commission = Number(campaign.creatorCommissionValue || 0);
    }

    return {
      creatorUserId,
      grossAmount: roundMoney(gross),
      commissionAmount: roundMoney(Math.min(commission, gross)),
      revenuePolicyId: campaign.revenuePolicyId || null
    };
  }

  async function createReservation({ businessId, resourceId, customerUserId, startsAt, endsAt, partySize = 1, depositAmount = 0, currency = "USD" }) {
    if (!businessId || !startsAt) throw new Error("INVALID_RESERVATION");
    const conflict = await db.findReservationConflict({ businessId, resourceId, startsAt, endsAt });
    if (conflict) throw new Error("RESERVATION_CONFLICT");

    return db.createReservation({
      businessId,
      resourceId: resourceId || null,
      customerUserId: customerUserId || null,
      startsAt,
      endsAt: endsAt || null,
      partySize: Number(partySize || 1),
      depositAmount: roundMoney(depositAmount),
      currency,
      paymentStatus: Number(depositAmount || 0) > 0 ? "pending" : "not_required"
    });
  }

  async function resolveHoloMenuTouchpoint(token) {
    if (!token) throw new Error("TOKEN_REQUIRED");
    const touchpoint = await db.findActiveHoloMenuTouchpoint(token);
    if (!touchpoint) throw new Error("TOUCHPOINT_NOT_FOUND");
    await db.recordTouchpointVisit({ touchpointId: touchpoint.id });
    return touchpoint;
  }

  async function submitVerifiedReview({ businessId, userId, verificationType, referenceId, rating, body }) {
    const verified = await db.verifyReviewReference({ businessId, userId, verificationType, referenceId });
    if (!verified) throw new Error("REVIEW_NOT_VERIFIED");

    return db.createVerifiedReview({
      businessId,
      userId,
      verificationType,
      referenceId,
      rating: Math.max(1, Math.min(5, Number(rating || 0))),
      body: body || null
    });
  }

  return {
    earnHoloPass,
    calculateAffiliateConversion,
    createReservation,
    resolveHoloMenuTouchpoint,
    submitVerifiedReview
  };
}

module.exports = { createGrowthCommerceEngine };
