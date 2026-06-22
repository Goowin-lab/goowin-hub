import Link from 'next/link';
import { ArrowLeft, Bell } from 'lucide-react';

import { GoowinLogo } from '@/components/admin/goowin-logo';
import { Button } from '@/components/ui/button';

type ClientShellProps = {
  backHref?: string;
  children: React.ReactNode;
  description: string;
  title: string;
};

export function ClientShell({
  backHref,
  children,
  description,
  title,
}: ClientShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <GoowinLogo className="w-[118px]" />
            <div className="hidden h-8 w-px bg-border sm:block" />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-normal text-goowin-text">
                {title}
              </h1>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {backHref ? (
              <Button asChild variant="outline" className="gap-2">
                <Link href={backHref}>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Volver
                </Link>
              </Button>
            ) : null}
            <Button variant="outline" size="icon" aria-label="Notificaciones">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
