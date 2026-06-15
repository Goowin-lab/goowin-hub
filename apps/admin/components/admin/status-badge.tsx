import { Badge } from '@/components/ui/badge';

type CommercialStatus =
  | 'Al día'
  | 'Pago pendiente'
  | 'En seguimiento'
  | 'Suspendido';

const statusVariant: Record<
  CommercialStatus,
  'success' | 'warning' | 'neutral' | 'destructive'
> = {
  'Al día': 'success',
  'Pago pendiente': 'warning',
  'En seguimiento': 'neutral',
  Suspendido: 'destructive',
};

export function StatusBadge({ status }: { status: CommercialStatus }) {
  return <Badge variant={statusVariant[status]}>{status}</Badge>;
}
