import { goowinApiFetch } from './goowin-api';
import type { ClientCommercialStatus } from '@/lib/client-status';

export {
  commercialStatusLabels,
  commercialStatusOptions,
  getCommercialStatusLabel,
  parseCommercialStatus,
} from '@/lib/client-status';
export type {
  ClientCommercialStatus,
  CommercialStatusLabel,
} from '@/lib/client-status';

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
