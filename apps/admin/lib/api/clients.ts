import { goowinApiFetch } from './goowin-api';

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

export type Client = {
  id: string;
  name: string;
  legalName: string | null;
  taxId: string | null;
  billingEmail: string | null;
  phone: string | null;
  commercialStatus: ClientCommercialStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateClientPayload = {
  name: string;
  commercialStatus?: ClientCommercialStatus;
  taxId?: string;
};

export type UpdateClientPayload = {
  name?: string;
  taxId?: string;
};

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

export function getClients() {
  return goowinApiFetch<Client[]>('/clients');
}

export function getClient(id: string) {
  return goowinApiFetch<Client>(`/clients/${id}`);
}

export function createClient(payload: CreateClientPayload) {
  return goowinApiFetch<Client>('/clients', {
    body: payload,
    method: 'POST',
  });
}

export function updateClient(id: string, payload: UpdateClientPayload) {
  return goowinApiFetch<Client>(`/clients/${id}`, {
    body: payload,
    method: 'PATCH',
  });
}

export function changeClientCommercialStatus(
  id: string,
  commercialStatus: ClientCommercialStatus,
) {
  return goowinApiFetch<Client>(`/clients/${id}/commercial-status`, {
    body: {
      commercialStatus,
    },
    method: 'PATCH',
  });
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
