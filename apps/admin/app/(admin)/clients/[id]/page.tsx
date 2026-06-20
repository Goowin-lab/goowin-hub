import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, Save } from 'lucide-react';

import { AdminShell } from '@/components/admin/admin-shell';
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
import { commercialStatusOptions, getClient } from '@/lib/api/clients';
import type { Client } from '@/lib/api/clients';
import { getApiErrorType } from '@/lib/api/goowin-api';
import { updateClientAction } from './actions';

export const dynamic = 'force-dynamic';

type ClientDetailPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    error?: string;
    updated?: string;
  };
};

export default async function ClientDetailPage({
  params,
  searchParams,
}: ClientDetailPageProps) {
  const { client, error } = await loadClient(params.id);
  const notice = getNotice(searchParams, error);

  return (
    <AdminShell
      title="Editar Cliente"
      description="Actualización de datos comerciales de empresa cliente."
    >
      <div className="mb-4">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Clientes
          </Link>
        </Button>
      </div>

      {notice ? (
        <div
          className={`mb-4 flex max-w-2xl items-center gap-2 rounded-md border px-4 py-3 text-sm font-semibold ${
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

      {client ? (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Datos de empresa</CardTitle>
            <CardDescription>
              Edita la información base y el estado comercial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={updateClientAction.bind(null, client.id)}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Nombre empresa</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={client.name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">NIT</Label>
                <Input
                  id="taxId"
                  name="taxId"
                  defaultValue={client.taxId ?? ''}
                  placeholder="900123456-7"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commercialStatus">Estado Comercial</Label>
                <select
                  id="commercialStatus"
                  name="commercialStatus"
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm font-medium text-goowin-text shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  defaultValue={client.commercialStatus}
                >
                  {commercialStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" asChild>
                  <Link href="/clients">Cancelar</Link>
                </Button>
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Guardar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </AdminShell>
  );
}

async function loadClient(id: string): Promise<{
  client: Client | null;
  error?: 'api' | 'connection';
}> {
  try {
    return {
      client: await getClient(id),
    };
  } catch (error) {
    return {
      client: null,
      error: await getApiErrorType(error),
    };
  }
}

function getNotice(
  searchParams: ClientDetailPageProps['searchParams'],
  error?: 'api' | 'connection',
) {
  if (searchParams?.updated === '1') {
    return {
      message: 'Cliente actualizado',
      type: 'success' as const,
    };
  }

  if (searchParams?.error === 'connection' || error === 'connection') {
    return {
      message: 'Error conexión API',
      type: 'error' as const,
    };
  }

  if (searchParams?.error === 'update') {
    return {
      message: 'Error actualizando cliente',
      type: 'error' as const,
    };
  }

  if (error === 'api') {
    return {
      message: 'Error cargando cliente',
      type: 'error' as const,
    };
  }

  return null;
}
