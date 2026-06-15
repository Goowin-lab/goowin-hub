import {
  BillingCycle,
  ServiceTechnicalStatus,
  ServiceType,
} from '@prisma/client';

export const manageableServiceTypeValues = [
  ServiceType.DOMAIN,
  ServiceType.HOSTING,
  ServiceType.SEO,
  ServiceType.GOOGLE_ADS,
  ServiceType.LICENSE,
] as const;

export const manageableServiceStatusValues = [
  ServiceTechnicalStatus.ACTIVE,
  ServiceTechnicalStatus.SUSPENDED,
  ServiceTechnicalStatus.CANCELLED,
  ServiceTechnicalStatus.EXPIRED,
] as const;

export const manageableBillingCycleValues = [
  BillingCycle.MONTHLY,
  BillingCycle.QUARTERLY,
  BillingCycle.SEMIANNUAL,
  BillingCycle.ANNUAL,
  BillingCycle.ONE_TIME,
] as const;
