import { ArrowRight, CheckCircle2 } from 'lucide-react';

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

const services = [
  'Google Ads',
  'Dominios',
  'Hosting',
  'SEO',
  'Facturación',
  'Renovaciones',
  'Soporte',
];

export default function LoginPage({ searchParams }: LoginPageProps) {
  const errorMessage = searchParams?.error
    ? errorMessages[searchParams.error]
    : null;

  return (
    <main className="grid min-h-screen bg-background md:grid-cols-2">
      <section className="flex min-h-[420px] items-center bg-goowin-blue px-6 py-10 text-white sm:px-10 md:min-h-screen lg:px-16">
        <div className="mx-auto w-full max-w-[520px]">
          <div className="mb-10 inline-flex rounded-md bg-white px-4 py-3 shadow-subtle">
            <GoowinLogo className="w-[138px]" />
          </div>
          <h1 className="max-w-[460px] font-display text-3xl font-bold leading-tight tracking-normal sm:text-4xl lg:text-5xl">
            <span className="block">Bienvenido a</span>
            <span className="block">Goowin Hub</span>
          </h1>
          <p className="mt-5 max-w-[420px] text-sm font-medium leading-7 text-white/85 sm:text-base">
            Administra todos tus servicios digitales desde un único lugar.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            {services.map((service) => (
              <div key={service} className="flex items-center gap-3 text-sm font-semibold">
                <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{service}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-[560px] items-center px-4 py-10 sm:px-6 md:min-h-screen lg:px-8">
        <div className="mx-auto w-full max-w-[430px]">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="items-center space-y-3 p-6 text-center">
              <GoowinLogo className="w-[116px]" />
              <CardTitle className="font-display text-2xl">
                Iniciar sesión
              </CardTitle>
              <CardDescription>
                Ingresa con tu correo y contraseña.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={loginAction} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
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
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="remember"
                    className="flex items-center gap-2 text-sm font-semibold text-goowin-text"
                  >
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      className="h-4 w-4 rounded border-input text-goowin-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    Recordarme
                  </label>
                </div>
                <Button type="submit" className="w-full gap-2">
                  Iniciar sesión
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
                {errorMessage ? (
                  <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {errorMessage}
                  </div>
                ) : null}
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
