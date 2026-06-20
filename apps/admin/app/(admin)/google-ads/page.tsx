import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Megaphone,
  Settings,
  WalletCards,
} from 'lucide-react';

import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getClients } from '@/lib/api/clients';
import type { Client } from '@/lib/api/clients';
import {
  getGoogleAdsAccounts,
  getGoogleAdsDailyMovements,
  googleAdsStatusLabels,
  googleAdsStatusOptions,
} from '@/lib/api/google-ads';
import type {
  GoogleAdsAccount,
  GoogleAdsDailyMovement,
  GoogleAdsStatus,
} from '@/lib/api/google-ads';
import { getApiErrorType } from '@/lib/api/goowin-api';
import {
  createGoogleAdsAccountAction,
  createGoogleAdsConsumptionAction,
  createGoogleAdsDailyMovementAction,
  createGoogleAdsTopUpAction,
  updateGoogleAdsAccountAction,
} from './actions';

export const dynamic = 'force-dynamic';

type GoogleAdsPageProps = {
  searchParams?: {
    accountCreated?: string;
    accountUpdated?: string;
    consumptionCreated?: string;
    error?: string;
    movementCreated?: string;
    topUpCreated?: string;
  };
};

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  currency: 'COP',
  maximumFractionDigits: 0,
  style: 'currency',
});

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const statusVariant: Record<
  GoogleAdsStatus,
  'success' | 'warning' | 'neutral' | 'destructive'
> = {
  ACTIVE: 'success',
  LOW_BALANCE: 'warning',
  NO_BALANCE: 'destructive',
  PAUSED: 'neutral',
};

