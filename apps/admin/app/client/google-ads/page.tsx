import Link from 'next/link';
import {
  ArrowUpRight,
  BarChart3,
  CircleDollarSign,
  CreditCard,
  Megaphone,
  MousePointerClick,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getDevelopmentClientGoogleAds,
  googleAdsStatusLabels,
} from '@/lib/api/google-ads';
import type {
  ClientGoogleAdsAccount,
  ClientGoogleAdsSummary,
  DevelopmentClientReference,
} from '@/lib/api/google-ads';
import { getApiErrorType } from '@/lib/api/goowin-api';
import {
  formatCurrency,
  formatDate,
  getConfiguredDevelopmentClientId,
  statusVariant,
} from './view-utils';

export const dynamic = 'force-dynamic';

export default async function ClientGoogleAdsPage() {
  const { accounts, client, error, summary } = await loadClientGoogleAdsData();

  return (
    <ClientShell
      title="Google Ads"
      description="Tus campañas publicitarias y saldo disponible."
    >
      {error ? (
        <ClientNotice message="No pudimos cargar tus campañas en este momento." />
      ) : null}

      {!client ? (
        <EmptyState message="No hay cliente disponible para esta vista." />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <MetricCard
              icon={WalletCards}
              label="Saldo disponible"
              value={formatCurrency(summary?.balance ?? 0)}
            />
            <MetricCard
              icon={BarChart3}
              label="Conversiones del mes"
              value={String(summary?.monthConversions ?? 0)}
            />
            <MetricCard
              icon={MousePointerClick}
              label="Clicks del mes"
              value={String(summary?.monthClicks ?? 0)}
            />
            <MetricCard
              icon={CircleDollarSign}
              label="Consumo del mes"
              value={formatCurrency(summary?.monthConsumption ?? 0)}
            />
            <MetricCard
              icon={CreditCard}
              label="Recargas del mes"
              value={formatCurrency(summary?.monthTopUps ?? 0)}
            />
            <MetricCard
              icon={Megaphone}
              label="Cuentas activas"
              value={String(summary?.activeAccounts ?? 0)}
            />
          </section>

          <Card className="mt-6">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Campañas</CardTitle>
                <CardDescription>{client.name}</CardDescription>
              </div>
              <Badge variant="secondary">
                {accounts.length} {accounts.length === 1 ? 'cuenta' : 'cuentas'}
              </Badge>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cuenta</TableHead>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Conversiones</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Último movimiento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Detalle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <CampaignRow key={account.id} account={account} />
                  ))}

                  {accounts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        className="py-10 text-center text-sm font-semibold text-muted-foreground"
                        colSpan={8}
                      >
                        No hay campañas Google Ads registradas.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </ClientShell>
  );
}

async function loadClientGoogleAdsData(): Promise<{
  accounts: ClientGoogleAdsAccount[];
  client: DevelopmentClientReference | null;
  error?: 'api' | 'connection';
  summary: ClientGoogleAdsSummary | null;
}> {
  try {
    const { accounts, client, summary } = await getDevelopmentClientGoogleAds(
      getConfiguredDevelopmentClientId(),
    );

    return {
      accounts,
      client,
      summary,
    };
  } catch (error) {
    return {
      accounts: [],
      client: null,
      error: await getApiErrorType(error),
      summary: null,
    };
  }
}

function CampaignRow({ account }: { account: ClientGoogleAdsAccount }) {
  return (
    <TableRow>
      <TableCell>
        <p className="font-bold">{account.accountName}</p>
      </TableCell>
      <TableCell className="font-medium text-muted-foreground">
        {account.customerId ?? 'Sin registro'}
      </TableCell>
      <TableCell className="font-bold">
        {formatCurrency(account.balance)}
      </TableCell>
      <TableCell className="font-medium text-muted-foreground">
        {account.conversions}
      </TableCell>
      <TableCell className="font-medium text-muted-foreground">
        {account.clicks}
      </TableCell>
      <TableCell className="font-medium text-muted-foreground">
        {formatDate(account.latestMovementDate)}
      </TableCell>
      <TableCell>
        <Badge variant={statusVariant[account.status]}>
          {googleAdsStatusLabels[account.status]}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href={`/client/google-ads/${account.id}`}>
            Ver detalle
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
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
