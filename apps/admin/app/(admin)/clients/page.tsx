import Link from 'next/link';
import { Plus, Search } from 'lucide-react';

import { AdminShell } from '@/components/admin/admin-shell';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { clients } from '@/lib/mock-data';

export default function ClientsPage() {
  return (
    <AdminShell
      title="Clientes"
      description="Empresas, organizaciones y cuentas comerciales."
    >
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
          <div className="mb-4 flex max-w-md items-center gap-2 rounded-md border bg-white px-3">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              className="border-0 px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Buscar empresa"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Estado Comercial</TableHead>
                <TableHead>Fecha creación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div>
                      <p className="font-bold">{client.company}</p>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">
                        {client.id.toUpperCase()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={client.status} />
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {client.createdAt}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
