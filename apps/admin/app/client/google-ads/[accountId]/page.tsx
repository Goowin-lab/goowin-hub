import {
  BarChart3,
  CircleDollarSign,
  CreditCard,
  MousePointerClick,
  WalletCards,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { ClientShell } from '@/components/client/client-shell';
import { Badge } from '@/components/ui/badge';
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
  getClientGoogleAdsAccountDetail,
  googleAdsStatusLabels,
} from '@/lib/api/google-ads';
import type { ClientGoogleAdsAccountDetail } from '@/lib/api/google-ads';
import { getApiErrorType } from '@/lib/api/goowin-api';
import {
  formatCurrency,
  formatDate,
  getTemporaryClientForGoogleAds,
  statusVariant,
} from '../view-utils';

export const dynamic = 'force-dynamic';

type ClientGoogleAdsDetailPageProps = {
  params: {
    accountId: string;
  };
};

export default async function ClientGoogleAdsDetailPage({
  params,
}: ClientGoogleAdsDetailPageProps) {
  const { detail, error } = await loadClientGoogleAdsDetail(params.accountId);

  return (
    <ClientShell
      title={detail?.accountName ?? 'Google Ads'}
      description="Tus campañas publicitarias y saldo disponible."
      backHref="/client/google-ads"
    >
      {error ? (
        <ClientNotice message="No pudimos cargar el detalle de esta cuenta." />
      ) : null}

      {!detail ? (
        <EmptyState message="No hay detalle disponible para esta cuenta." />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              icon={WalletCards}
              label="Saldo disponible"
              value={formatCurrency(detail.balance)}
            />
            <MetricCard
              icon={BarChart3}
              label="Conversiones"
              value={String(detail.conversions)}
            />
            <MetricCard
              icon={MousePointerClick}
              label="Clicks"
              value={String(detail.clicks)}
            />
            <MetricCard
              icon={CircleDollarSign}
              label="Consumo"
              value={formatCurrency(detail.consumption)}
            />
            <MetricCard
              icon={CreditCard}
              label="Recargas"
              value={formatCurrency(detail.topUp)}
            />
          </section>

          <Card className="mt-6">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>{detail.accountName}</CardTitle>
                <CardDescription>
                  {detail.customerId ?? 'Sin Customer ID'}
                </CardDescription>
              </div>
              <Badge variant={statusVariant[detail.status]}>
                {googleAdsStatusLabels[detail.status]}
              </Badge>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Conversiones</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>CPC</TableHead>
                    <TableHead>Consumo</TableHead>
                    <TableHead>Recarga</TableHead>
                    <TableHead>Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.movements.map((movement) => (
                    <TableRow key={movement.movementDate}>
                      <TableCell className="font-medium">
                        {formatDate(movement.movementDate)}
                      </TableCell>
                      <TableCell>{movement.conversions}</TableCell>
                      <TableCell>{movement.clicks}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(movement.cpc)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(movement.consumption)}
                      </TableCell>
                      <TableCell>{formatCurrency(movement.topUp)}</TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(movement.balance)}
                      </TableCell>
                    </TableRow>
                  ))}

                  {detail.movements.length === 0 ? (
                    <TableRow>
                      <TableCell
                        className="py-10 text-center text-sm font-semibold text-muted-foreground"
                        colSpan={7}
                      >
                        No hay movimientos diarios registrados.
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

async function loadClientGoogleAdsDetail(
  accountId: string,
): Promise<{
  detail: ClientGoogleAdsAccountDetail | null;
  error?: 'api' | 'connection';
}> {
  try {
    const client = await getTemporaryClientForGoogleAds();

    if (!client) {
      return {
        detail: null,
      };
    }

    return {
      detail: await getClientGoogleAdsAccountDetail(client.id, accountId),
    };
  } catch (error) {
    return {
      detail: null,
      error: await getApiErrorType(error),
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
