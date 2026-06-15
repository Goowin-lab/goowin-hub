import { ArrowRight } from 'lucide-react';

import { GoowinLogo } from '@/components/admin/goowin-logo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex justify-center">
          <GoowinLogo className="w-[152px]" />
        </div>
        <Card className="border-slate-200 bg-white">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="font-display text-2xl">Goowin Hub</CardTitle>
            <CardDescription>
              Acceso administrativo para el equipo Goowin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/" className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@goowin.co"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full gap-2">
                Ingresar
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
