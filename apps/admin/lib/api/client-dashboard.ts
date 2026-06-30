import { goowinPublicApiFetch } from './goowin-api';

export type ClientDashboardAccountStatus = 'CURRENT' | 'PAYMENT_PENDING';

export type ClientDashboardSummary = {
  activeServices: number;
  upcomingRenewals: number;
  pendingInvoices: number;
  googleAdsBalance: string;
  notifications: number;
  accountStatus: ClientDashboardAccountStatus;
};

export type ClientDashboardActivity = {
  id: string;
  title: string;
  description: string | null;
  occurredAt: string | null;
  type:
    | 'GOOGLE_ADS_TOP_UP'
    | 'GOOGLE_ADS_MOVEMENT'
    | 'CAMPAIGN_UPDATED'
    | 'PAYMENT_APPLIED'
    | 'RENEWAL_COMPLETED'
    | 'TEMP';
  amount: string | null;
  isTemporary: boolean;
};

export type ClientDashboardService = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  metricLabel: string | null;
  metricValue: string | null;
  href: string | null;
  isAvailable: boolean;
  isTemporary: boolean;
};

export type DevelopmentClientReference = {
  id: string;
  name: string;
};

export type DevelopmentClientDashboardPayload = {
  client: DevelopmentClientReference | null;
  summary: ClientDashboardSummary | null;
  recentActivity: ClientDashboardActivity[];
  services: ClientDashboardService[];
};

export function getDevelopmentClientDashboard(clientId?: string | null) {
  return goowinPublicApiFetch<DevelopmentClientDashboardPayload>(
    `/dev/client/dashboard${buildClientIdQuery(clientId)}`,
  );
}

function buildClientIdQuery(clientId?: string | null) {
  if (!clientId) {
    return '';
  }

  return `?clientId=${encodeURIComponent(clientId)}`;
}
