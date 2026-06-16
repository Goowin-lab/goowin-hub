import { goowinApiFetch } from './goowin-api';

export type GoogleAdsStatus = 'ACTIVE' | 'LOW_BALANCE' | 'NO_BALANCE' | 'PAUSED';

export type GoogleAdsAccount = {
  id: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  accountName: string;
  customerId: string | null;
  status: GoogleAdsStatus;
  currencyCode: string;
  balance: string;
  totalTopUps: string;
  totalConsumptions: string;
  lastTopUpAt: string | null;
  lastTopUpAmount: string | null;
  lastConsumptionAt: string | null;
  lastConsumptionAmount: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateGoogleAdsAccountPayload = {
  accountName: string;
  clientId: string;
  currencyCode?: string;
  customerId?: string;
  notes?: string;
  status?: GoogleAdsStatus;
};

export type CreateGoogleAdsTopUpPayload = {
  amount: string;
  notes?: string;
  reference?: string;
  toppedUpAt?: string;
};

export type CreateGoogleAdsConsumptionPayload = {
  amount: string;
  consumedAt?: string;
  notes?: string;
};

export const googleAdsStatusLabels: Record<GoogleAdsStatus, string> = {
  ACTIVE: 'Activo',
  LOW_BALANCE: 'Saldo bajo',
  NO_BALANCE: 'Sin saldo',
  PAUSED: 'Pausado',
};

export const googleAdsStatusOptions = [
  { label: googleAdsStatusLabels.ACTIVE, value: 'ACTIVE' },
  { label: googleAdsStatusLabels.LOW_BALANCE, value: 'LOW_BALANCE' },
  { label: googleAdsStatusLabels.NO_BALANCE, value: 'NO_BALANCE' },
  { label: googleAdsStatusLabels.PAUSED, value: 'PAUSED' },
] satisfies Array<{
  label: string;
  value: GoogleAdsStatus;
}>;

export function getGoogleAdsAccounts() {
  return goowinApiFetch<GoogleAdsAccount[]>('/google-ads/accounts');
}

export function createGoogleAdsAccount(
  payload: CreateGoogleAdsAccountPayload,
) {
  return goowinApiFetch<GoogleAdsAccount>('/google-ads/accounts', {
    body: payload,
    method: 'POST',
  });
}

export function createGoogleAdsTopUp(
  accountId: string,
  payload: CreateGoogleAdsTopUpPayload,
) {
  return goowinApiFetch(`/google-ads/accounts/${accountId}/top-ups`, {
    body: payload,
    method: 'POST',
  });
}

export function createGoogleAdsConsumption(
  accountId: string,
  payload: CreateGoogleAdsConsumptionPayload,
) {
  return goowinApiFetch(`/google-ads/accounts/${accountId}/consumptions`, {
    body: payload,
    method: 'POST',
  });
}

export function parseGoogleAdsStatus(
  value: FormDataEntryValue | null,
): GoogleAdsStatus {
  const status = String(value ?? 'ACTIVE');

  if (
    status === 'ACTIVE' ||
    status === 'LOW_BALANCE' ||
    status === 'NO_BALANCE' ||
    status === 'PAUSED'
  ) {
    return status;
  }

  return 'ACTIVE';
}
