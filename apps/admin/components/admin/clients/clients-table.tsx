'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { StatusBadge } from '@/components/admin/status-badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getCommercialStatusLabel } from '@/lib/client-status';
import type { Client } from '@/lib/api/clients';

type ClientsTableProps = {
  clients: Client[];
};

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function ClientsTable({ clients }: ClientsTableProps) {
  const [query, setQuery] = useState('');

  const filteredClients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return clients;
    }

    return clients.filter((client) => {
      const status = getCommercialStatusLabel(client.commercialStatus);
      const searchableText = `${client.name} ${client.taxId ?? ''} ${status}`;

      return searchableText.toLowerCase().includes(normalizedQuery);
    });
  }, [clients, query]);

  return (
    <>
      <div className="mb-4 flex max-w-md items-center gap-2 rounded-md border bg-white px-3">
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input
          className="border-0 px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar empresa"
          value={query}
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
          {filteredClients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <div>
                  <Link
                    className="font-bold text-goowin-text hover:text-goowin-blue"
                    href={`/clients/${client.id}`}
                  >
                    {client.name}
                  </Link>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {client.taxId ?? client.id}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge
                  status={getCommercialStatusLabel(client.commercialStatus)}
                />
              </TableCell>
              <TableCell className="font-medium text-muted-foreground">
                {formatDate(client.createdAt)}
              </TableCell>
            </TableRow>
          ))}

          {filteredClients.length === 0 ? (
            <TableRow>
              <TableCell
                className="py-10 text-center text-sm font-semibold text-muted-foreground"
                colSpan={3}
              >
                No se encontraron clientes.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
}
