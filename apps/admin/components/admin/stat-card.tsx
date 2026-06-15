import type { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: 'blue' | 'green' | 'amber' | 'slate';
};

const toneClasses = {
  blue: 'bg-blue-50 text-goowin-blue',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  slate: 'bg-slate-100 text-slate-700',
};

export function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = 'blue',
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-muted-foreground">{title}</p>
            <p className="mt-3 text-3xl font-bold tracking-normal text-goowin-text">
              {value}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
          </div>
          <div className={cn('rounded-md p-2.5', toneClasses[tone])}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
