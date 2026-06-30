import Link from 'next/link';
import {
  ArrowUpRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Globe2,
  Layers3,
  LifeBuoy,
  Megaphone,
  Receipt,
  RefreshCcw,
  Search,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { ClientShell } from '@/components/client/client-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ClientDashboardActivity,
  ClientDashboardService,
  ClientDashboardSummary,
  getClientDashboard,
} from '@/lib/api/client-dashboard';
import { getApiErrorType } from '@/lib/api/goowin-api';
import { requireClientSession } from '@/lib/auth/server';
import { formatCurrency, formatDate } from '../google-ads/view-utils';

export const dynamic = 'force-dynamic';

type ClientDashboardData = {
  recentActivity: ClientDashboardActivity[];
  services: ClientDashboardService[];
  summary: ClientDashboardSummary;
};

type QuickAccessItem = {
  description: string;
  href?: string;
  icon: LucideIcon;
  title: string;
};

const quickAccessItems: QuickAccessItem[] = [
  {
    description: 'Consulta campañas y saldo.',
    href: '/client/google-ads',
    icon: Megaphone,
    title: 'Google Ads',
  },
  {
    description: 'Consulta renovaciones.',
    icon: Globe2,
    title: 'Dominios y Hosting',
  },
  {
    description: 'Consulta informes mensuales.',
    icon: Search,
    title: 'SEO',
  },
  {
    description: 'Consulta facturas y pagos.',
    icon: Receipt,
    title: 'Facturación',
  },
  {
    description: 'Servicios próximos a vencer.',
    icon: RefreshCcw,
    title: 'Renovaciones',
  },
  {
    description: 'Abre tickets y contacta Goowin.',
    icon: LifeBuoy,
    title: 'Soporte',
  },
];

export default async function ClientDashboardPage() {
  const { dashboard, error, hasSession } = await loadClientDashboardData();

  return (
    <ClientShell
      title="Bienvenido"
      description="Aquí puedes consultar el estado general de tus servicios."
    >
      {error ? (
        <ClientNotice message="No pudimos cargar tu dashboard en este momento." />
      ) : null}

      {!hasSession ? (
        <EmptyState message="No hay sesión de cliente disponible." />
      ) : !dashboard ? (
        <EmptyState message="No hay datos disponibles para este dashboard." />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <MetricCard
              icon={Layers3}
              label="Servicios activos"
              value={String(dashboard.summary.activeServices)}
            />
            <MetricCard
              icon={CalendarClock}
              label="Próximos vencimientos"
              value={String(dashboard.summary.upcomingRenewals)}
            />
            <MetricCard
              icon={CreditCard}
              label="Facturas pendientes"
              value={String(dashboard.summary.pendingInvoices)}
            />
            <MetricCard
              icon={WalletCards}
              label="Google Ads"
              value={formatCurrency(dashboard.summary.googleAdsBalance)}
            />
            <MetricCard
              icon={Bell}
              label="Notificaciones"
              value={String(dashboard.summary.notifications)}
            />
            <StatusMetricCard
              accountStatus={dashboard.summary.accountStatus}
              icon={ShieldCheck}
              label="Estado general"
            />
          </section>

          <section className="mt-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Accesos rápidos</CardTitle>
                <CardDescription>Módulos disponibles para tu cuenta.</CardDescription>
              </div>
              <Badge variant="secondary">
                {quickAccessItems.length} módulos
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {quickAccessItems.map((item) => (
                <QuickAccessCard key={item.title} item={item} />
              ))}
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
            <Card>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Actividad reciente</CardTitle>
                  <CardDescription>Últimos movimientos visibles.</CardDescription>
                </div>
                <Badge variant="secondary">
                  {dashboard.recentActivity.slice(0, 5).length} eventos
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard.recentActivity.slice(0, 5).map((activity) => (
                    <ActivityItem activity={activity} key={activity.id} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <div>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Servicios contratados</CardTitle>
                  <CardDescription>Estado general por módulo.</CardDescription>
                </div>
                <Badge variant="secondary">
                  {dashboard.services.length} servicios
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {dashboard.services.map((service) => (
                  <ContractedServiceCard key={service.id} service={service} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </ClientShell>
  );
}

async function loadClientDashboardData(): Promise<{
  dashboard: ClientDashboardData | null;
  error?: 'api' | 'connection';
  hasSession: boolean;
}> {
  const session = requireClientSession();

  if (!session) {
    return {
      dashboard: null,
      hasSession: false,
    };
  }

  try {
    const payload = await getClientDashboard();

    return {
      dashboard: payload.summary
        ? {
            recentActivity: payload.recentActivity,
            services: payload.services,
            summary: payload.summary,
          }
        : null,
      hasSession: true,
    };
  } catch (error) {
    return {
      dashboard: null,
      error: await getApiErrorType(error),
      hasSession: true,
    };
  }
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-[120px] flex-col justify-between p-5">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-blue-50 text-goowin-blue">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 truncate text-2xl font-black tracking-normal text-goowin-text">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusMetricCard({
  accountStatus,
  icon: Icon,
  label,
}: {
  accountStatus: ClientDashboardSummary['accountStatus'];
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-[120px] flex-col justify-between p-5">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-blue-50 text-goowin-blue">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground">
            {label}
          </p>
          <Badge
            variant={accountStatus === 'CURRENT' ? 'success' : 'warning'}
            className="mt-2 w-fit"
          >
            {accountStatus === 'CURRENT'
              ? 'Cuenta al día'
              : 'Pendiente de pago'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAccessCard({ item }: { item: QuickAccessItem }) {
  const Icon = item.icon;

  return (
    <Card>
      <CardHeader>
        <div className="mb-3 grid h-10 w-10 place-items-center rounded-md bg-blue-50 text-goowin-blue">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <CardTitle>{item.title}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {item.href ? (
          <Button asChild size="sm" className="gap-2">
            <Link href={item.href}>
              Abrir
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button disabled size="sm" variant="secondary">
            Próximamente
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityItem({ activity }: { activity: ClientDashboardActivity }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-goowin-text">{activity.title}</p>
          {activity.isTemporary ? (
            <Badge variant="neutral" className="px-2 py-0 text-[11px]">
              TEMP
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {activity.description ?? 'Sin detalle'}
          {activity.amount ? ` · ${formatCurrency(activity.amount)}` : ''}
        </p>
      </div>
      <p className="shrink-0 text-xs font-semibold text-muted-foreground">
        {formatActivityDate(activity.occurredAt)}
      </p>
    </div>
  );
}

function ContractedServiceCard({
  service,
}: {
  service: ClientDashboardService;
}) {
  const isActive = service.status === 'Activo';

  return (
    <Card>
      <CardContent className="flex min-h-[120px] items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-goowin-text">{service.name}</p>
            {service.isTemporary ? (
              <Badge variant="neutral" className="px-2 py-0 text-[11px]">
                TEMP
              </Badge>
            ) : null}
          </div>
          {service.metricValue ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {service.metricLabel}:{' '}
              <strong>{formatCurrency(service.metricValue)}</strong>
            </p>
          ) : (
            <p className="mt-3 text-sm font-semibold text-muted-foreground">
              Próximamente
            </p>
          )}
        </div>
        <Badge variant={isActive ? 'success' : 'neutral'}>
          {service.status}
        </Badge>
      </CardContent>
    </Card>
  );
}

function ClientNotice({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      {message}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center text-sm font-semibold text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  );
}

function formatActivityDate(value: string | null) {
  if (!value) {
    return 'TEMP';
  }

  return formatDate(value);
}
