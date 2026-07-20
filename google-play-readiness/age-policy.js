'use strict';

const AGE_BANDS = Object.freeze({ CHILD: 'CHILD', TEEN: 'TEEN', ADULT: 'ADULT' });

const FEATURE_RULES = Object.freeze({
  public_feed: [AGE_BANDS.CHILD, AGE_BANDS.TEEN, AGE_BANDS.ADULT],
  child_safe_live: [AGE_BANDS.CHILD, AGE_BANDS.TEEN, AGE_BANDS.ADULT],
  teen_live: [AGE_BANDS.TEEN, AGE_BANDS.ADULT],
  adult_live: [AGE_BANDS.ADULT],
  direct_messages: [AGE_BANDS.TEEN, AGE_BANDS.ADULT],
  adult_direct_messages: [AGE_BANDS.ADULT],
  mature_content: [AGE_BANDS.ADULT],
  virtual_gifts: [AGE_BANDS.TEEN, AGE_BANDS.ADULT],
  unrestricted_virtual_gifts: [AGE_BANDS.ADULT],
  marketplace_general: [AGE_BANDS.TEEN, AGE_BANDS.ADULT],
  marketplace_adult: [AGE_BANDS.ADULT],
  creator_monetization: [AGE_BANDS.ADULT]
});

function calculateAge(dateOfBirth, now = new Date()) {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) throw new Error('Invalid date of birth');
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - dob.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < dob.getUTCDate())) age--;
  return age;
}

function deriveAgeBand(dateOfBirth, now = new Date()) {
  const age = calculateAge(dateOfBirth, now);
  if (age < 0) throw new Error('Invalid age');
  if (age < 13) return AGE_BANDS.CHILD;
  if (age < 18) return AGE_BANDS.TEEN;
  return AGE_BANDS.ADULT;
}

function canUseFeature(ageBand, feature) {
  const allowed = FEATURE_RULES[feature];
  return Array.isArray(allowed) && allowed.includes(ageBand);
}

function requireFeature(feature) {
  return (req, res, next) => {
    const ageBand = req.user && req.user.age_band;
    if (!ageBand) return res.status(401).json({ error: 'AGE_BAND_REQUIRED' });
    if (!canUseFeature(ageBand, feature)) return res.status(403).json({ error: 'AGE_RESTRICTED', feature });
    return next();
  };
}

function sanitizeDiscoveryForAge(ageBand, items) {
  return (items || []).filter((item) => {
    if (item.mature && ageBand !== AGE_BANDS.ADULT) return false;
    if (item.min_age === 18 && ageBand !== AGE_BANDS.ADULT) return false;
    if (item.min_age === 13 && ageBand === AGE_BANDS.CHILD) return false;
    return true;
  });
}

module.exports = { AGE_BANDS, FEATURE_RULES, calculateAge, deriveAgeBand, canUseFeature, requireFeature, sanitizeDiscoveryForAge };