export default async function GoogleAdsPage({
  searchParams,
}: GoogleAdsPageProps) {
  const { accounts, clients, error, movements } = await loadGoogleAdsData();
  const notice = getNotice(searchParams, error);
  const summary = getGoogleAdsSummary(accounts);

  return (
    <AdminShell
      title="Google Ads"
      description="Billetera publicitaria por cliente y cuenta."
    >
      {notice ? (
        <div
          className={`mb-4 flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-semibold ${
            notice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          ) : (
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
          )}
          {notice.message}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricCard
          icon={WalletCards}
          label="Saldo disponible"
          value={formatCurrency(summary.availableBalance)}
        />
        <DashboardMetricCard
          icon={CreditCard}
          label="Última recarga"
          value={formatMovement(summary.lastTopUpAmount, summary.lastTopUpAt)}
        />
        <DashboardMetricCard
          icon={CircleDollarSign}
          label="Último consumo"
          value={formatMovement(
            summary.lastConsumptionAmount,
            summary.lastConsumptionAt,
          )}
        />
        <DashboardMetricCard
          icon={BarChart3}
          label="Conversiones / Clicks"
          value={`${summary.conversions} / ${summary.clicks}`}
        />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        <WalletFormCard
          clients={clients}
          title="Nueva Cuenta Google Ads"
          description="Registra una billetera publicitaria para un cliente."
          icon={Megaphone}
        >
          <form action={createGoogleAdsAccountAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Cliente</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm font-medium text-goowin-text shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                id="clientId"
                name="clientId"
                required
              >
                <option value="">Seleccionar cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">Nombre</Label>
              <Input
                id="accountName"
                name="accountName"
                placeholder="Cuenta principal Google Ads"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer ID</Label>
                <Input id="customerId" name="customerId" placeholder="123-456-7890" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currencyCode">Moneda</Label>
                <Input
                  defaultValue="COP"
                  id="currencyCode"
                  maxLength={3}
                  name="currencyCode"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpcMultiplier">Multiplicador CPC</Label>
              <Input
                id="cpcMultiplier"
                min="0.01"
                name="cpcMultiplier"
                placeholder="1.50"
                required
                step="0.01"
                type="number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm font-medium text-goowin-text shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue="ACTIVE"
                id="status"
                name="status"
              >
                {googleAdsStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <NotesField id="accountNotes" name="notes" />
            <Button className="w-full gap-2" type="submit">
              <Megaphone className="h-4 w-4" aria-hidden="true" />
              Crear cuenta
            </Button>
          </form>
        </WalletFormCard>

        <WalletFormCard
          clients={clients}
          title="Movimiento Diario"
          description="Registra métricas comerciales diarias."
          icon={BarChart3}
        >
          <form action={createGoogleAdsDailyMovementAction} className="space-y-4">
            <AccountSelect accounts={accounts} id="movementAccountId" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="movementDate">Fecha</Label>
                <Input id="movementDate" name="movementDate" required type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="movementCpcCost">CPC Costo</Label>
                <Input
                  id="movementCpcCost"
                  min="0"
                  name="cpcCost"
                  placeholder="911"
                  required
                  step="0.01"
                  type="number"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="conversions">Conversiones</Label>
                <Input
                  defaultValue="0"
                  id="conversions"
                  min="0"
                  name="conversions"
                  type="number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clicks">Clicks</Label>
                <Input
                  defaultValue="0"
                  id="clicks"
                  min="0"
                  name="clicks"
                  type="number"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="movementConsumption">Consumo</Label>
                <Input
                  defaultValue="0"
                  id="movementConsumption"
                  min="0"
                  name="consumption"
                  step="0.01"
                  type="number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="movementTopUp">Recarga</Label>
                <Input
                  defaultValue="0"
                  id="movementTopUp"
                  min="0"
                  name="topUp"
                  step="0.01"
                  type="number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="movementBalance">Saldo</Label>
                <Input
                  id="movementBalance"
                  name="balance"
                  placeholder="Calculado"
                  step="0.01"
                  type="number"
                />
              </div>
            </div>

            <NotesField id="movementNotes" name="notes" />
            <Button className="w-full gap-2" type="submit">
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              Registrar movimiento
            </Button>
          </form>
        </WalletFormCard>

        <WalletFormCard
          clients={clients}
          title="Configuración Comercial"
          description="Actualiza el multiplicador CPC por cuenta."
          icon={Settings}
        >
          <form action={updateGoogleAdsAccountAction} className="space-y-4">
            <AccountSelect accounts={accounts} id="settingsAccountId" />
            <div className="space-y-2">
              <Label htmlFor="settingsCpcMultiplier">Multiplicador CPC</Label>
              <Input
                id="settingsCpcMultiplier"
                min="0.01"
                name="cpcMultiplier"
                placeholder="1.50"
                required
                step="0.01"
                type="number"
              />
            </div>
            <Button className="w-full gap-2" type="submit">
              <Settings className="h-4 w-4" aria-hidden="true" />
              Guardar configuración
            </Button>
          </form>
        </WalletFormCard>

        <WalletFormCard
          clients={clients}
          title="Nueva Recarga"
          description="Aumenta el saldo de una cuenta Google Ads."
          icon={CreditCard}
        >
          <form action={createGoogleAdsTopUpAction} className="space-y-4">
            <AccountSelect accounts={accounts} id="topUpAccountId" />
            <MoneyAndDateFields amountId="topUpAmount" dateId="topUpDate" />
            <div className="space-y-2">
              <Label htmlFor="reference">Referencia</Label>
              <Input id="reference" name="reference" placeholder="Comprobante u orden" />
            </div>
            <NotesField id="topUpNotes" name="notes" />
            <Button className="w-full gap-2" type="submit">
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              Registrar recarga
            </Button>
          </form>
        </WalletFormCard>

        <WalletFormCard
          clients={clients}
          title="Nuevo Consumo"
          description="Registra consumo real de pauta publicitaria."
          icon={CircleDollarSign}
        >
          <form action={createGoogleAdsConsumptionAction} className="space-y-4">
            <AccountSelect accounts={accounts} id="consumptionAccountId" />
            <MoneyAndDateFields
              amountId="consumptionAmount"
              dateId="consumptionDate"
            />
            <NotesField id="consumptionNotes" name="notes" />
            <Button className="w-full gap-2" type="submit">
              <CircleDollarSign className="h-4 w-4" aria-hidden="true" />
              Registrar consumo
            </Button>
          </form>
        </WalletFormCard>
      </section>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Cuentas Google Ads</CardTitle>
          <CardDescription>
            Saldo disponible y métricas consolidadas desde movimientos diarios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Cuenta</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Multiplicador</TableHead>
                <TableHead>CPC Venta</TableHead>
                <TableHead>Conversiones</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Última recarga</TableHead>
                <TableHead>Último consumo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <p className="font-bold">{account.clientName}</p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      {account.customerId ?? account.clientId}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <p className="font-bold">{account.accountName}</p>
                      <Badge variant={statusVariant[account.status]}>
                        {googleAdsStatusLabels[account.status]}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(account.balance)}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatMultiplier(account.cpcMultiplier)}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(account.latestMovementCpcSale)}
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {account.conversions}
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {account.clicks}
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {formatMovement(
                      account.lastTopUpAmount,
                      account.lastTopUpAt,
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {formatMovement(
                      account.lastConsumptionAmount,
                      account.lastConsumptionAt,
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-10 text-center text-sm font-semibold text-muted-foreground"
                    colSpan={9}
                  >
                    No hay cuentas Google Ads registradas.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Movimientos diarios</CardTitle>
          <CardDescription>
            Vista administrativa con costos internos y CPC de venta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Cuenta</TableHead>
                <TableHead>Conversiones</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>CPC Costo</TableHead>
                <TableHead>Multiplicador</TableHead>
                <TableHead>CPC Venta</TableHead>
                <TableHead>Consumo</TableHead>
                <TableHead>Recarga</TableHead>
                <TableHead>Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="font-medium">
                    {formatDate(movement.movementDate)}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {movement.clientName}
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {movement.accountName}
                  </TableCell>
                  <TableCell>{movement.conversions}</TableCell>
                  <TableCell>{movement.clicks}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(movement.cpcCost)}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatMultiplier(movement.cpcMultiplier)}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(movement.cpcSale)}
                  </TableCell>
                  <TableCell>{formatCurrency(movement.consumption)}</TableCell>
                  <TableCell>{formatCurrency(movement.topUp)}</TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(movement.balance)}
                  </TableCell>
                </TableRow>
              ))}

              {movements.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-10 text-center text-sm font-semibold text-muted-foreground"
                    colSpan={11}
                  >
                    No hay movimientos diarios registrados.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminShell>
  );
}

async function loadGoogleAdsData(): Promise<{
  accounts: GoogleAdsAccount[];
  clients: Client[];
  error?: 'api' | 'connection';
  movements: GoogleAdsDailyMovement[];
}> {
  try {
    const [clients, accounts] = await Promise.all([
      getClients(),
      getGoogleAdsAccounts(),
    ]);
    const movements = (
      await Promise.all(
        accounts.map((account) => getGoogleAdsDailyMovements(account.id)),
      )
    ).flat();

    return {
      accounts,
      clients,
      movements,
    };
  } catch (error) {
    return {
      accounts: [],
      clients: [],
      error: await getApiErrorType(error),
      movements: [],
    };
  }
}

function DashboardMetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Megaphone;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="grid h-11 w-11 place-items-center rounded-md bg-blue-50 text-goowin-blue">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 truncate text-xl font-black text-goowin-text">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function getGoogleAdsSummary(accounts: GoogleAdsAccount[]) {
  let availableBalance = 0;
  let clicks = 0;
  let conversions = 0;
  let lastTopUpAmount: string | null = null;
  let lastTopUpAt: string | null = null;
  let lastConsumptionAmount: string | null = null;
  let lastConsumptionAt: string | null = null;

  for (const account of accounts) {
    availableBalance += Number(account.balance ?? 0);
    clicks += account.clicks;
    conversions += account.conversions;

    if (
      account.lastTopUpAt &&
      (!lastTopUpAt ||
        new Date(account.lastTopUpAt) > new Date(lastTopUpAt))
    ) {
      lastTopUpAt = account.lastTopUpAt;
      lastTopUpAmount = account.lastTopUpAmount;
    }

    if (
      account.lastConsumptionAt &&
      (!lastConsumptionAt ||
        new Date(account.lastConsumptionAt) > new Date(lastConsumptionAt))
    ) {
      lastConsumptionAt = account.lastConsumptionAt;
      lastConsumptionAmount = account.lastConsumptionAmount;
    }
  }

  return {
    availableBalance,
    clicks,
    conversions,
    lastConsumptionAmount,
    lastConsumptionAt,
    lastTopUpAmount,
    lastTopUpAt,
  };
}

function WalletFormCard({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: React.ReactNode;
  clients: Client[];
  description: string;
  icon: typeof Megaphone;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2 grid h-10 w-10 place-items-center rounded-md bg-blue-50 text-goowin-blue">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function AccountSelect({
  accounts,
  id,
}: {
  accounts: GoogleAdsAccount[];
  id: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Cuenta</Label>
      <select
        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm font-medium text-goowin-text shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        id={id}
        name="accountId"
        required
      >
        <option value="">Seleccionar cuenta</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.clientName} / {account.accountName}
          </option>
        ))}
      </select>
    </div>
  );
}

function MoneyAndDateFields({
  amountId,
  dateId,
}: {
  amountId: string;
  dateId: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={amountId}>Valor</Label>
        <Input
          id={amountId}
          min="0"
          name="amount"
          placeholder="500000"
          required
          step="0.01"
          type="number"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={dateId}>Fecha</Label>
        <Input id={dateId} name="operationDate" type="date" />
      </div>
    </div>
  );
}

function NotesField({ id, name }: { id: string; name: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Observación</Label>
      <textarea
        className="flex min-h-20 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        id={id}
        name={name}
        placeholder="Nota operativa"
      />
    </div>
  );
}

function getNotice(
  searchParams: GoogleAdsPageProps['searchParams'],
  error?: 'api' | 'connection',
) {
  if (searchParams?.accountCreated === '1') {
    return {
      message: 'Cuenta Google Ads creada',
      type: 'success' as const,
    };
  }

  if (searchParams?.accountUpdated === '1') {
    return {
      message: 'Configuración Google Ads actualizada',
      type: 'success' as const,
    };
  }

  if (searchParams?.topUpCreated === '1') {
    return {
      message: 'Recarga registrada',
      type: 'success' as const,
    };
  }

  if (searchParams?.consumptionCreated === '1') {
    return {
      message: 'Consumo registrado',
      type: 'success' as const,
    };
  }

  if (searchParams?.movementCreated === '1') {
    return {
      message: 'Movimiento diario registrado',
      type: 'success' as const,
    };
  }

  if (error === 'connection' || searchParams?.error === 'connection') {
    return {
      message: 'Error conexión API',
      type: 'error' as const,
    };
  }

  if (searchParams?.error === 'account') {
    return {
      message: 'Error creando cuenta Google Ads',
      type: 'error' as const,
    };
  }

  if (searchParams?.error === 'accountUpdate') {
    return {
      message: 'Error actualizando configuración Google Ads',
      type: 'error' as const,
    };
  }

  if (searchParams?.error === 'topUp') {
    return {
      message: 'Error registrando recarga',
      type: 'error' as const,
    };
  }

  if (searchParams?.error === 'consumption') {
    return {
      message: 'Error registrando consumo',
      type: 'error' as const,
    };
  }

  if (searchParams?.error === 'movement') {
    return {
      message: 'Error registrando movimiento diario',
      type: 'error' as const,
    };
  }

  if (error === 'api') {
    return {
      message: 'Error cargando Google Ads',
      type: 'error' as const,
    };
  }

  return null;
}

function formatCurrency(value: string | number | null) {
  return currencyFormatter.format(Number(value ?? 0));
}

function formatMultiplier(value: string | null) {
  return `${Number(value ?? 0).toFixed(2)}x`;
}

function formatMovement(amount: string | null, date: string | null) {
  if (!amount || !date) {
    return 'Sin registro';
  }

  return `${formatCurrency(amount)} / ${formatDate(date)}`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
}
