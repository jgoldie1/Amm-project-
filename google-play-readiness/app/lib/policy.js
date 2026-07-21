export const AGE_BANDS = Object.freeze({ CHILD: 'CHILD', TEEN: 'TEEN', ADULT: 'ADULT' });

export function deriveAgeBand(dateOfBirth, now = new Date()) {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime()) || dob > now) throw new Error('Invalid date of birth');
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const m = now.getUTCMonth() - dob.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < dob.getUTCDate())) age--;
  if (age < 13) return AGE_BANDS.CHILD;
  if (age < 18) return AGE_BANDS.TEEN;
  return AGE_BANDS.ADULT;
}

const PERMISSIONS = {
  CHILD: new Set(['view_family_feed','view_curated_games','guardian_messaging','report','block']),
  TEEN: new Set(['view_teen_feed','create_post','join_teen_live','teen_messaging','report','block','mute']),
  ADULT: new Set(['view_adult_feed','create_post','create_live','join_live','direct_message','marketplace','creator_tools','virtual_gifts','report','block','mute'])
};

export function canUse(ageBand, feature) {
  return Boolean(PERMISSIONS[ageBand]?.has(feature));
}

export function canInteract(actorBand, targetBand) {
  if (actorBand === AGE_BANDS.CHILD || targetBand === AGE_BANDS.CHILD) return actorBand === targetBand;
  if (actorBand === AGE_BANDS.ADULT && targetBand === AGE_BANDS.TEEN) return false;
  if (actorBand === AGE_BANDS.TEEN && targetBand === AGE_BANDS.ADULT) return false;
  return true;
}
