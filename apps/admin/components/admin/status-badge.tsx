import { Badge } from '@/components/ui/badge';
import type { CommercialStatusLabel } from '@/lib/api/clients';

const statusVariant: Record<
  CommercialStatusLabel,
  'success' | 'warning' | 'neutral' | 'destructive'
> = {
  'Al día': 'success',
  'Pago pendiente': 'warning',
  'En seguimiento': 'neutral',
  Suspendido: 'destructive',
};

export function StatusBadge({ status }: { status: CommercialStatusLabel }) {
  return <Badge variant={statusVariant[status]}>{status}</Badge>;
}
