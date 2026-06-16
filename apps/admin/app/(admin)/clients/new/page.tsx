import Link from 'next/link';
import { AlertCircle, ArrowLeft, Save } from 'lucide-react';

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
import { commercialStatusOptions } from '@/lib/api/clients';
import { createClientAction } from './actions';

type NewClientPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function NewClientPage({ searchParams }: NewClientPageProps) {
  const errorMessage = getErrorMessage(searchParams?.error);

  return (
    <AdminShell
      title="Nuevo Cliente"
      description="Registro inicial de una empresa cliente."
    >
      <div className="mb-4">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Clientes
          </Link>
        </Button>
      </div>

      {errorMessage ? (
        <div className="mb-4 flex max-w-2xl items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {errorMessage}
        </div>
      ) : null}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Datos de empresa</CardTitle>
          <CardDescription>
            Información comercial base para Goowin Hub.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createClientAction} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre empresa</Label>
              <Input
                id="name"
                name="name"
                placeholder="Papeles Contables SAS"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">NIT</Label>
              <Input id="taxId" name="taxId" placeholder="900123456-7" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commercialStatus">Estado Comercial</Label>
              <select
                id="commercialStatus"
                name="commercialStatus"
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm font-medium text-goowin-text shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue="CURRENT"
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
    </AdminShell>
  );
}

function getErrorMessage(error?: string) {
  if (error === 'connection') {
    return 'Error conexión API';
  }

  if (error === 'create') {
    return 'Error creando cliente';
  }

  return null;
}
