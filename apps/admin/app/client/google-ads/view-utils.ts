import type { GoogleAdsStatus } from '@/lib/api/google-ads';

export const currencyFormatter = new Intl.NumberFormat('es-CO', {
  currency: 'COP',
  maximumFractionDigits: 0,
  style: 'currency',
});

export const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
  year: 'numeric',
});

export const statusVariant: Record<
  GoogleAdsStatus,
  'success' | 'warning' | 'neutral' | 'destructive'
> = {
  ACTIVE: 'success',
  LOW_BALANCE: 'warning',
  NO_BALANCE: 'destructive',
  PAUSED: 'neutral',
};

export function formatCurrency(value: string | number | null) {
  return currencyFormatter.format(Number(value ?? 0));
}

export function formatDate(value: string | null) {
  if (!value) {
    return 'Sin registro';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
}

export function getConfiguredDevelopmentClientId() {
  // TODO(client-auth): replace this temporary/dev value with the authenticated clientId.
  return process.env.NEXT_PUBLIC_DEV_CLIENT_ID ?? null;
}
