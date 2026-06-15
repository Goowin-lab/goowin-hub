import { Bell, Search } from 'lucide-react';

import { GoowinLogo } from '@/components/admin/goowin-logo';
import { Button } from '@/components/ui/button';

type HeaderProps = {
  title: string;
  description?: string;
};

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <GoowinLogo className="w-[112px] lg:hidden" />
          <div className="hidden h-8 w-px bg-border lg:block" />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-normal text-goowin-text">
              {title}
            </h1>
            {description ? (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <GoowinLogo className="hidden w-[92px] xl:block" />
          <div className="hidden h-10 w-64 items-center gap-2 rounded-md border bg-white px-3 text-sm text-muted-foreground md:flex">
            <Search className="h-4 w-4" aria-hidden="true" />
            Buscar
          </div>
          <Button variant="outline" size="icon" aria-label="Notificaciones">
            <Bell className="h-4 w-4" />
          </Button>
          <div className="hidden items-center gap-3 rounded-md border bg-white px-3 py-2 sm:flex">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-goowin-blue text-xs font-bold text-white">
              CG
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-goowin-text">Goowin Admin</p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
