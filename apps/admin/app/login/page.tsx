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
import { loginAction } from './actions';

type LoginPageProps = {
  searchParams?: {
    error?: string;
  };
};

const errorMessages: Record<string, string> = {
  connection: 'No pudimos conectar con Goowin Hub. Inténtalo nuevamente.',
  credentials: 'El correo o la contraseña no son correctos.',
  role: 'Este rol todavía no tiene una experiencia habilitada.',
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const errorMessage = searchParams?.error
    ? errorMessages[searchParams.error]
    : null;

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex justify-center">
          <GoowinLogo className="w-[152px]" />
        </div>
        <Card className="border-slate-200 bg-white">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="font-display text-2xl">Goowin Hub</CardTitle>
            <CardDescription>
              Ingresa con tu correo y contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage ? (
              <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <form action={loginAction} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nombre@empresa.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  minLength={8}
                  required
                />
              </div>
              <Button type="submit" className="w-full gap-2">
                Iniciar sesión
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
