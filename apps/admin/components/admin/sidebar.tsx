import Link from 'next/link';
import { BarChart3, Building2 } from 'lucide-react';

import { GoowinLogo } from '@/components/admin/goowin-logo';
import { cn } from '@/lib/utils';

const navigation = [
  {
    href: '/',
    label: 'Dashboard',
    icon: BarChart3,
  },
  {
    href: '/clients',
    label: 'Clientes',
    icon: Building2,
  },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <GoowinLogo className="w-[122px]" />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-goowin-text',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          adminhub.goowin.co
        </p>
      </div>
    </aside>
  );
}
