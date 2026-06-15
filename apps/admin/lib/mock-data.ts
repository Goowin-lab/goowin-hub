export type CommercialStatus =
  | 'Al día'
  | 'Pago pendiente'
  | 'En seguimiento'
  | 'Suspendido';

export const dashboardStats = [
  {
    title: 'Clientes activos',
    value: '124',
    detail: '18 con seguimiento esta semana',
    tone: 'blue' as const,
  },
  {
    title: 'Servicios activos',
    value: '389',
    detail: 'Dominio, hosting, SEO y licencias',
    tone: 'green' as const,
  },
  {
    title: 'Renovaciones próximas',
    value: '32',
    detail: 'Vencen en los próximos 30 días',
    tone: 'amber' as const,
  },
  {
    title: 'Facturas pendientes',
    value: '17',
    detail: 'Prioridad para gestión comercial',
    tone: 'slate' as const,
  },
];

export const clients = [
  {
    id: 'cli-001',
    company: 'Papeles Contables SAS',
    status: 'Al día' as CommercialStatus,
    createdAt: '2026-01-15',
  },
  {
    id: 'cli-002',
    company: 'Andes Retail Group',
    status: 'Pago pendiente' as CommercialStatus,
    createdAt: '2026-02-03',
  },
  {
    id: 'cli-003',
    company: 'Clinica Norte Digital',
    status: 'En seguimiento' as CommercialStatus,
    createdAt: '2026-03-21',
  },
  {
    id: 'cli-004',
    company: 'Constructora Horizonte',
    status: 'Al día' as CommercialStatus,
    createdAt: '2026-04-07',
  },
  {
    id: 'cli-005',
    company: 'Lima Partners',
    status: 'Suspendido' as CommercialStatus,
    createdAt: '2026-05-12',
  },
];

export const recentActivity = [
  {
    title: 'Renovación de hosting registrada',
    client: 'Papeles Contables SAS',
    time: 'Hace 18 min',
  },
  {
    title: 'Cliente marcado en seguimiento',
    client: 'Clinica Norte Digital',
    time: 'Hace 1 h',
  },
  {
    title: 'Factura pendiente revisada',
    client: 'Andes Retail Group',
    time: 'Hace 3 h',
  },
];
