import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

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

export default function NewClientPage() {
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

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Datos de empresa</CardTitle>
          <CardDescription>
            Información comercial base para Goowin Hub.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/clients" className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="company">Nombre empresa</Label>
              <Input
                id="company"
                name="company"
                placeholder="Papeles Contables SAS"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">NIT</Label>
              <Input id="taxId" name="taxId" placeholder="900123456-7" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado Comercial</Label>
              <select
                id="status"
                name="status"
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm font-medium text-goowin-text shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue="Al día"
              >
                <option>Al día</option>
                <option>Pago pendiente</option>
                <option>En seguimiento</option>
                <option>Suspendido</option>
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
