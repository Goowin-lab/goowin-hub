import {
  AlertCircle,
  Building2,
  CalendarClock,
  CheckCircle2,
} from 'lucide-react';

import { AdminShell } from '@/components/admin/admin-shell';
import { StatCard } from '@/components/admin/stat-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { dashboardStats, recentActivity } from '@/lib/mock-data';

const icons = [Building2, CheckCircle2, CalendarClock, AlertCircle];

export default function DashboardPage() {
  return (
    <AdminShell
      title="Dashboard"
      description="Vista operativa inicial de Goowin Hub."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            detail={stat.detail}
            tone={stat.tone}
            icon={icons[index]}
          />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Prioridad operativa</CardTitle>
            <CardDescription>
              Seguimiento de clientes, servicios y renovaciones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-slate-50 p-4">
                <p className="text-sm font-semibold text-muted-foreground">
                  Renovaciones críticas
                </p>
                <p className="mt-3 text-2xl font-bold text-goowin-text">8</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Dominio y hosting con vencimiento cercano.
                </p>
              </div>
              <div className="rounded-lg border bg-slate-50 p-4">
                <p className="text-sm font-semibold text-muted-foreground">
                  Clientes en seguimiento
                </p>
                <p className="mt-3 text-2xl font-bold text-goowin-text">14</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Requieren gestión comercial u operativa.
                </p>
              </div>
              <div className="rounded-lg border bg-slate-50 p-4">
                <p className="text-sm font-semibold text-muted-foreground">
                  Servicios suspendidos
                </p>
                <p className="mt-3 text-2xl font-bold text-goowin-text">5</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Casos visibles para administración.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>Movimientos operativos del día.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={`${activity.title}-${activity.client}`}
                  className="flex gap-3 rounded-lg border bg-white p-3"
                >
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-goowin-blue" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-goowin-text">
                      {activity.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {activity.client}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}
