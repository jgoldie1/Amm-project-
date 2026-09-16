export type CountryOpportunityConfig = {
  countryCode: string;
  employmentRulesVerified: boolean;
  paymentProvidersVerified: boolean;
  telecomProvidersVerified: boolean;
  credentialRulesVerified: boolean;
  taxRulesVerified: boolean;
  localizationVerified: boolean;
};

export const COUNTRY_LOCALIZATION_GATE = {
  usTemplateMayNotBeAssumedGlobally: true,
  localEmploymentRulesRequired: true,
  localPaymentProviderRulesRequired: true,
  localTelecomRulesRequired: true,
  localCredentialRulesRequired: true,
  localTaxRulesRequired: true,
  languageAndAccessibilityLocalizationRequired: true,
  activationRequiresVerifiedConfig: true,
} as const;
