export type LedgerKind = 'STREET_CREDIT' | 'REWARD' | 'PAYABLE';
export type CompetitionKind = 'RACE' | 'BASKETBALL' | 'FOOTBALL' | 'SOCCER' | 'BASEBALL' | 'TRACK' | 'GOLF' | 'BOWLING' | 'ESPORTS' | 'HOLOSPORT';

export type PrizePlacement = { place: 1 | 2 | 3; amountCents: number };

export interface CompetitionRules {
  id: string;
  title: string;
  kind: CompetitionKind;
  entryStreetCredits?: number;
  cashEntryCents?: number;
  prizePoolCents?: number;
  sponsorFunded?: boolean;
  playerFundedCashEnabled?: boolean;
  minPlayers: number;
  maxPlayers: number;
  ageGate: number;
  jurisdictionAllowList?: string[];
  placements: PrizePlacement[];
}

export interface PlayerEligibility {
  playerId: string;
  age: number;
  jurisdiction?: string;
  streetCreditBalance: number;
  cashCompetitionApproved: boolean;
  antiCheatEligible: boolean;
}

export interface MarketItem {
  id: string;
  ownerId: string;
  title: string;
  category: 'HOME' | 'SPORTS' | 'VEHICLE' | 'CREATOR' | 'OTHER';
  transferable: boolean;
  resaleStreetCredits: number;
}

export interface CompetitionResult {
  competitionId: string;
  playerId: string;
  place: number;
  score: number;
  verified: boolean;
}

export const economyGuardrails = Object.freeze({
  spectatorBettingEnabled: false,
  streetCreditCashConvertible: false,
  cashPayoutRequiresServerVerification: true,
  realMoneyCompetitionsRequireJurisdictionApproval: true,
  playerFundedCashDefaultEnabled: false,
});

export function validateCompetitionRules(rules: CompetitionRules): string[] {
  const errors: string[] = [];
  if (rules.minPlayers < 2) errors.push('minPlayers must be at least 2');
  if (rules.maxPlayers < rules.minPlayers) errors.push('maxPlayers must be >= minPlayers');
  if (rules.placements.some((p) => p.amountCents < 0)) errors.push('prizes cannot be negative');
  if (rules.playerFundedCashEnabled && !rules.jurisdictionAllowList?.length) {
    errors.push('player-funded cash competition requires jurisdiction allow-list');
  }
  return errors;
}

export function canEnterCompetition(player: PlayerEligibility, rules: CompetitionRules) {
  const ruleErrors = validateCompetitionRules(rules);
  if (ruleErrors.length) return { ok: false, reason: ruleErrors.join('; ') };
  if (!player.antiCheatEligible) return { ok: false, reason: 'anti-cheat eligibility required' };
  if (player.age < rules.ageGate) return { ok: false, reason: 'age gate not met' };
  if ((rules.entryStreetCredits ?? 0) > player.streetCreditBalance) {
    return { ok: false, reason: 'insufficient StreetCredit' };
  }
  if ((rules.cashEntryCents ?? 0) > 0) {
    if (!player.cashCompetitionApproved) return { ok: false, reason: 'cash competition approval required' };
    if (!player.jurisdiction) return { ok: false, reason: 'jurisdiction required' };
    if (!rules.jurisdictionAllowList?.includes(player.jurisdiction)) {
      return { ok: false, reason: 'cash competition unavailable in jurisdiction' };
    }
  }
  return { ok: true };
}

export function calculateVerifiedPrizes(rules: CompetitionRules, results: CompetitionResult[]) {
  const verified = results.filter((r) => r.verified && r.place >= 1 && r.place <= 3);
  return verified.flatMap((result) => {
    const prize = rules.placements.find((p) => p.place === result.place);
    return prize ? [{ playerId: result.playerId, ledger: 'PAYABLE' as LedgerKind, amountCents: prize.amountCents }] : [];
  });
}

export function quoteStreetVerseExchange(item: MarketItem, platformFeeBps = 500) {
  if (!item.transferable) return { eligible: false, reason: 'item is not transferable' };
  const fee = Math.floor((item.resaleStreetCredits * platformFeeBps) / 10_000);
  return {
    eligible: true,
    grossStreetCredits: item.resaleStreetCredits,
    platformFeeStreetCredits: fee,
    sellerStreetCredits: item.resaleStreetCredits - fee,
    ledger: 'STREET_CREDIT' as LedgerKind,
  };
}

export const careerLoop = [
  'PLAY',
  'WORK',
  'EARN_STREET_CREDIT',
  'BUY_OR_TRADE',
  'CUSTOMIZE_HOME_OR_GEAR',
  'TRAIN',
  'COMPETE',
  'BUILD_REPUTATION',
  'JOIN_OR_OWN_TEAM',
  'ATTRACT_SPONSORS',
  'CREATE_CONTENT',
  'EARN_AGAIN',
] as const;
