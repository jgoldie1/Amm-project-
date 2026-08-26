'use strict';

const crypto = require('crypto');

const FUND_TYPES = Object.freeze([
  'tithe',
  'offering',
  'benevolence',
  'storehouse',
  'house_building',
  'missions',
  'education',
  'emergency_relief',
  'kingdom_work',
  'unrestricted'
]);

function faithId(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

function positiveCents(value) {
  const amount = Number(value);
  return Number.isInteger(amount) && amount > 0 ? amount : 0;
}

function installFaithTreasuryGovernance({ app, auth, admin, getStore, saveStore }) {
  const store = getStore();
  store.faithContributions ||= [];
  store.faithPartnershipReviews ||= [];

  app.get('/api/faith/funds', auth, (_req, res) => {
    res.json({ funds: FUND_TYPES });
  });

  app.post('/api/faith/contributions', auth, async (req, res) => {
    const amountCents = positiveCents(req.body.amountCents);
    const fund = String(req.body.fund || 'unrestricted').trim().toLowerCase();
    if (!amountCents) return res.status(400).json({ error: 'Positive amountCents required' });
    if (!FUND_TYPES.includes(fund)) return res.status(400).json({ error: 'Unknown ministry fund' });

    const contribution = {
      id: faithId('faith'),
      donorId: req.user.id,
      ministryId: String(req.body.ministryId || 'default-ministry').slice(0, 120),
      amountCents,
      fund,
      status: 'recorded_pending_processor_verification',
      goodsOrServicesProvided: Boolean(req.body.goodsOrServicesProvided),
      taxTreatment: 'pending_ministry_tax_review',
      createdAt: new Date().toISOString()
    };

    store.faithContributions.push(contribution);
    await saveStore();
    res.status(201).json({ contribution });
  });

  app.post('/api/faith/partnership-reviews', auth, admin, async (req, res) => {
    const amountCents = positiveCents(req.body.amountCents);
    if (!amountCents) return res.status(400).json({ error: 'Positive amountCents required' });

    const review = {
      id: faithId('fpr'),
      counterparty: String(req.body.counterparty || '').trim().slice(0, 160),
      arrangementType: String(req.body.arrangementType || 'service').trim().slice(0, 80),
      amountCents,
      charitablePurpose: String(req.body.charitablePurpose || '').trim().slice(0, 1000),
      relatedParty: Boolean(req.body.relatedParty),
      comparabilityEvidence: Array.isArray(req.body.comparabilityEvidence) ? req.body.comparabilityEvidence : [],
      conflictDisclosures: Array.isArray(req.body.conflictDisclosures) ? req.body.conflictDisclosures : [],
      independentApprovers: Array.isArray(req.body.independentApprovers) ? req.body.independentApprovers : [],
      fairMarketValueDocumented: Boolean(req.body.fairMarketValueDocumented),
      status: 'pending_independent_review',
      createdAt: new Date().toISOString(),
      reviewedAt: null
    };

    if (!review.counterparty || !review.charitablePurpose) {
      return res.status(400).json({ error: 'counterparty and charitablePurpose required' });
    }

    store.faithPartnershipReviews.push(review);
    await saveStore();
    res.status(201).json({ review });
  });

  app.post('/api/faith/partnership-reviews/:id/decision', auth, admin, async (req, res) => {
    const review = store.faithPartnershipReviews.find(item => item.id === req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const approve = req.body.decision === 'approve';
    if (approve && review.relatedParty) {
      const missingEvidence = !review.fairMarketValueDocumented || review.comparabilityEvidence.length === 0 || review.independentApprovers.length === 0;
      if (missingEvidence) {
        return res.status(409).json({ error: 'Related-party arrangement lacks fair-market-value/comparability evidence or independent approval' });
      }
    }

    review.status = approve ? 'approved' : 'rejected';
    review.reviewedAt = new Date().toISOString();
    review.decisionNote = String(req.body.note || '').slice(0, 1000);
    await saveStore();
    res.json({ review });
  });

  app.get('/api/faith/audit', auth, admin, (_req, res) => {
    res.json({
      contributions: store.faithContributions,
      partnershipReviews: store.faithPartnershipReviews,
      controls: {
        separateFaithLedger: true,
        relatedPartyGate: true,
        independentReviewRequired: true,
        fairMarketValueEvidenceRequiredForRelatedParties: true,
        taxStatementsRequireProfessionalApprovalBeforeProduction: true,
        donorSensitiveDataOnChain: false
      }
    });
  });
}

module.exports = { installFaithTreasuryGovernance, FUND_TYPES };
