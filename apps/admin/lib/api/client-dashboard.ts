import { goowinPublicApiFetch } from './goowin-api';
import {
  getDevelopmentClientGoogleAds,
  type DevelopmentClientGoogleAdsPayload,
} from './google-ads';

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

export async function getDevelopmentClientDashboard(clientId?: string | null) {
  const googleAdsPayload = await getDevelopmentClientGoogleAds(clientId);

  if (!googleAdsPayload.client) {
    return toDashboardFallbackPayload(googleAdsPayload);
  }

  try {
    const dashboardPayload =
      await goowinPublicApiFetch<DevelopmentClientDashboardPayload>(
        `/dev/client/dashboard${buildClientIdQuery(clientId)}`,
      );

    if (dashboardPayload.client && dashboardPayload.summary) {
      return dashboardPayload;
    }
  } catch {
    // TODO(client-auth): remove this temporary fallback when real client login provides clientId.
  }

  return toDashboardFallbackPayload(googleAdsPayload);
}

function buildClientIdQuery(clientId?: string | null) {
  if (!clientId) {
    return '';
  }

  return `?clientId=${encodeURIComponent(clientId)}`;
}

function toDashboardFallbackPayload(
  googleAdsPayload: DevelopmentClientGoogleAdsPayload,
): DevelopmentClientDashboardPayload {
  const googleAdsBalance = googleAdsPayload.summary?.balance ?? '0';
  const activeAccounts = googleAdsPayload.summary?.activeAccounts ?? 0;
  const recentActivity = buildRecentActivityFallback(googleAdsPayload);

  return {
    client: googleAdsPayload.client,
    recentActivity,
    services: [
      {
        description: 'Billetera publicitaria',
        href: '/client/google-ads',
        id: 'google-ads',
        isAvailable: true,
        isTemporary: false,
        metricLabel: 'Saldo',
        metricValue: googleAdsBalance,
        name: 'Google Ads',
        status: activeAccounts > 0 ? 'Activo' : 'Sin cuentas',
      },
      {
        description: null,
        href: null,
        id: 'website',
        isAvailable: false,
        isTemporary: true,
        metricLabel: null,
        metricValue: null,
        name: 'Sitio Web',
        status: 'Próximamente',
      },
      {
        description: null,
        href: null,
        id: 'hosting',
        isAvailable: false,
        isTemporary: true,
        metricLabel: null,
        metricValue: null,
        name: 'Hosting',
        status: 'Próximamente',
      },
      {
        description: null,
        href: null,
        id: 'seo',
        isAvailable: false,
        isTemporary: true,
        metricLabel: null,
        metricValue: null,
        name: 'SEO',
        status: 'Próximamente',
      },
    ],
    summary: {
      accountStatus: 'CURRENT',
      activeServices: activeAccounts,
      googleAdsBalance,
      notifications: 0,
      pendingInvoices: 0,
      upcomingRenewals: 0,
    },
  };
}

function buildRecentActivityFallback(
  googleAdsPayload: DevelopmentClientGoogleAdsPayload,
): ClientDashboardActivity[] {
  const latestAccounts = googleAdsPayload.accounts
    .filter((account) => account.latestMovementDate)
    .slice(0, 5);

  if (latestAccounts.length > 0) {
    return latestAccounts.map((account) => ({
      amount: account.balance,
      description: account.accountName,
      id: `google-ads-account-${account.id}`,
      isTemporary: false,
      occurredAt: account.latestMovementDate,
      title: 'Movimiento Google Ads registrado',
      type: 'GOOGLE_ADS_MOVEMENT',
    }));
  }

  return [
    'Recarga Google Ads recibida',
    'Movimiento Google Ads registrado',
    'Campaña actualizada',
    'Pago aplicado',
    'Renovación realizada',
  ].map((title, index) => ({
    amount: null,
    description:
      'Placeholder temporal hasta conectar el historial visible del cliente.',
    id: `temp-activity-${index + 1}`,
    isTemporary: true,
    occurredAt: null,
    title: `TEMP - ${title}`,
    type: 'TEMP',
  }));
}
