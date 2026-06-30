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
  DevelopmentClientReference,
  getDevelopmentClientDashboard,
} from '@/lib/api/client-dashboard';
import { getApiErrorType } from '@/lib/api/goowin-api';

export const dynamic = 'force-dynamic';

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  currency: 'COP',
  maximumFractionDigits: 0,
  style: 'currency',
});

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
});

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
  const { client, dashboard, error } = await loadClientDashboardData();

  return (
    <ClientShell
      title="Bienvenido"
      description="Aquí puedes consultar el estado general de tus servicios."
    >
      {error ? (
        <ClientNotice message="No pudimos cargar tu dashboard en este momento." />
      ) : null}

      {!client || !dashboard ? (
        <EmptyState message="No hay cliente disponible para este dashboard." />
      ) : (
        <div className="space-y-10">
          <section>
            <SectionHeading
              title="Estado General"
              description={client.name}
            />
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <SummaryCard
                icon={Layers3}
                label="Servicios activos"
                value={String(dashboard.summary.activeServices)}
              />
              <SummaryCard
                icon={CalendarClock}
                label="Próximos vencimientos"
                value={String(dashboard.summary.upcomingRenewals)}
              />
              <SummaryCard
                icon={CreditCard}
                label="Facturas pendientes"
                value={String(dashboard.summary.pendingInvoices)}
              />
              <SummaryCard
                description="Saldo disponible"
                icon={WalletCards}
                label="Google Ads"
                value={formatCurrency(dashboard.summary.googleAdsBalance)}
              />
              <SummaryCard
                icon={Bell}
                label="Notificaciones"
                value={String(dashboard.summary.notifications)}
              />
              <SummaryCard icon={ShieldCheck} label="Estado general">
                <Badge
                  variant={
                    dashboard.summary.accountStatus === 'CURRENT'
                      ? 'success'
                      : 'warning'
                  }
                  className="w-fit px-3 py-1 text-sm"
                >
                  {dashboard.summary.accountStatus === 'CURRENT'
                    ? 'Cuenta al día'
                    : 'Pendiente de pago'}
                </Badge>
              </SummaryCard>
            </div>
          </section>

          <section>
            <SectionHeading title="Accesos rápidos" />
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {quickAccessItems.map((item) => (
                <QuickAccessCard key={item.title} item={item} />
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
            <div>
              <SectionHeading title="Actividad reciente" />
              <Card className="mt-5">
                <CardContent className="p-5">
                  <div className="space-y-4">
                    {dashboard.recentActivity.slice(0, 5).map((activity) => (
                      <ActivityItem
                        activity={activity}
                        key={activity.id}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <SectionHeading title="Servicios contratados" />
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {dashboard.services.map((service) => (
                  <ContractedServiceCard
                    key={service.id}
                    service={service}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </ClientShell>
  );
}

async function loadClientDashboardData(): Promise<{
  client: DevelopmentClientReference | null;
  dashboard: ClientDashboardData | null;
  error?: 'api' | 'connection';
}> {
  try {
    const payload = await getDevelopmentClientDashboard(
      getConfiguredDevelopmentClientId(),
    );

    return {
      client: payload.client,
      dashboard: payload.summary
        ? {
            recentActivity: payload.recentActivity,
            services: payload.services,
            summary: payload.summary,
          }
        : null,
    };
  } catch (error) {
    return {
      client: null,
      dashboard: null,
      error: await getApiErrorType(error),
    };
  }
}

function SectionHeading({
  description,
  title,
}: {
  description?: string;
  title: string;
}) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold tracking-normal text-goowin-text">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

function SummaryCard({
  children,
  description,
  icon: Icon,
  label,
  value,
}: {
  children?: React.ReactNode;
  description?: string;
  icon: LucideIcon;
  label: string;
  value?: string;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-[156px] flex-col justify-between p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-goowin-text">{label}</p>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-blue-50 text-goowin-blue">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <div className="pt-8">
          {children ?? (
            <p className="truncate text-3xl font-black tracking-normal text-goowin-text">
              {value}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAccessCard({ item }: { item: QuickAccessItem }) {
  const Icon = item.icon;

  return (
    <Card className="transition-colors hover:border-blue-100">
      <CardHeader className="pb-4">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-md bg-blue-50 text-goowin-blue">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <CardTitle>{item.title}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {item.href ? (
          <Button asChild className="gap-2">
            <Link href={item.href}>
              Abrir
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button disabled variant="secondary">
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
      <CardContent className="flex min-h-[118px] items-center justify-between gap-4 p-5">
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
              {service.metricLabel}: <strong>{formatCurrency(service.metricValue)}</strong>
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

function formatCurrency(value: string | number | null) {
  return currencyFormatter.format(Number(value ?? 0));
}

function formatActivityDate(value: string | null) {
  if (!value) {
    return 'TEMP';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Ahora';
  }

  return dateFormatter.format(date);
}

function getConfiguredDevelopmentClientId() {
  // TODO(client-auth): replace this temporary/dev value with the authenticated clientId.
  return process.env.NEXT_PUBLIC_DEV_CLIENT_ID ?? null;
}
