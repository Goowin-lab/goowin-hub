import Link from 'next/link';
import { AlertCircle, CheckCircle2, Plus } from 'lucide-react';

import { AdminShell } from '@/components/admin/admin-shell';
import { ClientsTable } from '@/components/admin/clients/clients-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getClients } from '@/lib/api/clients';
import type { Client } from '@/lib/api/clients';
import { isApiConnectionError } from '@/lib/api/goowin-api';

export const dynamic = 'force-dynamic';

type ClientsPageProps = {
  searchParams?: {
    created?: string;
    error?: string;
    updated?: string;
  };
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const { clients, error } = await loadClients();
  const notice = getNotice(searchParams, error);

  return (
    <AdminShell
      title="Clientes"
      description="Empresas, organizaciones y cuentas comerciales."
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

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Empresas cliente</CardTitle>
          <Button asChild className="gap-2">
            <Link href="/clients/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nuevo Cliente
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ClientsTable clients={clients} />
        </CardContent>
      </Card>
    </AdminShell>
  );
}

async function loadClients(): Promise<{
  clients: Client[];
  error?: 'api' | 'connection';
}> {
  try {
    return {
      clients: await getClients(),
    };
  } catch (error) {
    return {
      clients: [],
      error: isApiConnectionError(error) ? 'connection' : 'api',
    };
  }
}

function getNotice(
  searchParams: ClientsPageProps['searchParams'],
  error?: 'api' | 'connection',
) {
  if (searchParams?.created === '1') {
    return {
      message: 'Cliente creado',
      type: 'success' as const,
    };
  }

  if (searchParams?.updated === '1') {
    return {
      message: 'Cliente actualizado',
      type: 'success' as const,
    };
  }

  if (error === 'connection') {
    return {
      message: 'Error conexión API',
      type: 'error' as const,
    };
  }

  if (error === 'api') {
    return {
      message: 'Error cargando clientes',
      type: 'error' as const,
    };
  }

  return null;
}
