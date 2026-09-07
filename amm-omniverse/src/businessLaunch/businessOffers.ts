export type OfferStatus = 'LIVE' | 'READY' | 'BUILDING' | 'LOCKED' | 'COMING_SOON';

export type BusinessOffer = {
  id: string;
  name: string;
  priceCents: number;
  cadence: 'one_time' | 'monthly' | 'weekly';
  status: OfferStatus;
  headline: string;
  includes: string[];
  cta: string;
};

export const BUSINESS_OFFERS: BusinessOffer[] = [
  {
    id: 'free-listing', name: 'Free Listing', priceCents: 0, cadence: 'one_time', status: 'READY',
    headline: 'Get discovered inside the TRYAMM Global Business Network.',
    includes: ['Business profile', 'Business Passport starter record', 'Network discovery eligibility'], cta: 'Join Free',
  },
  {
    id: 'business-plus', name: 'Business+', priceCents: 2900, cadence: 'monthly', status: 'READY',
    headline: 'Upgrade your business presence and discovery tools.',
    includes: ['Enhanced business profile', 'Business Vault access', 'Expanded discovery tools'], cta: 'Start Business+',
  },
  {
    id: 'business-pass', name: 'Business Pass', priceCents: 14900, cadence: 'monthly', status: 'READY',
    headline: 'Stay connected to TRYAMM business services after launch.',
    includes: ['Business Vault', 'LaunchCare workflow', 'Business Passport', 'Eligible TRYAMM revenue surfaces'], cta: 'Get Business Pass',
  },
  {
    id: 'preview', name: 'Business Preview', priceCents: 49900, cadence: 'one_time', status: 'READY',
    headline: 'See your business transformed into a TRYAMM-ready digital experience.',
    includes: ['Scope session', 'Branded preview', 'LaunchReady review', 'Upgrade path to Experience'], cta: 'Order Preview',
  },
  {
    id: 'experience', name: 'Business Experience', priceCents: 125000, cadence: 'one_time', status: 'READY',
    headline: 'Turn your brand into an interactive customer experience.',
    includes: ['Interactive branded experience', 'Commerce-ready structure', 'Media and discovery integration', 'LaunchReady review'], cta: 'Build My Experience',
  },
  {
    id: 'digital-twin', name: 'Digital Twin', priceCents: 250000, cadence: 'one_time', status: 'READY',
    headline: 'Build a premium digital representation of your real business.',
    includes: ['Business Digital Twin', 'Business Passport connection', 'Business Vault', 'Cross-surface integration plan', 'LaunchReady review'], cta: 'Build My Digital Twin',
  },
  {
    id: 'sponsored-discovery', name: 'Sponsored Discovery', priceCents: 4900, cadence: 'weekly', status: 'READY',
    headline: 'Put your business in front of more TRYAMM customers.',
    includes: ['Sponsored discovery placement', 'Campaign tracking'], cta: 'Boost My Business',
  },
];

export const BUSINESS_FULFILLMENT_FLOW = [
  'ORDER', 'SCOPE_LOCK', 'ASSETS', 'BUILD', 'QA', 'CUSTOMER_REVIEW',
  'LAUNCHREADY_TEST', 'ACCEPTANCE', 'LAUNCH', 'LAUNCHCARE',
] as const;

export const LAUNCH_VERTICALS = [
  'Food & Hospitality', 'Beauty & Wellness', 'Retail & Products',
  'Professional Services', 'Creators & Entertainment', 'Real Estate & Local Services',
] as const;

export const FREE_SHOWCASE_SLOTS = 3;

export function formatOfferPrice(offer: BusinessOffer): string {
  if (offer.priceCents === 0) return 'Free';
  const amount = `$${(offer.priceCents / 100).toLocaleString('en-US')}`;
  if (offer.cadence === 'monthly') return `${amount}/month`;
  if (offer.cadence === 'weekly') return `${amount}+/week`;
  return amount;
}
