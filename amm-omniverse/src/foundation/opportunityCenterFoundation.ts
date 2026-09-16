import type { OpportunityLane } from './academyCreatorJobsFoundation';

export type Opportunity = {
  id: string;
  lane: OpportunityLane;
  title: string;
  trainingRequired: boolean;
  externalCredentialRequired: boolean;
  realEmployerOrProviderRequired: boolean;
};

export const OPPORTUNITY_PATHWAYS: readonly Opportunity[] = [
  { id: 'creator-live-pk', lane: 'creator', title: 'LIVE / PK Creator', trainingRequired: true, externalCredentialRequired: false, realEmployerOrProviderRequired: false },
  { id: 'middleverse-support', lane: 'employee', title: 'MiddleVerse Work-From-Home Support', trainingRequired: true, externalCredentialRequired: false, realEmployerOrProviderRequired: true },
  { id: 'business-scout', lane: 'agent', title: 'StreetVerse Business Scout', trainingRequired: true, externalCredentialRequired: false, realEmployerOrProviderRequired: true },
  { id: 'holofon-agent', lane: 'agent', title: 'Holo FON Agent / Dealer', trainingRequired: true, externalCredentialRequired: false, realEmployerOrProviderRequired: true },
  { id: 'all-american-store', lane: 'business-owner', title: 'All American Store Operator', trainingRequired: true, externalCredentialRequired: false, realEmployerOrProviderRequired: true },
  { id: 'beauty-operator', lane: 'business-owner', title: 'All American Beauty Operator', trainingRequired: true, externalCredentialRequired: false, realEmployerOrProviderRequired: true },
  { id: 'yahavah-seller', lane: 'business-owner', title: 'YAHAVAH Food Seller', trainingRequired: true, externalCredentialRequired: false, realEmployerOrProviderRequired: true },
  { id: 'warehouse-delivery', lane: 'employee', title: 'Warehouse / Delivery', trainingRequired: true, externalCredentialRequired: true, realEmployerOrProviderRequired: true },
  { id: 'apprenticeship', lane: 'apprentice', title: 'StreetVerse Apprenticeship', trainingRequired: true, externalCredentialRequired: false, realEmployerOrProviderRequired: true },
  { id: 'mentor', lane: 'mentor', title: 'Academy Mentor', trainingRequired: true, externalCredentialRequired: false, realEmployerOrProviderRequired: true },
] as const;

export const CREATE_MY_BUSINESS_STEPS = [
  'CHOOSE BUSINESS',
  'TRAINING',
  'SKILLS + BUSINESS PASSPORT',
  'TERRITORY',
  'STOREFRONT / SERVICE',
  'PROVIDER + COMPLIANCE GATES',
  'CATALOG / OFFER',
  'HIRING',
  'HOLO ADS + LIVE/PK PROMOTION',
  'FULFILLMENT',
  'SERVER-AUTHORITATIVE PAYMENTS + LEDGER',
  'LAUNCH READINESS',
] as const;

export const HIRE_FROM_STREETVERSE_STEPS = [
  'POST REAL JOB',
  'MATCH VERIFIED SKILLS',
  'INTERVIEW',
  'REQUIRED TRAINING',
  'EMPLOYER DECISION',
  'AUTHORIZED PAYROLL / PROVIDER',
  'RETENTION + OUTCOME EVIDENCE',
] as const;

export const OPPORTUNITY_AUTHORITY = {
  aiMayPromiseEmployment: false,
  aiMayInventWage: false,
  clientMayMarkWorkerPaid: false,
  clientMaySettleCommission: false,
  realEmployerRequiredForRealJob: true,
  authorizedProviderRequiredForRealPayment: true,
  signedAgreementRequiredForCommission: true,
} as const;
