export type ClientCommercialStatus =
  | 'CURRENT'
  | 'PAYMENT_PENDING'
  | 'FOLLOW_UP'
  | 'SUSPENDED';

export type CommercialStatusLabel =
  | 'Al día'
  | 'Pago pendiente'
  | 'En seguimiento'
  | 'Suspendido';

export const commercialStatusLabels: Record<
  ClientCommercialStatus,
  CommercialStatusLabel
> = {
  CURRENT: 'Al día',
  FOLLOW_UP: 'En seguimiento',
  PAYMENT_PENDING: 'Pago pendiente',
  SUSPENDED: 'Suspendido',
};

export const commercialStatusOptions = [
  { label: commercialStatusLabels.CURRENT, value: 'CURRENT' },
  { label: commercialStatusLabels.PAYMENT_PENDING, value: 'PAYMENT_PENDING' },
  { label: commercialStatusLabels.FOLLOW_UP, value: 'FOLLOW_UP' },
  { label: commercialStatusLabels.SUSPENDED, value: 'SUSPENDED' },
] satisfies Array<{
  label: CommercialStatusLabel;
  value: ClientCommercialStatus;
}>;

export function getCommercialStatusLabel(status: ClientCommercialStatus) {
  return commercialStatusLabels[status];
}

export function parseCommercialStatus(
  value: FormDataEntryValue | null,
): ClientCommercialStatus {
  const status = String(value ?? 'CURRENT');

  if (
    status === 'CURRENT' ||
    status === 'PAYMENT_PENDING' ||
    status === 'FOLLOW_UP' ||
    status === 'SUSPENDED'
  ) {
    return status;
  }

  return 'CURRENT';
}
